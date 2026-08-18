#!/usr/bin/env node
/**
 * Kontaktbogen fuer die fachliche Abnahme der ausgetauschten Rezeptbilder.
 *
 * Stellt je Rezept das aktuell ausgelieferte Bild neben den neuen Kandidaten und
 * schreibt das MUSS-Kriterium aus dem Bildbrief darueber — die Abnahme prueft
 * genau das, nicht "gefaellt mir". Verfahren wie beim Cut-Atlas.
 *
 * Erzeugt eine einzelne, in sich geschlossene HTML-Datei (Bilder als data:-URI),
 * die sich per Doppelklick oeffnen und weitergeben laesst.
 *
 * Usage:
 *   node scripts/kontaktbogen.mjs
 *   node scripts/kontaktbogen.mjs --out bild-austausch/abnahme.html
 */

import { readFile, writeFile, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { JOBS } from './rezept-bild-austausch.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT     = join(__dirname, '..')
const ERGEBNIS = join(ROOT, 'bild-austausch', 'ergebnis')
const AKTUELL  = join(ROOT, 'public', 'images', 'rezepte')

const arg = (n) => process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null
const OUT = arg('--out') || join(ROOT, 'bild-austausch', 'abnahme.html')

async function dataUri(pfad) {
  if (!existsSync(pfad)) return null
  const buf = await readFile(pfad)
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]))

async function main() {
  const zeilen = []
  let offen = 0

  for (const job of JOBS) {
    const neu = await dataUri(join(ERGEBNIS, `${job.slug}.jpg`))
    if (!neu) { offen++; continue }
    const alt = await dataUri(join(AKTUELL, `${job.slug}.jpg`))

    zeilen.push(`
      <section class="karte">
        <header>
          <h2>${esc(job.slug)}</h2>
          <p class="muss"><span>MUSS</span> ${esc(job.muss)}</p>
        </header>
        <div class="paar">
          <figure>
            <figcaption>bisher — ausgeliefert</figcaption>
            ${alt ? `<img src="${alt}" alt="bisheriges Bild ${esc(job.slug)}">`
                  : `<div class="fehlt">kein Bild in public/</div>`}
          </figure>
          <figure>
            <figcaption>neu — Echtfoto + Nano-Banana-Edit</figcaption>
            <img src="${neu}" alt="neuer Kandidat ${esc(job.slug)}">
          </figure>
        </div>
        <div class="urteil">
          <label><input type="checkbox"> Motiv trifft das MUSS</label>
          <label><input type="checkbox"> Anatomie unveraendert gegenueber Quellfoto</label>
          <label><input type="checkbox"> Hausstil sitzt (Licht, Set, kein Plastiklook)</label>
          <label class="nein"><input type="checkbox"> ABLEHNEN</label>
        </div>
      </section>`)
  }

  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bildabnahme — 22 Falsch-Motive</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; padding:32px; background:#17100b; color:#F0E8D8;
         font:16px/1.6 ui-serif, Georgia, serif; }
  h1 { font-size:28px; margin:0 0 4px; }
  .intro { color:#a8895f; margin:0 0 32px; max-width:70ch; }
  .karte { border:1px solid #3a2818; margin-bottom:28px; }
  .karte header { padding:14px 18px; border-bottom:1px solid #3a2818; }
  .karte h2 { font:700 18px/1.3 ui-sans-serif, system-ui; margin:0 0 6px; color:#C8882A; }
  .muss { margin:0; font-size:14px; color:#d8cbb4; }
  .muss span { display:inline-block; font:700 10px/1 ui-sans-serif, system-ui;
               letter-spacing:.14em; background:#9C3A0E; color:#F7EEDD;
               padding:4px 6px; margin-right:8px; vertical-align:1px; }
  .paar { display:grid; grid-template-columns:1fr 1fr; gap:2px; background:#3a2818; }
  figure { margin:0; background:#17100b; }
  figcaption { font:700 10px/1 ui-sans-serif, system-ui; letter-spacing:.12em;
               text-transform:uppercase; color:#a8895f; padding:10px 12px; }
  img { display:block; width:100%; height:auto; }
  .fehlt { padding:60px 12px; text-align:center; color:#6b5842; font-size:13px; }
  .urteil { display:flex; flex-wrap:wrap; gap:18px; padding:12px 18px;
            border-top:1px solid #3a2818; font:14px ui-sans-serif, system-ui; }
  .urteil label { display:flex; align-items:center; gap:7px; }
  .urteil .nein { margin-left:auto; color:#e8735a; }
  @media (max-width:760px) { .paar { grid-template-columns:1fr; } }
</style></head>
<body>
  <h1>Bildabnahme — Austausch der Falsch-Motive</h1>
  <p class="intro">Links das aktuell ausgelieferte Bild, rechts der neue Kandidat.
  Gepr&uuml;ft wird gegen das MUSS aus dem Bildbrief, nicht nach Geschmack.
  ${zeilen.length} von ${JOBS.length} Motiven fertig${offen ? `, ${offen} noch offen` : ''}.</p>
  ${zeilen.join('\n')}
</body></html>`

  await writeFile(OUT, html, 'utf8')
  console.log(`\n  Kontaktbogen: ${OUT}`)
  console.log(`  ${zeilen.length} Motive enthalten, ${offen} noch ohne Ergebnis.\n`)
}

main().catch(e => { console.error(e.stack || e.message); process.exit(1) })
