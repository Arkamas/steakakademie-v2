#!/usr/bin/env node
/**
 * Austausch der 22 Falsch-Motiv-Rezeptbilder (Echtfoto → Nano-Banana-Edit → Grading)
 *
 * Verfahren nach docs/bildstrategie-grading.md und docs/bildbrief-22-austausch.md:
 *   echtes Referenzfoto (Unsplash)
 *     → fal-Storage-Upload
 *     → fal-ai/nano-banana-pro/edit (Prompt: erst BEWAHREN, dann AENDERN)
 *     → deterministisches Grading mit sharp NACH dem Edit (NICHT generativ,
 *       nie vor dem Edit — das verfaelscht die Quelle, die BEWAHREN schuetzt)
 *     → 16:10 Hauptbild + 16:9 Hero
 *
 * Grading-Profil: immer "kraeftig", eingefroren am 18.08.2026. Das flau-Profil
 * gehoert zur Cut-Pipeline und ist hier gesperrt.
 *
 * Nichts wird nach public/ geschrieben. Ergebnisse landen im Staging-Ordner
 * bild-austausch/ und gehen erst nach fachlicher Abnahme ins Repo — dieselbe
 * Regel wie beim Cut-Atlas.
 *
 * Quellfotos kommen aus der Kandidatensuche ueber Pexels, Unsplash und Pixabay
 * — in dieser Reihenfolge, nach der Einstufung in docs/bildquellen-whitelist.md.
 * Drei Quellen, weil eine nicht reicht: "porterhouse steak" ergab bei Unsplash
 * 3 Treffer, bei Pexels 4805 und bei Pixabay 940 (geprueft 18.08.2026); bei vier
 * der 22 Motive liefert Unsplash gar nichts.
 *
 * Pexels und Unsplash stehen dort auf GRUEN, Pixabay auf GELB: Die Plattform
 * hostet KI-Bilder. Deren Treffer werden ueber das API-Feld `isAiGenerated`
 * aussortiert, damit kein KI-Bild als "Echtfoto-Basis" durchrutscht.
 *
 * Ablauf: suchen → sichten → waehlen → bearbeiten.
 *
 * Usage:
 *   node scripts/rezept-bild-austausch.mjs --suche                 # Kandidaten fuer alle 22
 *   node scripts/rezept-bild-austausch.mjs --suche porterhouse-grill
 *   node scripts/rezept-bild-austausch.mjs --waehle porterhouse-grill=pexels-1639557
 *   node scripts/rezept-bild-austausch.mjs --check                 # was fehlt an Quellen?
 *   node scripts/rezept-bild-austausch.mjs --only porterhouse-grill
 *   node scripts/rezept-bild-austausch.mjs --only a,b,c --profil kraeftig
 *   node scripts/rezept-bild-austausch.mjs --dry-run --only x      # Prompt zeigen, nichts senden
 *   node scripts/rezept-bild-austausch.mjs --kalibrier porterhouse-grill
 *   node scripts/rezept-bild-austausch.mjs --neurahmen a,b   # nur neu rahmen
 *
 * Nur --only und --kalibrier kosten fal.ai-Guthaben; Suche, Auswahl und
 * --neurahmen sind frei. --neurahmen arbeitet auf dem gesicherten <slug>--roh.jpg
 * und ist der Weg, eine geaenderte Beschnitt-Entscheidung umzusetzen, ohne den
 * Edit noch einmal zu bezahlen.
 *
 * ACHTUNG: Jeder Lauf ohne --dry-run kostet fal.ai-Guthaben.
 *
 * Env: FAL_KEY (key_id:secret), sonst aus .env.local gelesen.
 */

