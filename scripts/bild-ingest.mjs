#!/usr/bin/env node
/**
 * Bild-Ingest: von der Fundgrube ins Repo, mit belegter Herkunft.
 *
 * Das Problem, das dieses Skript loest: Ein heruntergeladenes Stockbild verliert
 * seine Herkunft in dem Moment, in dem es im Dateisystem liegt. Wer sie spaeter
 * rekonstruieren will, findet sie nicht mehr — und ein Bild ohne belegbare
 * Herkunft ist auf einer kommerziellen Seite unbenutzbar.
 *
 * Die Loesung braucht keine Datenbank und keine Disziplin beim Ablegen:
 *   Ordnername  = Quelle    (pexels/, pixabay/, magnific/, ...)
 *   Dateiname   = Bild-ID   (5252598-grill-holzkohle.jpg → 5252598)
 * Daraus leitet dieses Skript Lizenz, Attributionspflicht und KI-Status ab.
 * Beim Ablegen ist also nichts zu dokumentieren — nur der richtige Ordner.
 *
 * Was es NICHT tut: raten. Unbekannte Quelle, fehlende ID oder ein Bild aus
 * _unsortiert/ fuehren zum Abbruch, nicht zu einer Vermutung. Ein falscher
 * Herkunftseintrag ist schlimmer als gar keiner, weil er Sicherheit vortaeuscht.
 *
 * Usage:
 *   node scripts/bild-ingest.mjs                       # Statusbericht der Fundgrube
 *   node scripts/bild-ingest.mjs --suche "brisket smoked" --n 5
 *                                                      # Stock-Kandidaten + Vorschauen
 *   node scripts/bild-ingest.mjs --hole pexels:36869213 \
 *        --typ cuts --slug brisket --alt "Beschreibung des Motivs"
 *                                                      # laedt Original + ingestiert
 *   node scripts/bild-ingest.mjs --datei pexels/xy.jpg \
 *        --typ methoden --slug direktes-grillen --alt "..."
 *                                                      # Ingest aus der Fundgrube
 *   node scripts/bild-ingest.mjs --aufraeumen           # _kandidaten leeren
 *
 * Flags: --dry-run (nichts schreiben), --force (Zieldatei ueberschreiben),
 *        --ki (imageAI erzwingen), --autor "Name" (Pflicht bei Magnific)
 *
 * WICHTIG: Suchtreffer IMMER visuell sichten. Die Plattformen zerlegen Phrasen
 * und liefern grob Themenfremdes; der Domaenenfilter faengt das nur grob ab.
 */

import { readFile, writeFile, readdir, stat, copyFile, rename, mkdir } from 'fs/promises'
import { existsSync, readFileSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')
const FUNDGRUBE = process.env.BILD_FUNDGRUBE || join(ROOT, '..', '_bilder-fundgrube')
const CONTENT   = join(ROOT, 'content')
const PUBLIC    = join(ROOT, 'public', 'images')

const c = {
  g: s => `\x1b[32m${s}\x1b[0m`, y: s => `\x1b[33m${s}\x1b[0m`,
  r: s => `\x1b[31m${s}\x1b[0m`, d: s => `\x1b[2m${s}\x1b[0m`,
  b: s => `\x1b[1m${s}\x1b[0m`,
}

const argv = process.argv.slice(2)
const DRY   = argv.includes('--dry-run')
const FORCE = argv.includes('--force')
const arg = n => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null }

/* ------------------------------------------------------------------ *
 * Quellenregister — kodiert docs/bildquellen-whitelist.md.
 * Aendert sich die Whitelist, aendert sich diese Tabelle mit. Sie ist
 * bewusst hier und nicht in einer JSON-Datei: Lizenzregeln gehoeren dorthin,
 * wo sie angewendet werden, sonst laufen Doku und Code auseinander.
 * ------------------------------------------------------------------ */
