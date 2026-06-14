#!/usr/bin/env node
/**
 * Steakakademie Cut Image Generator (FLUX.1 via fal.ai)
 *
 * Erzeugt für jeden Cut aus src/lib/cuts-catalog.ts ein freigestelltes
 * „Metzger-Poster"-Foto (Carneo-Look): einzelnes rohes Teilstück, zentriert auf
 * dunklem Schiefer, Studio-Licht. Speichert nach public/images/cuts/<slug>.jpg.
 * Idempotent (überspringt vorhandene).
 *
 * Usage:
 *   FAL_KEY=... node scripts/cut-images.mjs            # alle fehlenden
 *   FAL_KEY=... node scripts/cut-images.mjs --limit 5  # nur N
 *   node scripts/cut-images.mjs --dry-run              # nur Prompts zeigen
 *   FAL_KEY=... node scripts/cut-images.mjs --force    # auch vorhandene neu
 *   FAL_KEY=... node scripts/cut-images.mjs --only ribeye,tomahawk
 *
 * Env: FAL_KEY (key_id:secret). In CI als GitHub-Secret gesetzt.
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT    = join(__dirname, '..')
const CATALOG = join(ROOT, 'src', 'lib', 'cuts-catalog.ts')
const IMG_DIR = join(ROOT, 'public', 'images', 'cuts')

const DRY   = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')
const LIMIT = process.argv.includes('--limit')
  ? parseInt(process.argv[process.argv.indexOf('--limit') + 1], 10) : Infinity
const ONLY = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1].split(',').map(s => s.trim())
  : null

let FAL_KEY = process.env.FAL_KEY
if (!FAL_KEY && existsSync(join(ROOT, '.env.local'))) {
  const m = (await readFile(join(ROOT, '.env.local'), 'utf8')).match(/^FAL_KEY=(.+)$/m)
  if (m) FAL_KEY = m[1].trim()
}

const c = { g: s => `\x1b[32m${s}\x1b[0m`, y: s => `\x1b[33m${s}\x1b[0m`, r: s => `\x1b[31m${s}\x1b[0m`, d: s => `\x1b[2m${s}\x1b[0m` }

// Cuts aus dem TS-Katalog extrahieren (slug + species + visualBrief je Objekt).
async function parseCuts() {
  const src = await readFile(CATALOG, 'utf8')
  const re = /slug:\s*'([^']+)',\s*species:\s*'([^']+)',[\s\S]*?visualBrief:\s*'((?:[^'\\]|\\.)*)'/g
  const cuts = []
  let m
  while ((m = re.exec(src)) !== null) {
    cuts.push({ slug: m[1], species: m[2], brief: m[3].replace(/\\'/g, "'") })
  }
  return cuts
}

// Carneo-Look: freigestelltes Teilstück, dunkler Grund, Studio-Produktfoto.
// Fleischfarbe je Spezies — der hauseigene LoRA ist auf RIND trainiert und zieht
// Schwein sonst ins Rote.
function buildPrompt(brief, species) {
  const colour = species === 'schwein'
    ? 'fresh pale pink raw pork with creamy white fat and natural texture'
    : 'fresh deep-red raw beef with natural marbling and texture'
  return `${brief}, a single isolated cut of raw meat centered in frame on a dark charcoal slate surface, `
    + `professional studio product photography, soft even softbox lighting from above, `
    + `${colour}, crisp focus, subtle shadow, `
    + `clean dark moody background, no garnish, no herbs, no text, no watermark, no people, no hands`
}

// LoRA-Stärke: Rind 0.45 (Hausstil ok), Schwein 0.3 (Rind-/Rot-Bias zurücknehmen).
function loraScale(species) {
  return species === 'schwein' ? 0.3 : 0.45
}

// Hausstil-LoRA dezent (Stil ja, isoliertes Produkt-Framing dominiert).
const FOODSTYLE_LORA = process.env.FAL_LORA_FOODSTYLE
  || 'https://v3b.fal.media/files/b/0a9cfb28/4f5c21hz9uGU5ia2PWRnR_pytorch_lora_weights.safetensors'

async function generateOnce(prompt, scale) {
  const res = await fetch('https://fal.run/fal-ai/flux-lora', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `sa_foodstyle, ${prompt}`,
      image_size: 'landscape_4_3',
      num_images: 1,
      enable_safety_checker: true,
      loras: [{ path: FOODSTYLE_LORA, scale }],
    }),
  })
  if (!res.ok) throw new Error(`fal ${res.status}: ${(await res.text()).slice(0, 160)}`)
  const j = await res.json()
  const url = j.images?.[0]?.url
  if (!url) throw new Error('keine Bild-URL in fal-Antwort')
  const img = await fetch(url)
  return Buffer.from(await img.arrayBuffer())
}

// Retry gegen transiente Fehler (z. B. „fetch failed" beim LoRA-Kaltstart).
async function generate(prompt, scale, tries = 3) {
  let last
  for (let i = 1; i <= tries; i++) {
    try {
      return await generateOnce(prompt, scale)
    } catch (e) {
      last = e
      if (i < tries) await new Promise(r => setTimeout(r, i * 4000))
    }
  }
  throw last
}

async function main() {
  console.log(c.d('\n🥩 Cut Image Generator (FLUX.1 · Carneo-Look)\n'))
  if (!DRY && !FAL_KEY) { console.log(c.r('⚠ FAL_KEY fehlt — Abbruch.')); process.exit(0) }
  await mkdir(IMG_DIR, { recursive: true })

  const cuts = await parseCuts()
  console.log(c.d(`${cuts.length} Cuts im Katalog\n`))
  let done = 0, skipped = 0, failed = 0

  for (const { slug, species, brief } of cuts) {
    if (done >= LIMIT) break
    if (ONLY && !ONLY.includes(slug)) { skipped++; continue }
    const target = join(IMG_DIR, `${slug}.jpg`)
    if (!FORCE && existsSync(target)) { skipped++; continue }

    const prompt = buildPrompt(brief, species)
    if (DRY) { console.log(c.y(`◇ ${slug} (${species})`)); console.log(c.d(`  ${prompt}\n`)); done++; continue }

    try {
      process.stdout.write(c.d(`◇ ${slug} … `))
      const buf = await generate(prompt, loraScale(species))
      await writeFile(target, buf)
      console.log(c.g(`✓ ${(buf.length / 1024).toFixed(0)} KB`))
      done++
    } catch (e) {
      console.log(c.r(`✗ ${e.message}`))
      failed++
    }
  }

  console.log(`\n${c.g(`✓ ${done} generiert`)} · ${c.d(`${skipped} übersprungen`)} · ${failed ? c.r(`${failed} Fehler`) : '0 Fehler'}\n`)
}

main().catch(e => { console.error(c.r(e.stack || e.message)); process.exit(1) })