import { readFile, writeFile, mkdir, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT    = join(__dirname, '..')
const STAGING = join(ROOT, 'bild-austausch')
const QUELLEN = join(STAGING, 'quellen')
const ERGEBNIS = join(STAGING, 'ergebnis')

const DRY  = process.argv.includes('--dry-run')
const CHECK = process.argv.includes('--check')
const arg = (name) => process.argv.includes(name)
  ? (process.argv[process.argv.indexOf(name) + 1] || '').trim() : null
const ONLY = arg('--only') ? arg('--only').split(',').map(s => s.trim()).filter(Boolean) : null
const PROFIL = arg('--profil') || 'kraeftig'
const KALIBRIER = arg('--kalibrier')
// --suche ohne Wert = alle 22; mit Wert = nur diese Slugs.
const SUCHE = process.argv.includes('--suche') ? (arg('--suche') || '').replace(/^--.*/, '') : null
const WAEHLE = arg('--waehle')
const PRO_QUELLE = parseInt(arg('--pro-quelle') || '4', 10)
// --neurahmen: Rahmung aus dem gesicherten Rohbild neu erzeugen, ohne fal-Aufruf.
const NEURAHMEN = process.argv.includes('--neurahmen') ? (arg('--neurahmen') || '').replace(/^--.*/, '') : null

// Keys aus der Umgebung, sonst aus .env.local (dotenv-Quirk umgehen).
const envRoh = existsSync(join(ROOT, '.env.local'))
  ? await readFile(join(ROOT, '.env.local'), 'utf8') : ''
const key = (name) =>
  process.env[name] || (envRoh.match(new RegExp(`^${name}=(.+)$`, 'm'))?.[1] || '').trim()

const FAL_KEY = key('FAL_KEY')

const c = {
  g: s => `\x1b[32m${s}\x1b[0m`, y: s => `\x1b[33m${s}\x1b[0m`,
  r: s => `\x1b[31m${s}\x1b[0m`, d: s => `\x1b[2m${s}\x1b[0m`, b: s => `\x1b[1m${s}\x1b[0m`,
}

// ── Hausstil ────────────────────────────────────────────────────────────────
// Der AENDERN-Teil ist fuer alle Motive gleich — der Look ist Marke, nicht Motiv.
// Spur B (Rezeptbilder) laut docs/bildprogramm.md: Warm & Rustikal.
const HAUSSTIL =
  'Restage the scene in a warm rustic steakhouse style: dark slate or aged wood surface, ' +
  'soft warm key light from the upper left, gentle fill from the right, light sources outside ' +
  'the frame, muted earthy background falling into shadow, shallow depth of field. ' +
  'No text, no signage, no logos, no hands, no cutlery unless already present. ' +
  'Photographic realism, no illustration, no plastic sheen, no stamped grill diamonds.'

// ── Die 22 Auftraege aus docs/bildbrief-22-austausch.md ─────────────────────
// `muss` ist woertlich der BEWAHREN-Teil des Prompts: Was das Foto zeigt und was
// der Edit unter keinen Umstaenden veraendern darf. Genau hier sind die bisherigen
// Bilder gescheitert (Porterhouse ohne T-Knochen, Coleslaw als Nudeln).
export const JOBS = [
  // MUSS entschaerft 18.08.2026 (Uwe-Entscheidung): Das Bourbon-Glas ist
  // gestrichen. Zwei Suchrunden ueber drei Bibliotheken (35 Kandidaten) fanden
  // Brisket ODER Glas, nie beides; der einzige mit beidem zeigt eine
  // Jim-Beam-Flasche und ist als Markenbild gesperrt. Ein Glas per Edit
  // hinzuzufuegen waere eine Inhaltsaenderung und verletzt BEWAHREN.
  // Das Pairing traegt jetzt der Text, nicht das Bild.
  { slug: 'bourbon-brisket-pairing',
    suche: ['brisket bourbon glass bbq', 'barbecue plate whiskey glass', 'smoked meat whiskey tasting board'],
    muss: 'sliced smoked beef brisket with a dark bark and a clearly visible pink smoke ring' },
  // Geschaerft: Grillmarken gab es, den Klapprost nie — der ist das Kennzeichen.
  { slug: 'braaibroodjies',
    suche: ['grilled cheese sandwich braai toastie', 'hinged grid braai sandwich', 'sandwich grill basket charcoal'],
    muss: 'grilled stuffed sandwiches with clear grill marks, folded in a grill basket' },
  { slug: 'bun-cha-hanoi', suche: 'bun cha vietnamese noodle bowl',
    muss: 'a bowl of broth with small grilled pork patties, a separate portion of white rice noodles and fresh herbs' },
  { slug: 'ca-nuong-bananenblatt', suche: 'grilled fish banana leaf',
    muss: 'a whole fish lying on a clearly visible green banana leaf' },
  { slug: 'cedar-plank-lachs', suche: 'cedar plank salmon grill',
    muss: 'a salmon fillet on a clearly visible charred cedar wood plank' },
  // Geschaerft: Die erste Runde lieferte ueberwiegend Roastbeef und Ribeye.
  { slug: 'chateaubriand-filet',
    suche: ['chateaubriand beef tenderloin sliced', 'beef tenderloin center cut medium rare', 'filet mignon roast sliced pink'],
    muss: 'a thick centre-cut beef tenderloin, sliced, pink even core, uniform fine-grained muscle without any spiral or layered structure' },
  { slug: 'iberico-carrillera', suche: 'braised pork cheeks',
    muss: 'braised boneless pork cheeks, small round pieces of meat in a dark glossy sauce, absolutely no bone' },
  { slug: 'iberico-secreto', suche: 'secreto iberico pork cut',
    muss: 'a thin, flat, fan-shaped secreto iberico pork cut, heavily marbled, boneless, absolutely no bone' },
  { slug: 'onglet-hanger-steak', suche: 'hanger steak sliced',
    muss: 'a boneless hanger steak with coarse longitudinal grain, sliced against the grain, absolutely no bone' },
  { slug: 'porterhouse-grill', suche: 'porterhouse steak bone',
    muss: 'a single thick porterhouse steak with a clearly visible T-shaped bone running down the centre, a large striploin muscle on one side and a large round tenderloin filet on the other side of the bone' },
  { slug: 'moo-ping', suche: 'thai grilled pork skewers moo ping',
    muss: 'grilled pork strips threaded on wooden skewers, lightly caramelised' },
  { slug: 'pla-pao-salzkruste', suche: 'salt crusted grilled fish thai',
    muss: 'a whole fish fully encased in a thick white salt crust, thai street grill setting' },
  { slug: 'sis-kebab-tuerkisch', suche: 'shish kebab skewers turkish',
    muss: 'cubes of meat threaded on flat metal skewers over a mangal grill' },
  // MUSS entschaerft 18.08.2026 (Uwe-Entscheidung): Die Aprikosen sind
  // gestrichen. Vier Suchbegriffe ueber drei Bibliotheken (40 Kandidaten)
  // fanden Aprikosen nur als Zutat allein — getrocknete Fruechte, Marillen-
  // knoedel, Bluetenzweige —, nie am Spiess. Bleibt: marinierter Fleischspiess
  // ueber Glut. Der Alt-Text darf dann keine Aprikosen behaupten.
  { slug: 'sosaties-braai',
    suche: ['sosatie skewers braai apricot', 'apricot lamb skewer marinated', 'kebab with dried apricots grilled', 'south african braai skewers'],
    muss: 'marinated cubes of meat threaded on skewers over glowing coals, no vegetables dominating the skewer' },
  { slug: 'tavuk-sis-kebab', suche: 'chicken shish kebab skewers',
    muss: 'cubes of chicken threaded on skewers, not a whole roast chicken' },
  // Geschaerft: Die erste Runde lieferte Rotkohl oder Teller mit Markenflaschen.
  { slug: 'texas-coleslaw',
    suche: ['creamy coleslaw white cabbage bowl', 'shredded white cabbage carrot salad', 'coleslaw bowl bbq side'],
    muss: 'a bowl of coleslaw made of finely shredded white cabbage and carrot, creamy dressing, absolutely no noodles and no minced meat' },
  { slug: 'thit-nuong-vietnam', suche: 'vietnamese grilled pork thit nuong',
    muss: 'grilled marinated pork slices served with rice or noodles and fresh herbs' },
  { slug: 'thunfisch-steak-grill', suche: 'seared tuna steak grill',
    muss: 'a tuna steak seared on the outside with a deep red raw centre and the clear flaky texture of fish, not beef' },
  { slug: 'ganze-makrele-grill', suche: 'grilled whole mackerel',
    muss: 'a whole mackerel with its characteristic dark wavy stripe pattern on silver skin' },
  { slug: 'ikan-bakar-singapur', suche: 'ikan bakar sambal banana leaf',
    muss: 'a whole fish on a banana leaf coated in red sambal marinade' },
  { slug: 'roastbeef-reverse-sear', suche: 'roastbeef sliced medium rare',
    muss: 'a whole roast beef joint with slices cut from it, even pink core, no foreign objects stuck into the meat' },
  { slug: 'wagyu-burger', suche: 'wagyu beef burger',
    muss: 'a properly stacked burger with a thick patty, bun sitting squarely on top' },
]

// ── Grading (deterministisch, docs/bildstrategie-grading.md) ────────────────
// ImageMagick ist nicht installiert; convert.exe im PATH ist das Windows-
// Dateisystem-Tool und darf niemals als Fallback aufgerufen werden.
// Umrechnung laut Uebersetzungstabelle:
//   -modulate 100,S,99        -> modulate({ saturation: S/100, hue: -3 })
//   -brightness-contrast BxC  -> linear(1 + C/100, (B/100)*255 - (C/100)*128)
//   -level 2%,99%,1.03        -> gamma(1.03)
//   -unsharp 0x1+m1+0.02      -> sharpen({ sigma: 1, m1, m2 })
// Eingefroren am 18.08.2026 nach dem Kalibrierlauf an texas-coleslaw.
// Die Bandbreiten aus der Doku sind hier bewusst auf feste Werte festgelegt —
// "deterministisch graden" heisst, dass zwei Laeufe dasselbe Bild ergeben.
const PROFILE = {
  // Rezept-Pipeline: das einzige hier zulaessige Profil (siehe PROFIL_GESPERRT).
  kraeftig:  { S: 105, B: -2, C: 7,  gamma: 1.0,  m1: 0.5 },
  // Cut-Pipeline (Rohfoto ohne Edit). Steht nur fuer den Kalibriervergleich hier
  // und ist fuer den Regellauf gesperrt.
  flau:      { S: 119, B: -3, C: 14, gamma: 1.03, m1: 0.5 },
}

/**
 * docs/bildstrategie-grading.md, "Zwei Pipeline-Kontexte" (Entscheidung
 * 18.08.2026): In der Rezept-Pipeline gilt IMMER das milde kraeftig-Profil nach
 * dem Edit. Das flau-Profil ist fuer Rohfotos der Cut-Pipeline kalibriert und
 * zieht nach einem Nano-Banana-Edit rund 19 % Helligkeit ab — der Hintergrund
 * saeuft ab. Deshalb hier gesperrt statt nur abgeraten.
 *
 * Graden VOR dem Edit ist ebenfalls verboten: Es verfaelscht die Quelle, die der
 * BEWAHREN-Teil des Prompts gerade schuetzen soll. Das Skript gradet daher
 * ausschliesslich das Edit-Ergebnis.
 */
const PROFIL_GESPERRT = ['flau']

function linearAB(B, C) {
  return { a: 1 + C / 100, b: (B / 100) * 255 - (C / 100) * 128 }
}

/** Weiche Vignette als SVG-Overlay, multipliziert. Deckkraft am Rand ~0.15. */
function vignetteSvg(w, h) {
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
       <defs><radialGradient id="v" cx="50%" cy="50%" r="75%">
         <stop offset="55%" stop-color="#fff"/>
         <stop offset="100%" stop-color="#d9d9d9"/>
       </radialGradient></defs>
       <rect width="${w}" height="${h}" fill="url(#v)"/>
     </svg>`
  )
}

async function grade(buf, profilName, imKalibrierlauf = false) {
  const p = PROFILE[profilName]
  if (!p) throw new Error(`Unbekanntes Grading-Profil: ${profilName}`)
  if (PROFIL_GESPERRT.includes(profilName) && !imKalibrierlauf) {
    throw new Error(
      `Profil "${profilName}" ist in der Rezept-Pipeline gesperrt. ` +
      `Nach dem Nano-Banana-Edit gilt immer "kraeftig" — siehe ` +
      `docs/bildstrategie-grading.md, Abschnitt "Zwei Pipeline-Kontexte".`)
  }
  const { a, b } = linearAB(p.B, p.C)
  return sharp(buf)
    .modulate({ saturation: p.S / 100, hue: -3 })
    .linear(a, b)
    .gamma(p.gamma)
    .sharpen({ sigma: 1, m1: p.m1, m2: 0.5 })
    .toBuffer()
}

/**
 * Zielformat nach der Beschnitt-Regel in docs/bildstrategie-grading.md
 * (Entscheidung 18.08.2026): Beschneiden ist erlaubt, solange das Gericht
 * vollstaendig im Bild bleibt. Verboten bei Cut-Motiven, wo die Anatomie die
 * Aussage ist — Knochen, Fettkappe, Anschnittflaeche. Dort wird eingepasst,
 * auch um den Preis von Randflaechen: Ein halbierter T-Knochen macht genau den
 * Fehler, den dieses Paket beheben soll.
 *
 * `beschnittVerboten` steht am Auftrag, weil es eine fachliche Aussage ueber das
 * Motiv ist und keine technische ueber die Datei.
 */
async function rahmen(buf, w, h, beschnittVerboten = false) {
  const bild = sharp(buf).resize(w, h, {
    fit: beschnittVerboten ? 'contain' : 'cover',
    position: 'centre',
    background: { r: 26, g: 17, b: 9 },
  })
  const mitVignette = await bild
    .composite([{ input: vignetteSvg(w, h), blend: 'multiply' }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer()
  return mitVignette
}

// ── fal.ai ──────────────────────────────────────────────────────────────────

async function falUpload(buf, dateiname) {
  const init = await fetch('https://rest.alpha.fal.ai/storage/upload/initiate', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_type: 'image/jpeg', file_name: dateiname }),
  })
  if (!init.ok) throw new Error(`Upload-Initiate fehlgeschlagen: ${init.status} ${await init.text()}`)
  const { upload_url, file_url } = await init.json()

  const put = await fetch(upload_url, {
    method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: buf,
  })
  if (!put.ok) throw new Error(`Upload-PUT fehlgeschlagen: ${put.status}`)
  return file_url
}

async function falEdit(bildUrl, prompt) {
  const res = await fetch('https://fal.run/fal-ai/nano-banana-pro/edit', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image_urls: [bildUrl], num_images: 1 }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Edit fehlgeschlagen: ${res.status} ${text.slice(0, 400)}`)
  const data = JSON.parse(text)
  const url = data?.images?.[0]?.url || data?.image?.url
  if (!url) throw new Error(`Antwort ohne Bild-URL: ${text.slice(0, 300)}`)
  const bild = await fetch(url)
  return Buffer.from(await bild.arrayBuffer())
}