const QUELLEN = {
  'pexels':        { name: 'Pexels',        ampel: 'gruen', attribution: false, kiDefault: false,
                     url: id => `https://www.pexels.com/photo/${id}/` },
  'unsplash':      { name: 'Unsplash',      ampel: 'gruen', attribution: false, kiDefault: false,
                     url: id => `https://unsplash.com/photos/${id}` },
  // Burst vergibt Slugs statt numerischer IDs — deshalb ohneId, sonst blockiert
  // die ID-Pruefung jedes Burst-Bild grundlos.
  'shopify-burst': { name: 'Burst',         ampel: 'gruen', attribution: false, kiDefault: false,
                     url: () => 'https://www.shopify.com/stock-photos', ohneId: true },
  'stocksnap':     { name: 'StockSnap',     ampel: 'gruen', attribution: false, kiDefault: false,
                     url: id => `https://stocksnap.io/photo/${id}` },
  'pixabay':       { name: 'Pixabay',       ampel: 'gelb',  attribution: false, kiDefault: false,
                     url: id => `https://pixabay.com/images/id-${id}/`,
                     hinweis: 'Pixabay hostet gekennzeichnete KI-Bilder. Nicht-KI pruefen oder --ki setzen. Keine erkennbaren Marken/Logos.' },
  'magnific':      { name: 'Magnific',      ampel: 'gelb',  attribution: true,  kiDefault: false,
                     url: id => `https://www.magnific.com/de/bilder/${id}`,
                     lizenzBeleg: true,
                     hinweis: 'ATTRIBUTIONSPFLICHT. Lizenz-PDF muss neben der Bilddatei liegen.' },
  'eigene-fotos':  { name: 'Eigenes Foto',  ampel: 'gruen', attribution: false, kiDefault: false,
                     url: () => null, ohneId: true },
  'ki-eigen':      { name: 'Eigene KI',     ampel: 'gruen', attribution: false, kiDefault: true,
                     url: () => null, ohneId: true },
}

/** Ordner, die nie ingestiert werden. _unsortiert ist Durchlaufstation, kein Lager. */
const IGNORIERT = ['_unsortiert', '_screenshots', '_referenz', '_fertig']

/* ------------------------------------------------------------------ *
 * Stock-Suche. Dieselben Endpunkte und dieselbe Quellenreihenfolge wie
 * scripts/rezept-bild-austausch.mjs — dort fuer Rezepte, hier fuer alles
 * andere. Der Download landet direkt korrekt benannt im Quellordner, damit
 * die Herkunft gar nicht erst verlorengehen kann.
 * ------------------------------------------------------------------ */

/** Liest einen Schluessel aus der Umgebung oder .env.local. */
function key(name) {
  if (process.env[name]) return process.env[name]
  for (const datei of ['.env.local', '.env']) {
    const p = join(ROOT, datei)
    if (!existsSync(p)) continue
    const treffer = readFileSync(p, 'utf8').split('\n').find(z => z.startsWith(`${name}=`))
    if (treffer) return treffer.slice(name.length + 1).trim().replace(/^["']|["']$/g, '')
  }
  return null
}

async function suchePexels(q, n) {
  const k = key('PEXELS_API_KEY'); if (!k) return []
  const r = await fetch(`https://api.pexels.com/v1/search?per_page=${n}&query=${encodeURIComponent(q)}`,
    { headers: { Authorization: k } })
  if (!r.ok) return []
  const j = await r.json()
  return (j.photos || []).map(p => ({
    quelle: 'pexels', id: String(p.id), fotograf: p.photographer || '—',
    beschreibung: p.alt || '', vorschau: p.src?.medium,
    original: p.src?.original, breite: p.width, hoehe: p.height,
  }))
}

async function sucheUnsplash(q, n) {
  const k = key('UNSPLASH_ACCESS_KEY'); if (!k) return []
  const r = await fetch(`https://api.unsplash.com/search/photos?per_page=${n}&query=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Client-ID ${k}` } })
  if (!r.ok) return []
  const j = await r.json()
  return (j.results || []).map(p => ({
    quelle: 'unsplash', id: p.id, fotograf: p.user?.name || '—',
    beschreibung: p.alt_description || p.description || '', vorschau: p.urls?.small,
    original: `${p.urls?.raw}&w=2400&fm=jpg&q=90`, breite: p.width, hoehe: p.height,
  }))
}

