#!/usr/bin/env node
/**
 * Frontmatter-Validator fuer Rezepte (KAN-67).
 *
 * Haelt Defekte auf, die keinen Build-Fehler erzeugen, aber Seiten still
 * beschaedigen: eine unbekannte Kategorie laesst das Rezept aus jeder Uebersicht
 * fallen, ein fehlendes Bild liefert eine kaputte Kachel, ein fehlender Alt-Text
 * kostet Barrierefreiheit und SEO.
 *
 * Geprueft wird content/rezepte/*.mdx:
 *   1. kategorie liegt in der Whitelist der sechs Rezept-Kategorien
 *   2. land ist vorhanden und nicht leer
 *   3. imageAI ist explizit true/false gesetzt UND imageSource ist vorhanden
 *   4. imageAlt ist vorhanden und nicht leer
 *   5. die unter image (und heroImage) genannte Datei liegt in public/
 *
 * Stichtagsregel (2 und 3): Der Altbestand wird ueber das laufende Tagging
 * nachgezogen und soll den Build nicht sofort brechen. Rezepte, die vor dem
 * Stichtag veroeffentlicht wurden, erzeugen deshalb eine gezaehlte Warnung
 * statt eines Fehlers. Alles ab dem Stichtag ist hart.
 *
 * Zusaetzlich sind drei Technik-Rezepte namentlich von der land-Pflicht
 * ausgenommen (LAND_ENTBEHRLICH) — sie haben keine Herkunft.
 *
 * `land` faellt bewusst ebenfalls unter die Stichtagsregel: 14 Altrezepte haben
 * kein `land` (Stand 18.08.2026, ueberwiegend die US-Klassiker vom 24.05.), ein
 * hartes Gate haette den Build ab der ersten Minute rot gesetzt. Fuer neue
 * Rezepte gilt die Pflicht unveraendert. Sobald die 14 nachgetragen sind, kann
 * `land` aus STICHTAG_FELDER heraus und wird fuer alle hart.
 *
 * Usage:
 *   node scripts/validate-frontmatter.mjs
 *   node scripts/validate-frontmatter.mjs --strict   # Warnungen zaehlen auch als Fehler
 *
 * Exit 1 bei mindestens einem Fehler — als Build-Gate in postbuild und in
 * .github/workflows/build-guard.yml eingehaengt.
 */

import { readdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT    = join(__dirname, '..')
const REZEPTE = join(ROOT, 'content', 'rezepte')
const PUBLIC  = join(ROOT, 'public')

const STRICT = process.argv.includes('--strict')

/** Ab diesem publishedAt gelten die Stichtagsfelder hart. */
const STICHTAG = '2026-08-18'
const STICHTAG_FELDER = ['land', 'imageAI', 'imageSource']

const KATEGORIEN = ['fleisch', 'fisch', 'beilagen', 'saucen-rubs', 'desserts', 'wine-spirits']

/**
 * Rezepte, die kein `land` tragen koennen, weil sie keine Herkunft haben.
 *
 * Das sind reine Technik-Rezepte: Es geht um ein Garverfahren, nicht um ein
 * Gericht aus einer Kueche. Geprueft am 18.08.2026 durch Textsuche — die
 * einzigen Landesbezuege waren Nebenbemerkungen ("japanischen", "Kentucky"),
 * die keine Zuordnung tragen.
 *
 * Ein erfundener Wert waere hier schlimmer als ein fehlender: `land` steuert die
 * Laender-Filterleiste auf /rezepte, ein falscher Wert sortiert das Rezept unter
 * eine Flagge, zu der es nicht gehoert.
 *
 * Bewusst eine namentliche Liste und keine Regel: Jede Ausnahme soll einzeln
 * begruendet sein und auffallen, wenn sie waechst. Fuer neue Rezepte bleibt
 * `land` Pflicht.
 */
const LAND_ENTBEHRLICH = new Set([
  'ribeye-sous-vide',      // Sous-vide-Verfahren, kein Landesgericht
  't-bone-direktgrill',    // Drei-Zonen-Grillen, kein Landesgericht
  'tomahawk-reverse-sear', // Reverse Sear, kein Landesgericht
])

const c = {
  g: s => `\x1b[32m${s}\x1b[0m`, y: s => `\x1b[33m${s}\x1b[0m`,
  r: s => `\x1b[31m${s}\x1b[0m`, d: s => `\x1b[2m${s}\x1b[0m`, b: s => `\x1b[1m${s}\x1b[0m`,
}

/**
 * Frontmatter-Feld lesen. Bewusst zeilenbasiert wie die uebrigen Skripte im
 * Projekt — und mit \r im Zeichensatz, weil im Repo CRLF-Rezepte liegen (KAN-26).
 * Ohne das liest `land: USA\r` als "USA\r" und ein Vergleich auf Leerstring
 * schlaegt fehl.
 */
function feld(raw, key) {
  const m = raw.match(new RegExp(`^${key}:[ \\t]*(.*?)[ \\t\\r]*$`, 'm'))
  if (!m) return null
  return m[1].replace(/^["']|["']$/g, '').trim()
}

function pflichtGiltHart(publishedAt, feldName) {
  if (!STICHTAG_FELDER.includes(feldName)) return true
  if (!publishedAt) return true          // ohne Datum keine Nachsicht
  return publishedAt >= STICHTAG          // ISO-Datum, String-Vergleich reicht
}

async function main() {
  const dateien = (await readdir(REZEPTE)).filter(f => f.endsWith('.mdx')).sort()
  const fehler = []
  const warnungen = []

  for (const datei of dateien) {
    const pfad = join(REZEPTE, datei)
    const raw = await readFile(pfad, 'utf8')
    const slug = datei.replace(/\.mdx$/, '')
    const publishedAt = feld(raw, 'publishedAt')

    const melde = (feldName, text) => {
      const eintrag = { slug, text }
      if (pflichtGiltHart(publishedAt, feldName)) fehler.push(eintrag)
      else warnungen.push(eintrag)
    }

    // 1 — Kategorie. Immer hart: eine unbekannte Kategorie laesst das Rezept aus
    // jeder Uebersichtsseite fallen, das ist kein Altlast-Thema.
    const kategorie = feld(raw, 'kategorie')
    if (!kategorie) fehler.push({ slug, text: 'kategorie fehlt' })
    else if (!KATEGORIEN.includes(kategorie))
      fehler.push({ slug, text: `kategorie "${kategorie}" ist keine der sechs erlaubten` })

    // 2 — Land. Technik-Rezepte ohne Herkunft sind namentlich ausgenommen.
    if (!feld(raw, 'land') && !LAND_ENTBEHRLICH.has(slug))
      melde('land', 'land fehlt oder ist leer')

    // 3 — KI-Kennzeichnung
    const imageAI = feld(raw, 'imageAI')
    if (imageAI === null) melde('imageAI', 'imageAI fehlt (true oder false explizit setzen)')
    else if (!['true', 'false'].includes(imageAI))
      melde('imageAI', `imageAI ist "${imageAI}", erlaubt sind nur true oder false`)
    if (!feld(raw, 'imageSource')) melde('imageSource', 'imageSource fehlt')

    // 4 — Alt-Text
    if (!feld(raw, 'imageAlt')) fehler.push({ slug, text: 'imageAlt fehlt oder ist leer' })

    // 5 — Bilddateien. heroImage wird mitgeprueft: ein fehlender Hero ist
    // derselbe Defekt, nur auf der Detailseite statt auf der Kachel.
    for (const key of ['image', 'heroImage']) {
      const wert = feld(raw, key)
      if (key === 'image' && !wert) { fehler.push({ slug, text: 'image fehlt' }); continue }
      if (!wert) continue
      if (!wert.startsWith('/')) {
        fehler.push({ slug, text: `${key} "${wert}" ist kein absoluter Pfad ab /` })
        continue
      }
      if (!existsSync(join(PUBLIC, wert.replace(/^\//, ''))))
        fehler.push({ slug, text: `${key} verweist auf ${wert} — Datei liegt nicht in public/` })
    }
  }

  // ── Ausgabe ───────────────────────────────────────────────────────────────
  console.log(c.b('\n  Frontmatter-Validator — Rezepte\n'))
  console.log(`  ${dateien.length} Rezepte geprueft.\n`)

  if (fehler.length) {
    console.log(c.r(`  ✗ ${fehler.length} Fehler:\n`))
    for (const f of fehler) console.log(`    ${c.r('•')} ${f.slug.padEnd(38)} ${f.text}`)
    console.log()
  } else {
    console.log(c.g('  ✓ Keine Fehler.\n'))
  }

  if (warnungen.length) {
    console.log(c.y(`  ⚠ ${warnungen.length} Warnungen (Altbestand vor ${STICHTAG}):\n`))
    const proFeld = new Map()
    for (const w of warnungen) {
      const schluessel = w.text.split(' ')[0]
      proFeld.set(schluessel, (proFeld.get(schluessel) ?? 0) + 1)
    }
    for (const [feldName, anzahl] of proFeld) console.log(`    ${c.y('·')} ${feldName}: ${anzahl}`)
    console.log(c.d(`\n    Diese Rezepte werden ueber das laufende Tagging nachgezogen und`))
    console.log(c.d(`    brechen den Build nicht.`))
    console.log(c.d(`    STICHTAG IST KEIN KALENDERDATUM: hart geprueft wird jedes Rezept mit`))
    console.log(c.d(`    publishedAt >= ${STICHTAG} — unabhaengig davon, welcher Tag heute ist.`))
    console.log(c.d(`    Diese Warnungen verschwinden erst, wenn die Altrezepte getaggt sind.`))
    console.log(c.d(`    Vollstaendige Liste mit --strict.\n`))
    if (STRICT) {
      for (const w of warnungen) console.log(`    ${c.y('·')} ${w.slug.padEnd(38)} ${w.text}`)
      console.log()
    }
  }

  const rot = fehler.length > 0 || (STRICT && warnungen.length > 0)
  if (rot) { console.log(c.r('  Build-Gate: FEHLGESCHLAGEN\n')); process.exit(1) }
  console.log(c.g('  Build-Gate: bestanden\n'))
}

main().catch(e => { console.error(e.stack || e.message); process.exit(1) })