function baueprompt(job) {
  return `PRESERVE EXACTLY, do not alter: ${job.muss}. ` +
    `The anatomy, shape, bones, fat and surface texture of the food must remain exactly as in the source photo. ` +
    `THEN CHANGE only lighting, staging and surroundings: ${HAUSSTIL}`
}

// ── Kandidatensuche ueber drei Quellen ──────────────────────────────────────
// Unsplash allein reicht bei Fleisch-Fachbegriffen nicht: "porterhouse steak"
// ergab dort 3 Treffer, bei Pexels 4805 und bei Pixabay 940 (geprueft 18.08.2026).
// Alle drei Lizenzen erlauben kommerzielle Nutzung und Bearbeitung ohne
// Attributionspflicht — siehe Rechts-Doktrin in public/images/cuts/CREDITS.md.

const KANDIDATEN = join(STAGING, 'kandidaten')

/**
 * Motive, bei denen Beschnitt verboten ist — Cut-Motive, deren Anatomie die
 * Aussage traegt (Knochen, Fettkappe, Anschnittflaeche), und ganze Tiere, bei
 * denen ein Anschnitt Schwanz oder Kopf kostet. Alles andere darf beschnitten
 * werden, solange das Gericht vollstaendig im Bild bleibt.
 * Regel: docs/bildstrategie-grading.md, Abschnitt "Beschnitt-Regel".
 */