/**
 * Pixabay steht auf GELB: Die Plattform hostet KI-Bilder, kennzeichnet sie aber
 * ueber das API-Feld `isAiGenerated`. Der Query-Parameter `&ai=false` wirkt nicht,
 * also clientseitig filtern und dafuer ueberzogen abfragen.
 */
let pixabayGefiltert = 0
let themenfremd = 0
async function suchePixabay(q, n) {
  const k = key('PIXABAY_API_KEY'); if (!k) return []
  const r = await fetch(`https://pixabay.com/api/?key=${k}&image_type=photo&per_page=${Math.max(3, n * 4)}&q=${encodeURIComponent(q)}`)
  if (!r.ok) return []
  const j = await r.json()
  const alle = j.hits || []
  const echt = alle.filter(p => p.isAiGenerated !== true)
  pixabayGefiltert += alle.length - echt.length
  return echt.slice(0, n).map(p => ({
    quelle: 'pixabay', id: String(p.id), fotograf: p.user || '—',
    beschreibung: p.tags || '', vorschau: p.webformatURL,
    original: p.largeImageURL, breite: p.imageWidth, hoehe: p.imageHeight,
  }))
}

const RANG = { pexels: 1, unsplash: 2, pixabay: 3 }

/**
 * Domaenenfilter. Grund (29.08.2026): Pixabay zerlegt Suchphrasen in Einzelwoerter
 * und verodert sie. "baby back ribs dry rub smoker" lieferte deshalb Elefantenbabys
 * aus Namibia und schlafende Kleinkinder — Treffer auf "baby" und "back". Unsplash
 * matchte "bark" auf Baumrinde, "thermometer" auf Fieberthermometer.
 *
 * Solche Treffer sind nicht nur nutzlos: Sie werden als Vorschau heruntergeladen und
 * liegen dann als Fotos fremder Kinder im Projektordner. Das gehoert dort nicht hin,
 * unabhaengig davon, dass sie nie verwendet werden.
 *
 * Der Filter greift nur, wenn die Plattform ueberhaupt eine Beschreibung liefert —
 * ohne Text wird durchgelassen statt geraten. Bewusst weit gefasst: er soll grob
 * Themenfremdes abweisen, nicht die Motivauswahl vorwegnehmen. Die bleibt Sichtsache.
 */
const DOMAENE = [
  'meat', 'beef', 'pork', 'steak', 'brisket', 'rib', 'sausage', 'bacon', 'lamb', 'chicken',
  'grill', 'barbecue', 'bbq', 'braai', 'smoker', 'smoke', 'roast', 'sear', 'char', 'skewer',
  'charcoal', 'ember', 'coal', 'flame', 'fire', 'pit', 'oven', 'pan', 'skillet', 'cast iron',
  'food', 'meal', 'dish', 'dinner', 'cook', 'kitchen', 'chef', 'cuisine', 'eat', 'plate',
  'sauce', 'spice', 'herb', 'rub', 'marinade', 'knife', 'blade', 'board', 'thermometer',
  'butcher', 'wagyu', 'fillet', 'chop', 'slice', 'grilling', 'roasting',
]

function imThema(t) {
  const text = (t.beschreibung || '').toLowerCase()
  if (!text.trim()) return true              // keine Beschreibung → nicht bestrafen
  return DOMAENE.some(w => text.includes(w))
}

