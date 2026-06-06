#!/usr/bin/env node
/**
 * Recipe Image Self-Briefing — Claude verfasst je Rezept eine präzise ENGLISCHE
 * Bild-Beschreibung (Motiv, Gargrad, Darreichung, "nicht verwechseln mit …") und
 * schreibt sie als `imagePrompt` ins Frontmatter. recipe-images.mjs nutzt sie dann
 * als Priorität #1 → korrektes Motiv statt Raten (z. B. Coleslaw ≠ Nudelsalat).
 *
 * Einmal-Lauf, gecacht + von Hand editierbar. Idempotent (überspringt vorhandene).
 *
 * Usage:
 *   node scripts/recipe-image-briefs.mjs                 # alle ohne imagePrompt
 *   node scripts/recipe-image-briefs.mjs --only coleslaw # gezielt
 *   node scripts/recipe-image-briefs.mjs --force         # auch vorhandene neu
 *   node scripts/recipe-image-briefs.mjs --dry-run       # nur anzeigen
 *
 * Env: ANTHROPIC_API_KEY (env zuerst, sonst .env.local).
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT    = join(__dirname, '..')
const REZEPTE = join(ROOT, 'content', 'rezepte')

const DRY   = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')
const ONLY  = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1].split(',').map(s => s.trim())
  : null

let KEY = process.env.ANTHROPIC_API_KEY
if (!KEY && existsSync(join(ROOT, '.env.local'))) {
  const m = (await readFile(join(ROOT, '.env.local'), 'utf8')).match(/^ANTHROPIC_API_KEY=(.+)$/m)
  if (m) KEY = m[1].trim()
}

const c = { g: s => `\x1b[32m${s}\x1b[0m`, y: s => `\x1b[33m${s}\x1b[0m`, r: s => `\x1b[31m${s}\x1b[0m`, d: s => `\x1b[2m${s}\x1b[0m` }
const fm = (raw, key) => { const m = raw.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, 'm')); return m ? m[1] : '' }

// Cut-Wissensbasis laden → visual: erdet das Briefing anatomisch (korrekter Cut).
let CUTS = {}
const CUTS_PATH = join(ROOT, 'data', 'cuts-knowledge.yaml')
if (existsSync(CUTS_PATH)) {
  try { CUTS = yaml.load(await readFile(CUTS_PATH, 'utf8')) || {} }
  catch (e) { console.log(c.r(`⚠ cuts-knowledge.yaml: ${e.message}`)) }
}
function cutLookup(hay) {
  const h = ` ${hay.toLowerCase()} `
  for (const [k, v] of Object.entries(CUTS)) {
    const needles = (v.match || [k]).map(s => String(s).toLowerCase())
    if (needles.some(n => n && h.includes(n))) return v
  }
  return null
}

const SYSTEM = `You write ONE concise English visual description of a FINISHED dish for an AI image generator (FLUX.1). The generator must render exactly the right food — not a look-alike. Output ONLY the description, no preamble, no quotes.

Rules:
- 1–2 sentences, English, purely visual (what is on the plate/board).
- Name the exact item and its form (whole / sliced / fillet / chops / in a bowl …).
- Doneness + surface where relevant:
  - Beef/lamb steaks: "an evenly dark-brown seared crust on the outside; if sliced, the rosy medium-rare colour appears ONLY on the cut faces; no raw red patches on the outer surface, no bloody juices".
  - Poultry: "crispy golden-brown skin, fully cooked, no pink".
  - Fish: "moist flaky flesh, lightly charred skin, no red meat".
  - Pork: "fully cooked, juicy, at most slightly rosy".
  - Sides/sauces/sweets: describe the REAL components precisely (e.g. coleslaw = finely shredded raw white cabbage and carrot in a creamy pale dressing).
  - Grilled vegetables/produce: caramelized charred edges, blistered skin, a glossy sheen of oil, vibrant fresh colours and clear grill marks — never raw and cold, never just burnt black.
- Plating/garnish (tasteful, optional): you MAY add a fine drizzle of a glossy sauce, a neat dollop or quenelle of a dip, a small ramekin of sauce alongside, scattered microgreens, fresh herbs or crumbled cheese. Do NOT name the plate type, camera, lens, lighting or style — those are fixed separately.
- End with a short "not:" clause naming the most likely WRONG render (e.g. coleslaw → "not pasta, no noodles"; duck → "not a chicken").
- Do NOT mention camera, lens, lighting, board, style, "photorealistic", "4k" — those are added separately.`

async function brief(title, desc, meat, kat, cut) {
  let user = `Dish title: ${title}\nCategory: ${kat || '—'}\nMain ingredient: ${meat || '—'}\nRecipe description: ${desc || '—'}`
  if (cut?.visual) user += `\n\nVerified cut appearance (authoritative — the rendered cut MUST match this anatomy): ${String(cut.visual).replace(/\s+/g, ' ').trim()}${cut.doneness ? ` Doneness: ${String(cut.doneness).replace(/\s+/g, ' ').trim()}` : ''}`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 220,
      temperature: 0.4,
      system: SYSTEM,
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 160)}`)
  const j = await res.json()
  let t = (j.content?.[0]?.text || '').trim()
  // einzeilig + frontmatter-safe (keine inneren Double-Quotes)
  t = t.replace(/\s+/g, ' ').replace(/"/g, "'").trim()
  return t
}

function patch(raw, value) {
  if (/^imagePrompt:/m.test(raw)) return raw.replace(/^imagePrompt:\s*.*$/m, `imagePrompt: "${value}"`)
  if (/^image:\s*.*$/m.test(raw))  return raw.replace(/^(image:\s*.*)$/m, `$1\nimagePrompt: "${value}"`)
  return raw.replace(/^---\n/, `---\nimagePrompt: "${value}"\n`)
}

async function main() {
  console.log(c.d('\n✍  Recipe Image Self-Briefing (Claude)\n'))
  if (!DRY && !KEY) { console.log(c.r('⚠ ANTHROPIC_API_KEY fehlt — Abbruch.')); process.exit(0) }

  const files = (await readdir(REZEPTE)).filter(f => f.endsWith('.mdx'))
  let done = 0, skipped = 0, failed = 0
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '')
    if (ONLY && !ONLY.includes(slug)) { skipped++; continue }
    const path = join(REZEPTE, file)
    const raw  = await readFile(path, 'utf8')
    if (!FORCE && fm(raw, 'imagePrompt')) { skipped++; continue }
    const title = fm(raw, 'title'), desc = fm(raw, 'description'), meat = fm(raw, 'meatType'), kat = fm(raw, 'kategorie')
    const cut = cutLookup(`${meat} ${slug} ${title}`)
    try {
      process.stdout.write(c.d(`◇ ${slug}${cut ? ' [cut]' : ''} … `))
      const b = await brief(title, desc, meat, kat, cut)
      if (DRY) { console.log(c.y('\n  ' + b + '\n')); done++; continue }
      await writeFile(path, patch(raw, b), 'utf8')
      console.log(c.g('✓'))
      console.log(c.d('  ' + b))
      done++
    } catch (e) { console.log(c.r(`✗ ${e.message}`)); failed++ }
  }
  console.log(`\n${c.g(`✓ ${done} Briefings`)} · ${c.d(`${skipped} übersprungen`)} · ${failed ? c.r(`${failed} Fehler`) : '0 Fehler'}\n`)
}
main()
