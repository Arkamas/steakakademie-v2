#!/usr/bin/env node
/**
 * Steakakademie Recipe Image Generator (FLUX.1 dev via fal.ai)
 *
 * Generiert für Rezepte OHNE vorhandenes Hero-Bild ein markenkonformes,
 * NATÜRLICH getuntes Food-Foto, speichert es nach public/images/rezepte/<slug>.jpg
 * und patcht das `image:`-Feld im Frontmatter. Idempotent (überspringt vorhandene).
 *
 * Usage:
 *   FAL_KEY=... node scripts/recipe-images.mjs            # alle fehlenden
 *   FAL_KEY=... node scripts/recipe-images.mjs --limit 3  # nur N
 *   node scripts/recipe-images.mjs --dry-run              # nur Prompts zeigen
 *   FAL_KEY=... node scripts/recipe-images.mjs --force    # auch vorhandene neu
 *
 * Env: FAL_KEY (key_id:secret). In CI als GitHub-Secret gesetzt.
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT     = join(__dirname, '..')
const REZEPTE  = join(ROOT, 'content', 'rezepte')
const IMG_DIR  = join(ROOT, 'public', 'images', 'rezepte')

const DRY   = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')
const LIMIT = process.argv.includes('--limit')
  ? parseInt(process.argv[process.argv.indexOf('--limit') + 1], 10) : Infinity

// FAL_KEY robust: env zuerst, sonst .env.local manuell (dotenv-Quirk umgehen)
let FAL_KEY = process.env.FAL_KEY
if (!FAL_KEY && existsSync(join(ROOT, '.env.local'))) {
  const m = (await readFile(join(ROOT, '.env.local'), 'utf8')).match(/^FAL_KEY=(.+)$/m)
  if (m) FAL_KEY = m[1].trim()
}

const c = { g: s => `\x1b[32m${s}\x1b[0m`, y: s => `\x1b[33m${s}\x1b[0m`, r: s => `\x1b[31m${s}\x1b[0m`, d: s => `\x1b[2m${s}\x1b[0m` }

function fm(raw, key) {
  const m = raw.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, 'm'))
  return m ? m[1] : ''
}

// NATÜRLICHER Hausstil — kein Hochglanz-KI-Look, glaubwürdiges "echtes Ergebnis"
function buildPrompt(raw) {
  const alt   = fm(raw, 'imageAlt') || fm(raw, 'title')
  const meat  = fm(raw, 'meatType')
  const method = fm(raw, 'cookingMethod')
  const subject = [alt, meat && `(${meat})`, method].filter(Boolean).join(', ')
  return `professional food photography of ${subject}, `
    + `naturally styled and slightly imperfect like a real home-grilled result, `
    + `dark charcoal background, warm dramatic side lighting, glistening juices, visible char and texture, `
    + `shallow depth of field, photorealistic, editorial quality, no text, no watermark, no people`
}

async function generate(prompt) {
  const res = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image_size: 'landscape_4_3', num_images: 1, enable_safety_checker: true }),
  })
  if (!res.ok) throw new Error(`fal ${res.status}: ${(await res.text()).slice(0, 160)}`)
  const j = await res.json()
  const url = j.images?.[0]?.url
  if (!url) throw new Error('keine Bild-URL in fal-Antwort')
  const img = await fetch(url)
  return Buffer.from(await img.arrayBuffer())
}

async function main() {
  console.log(c.d('\n🖼  Recipe Image Generator (FLUX.1 dev)\n'))
  if (!DRY && !FAL_KEY) { console.log(c.r('⚠ FAL_KEY fehlt — Abbruch.')); process.exit(0) }
  await mkdir(IMG_DIR, { recursive: true })

  const files = (await readdir(REZEPTE)).filter(f => f.endsWith('.mdx'))
  let done = 0, skipped = 0, failed = 0

  for (const file of files) {
    if (done >= LIMIT) break
    const slug = file.replace(/\.mdx$/, '')
    const path = join(REZEPTE, file)
    const raw  = await readFile(path, 'utf8')
    const target = join(IMG_DIR, `${slug}.jpg`)
    const webPath = `/images/rezepte/${slug}.jpg`

    if (!FORCE && existsSync(target)) { skipped++; continue }

    const prompt = buildPrompt(raw)
    if (DRY) { console.log(c.y(`◇ ${slug}`)); console.log(c.d(`  ${prompt}\n`)); done++; continue }

    try {
      process.stdout.write(c.d(`◇ ${slug} … `))
      const buf = await generate(prompt)
      await writeFile(target, buf)
      // image:-Feld patchen (regex, KEIN Re-Serialize → contentlayer-safe)
      const patched = raw.match(/^image:\s*.*$/m)
        ? raw.replace(/^image:\s*.*$/m, `image: "${webPath}"`)
        : raw.replace(/^---\n/, `---\nimage: "${webPath}"\n`)
      if (patched !== raw) await writeFile(path, patched, 'utf8')
      console.log(c.g(`✓ ${(buf.length / 1024).toFixed(0)} KB`))
      done++
    } catch (e) {
      console.log(c.r(`✗ ${e.message}`))
      failed++
    }
  }

  console.log(`\n${c.g(`✓ ${done} generiert`)} · ${c.d(`${skipped} vorhanden`)} · ${failed ? c.r(`${failed} Fehler`) : '0 Fehler'}\n`)
}

main().catch(e => { console.error(c.r(e.stack || e.message)); process.exit(1) })