async function sucheAlle(query, proQuelle = 5) {
  const listen = await Promise.all([
    suchePexels(query, proQuelle), sucheUnsplash(query, proQuelle), suchePixabay(query, proQuelle),
  ])
  const gesehen = new Set()
  const roh = listen.flat()
  const imThemaListe = roh.filter(imThema)
  themenfremd = roh.length - imThemaListe.length
  return imThemaListe
    .filter(t => { const s = `${t.quelle}:${t.id}`; if (gesehen.has(s)) return false; gesehen.add(s); return true })
    // Querformat bevorzugen: die Hero-Flaechen sind 65vh Full-Bleed, Hochformate
    // muessten so stark beschnitten werden, dass vom Motiv wenig uebrig bleibt.
    .filter(t => !t.breite || t.breite >= t.hoehe)
    .sort((a, b) => RANG[a.quelle] - RANG[b.quelle])
}

async function ladeDatei(url, ziel) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`Download fehlgeschlagen: HTTP ${r.status}`)
  await writeFile(ziel, Buffer.from(await r.arrayBuffer()))
}

/* ------------------------------------------------------------------ */

/** Setzt ein Frontmatter-Feld oder legt es an. Konvention aus bild-austausch-uebernehmen.mjs. */
function setzeFeld(raw, feld, wert) {
  const re = new RegExp(`^${feld}:.*$`, 'm')
  const zeile = typeof wert === 'boolean' ? `${feld}: ${wert}` : `${feld}: "${String(wert).replace(/"/g, '\\"')}"`
  if (re.test(raw)) return raw.replace(re, zeile)
  // Neues Feld hinter imageAlt einhaengen — dort gehoert es thematisch hin.
  if (/^imageAlt:.*$/m.test(raw)) return raw.replace(/^(imageAlt:.*)$/m, `$1\n${zeile}`)
  return raw.replace(/^---\n/, `---\n${zeile}\n`)
}

/**
 * Bild-ID aus dem Dateinamen.
 *
 * Pexels benennt nach dem Muster `pexels-<fotograf>-<fotografID>-<fotoID>.jpg`.
 * Die erste Zahl ist dort die Fotografen-ID, nicht die des Bildes — wer sie
 * nimmt, schreibt eine Herkunft ins Manifest, die auf ein fremdes Bild zeigt.
 * Bei Pexels gilt deshalb die LETZTE Zahlengruppe, sonst die fuehrende.
 */
function leseId(datei, quelle) {
  const name = basename(datei, extname(datei))
  // Unsplash vergibt alphanumerische IDs (z. B. "TDwxg8i8lfE"), keine Ziffernfolgen.
  // Eine reine Zifferpruefung wuerde jedes Unsplash-Bild faelschlich blockieren.
  if (quelle === 'unsplash') return /^[A-Za-z0-9_-]{6,}$/.test(name) ? name : null
  if (/^pexels[-_]/i.test(name)) {
    const zahlen = name.match(/\d{4,}/g)
    return zahlen ? zahlen[zahlen.length - 1] : null
  }
  const vorn = name.match(/^(\d{4,})/)
  if (vorn) return vorn[1]
  const irgendwo = name.match(/(\d{6,})/)
  return irgendwo ? irgendwo[1] : null
}

async function dateienIn(ordner) {
  if (!existsSync(ordner)) return []
  const alle = await readdir(ordner, { withFileTypes: true })
  return alle.filter(e => e.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(e.name)).map(e => e.name)
}

/* ------------------------------------------------------------------ *
 * Statusbericht — was liegt in der Fundgrube, was ist verwertbar
 * ------------------------------------------------------------------ */