const BESCHNITT_VERBOTEN = new Set([
  'bourbon-brisket-pairing',   // Rauchring und Anschnittflaeche
  'chateaubriand-filet',       // Anschnittflaeche, feine Faser
  'iberico-secreto',           // Marmorierung des flachen Cuts
  'onglet-hanger-steak',       // grobe Laengsfaser, Anschnitt quer
  'porterhouse-grill',         // T-Knochen — der ganze Punkt des Motivs
  'roastbeef-reverse-sear',    // Anschnittflaeche, rosa Kern
  'thunfisch-steak-grill',     // Anschnitt mit rohem Kern
  'ca-nuong-bananenblatt',     // ganzer Fisch auf dem Blatt
  'ganze-makrele-grill',       // ganzer Fisch, Streifenmuster ueber die Laenge
  'ikan-bakar-singapur',       // ganzer Fisch
  'pla-pao-salzkruste',        // ganzer Fisch in der Kruste
  // Nachgetragen 18.08.2026 nach Sichtung des ersten Beschnitt-Laufs: Hier war
  // Beschnitt erlaubt, das Ergebnis verletzte aber die Regel "Gericht
  // vollstaendig im Bild".
  'sosaties-braai',            // Spiess-Enden liefen links und rechts aus dem Bild
  'wagyu-burger',              // Bun unten angeschnitten
  'thit-nuong-vietnam',        // Fleisch lief unten aus dem Bild
])

