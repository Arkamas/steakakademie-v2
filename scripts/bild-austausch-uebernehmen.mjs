#!/usr/bin/env node
/**
 * Uebernahme der abgenommenen Austauschbilder nach public/ und ins Frontmatter.
 *
 * Laeuft NUR nach fachlicher Abnahme (Kontaktbogen, 18.08.2026). Was hier
 * passiert, ist bewusst mechanisch und nachlesbar:
 *   1. bild-austausch/ergebnis/<slug>.jpg  →  public/images/rezepte/<slug>.jpg
 *      Das -hero.jpg nur dort, wo das Rezept bereits ein heroImage fuehrt —
 *      sonst waere es eine Layout-Aenderung, die niemand bestellt hat.
 *   2. Frontmatter je Rezept: imageAlt an das neue Motiv, imageSource mit
 *      Echtfoto-Basis und Fotograf, imageAI: true.
 *   3. CREDITS-Eintrag in public/images/rezepte/CREDITS.md.
 *
 * Die Alt-Texte stehen hier ausgeschrieben, nicht generiert: Sie sind die
 * Aussage darueber, was auf dem Bild zu sehen ist, und genau daran sind die
 * alten Bilder gescheitert.
 *
 * Usage:
 *   node scripts/bild-austausch-uebernehmen.mjs --dry-run
 *   node scripts/bild-austausch-uebernehmen.mjs
 */