async function bericht() {
  if (!existsSync(FUNDGRUBE)) {
    console.log(c.r(`✗ Fundgrube nicht gefunden: ${FUNDGRUBE}`))
    console.log(c.d('  Pfad ueber BILD_FUNDGRUBE setzen, falls sie woanders liegt.'))
    process.exit(1)
  }
  console.log(c.b(`\nFundgrube: ${FUNDGRUBE}\n`))

  let verwertbar = 0, blockiert = 0
  for (const [ordner, q] of Object.entries(QUELLEN)) {
    const dateien = await dateienIn(join(FUNDGRUBE, ordner))
    if (!dateien.length) continue
    const ampel = q.ampel === 'gruen' ? c.g('●') : c.y('●')
    console.log(`${ampel} ${c.b(q.name.padEnd(14))} ${dateien.length} Datei(en)${q.attribution ? c.y('  [Attribution Pflicht]') : ''}`)
    for (const d of dateien) {
      const id = q.ohneId ? '—' : leseId(d, ordner)
      const problem = []
      if (!q.ohneId && !id) problem.push('keine ID im Dateinamen')
      if (q.lizenzBeleg) {
        const pdfs = (await readdir(join(FUNDGRUBE, ordner))).filter(f => f.toLowerCase().endsWith('.pdf'))
        if (!pdfs.length) problem.push('Lizenz-PDF fehlt')
      }
      if (problem.length) { blockiert++; console.log(`   ${c.r('✗')} ${d}\n     ${c.r(problem.join(' · '))}`) }
      else { verwertbar++; console.log(`   ${c.g('✓')} ${d} ${c.d(`ID ${id}`)}`) }
    }
    if (q.hinweis) console.log(c.d(`   ${q.hinweis}`))
    console.log()
  }

  // _unsortiert altern lassen und warnen — nach ~30 Tagen ist die
  // Chrome-Download-Historie weg und die Herkunft nicht mehr belegbar.
  const unsortiert = await dateienIn(join(FUNDGRUBE, '_unsortiert'))
  if (unsortiert.length) {
    let aeltester = 0
    for (const d of unsortiert) {
      const s = await stat(join(FUNDGRUBE, '_unsortiert', d))
      aeltester = Math.max(aeltester, Math.floor((Date.now() - s.mtimeMs) / 86400000))
    }
    console.log(c.y(`⚠ _unsortiert: ${unsortiert.length} Datei(en) ohne Herkunft, aelteste seit ${aeltester} Tagen.`))
    console.log(c.d('  Wird vom Ingest ignoriert. Quelle ueber chrome://downloads rekonstruieren,'))
    console.log(c.d('  danach in den passenden Quellordner verschieben.'))
    if (aeltester > 30) console.log(c.r('  Aelter als 30 Tage — Herkunft vermutlich nicht mehr belegbar.'))
    console.log()
  }

  const wurzel = await dateienIn(FUNDGRUBE)
  if (wurzel.length) {
    console.log(c.r(`✗ ${wurzel.length} Datei(en) direkt im Wurzelordner — ohne Quellordner keine Herkunft:`))
    wurzel.forEach(d => console.log(`   ${d}`))
    console.log()
  }

  console.log(c.b(`${verwertbar} verwertbar, ${blockiert} blockiert, ${unsortiert.length} ohne Herkunft\n`))
}

/* ------------------------------------------------------------------ *
 * Ingest eines einzelnen Bildes
 * ------------------------------------------------------------------ */
