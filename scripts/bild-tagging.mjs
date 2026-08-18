#!/usr/bin/env node
/**
 * KI-Kennzeichnung fuer den Rezeptbild-Altbestand nachtragen.
 *
 * Quelle der Wahrheit ist docs/bild-audit-rezepte-2026-08-18.md. Die Slug-Listen
 * werden von dort gelesen und nicht hier gepflegt — zwei Listen, die auseinander
 * laufen, waeren schlimmer als keine zweite.
 *
 *   Abschnitt A (C2PA-Metadaten von fal.ai/FLUX belegen die Herkunft)
 *     → imageSource: "KI-generiert (FLUX via fal.ai, C2PA-belegt)"
 *   Abschnitt B (visuell klassifiziert, Metadaten entfernt)
 *     → imageSource: "KI-generiert (visuell klassifiziert, Metadaten entfernt)"
 *
 * Beide bekommen imageAI: true.
 *
 * Rezepte, die bereits ein imageSource tragen, werden NICHT angefasst. Das
 * schuetzt die 21 am 18.08.2026 ausgetauschten Bilder, deren Quelle ein echtes
 * Foto ist — sie stehen in denselben Audit-Listen, weil das Audit den Zustand
 * VOR dem Austausch beschreibt.
 *
 * Usage:
 *   node scripts/bild-tagging.mjs --dry-run
 *   node scripts/bild-tagging.mjs
 */

import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT    = join(__dirname, '..')
const REZEPTE = join(ROOT, 'content', 'rezepte')
const AUDIT   = join(ROOT, 'docs', 'bild-audit-rezepte-2026-08-18.md')

const DRY = process.argv.includes('--dry-run')
const c = { g: s => `\x1b[32m${s}\x1b[0m`, y: s => `\x1b[33m${s}\x1b[0m`, r: s => `\x1b[31m${s}\x1b[0m`, d: s => `\x1b[2m${s}\x1b[0m`, b: s => `\x1b[1m${s}\x1b[0m` }

const QUELLE = {
  A: 'KI-generiert (FLUX via fal.ai, C2PA-belegt)',
  B: 'KI-generiert (visuell klassifiziert, Metadaten entfernt)',
}

/** Slugs aus dem Absatz unter einer Ueberschrift lesen (durch · getrennt). */
function slugsAusAbschnitt(text, ueberschrift) {
  const start = text.indexOf(ueberschrift)
  if (start === -1) throw new Error(`Abschnitt nicht gefunden: ${ueberschrift}`)
  const rest = text.slice(start + ueberschrift.length)
  const absatz = rest.split(/\n\s*\n/).find(a => a.includes('·'))
  if (!absatz) throw new Error(`Keine Slug-Liste unter: ${ueberschrift}`)
  return absatz.split('·').map(s => s.trim()).filter(s => /^[a-z0-9-]+$/.test(s))
}

function setzeFeld(raw, key, wert, roh = false) {
  const zeile = roh ? `${key}: ${wert}` : `${key}: "${wert}"`
  const vorhanden = new RegExp(`^${key}:.*$`, 'm')
  if (vorhanden.test(raw)) return raw.replace(vorhanden, zeile)
  return raw.replace(/^(image:.*)$/m, `$1\n${zeile}`)
}

async function main() {
  const audit = await readFile(AUDIT, 'utf8')
  const listen = {
    A: slugsAusAbschnitt(audit, '## A) C2PA-belegt KI'),
    B: slugsAusAbschnitt(audit, '## B) Visuell als KI klassifiziert'),
  }

  console.log(c.b('\n  KI-Kennzeichnung Altbestand\n'))
  console.log(`  Audit-Listen: A ${listen.A.length}, B ${listen.B.length}\n`)

  let getaggt = 0, uebersprungen = 0
  const fehlend = []

  for (const abschnitt of ['A', 'B']) {
    for (const slug of listen[abschnitt]) {
      const pfad = join(REZEPTE, `${slug}.mdx`)
      if (!existsSync(pfad)) { fehlend.push(slug); continue }
      let raw = await readFile(pfad, 'utf8')

      if (/^imageSource:/m.test(raw)) { uebersprungen++; continue }

      raw = setzeFeld(raw, 'imageSource', QUELLE[abschnitt])
      raw = setzeFeld(raw, 'imageAI', 'true', true)
      if (!DRY) await writeFile(pfad, raw)
      getaggt++
    }
  }

  console.log(`  ${c.g('✓')} ${getaggt} Rezepte getaggt`)
  console.log(`  ${c.d('·')} ${uebersprungen} uebersprungen (haben bereits ein imageSource)`)
  if (fehlend.length) {
    console.log(`\n  ${c.y('⚠')} ${fehlend.length} Slugs aus dem Audit haben kein Rezept:`)
    fehlend.forEach(s => console.log(`      ${s}`))
  }
  if (DRY) console.log(c.y('\n  [--dry-run: nichts geschrieben]'))
  console.log()
}

main().catch(e => { console.error(e.stack || e.message); process.exit(1) })