async function sucheUnsplash(q, n) {
  const k = key('UNSPLASH_ACCESS_KEY')
  if (!k) return []
  const r = await fetch(`https://api.unsplash.com/search/photos?per_page=${n}&query=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Client-ID ${k}` } })
  if (!r.ok) return []
  const j = await r.json()
  return (j.results || []).map(p => ({
    quelle: 'Unsplash', id: p.id, fotograf: p.user?.name || '—',
    beschreibung: p.alt_description || p.description || '',
    vorschau: p.urls?.small, original: `${p.urls?.raw}&w=2400&fm=jpg&q=90`,
  }))
}

async function suchePexels(q, n) {
  const k = key('PEXELS_API_KEY')
  if (!k) return []
  const r = await fetch(`https://api.pexels.com/v1/search?per_page=${n}&query=${encodeURIComponent(q)}`,
    { headers: { Authorization: k } })
  if (!r.ok) return []
  const j = await r.json()
  return (j.photos || []).map(p => ({
    quelle: 'Pexels', id: String(p.id), fotograf: p.photographer || '—',
    beschreibung: p.alt || '',
    vorschau: p.src?.medium, original: p.src?.large2x || p.src?.original,
  }))
}

let pixabayGefiltert = 0

/**
 * Pixabay steht in docs/bildquellen-whitelist.md auf GELB: Die Plattform hostet
 * KI-Bilder, kennzeichnet sie aber. Die API liefert dafuer ein explizites Feld
 * `isAiGenerated` — verlaesslicher als Tags zu durchsuchen. Der Query-Parameter
 * `&ai=false` bewirkt nichts (gleiche Trefferzahl, geprueft 18.08.2026), also
 * wird clientseitig gefiltert und dafuer ueberzogen abgefragt.
 *
 * Ein KI-Bild als "Echtfoto-Basis" durchzulassen waere genau der Fehler, den die
 * Doktrin bei Foodiesfeed schon einmal gefangen hat.
 */
async function suchePixabay(q, n) {
  const k = key('PIXABAY_API_KEY')
  if (!k) return []
  // Ueberziehen, weil nach dem Filter genug uebrig bleiben muss. per_page >= 3.
  const r = await fetch(`https://pixabay.com/api/?key=${k}&image_type=photo&per_page=${Math.max(3, n * 4)}&q=${encodeURIComponent(q)}`)
  if (!r.ok) return []
  const j = await r.json()
  const alle = j.hits || []
  const echt = alle.filter(p => p.isAiGenerated !== true)
  pixabayGefiltert += alle.length - echt.length
  return echt.slice(0, n).map(p => ({
    quelle: 'Pixabay', id: String(p.id), fotograf: p.user || '—',
    beschreibung: (p.tags || ''),
    vorschau: p.webformatURL, original: p.largeImageURL,
  }))
}

/**
 * Reihenfolge nach docs/bildquellen-whitelist.md: Pexels zuerst (KI-Uploads sind
 * dort per ToS verboten, damit die sauberste Quelle), dann Unsplash, dann
 * Pixabay als GELB-Quelle zuletzt. Die Sortierung steuert nur, was im
 * Auswahlbogen oben steht — gesucht wird weiterhin parallel.
 *
 * Noch nicht angebunden, aber in der Whitelist gruen: StockSnap, Kaboompics,
 * Burst, Gratisography. Dafuer fehlen Keys bzw. APIs.
 */