async function ingest() {
  const rel  = arg('datei')
  const typ  = arg('typ')
  const slug = arg('slug')
  const alt  = arg('alt')
  const kiFlag = argv.includes('--ki')

  if (!rel || !typ || !slug) {
    console.log(c.r('✗ --datei, --typ und --slug sind Pflicht.'))
    console.log(c.d('  Beispiel: --datei pexels/35963583.jpg --typ methoden --slug direktes-grillen'))
    process.exit(1)
  }

  const [ordner, dateiname] = rel.split(/[/\\]/)
  const q = QUELLEN[ordner]
  if (!q) {
    console.log(c.r(`✗ Unbekannte Quelle "${ordner}".`))
    if (IGNORIERT.includes(ordner)) console.log(c.r('  Dieser Ordner ist bewusst gesperrt — Herkunft ist nicht belegt.'))
    console.log(c.d(`  Erlaubt: ${Object.keys(QUELLEN).join(', ')}`))
    process.exit(1)
  }

  const quellDatei = join(FUNDGRUBE, ordner, dateiname)
  if (!existsSync(quellDatei)) { console.log(c.r(`✗ Datei nicht gefunden: ${quellDatei}`)); process.exit(1) }

  const id = q.ohneId ? null : leseId(dateiname, ordner)
  if (!q.ohneId && !id) {
    console.log(c.r(`✗ Keine Bild-ID im Dateinamen "${dateiname}".`))
    console.log(c.d('  Ohne ID laesst sich die Herkunft spaeter nicht rekonstruieren.'))
    process.exit(1)
  }

  if (q.lizenzBeleg) {
    const pdfs = (await readdir(join(FUNDGRUBE, ordner))).filter(f => f.toLowerCase().endsWith('.pdf'))
    if (!pdfs.length) {
      console.log(c.r(`✗ ${q.name} verlangt Attribution — Lizenz-PDF fehlt im Ordner.`))
      process.exit(1)
    }
  }

  const zielOrdner = join(PUBLIC, typ)
  const zielDatei  = join(zielOrdner, `${slug}.jpg`)
  const mdx        = join(CONTENT, typ, `${slug}.mdx`)

  if (!existsSync(mdx)) { console.log(c.r(`✗ Kein Content gefunden: ${mdx}`)); process.exit(1) }
  if (existsSync(zielDatei) && !FORCE) {
    console.log(c.r(`✗ ${zielDatei} existiert bereits. --force zum Ueberschreiben.`))
    process.exit(1)
  }

  const ki = kiFlag || q.kiDefault
  const autor = arg('autor')
  const quellUrl = q.url(id)

  // Attributionspflichtige Quellen brauchen den Autornamen — die Lizenzformel
  // lautet "designed by <autor> Magnific.com". Ohne Autor ist die Pflicht nicht
  // erfuellbar, also hier abbrechen statt spaeter eine halbe Zeile zu rendern.
  if (q.attribution && !autor) {
    console.log(c.r(`✗ ${q.name} verlangt Attribution — --autor ist Pflicht.`))
    console.log(c.d('  Der Name steht im Lizenz-PDF unter "Licensor\'s author".'))
    process.exit(1)
  }

  // Format bewusst mit "·" getrennt: lesbar im Frontmatter und parsebar durch
  // <BildCredit>. Der Marker am Ende steuert, ob eine Credit-Zeile gerendert wird.
  const herkunft = q.ohneId
    ? (ki ? 'Eigene KI-Erzeugung' : 'Eigenes Foto')
    : [q.name, `ID ${id}`, autor, quellUrl, q.attribution ? 'Attribution pflichtig' : null]
        .filter(Boolean).join(' · ')

  console.log(c.b('\nIngest'))
  console.log(`  Quelle    ${q.name}${q.attribution ? c.y('  [Attribution Pflicht]') : ''}`)
  console.log(`  Bild-ID   ${id ?? '—'}`)
  console.log(`  Ziel      public/images/${typ}/${slug}.jpg`)
  console.log(`  Content   content/${typ}/${slug}.mdx`)
  console.log(`  imageAI   ${ki}`)
  console.log(`  Herkunft  ${c.d(herkunft)}`)
  if (DRY) { console.log(c.y('\n--dry-run: nichts geschrieben.\n')); return }

  // Bild optimieren. sharp ist bereits Projektabhaengigkeit (seo-image-optimizer).
  await mkdir(zielOrdner, { recursive: true })
  try {
    const { default: sharp } = await import('sharp')
    await sharp(quellDatei).rotate().resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true }).toFile(zielDatei)
    console.log(c.g('  ✓ Bild optimiert (max 1920px, q82)'))
  } catch (e) {
    await copyFile(quellDatei, zielDatei)
    console.log(c.y(`  ⚠ sharp nicht verfuegbar (${e.message}) — Datei unveraendert kopiert`))
  }

  // Frontmatter
  let raw = await readFile(mdx, 'utf8')
  raw = setzeFeld(raw, 'image', `/images/${typ}/${slug}.jpg`)
  raw = setzeFeld(raw, 'imageSource', herkunft)
  raw = setzeFeld(raw, 'imageAI', ki)
  if (alt) raw = setzeFeld(raw, 'imageAlt', alt)
  await writeFile(mdx, raw)
  console.log(c.g('  ✓ Frontmatter gesetzt'))

  // CREDITS.md fortschreiben
  const credits = join(zielOrdner, 'CREDITS.md')
  const zeile = `| \`${slug}.jpg\` | ${alt ?? '—'} | ${q.name} | ${id ?? '—'} | ${quellUrl ?? 'eigen'} |`
  if (existsSync(credits)) {
    const vorher = await readFile(credits, 'utf8')
    if (!vorher.includes(`\`${slug}.jpg\``)) {
      // Hinter die LETZTE Tabellenzeile einhaengen, nicht ans Dateiende:
      // die CREDITS-Dateien fuehren unter der Tabelle noch Befund-Abschnitte,
      // und eine Tabellenzeile dahinter rendert als loser Text.
      const zeilen = vorher.trimEnd().split('\n')
      let letzte = -1
      for (let i = zeilen.length - 1; i >= 0; i--) {
        if (zeilen[i].trimStart().startsWith('|')) { letzte = i; break }
      }
      if (letzte >= 0) zeilen.splice(letzte + 1, 0, zeile)
      else zeilen.push('', zeile)
      await writeFile(credits, `${zeilen.join('\n')}\n`)
      console.log(c.g('  ✓ CREDITS.md ergaenzt'))
    } else console.log(c.d('  · CREDITS.md: Eintrag existiert bereits'))
  } else {
    await writeFile(credits, `# Bildquellen ${typ} (Provenienz)\n\n` +
      `Einstufung je Quelle: docs/bildquellen-whitelist.md\n\n` +
      `| Datei | Motiv | Quelle | ID | Link |\n|---|---|---|---|---|\n${zeile}\n`)
    console.log(c.g('  ✓ CREDITS.md angelegt'))
  }

  // Original archivieren, damit die Fundgrube nicht zum Lager wird
  await mkdir(join(FUNDGRUBE, '_fertig', ordner), { recursive: true })
  await rename(quellDatei, join(FUNDGRUBE, '_fertig', ordner, dateiname)).catch(() => {})

  if (q.attribution) {
    console.log(c.y('\n⚠ Attributionspflicht: Die Credit-Zeile muss auf der Seite sichtbar sein.'))
    console.log(c.d('  <BildCredit source="..." /> rendert sie aus imageSource.'))
  }
  console.log(c.g('\n✓ fertig\n'))
}