import { readFile, writeFile, copyFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT     = join(__dirname, '..')
const ERGEBNIS = join(ROOT, 'bild-austausch', 'ergebnis')
const QUELLEN  = join(ROOT, 'bild-austausch', 'quellen')
const REZEPTE  = join(ROOT, 'content', 'rezepte')
const BILDER   = join(ROOT, 'public', 'images', 'rezepte')

const DRY = process.argv.includes('--dry-run')
const c = { g: s => `\x1b[32m${s}\x1b[0m`, y: s => `\x1b[33m${s}\x1b[0m`, r: s => `\x1b[31m${s}\x1b[0m`, d: s => `\x1b[2m${s}\x1b[0m` }

/**
 * Abgenommen am 18.08.2026, cedar-plank-lachs nachtraeglich am 19.08.2026.
 *
 * Zum Alt-Text von cedar-plank-lachs: Er nennt bewusst ein "Holzbrett" und
 * keine Zedernplanke. Die Quelle zeigt ein Bambus-Schneidebrett; welche Holzart
 * nach dem Edit zu sehen ist, laesst sich nicht belegen. Ein Alt-Text, der eine
 * Zedernplanke behauptet, waere genau der Fehler, den dieses Paket beheben soll
 * — das Bild muss den Text belegen, nicht umgekehrt. Der Audit-Befund
 * "Keine Zedernplanke" bleibt deshalb offen (KAN-78).
 */
/** Abnahmedatum fuer die CREDITS-Tabelle; Abweichungen vom Sammeltermin. */
const ABNAHME_STANDARD = '18.08.2026'
const ABNAHME = { 'cedar-plank-lachs': '19.08.2026' }

const ABGENOMMEN = {
  'cedar-plank-lachs':       'Rohes Lachsfilet mit grobem Salz auf einem hellen Holzbrett',
  'bourbon-brisket-pairing': 'Aufgeschnittenes Brisket mit dunkler Bark und rosa Rauchring auf einem Holzbrett',
  'braaibroodjies':          'Zwei gegrillte, gefüllte Sandwiches mit Grillmarken im Klapprost über der Glut',
  'bun-cha-hanoi':           'Schälchen mit Brühe und gegrillten Schweinefleischstücken, daneben weiße Reisnudeln und frische Kräuter',
  'ca-nuong-bananenblatt':   'Ganzer gegrillter Fisch auf einem grünen Bananenblatt',
  'chateaubriand-filet':     'Aufgeschnittenes Rinderfilet-Mittelstück mit gleichmäßig rosa Kern',
  'iberico-carrillera':      'Geschmorte, knochenlose Schweinebäckchen in dunkler glänzender Sauce, auf einem Teller angerichtet',
  'iberico-secreto':         'Flacher, stark marmorierter Secreto-Cut vom Iberico-Schwein auf dunklem Schiefer',
  'onglet-hanger-steak':     'Quer zur Faser aufgeschnittenes Onglet mit grober Längsfaser auf einem Holzbrett',
  'porterhouse-grill':       'Gegrilltes Steak mit durchlaufendem T-Knochen, Roastbeef- und Filetseite sichtbar, auf dunklem Schiefer',
  'moo-ping':                'Gegrillte, leicht karamellisierte Schweinefleisch-Spieße auf Holzspießen',
  'pla-pao-salzkruste':      'Ganzer Fisch in dicker weißer Salzkruste auf dem Grillrost',
  'sis-kebab-tuerkisch':     'Fleischwürfel auf flachen Metallspießen über dem Mangal',
  'sosaties-braai':          'Marinierte Fleischspieße über glühender Kohle',
  'tavuk-sis-kebab':         'Hähnchenwürfel auf Spießen über dem Grill',
  'texas-coleslaw':          'Schüssel mit cremigem Krautsalat aus fein geschnittenem Weißkohl und Karotte',
  'thit-nuong-vietnam':      'Gegrillte marinierte Schweinescheiben mit Reis, frischem Gemüse und einem Schälchen Dip',
  'thunfisch-steak-grill':   'Angebratenes Thunfischsteak mit Kruste außen und tiefrotem, rohem Kern',
  'ganze-makrele-grill':     'Ganze Makrelen mit dunklem Wellenmuster auf der Silberhaut auf dem Grillrost',
  'ikan-bakar-singapur':     'Ganzer gegrillter Fisch im gefalteten Bananenblatt',
  'roastbeef-reverse-sear':  'Roastbeef am Stück mit abgeschnittenen Scheiben, gleichmäßig rosa Kern',
  'wagyu-burger':            'Aufgebauter Burger mit dickem Patty und Sesambrötchen, daneben Pommes',
}

/** Frontmatter-Zeile setzen: vorhandene ersetzen, sonst nach `image:` einfuegen. */
function setzeFeld(raw, key, wert) {
  const zeile = `${key}: "${wert.replace(/"/g, '\\"')}"`
  const vorhanden = new RegExp(`^${key}:.*$`, 'm')
  if (vorhanden.test(raw)) return raw.replace(vorhanden, zeile)
  return raw.replace(/^(image:.*)$/m, `$1\n${zeile}`)
}

async function main() {
  const quellen = JSON.parse(await readFile(join(QUELLEN, 'quellen.json'), 'utf8'))
  const credits = []
  let bilder = 0, heroes = 0, patches = 0

  for (const [slug, alt] of Object.entries(ABGENOMMEN)) {
    const quelle = quellen[slug]
    if (!quelle) { console.log(c.r(`  ✗ ${slug}: kein Quellen-Eintrag`)); continue }
    const ergebnis = join(ERGEBNIS, `${slug}.jpg`)
    const mdx = join(REZEPTE, `${slug}.mdx`)
    if (!existsSync(ergebnis)) { console.log(c.r(`  ✗ ${slug}: kein Ergebnisbild`)); continue }
    if (!existsSync(mdx))      { console.log(c.r(`  ✗ ${slug}: kein Rezept`)); continue }

    let raw = await readFile(mdx, 'utf8')
    const hatHero = /^heroImage:/m.test(raw)

    if (!DRY) {
      await copyFile(ergebnis, join(BILDER, `${slug}.jpg`))
      if (hatHero && existsSync(join(ERGEBNIS, `${slug}-hero.jpg`)))
        await copyFile(join(ERGEBNIS, `${slug}-hero.jpg`), join(BILDER, `${slug}-hero.jpg`))
    }
    bilder++
    if (hatHero) heroes++

    raw = setzeFeld(raw, 'imageAlt', alt)
    raw = setzeFeld(raw, 'imageSource', `Echtfoto-Basis (${quelle.quelle}: ${quelle.fotograf}), KI-bearbeitet (Nano Banana)`)
    raw = setzeFeld(raw, 'imageAI', 'true').replace(/^imageAI: "true"$/m, 'imageAI: true')
    if (!DRY) await writeFile(mdx, raw)
    patches++

    credits.push(`| ${slug} | ${quelle.quelle} | ${quelle.fotograf} | ${quelle.id} | ${ABNAHME[slug] ?? ABNAHME_STANDARD} |`)
    console.log(`  ${c.g('✓')} ${slug.padEnd(26)} ${quelle.quelle}/${quelle.fotograf}${hatHero ? c.d(' +hero') : ''}`)
  }

  const creditsDatei = `# Rezeptbild-Quellen (Provenienz)

Bilder des Austauschpakets vom 18.08.2026: 21 Rezepte, deren bisheriges Bild das
falsche Gericht zeigte (siehe docs/bild-audit-rezepte-2026-08-18.md, Abschnitt C).

**Verfahren:** echtes Referenzfoto aus Pexels, Unsplash oder Pixabay →
\`fal-ai/nano-banana-pro/edit\` (erst BEWAHREN, dann ÄNDERN) → deterministisches
Grading mit sharp. Das Motiv stammt unverändert aus dem Quellfoto; verändert
wurden Licht, Umgebung und Bildausschnitt. Deshalb tragen alle Einträge
\`imageAI: true\` — die Bearbeitung ist generativ, die Vorlage nicht.

**Lizenzen:** Pexels, Unsplash und Pixabay erlauben kommerzielle Nutzung und
Bearbeitung ohne Attributionspflicht. Diese Datei ist der Provenienznachweis,
keine Pflichtangabe. Einstufung je Quelle: docs/bildquellen-whitelist.md.

| Slug | Quelle | Fotograf | Foto-ID | Abnahme |
|------|--------|----------|---------|---------|
${credits.join('\n')}

## Offener Befund

- \`cedar-plank-lachs\` — Bild am 19.08.2026 ersetzt, der Audit-Befund
  ("keine Zedernplanke") bleibt aber **offen**. Vier Suchläufe über drei
  Bibliotheken fanden kein Foto von Lachs auf sichtbarer Zedernplanke. Das
  gewählte Bild zeigt rohen Lachs auf einem Holzbrett; der Alt-Text behauptet
  entsprechend keine Zedernplanke. Beschaffung eines passenden Motivs per
  Stock-Einzelkauf oder Eigenfoto: KAN-78.

## Übriger Bestand

Alle anderen Dateien in diesem Ordner stammen aus der rein generativen
fal.ai/FLUX-Pipeline und sind in docs/bild-audit-rezepte-2026-08-18.md als
KI-Bilder ausgewiesen.
`

  if (!DRY) await writeFile(join(BILDER, 'CREDITS.md'), creditsDatei)

  console.log(c.d(`\n  ${bilder} Bilder kopiert (davon ${heroes} mit Hero), ${patches} Frontmatter gepatcht.`))
  console.log(c.d(`  CREDITS.md geschrieben.${DRY ? c.y('  [--dry-run: nichts geschrieben]') : ''}\n`))
}

main().catch(e => { console.error(e.stack || e.message); process.exit(1) })