const QUELLEN_RANG = { Pexels: 1, Unsplash: 2, Pixabay: 3 }

/**
 * `suche` darf ein String oder eine Liste sein. Mehrere Begriffe, weil bei
 * schwierigen Motiven selten eine einzige Formulierung trifft: "sosatie skewers
 * braai apricot" fand acht Kandidaten, aber keinen einzigen mit Aprikosen —
 * und die sind bei dem Gericht das Kennzeichen (Befund 18.08.2026).
 * Treffer werden ueber Quelle+ID entdoppelt.
 */
async function sucheKandidaten(job, proQuelle) {
  const begriffe = Array.isArray(job.suche) ? job.suche : [job.suche]
  const gefunden = new Map()
  for (const begriff of begriffe) {
    const listen = await Promise.all([
      suchePexels(begriff, proQuelle).catch(() => []),
      sucheUnsplash(begriff, proQuelle).catch(() => []),
      suchePixabay(begriff, proQuelle).catch(() => []),
    ])
    for (const t of listen.flat()) {
      const schluessel = `${t.quelle}-${t.id}`
      if (!gefunden.has(schluessel)) gefunden.set(schluessel, t)
    }
  }
  return Array.from(gefunden.values())
    .sort((a, b) => (QUELLEN_RANG[a.quelle] ?? 9) - (QUELLEN_RANG[b.quelle] ?? 9))
}

/** Kandidaten sichten: Vorschauen laden und einen Auswahlbogen schreiben. */
async function modusSuche(jobs, proQuelle) {
  for (const job of jobs) {
   // Pro Motiv gekapselt: Ein Ausfall bei einer Quelle oder ein Rate-Limit darf
   // den Durchlauf ueber alle 22 nicht abbrechen — sonst ist nach dem ersten
   // Stolperer unklar, was schon gesucht wurde und was nicht.
   try {
    const ordner = join(KANDIDATEN, job.slug)
    await mkdir(ordner, { recursive: true })
    const treffer = await sucheKandidaten(job, proQuelle)
    if (!treffer.length) { console.log(`  ${c.y('·')} ${job.slug} — keine Treffer fuer "${job.suche}"`); continue }

    const mitBild = []
    for (const t of treffer) {
      try {
        const res = await fetch(t.vorschau)
        if (!res.ok) continue
        const buf = Buffer.from(await res.arrayBuffer())
        const name = `${t.quelle.toLowerCase()}-${t.id}.jpg`
        await writeFile(join(ordner, name), buf)
        mitBild.push({ ...t, vorschauDatei: name })
      } catch { /* einzelner Ausfall kippt die Suche nicht */ }
    }
    await writeFile(join(ordner, 'kandidaten.json'), JSON.stringify(mitBild, null, 2))
    await schreibeAuswahlbogen(job, mitBild, ordner)
    const proQ = mitBild.reduce((a, t) => ({ ...a, [t.quelle]: (a[t.quelle] || 0) + 1 }), {})
    console.log(`  ${c.g('✓')} ${job.slug.padEnd(28)} ${mitBild.length} Kandidaten (${Object.entries(proQ).map(([k2, v]) => `${k2} ${v}`).join(', ')})`)
   } catch (e) {
    console.log(`  ${c.r('✗')} ${job.slug.padEnd(28)} ${e.message}`)
   }
  }
  if (pixabayGefiltert)
    console.log(c.y(`\n  ${pixabayGefiltert} Pixabay-Treffer als KI-generiert aussortiert (isAiGenerated).`))
  console.log(c.d(`\n  Auswahlboegen: bild-austausch/kandidaten/<slug>/auswahl.html`))
  console.log(c.d(`  Uebernehmen mit: --waehle <slug>=<quelle>-<id>\n`))
}