/* ------------------------------------------------------------------ *
 * Suchmodus: Kandidaten finden, Vorschauen als Kontaktbogen ablegen
 * ------------------------------------------------------------------ */
async function suchen() {
  const query = arg('suche')
  const n = Number(arg('n') || 4)
  const treffer = await sucheAlle(query, n)
  if (!treffer.length) { console.log(c.r(`✗ keine Treffer fuer "${query}"`)); return }

  const bogen = join(FUNDGRUBE, '_kandidaten', query.replace(/[^a-z0-9]+/gi, '-').toLowerCase())
  await mkdir(bogen, { recursive: true })

  console.log(c.b(`\n"${query}" — ${treffer.length} Kandidaten\n`))
  const index = []
  for (const [i, t] of treffer.entries()) {
    const nr = String(i + 1).padStart(2, '0')
    const datei = join(bogen, `${nr}_${t.quelle}_${t.id}.jpg`)
    try { await ladeDatei(t.vorschau, datei) } catch { continue }
    index.push({ nr, ...t })
    console.log(`  ${c.b(nr)} ${t.quelle.padEnd(9)} ${String(t.id).padEnd(12)} ${c.d((t.beschreibung || '').slice(0, 58))}`)
  }
  await writeFile(join(bogen, 'index.json'), JSON.stringify(index, null, 2))
  if (pixabayGefiltert) console.log(c.d(`\n  ${pixabayGefiltert} Treffer als KI-generiert aussortiert`))
  if (themenfremd) console.log(c.d(`  ${themenfremd} Treffer als themenfremd aussortiert (Wortzerlegung der Plattform)`))
  console.log(c.d(`\n  Vorschauen: ${bogen}`))
  console.log(c.d(`  Uebernehmen: --hole <quelle>:<id> --typ <typ> --slug <slug> --alt "..."\n`))
}

/** Laedt ein Original aus der Suche in den Quellordner und ingestiert es direkt. */
async function holen() {
  const [quelle, id] = arg('hole').split(':')
  if (!QUELLEN[quelle]) { console.log(c.r(`✗ Unbekannte Quelle "${quelle}"`)); process.exit(1) }

  // Original-URL aus einem der Kandidaten-Indizes suchen
  const basis = join(FUNDGRUBE, '_kandidaten')
  let kandidat = null
  if (existsSync(basis)) {
    for (const ordner of await readdir(basis)) {
      const idx = join(basis, ordner, 'index.json')
      if (!existsSync(idx)) continue
      const gefunden = JSON.parse(await readFile(idx, 'utf8'))
        .find(t => t.quelle === quelle && String(t.id) === id)
      if (gefunden) { kandidat = gefunden; break }
    }
  }
  if (!kandidat) { console.log(c.r(`✗ ${quelle}:${id} in keinem Kandidaten-Index gefunden. Erst --suche.`)); process.exit(1) }

  const dateiname = `${id}.jpg`
  await mkdir(join(FUNDGRUBE, quelle), { recursive: true })
  const ziel = join(FUNDGRUBE, quelle, dateiname)
  await ladeDatei(kandidat.original, ziel)
  console.log(c.g(`  ✓ geladen: ${quelle}/${dateiname} ${c.d(`(${kandidat.fotograf})`)}`))

  // Direkt weiter in den Ingest — Argumente umbiegen
  argv.push('--datei', `${quelle}/${dateiname}`)
  if (QUELLEN[quelle].attribution && !arg('autor')) argv.push('--autor', kandidat.fotograf)
  await ingest()
}

/**
 * Leert _kandidaten. Die Vorschauen sind Wegwerfmaterial fuer eine einzige
 * Sichtung — bleiben sie liegen, waechst ein zweiter, unsortierter Bildbestand
 * neben der Fundgrube heran, dessen Herkunft niemand mehr zuordnet.
 */
async function aufraeumen() {
  const basis = join(FUNDGRUBE, '_kandidaten')
  if (!existsSync(basis)) { console.log(c.d('  _kandidaten existiert nicht — nichts zu tun')); return }
  const { rm } = await import('fs/promises')
  const ordner = await readdir(basis)
  let dateien = 0
  for (const o of ordner) dateien += (await readdir(join(basis, o)).catch(() => [])).length
  if (DRY) { console.log(c.y(`--dry-run: ${ordner.length} Ordner mit ${dateien} Dateien wuerden geloescht`)); return }
  await rm(basis, { recursive: true, force: true })
  console.log(c.g(`  ✓ ${ordner.length} Kandidaten-Ordner mit ${dateien} Vorschauen geloescht`))
}

const modus = argv.includes('--aufraeumen') ? aufraeumen
  : arg('suche') ? suchen : arg('hole') ? holen : arg('datei') ? ingest : bericht
modus().catch(e => { console.error(c.r(`\n✗ ${e.stack || e.message}\n`)); process.exit(1) })