async function schreibeAuswahlbogen(job, kandidaten, ordner) {
  const karten = kandidaten.map(t => `
    <figure>
      <img src="${t.vorschauDatei}" alt="${(t.beschreibung || '').replace(/"/g, '&quot;')}">
      <figcaption>
        <code>${t.quelle.toLowerCase()}-${t.id}</code><br>
        ${t.quelle} · ${t.fotograf}<br>
        <span class="d">${(t.beschreibung || '').slice(0, 90)}</span>
      </figcaption>
    </figure>`).join('\n')

  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<title>Kandidaten — ${job.slug}</title><style>
 :root{color-scheme:dark} body{margin:0;padding:28px;background:#17100b;color:#F0E8D8;
 font:15px/1.55 ui-serif,Georgia,serif}
 h1{font:700 22px/1.3 ui-sans-serif,system-ui;margin:0 0 4px;color:#C8882A}
 .muss{background:#9C3A0E;color:#F7EEDD;display:inline-block;padding:4px 7px;
 font:700 10px/1 ui-sans-serif,system-ui;letter-spacing:.14em;margin-right:8px}
 p.brief{max-width:80ch;color:#d8cbb4;font-size:14px}
 .raster{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;margin-top:22px}
 figure{margin:0;border:1px solid #3a2818}
 img{display:block;width:100%;height:210px;object-fit:cover}
 figcaption{padding:9px 11px;font:12px/1.5 ui-sans-serif,system-ui;color:#a8895f}
 code{color:#F0E8D8;background:#241a12;padding:1px 5px}
 .d{color:#6b5842}
</style></head><body>
<h1>${job.slug}</h1>
<p class="brief"><span class="muss">MUSS</span>${job.muss}</p>
<p class="brief d">Suchbegriff: „${job.suche}" — Auswahl per <code>node scripts/rezept-bild-austausch.mjs --waehle ${job.slug}=&lt;quelle&gt;-&lt;id&gt;</code></p>
<div class="raster">${karten}</div>
</body></html>`
  await writeFile(join(ordner, 'auswahl.html'), html, 'utf8')
}

/** Gewaehlten Kandidaten in Originalaufloesung als Quellfoto uebernehmen. */
async function modusWaehle(ausdruck) {
  const [slug, wahl] = ausdruck.split('=').map(s => s.trim())
  const job = JOBS.find(j => j.slug === slug)
  if (!job) throw new Error(`Unbekannter Slug: ${slug}`)
  const pfad = join(KANDIDATEN, slug, 'kandidaten.json')
  if (!existsSync(pfad)) throw new Error(`Erst suchen: --suche ${slug}`)
  const liste = JSON.parse(await readFile(pfad, 'utf8'))
  // Quelle unabhaengig von Gross-/Kleinschreibung vergleichen, die ID aber
  // exakt: Unsplash-IDs sind gemischt geschrieben (uKVaDWj7n-A) und enthalten
  // selbst Bindestriche, deshalb nur am ERSTEN Bindestrich trennen. Ein
  // pauschales toLowerCase() ueber die ganze Eingabe liess zuvor jede
  // Unsplash-Auswahl ins Leere laufen.
  const trenn = wahl.indexOf('-')
  const wahlQuelle = wahl.slice(0, trenn).toLowerCase()
  const wahlId = wahl.slice(trenn + 1)
  const treffer = liste.find(t => t.quelle.toLowerCase() === wahlQuelle && t.id === wahlId)
  if (!treffer) throw new Error(`Kandidat "${wahl}" nicht in der Liste von ${slug}`)

  const res = await fetch(treffer.original)
  if (!res.ok) throw new Error(`Download fehlgeschlagen: HTTP ${res.status}`)
  await mkdir(QUELLEN, { recursive: true })
  await writeFile(join(QUELLEN, `${slug}.jpg`), Buffer.from(await res.arrayBuffer()))

  const indexPfad = join(QUELLEN, 'quellen.json')
  const index = existsSync(indexPfad) ? JSON.parse(await readFile(indexPfad, 'utf8')) : {}
  index[slug] = { quelle: treffer.quelle, id: treffer.id, fotograf: treffer.fotograf }
  await writeFile(indexPfad, JSON.stringify(index, null, 2))
  console.log(`  ${c.g('✓')} ${slug} ← ${treffer.quelle} / ${treffer.fotograf} (${treffer.id})`)
  console.log(c.d(`    Weiter mit: --only ${slug}\n`))
}

// ── Ablauf ──────────────────────────────────────────────────────────────────

async function quellenIndex() {
  const pfad = join(QUELLEN, 'quellen.json')
  if (!existsSync(pfad)) return {}
  return JSON.parse(await readFile(pfad, 'utf8'))
}

async function main() {
  await mkdir(QUELLEN, { recursive: true })
  await mkdir(ERGEBNIS, { recursive: true })

  const index = await quellenIndex()
  let jobs = JOBS
  if (ONLY) jobs = jobs.filter(j => ONLY.includes(j.slug))
  if (KALIBRIER) jobs = JOBS.filter(j => j.slug === KALIBRIER)

  console.log(c.b('\n  Rezeptbild-Austausch — 22 Falsch-Motive\n'))

  if (WAEHLE) { await modusWaehle(WAEHLE); return }

  if (NEURAHMEN !== null) {
    // Rahmung aus dem gesicherten Rohbild neu erzeugen — ohne fal, ohne Kosten.
    // Dafuer liegt <slug>--roh.jpg im Ergebnisordner.
    const slugs = NEURAHMEN ? NEURAHMEN.split(',').map(s => s.trim()) : JOBS.map(j => j.slug)
    for (const slug of slugs) {
      const roh = join(ERGEBNIS, `${slug}--roh.jpg`)
      if (!existsSync(roh)) { console.log(`  ${c.y('·')} ${slug} — kein Rohbild, Neurahmen nicht moeglich`); continue }
      const buf = await readFile(roh)
      const verboten = BESCHNITT_VERBOTEN.has(slug)
      await writeFile(join(ERGEBNIS, `${slug}.jpg`), await rahmen(buf, 1600, 1000, verboten))
      await writeFile(join(ERGEBNIS, `${slug}-hero.jpg`), await rahmen(buf, 1920, 1080, verboten))
      console.log(`  ${c.g('✓')} ${slug.padEnd(28)} ${verboten ? 'eingepasst' : 'beschnitten'}`)
    }
    console.log(c.d('\n  Ohne fal-Aufruf, ohne Kosten.\n'))
    return
  }

  if (SUCHE !== null) {
    const zuSuchen = SUCHE ? JOBS.filter(j => SUCHE.split(',').map(s => s.trim()).includes(j.slug)) : JOBS
    await modusSuche(zuSuchen, PRO_QUELLE)
    return
  }

  if (CHECK) {
    let da = 0
    for (const j of JOBS) {
      const p = join(QUELLEN, `${j.slug}.jpg`)
      const ok = existsSync(p)
      if (ok) da++
      console.log(`  ${ok ? c.g('✓') : c.y('·')} ${j.slug.padEnd(28)} ${ok ? c.d(index[j.slug]?.fotograf || 'Fotograf fehlt in quellen.json') : c.d('Unsplash: ' + j.suche)}`)
    }
    console.log(`\n  ${da}/${JOBS.length} Quellfotos vorhanden.\n`)
    return
  }

  if (!DRY && !FAL_KEY) { console.error(c.r('  FAL_KEY fehlt.')); process.exit(1) }

  // Profilpruefung VOR dem ersten Edit: Die Sperre in grade() greift sonst erst
  // nach dem kostenpflichtigen fal-Aufruf — der Lauf haette dann Guthaben
  // verbraucht, nur um am Grading zu scheitern.
  if (!KALIBRIER && PROFIL_GESPERRT.includes(PROFIL)) {
    console.error(c.r(`  Profil "${PROFIL}" ist in der Rezept-Pipeline gesperrt.`))
    console.error(c.d(`  Nach dem Nano-Banana-Edit gilt immer "kraeftig" — siehe`))
    console.error(c.d(`  docs/bildstrategie-grading.md, Abschnitt "Zwei Pipeline-Kontexte".\n`))
    process.exit(1)
  }
  if (!PROFILE[PROFIL]) { console.error(c.r(`  Unbekanntes Profil: ${PROFIL}`)); process.exit(1) }

  for (const job of jobs) {
    const quelle = join(QUELLEN, `${job.slug}.jpg`)
    const prompt = baueprompt(job)

    if (DRY) {
      console.log(c.b(`  ${job.slug}`))
      console.log(c.d(`  ${prompt}\n`))
      continue
    }
    if (!existsSync(quelle)) {
      console.log(`  ${c.y('·')} ${job.slug} — kein Quellfoto (Unsplash: ${job.suche})`)
      continue
    }

    try {
      process.stdout.write(`  … ${job.slug} `)
      const roh = await readFile(quelle)
      const url = await falUpload(roh, `${job.slug}-quelle.jpg`)
      const editiert = await falEdit(url, prompt)

      if (KALIBRIER) {
        // Kalibrierleiter: beide Profile plus ungegradetes Ergebnis nebeneinander,
        // damit die sharp-Werte gegen den Soll-Look eingefroren werden koennen.
        await writeFile(join(ERGEBNIS, `${job.slug}--0-ungegradet.jpg`), await rahmen(editiert, 1600, 1000))
        for (const p of Object.keys(PROFILE)) {
          // imKalibrierlauf: Hier darf auch das gesperrte Profil gerendert werden,
          // sonst laesst sich die Sperre nicht mehr gegen den Soll-Look belegen.
          await writeFile(join(ERGEBNIS, `${job.slug}--${p}.jpg`), await rahmen(await grade(editiert, p, true), 1600, 1000))
        }
        console.log(c.g('Kalibrierleiter geschrieben'))
        continue
      }

      const gegradet = await grade(editiert, PROFIL)
      // Das gegradete Bild VOR der Rahmung sichern. Ohne das kostet jedes
      // spaetere Umrahmen einen neuen kostenpflichtigen Edit — beim Wechsel der
      // Beschnitt-Regel am 18.08.2026 genau so passiert.
      await writeFile(join(ERGEBNIS, `${job.slug}--roh.jpg`), gegradet)
      await writeFile(join(ERGEBNIS, `${job.slug}.jpg`), await rahmen(gegradet, 1600, 1000, BESCHNITT_VERBOTEN.has(job.slug)))
      await writeFile(join(ERGEBNIS, `${job.slug}-hero.jpg`), await rahmen(gegradet, 1920, 1080, BESCHNITT_VERBOTEN.has(job.slug)))
      console.log(c.g('fertig'))
    } catch (e) {
      console.log(c.r(`Fehler: ${e.message}`))
    }
  }

  console.log(c.d(`\n  Ergebnisse in bild-austausch/ergebnis/ — nichts in public/, nichts committet.\n`))
}

// Nur ausfuehren, wenn direkt aufgerufen — der Kontaktbogen importiert JOBS von hier.
// pathToFileURL statt String-Bastelei: auf Windows wuerde `file://C:/...` das
// Laufwerk als Host lesen und der Vergleich schluege immer fehl.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error(c.r(e.stack || e.message)); process.exit(1) })
}
