#!/usr/bin/env node
/**
 * Schwein-LoRA-Training (FLUX) auf fal.ai
 * ========================================
 * Trainiert einen hauseigenen LoRA, der Schwein NATIV als blass-rosa, geschichtetes
 * rohes Fleisch rendert — statt per Prompt gegen den rind-trainierten sa_foodstyle-LoRA
 * anzukämpfen. Grundlage für alle künftigen Schwein-Bilder (Cuts, Rezepte, Social).
 *
 * Datensatz: rechtefreie Cut-Fotos aus training/lora-pork/dataset/ (privat, ausserhalb
 * public/ -> NICHT auf der Website; nur die spaeter generierten Bilder gehen oeffentlich).
 * Läuft NUR in GitHub Actions (FAL_KEY = Secret). Output: scripts/pork-lora.json.
 *
 * Aufruf (im Workflow): node scripts/train-pork-lora.mjs
 *   ENV: FAL_KEY (Pflicht). Optional: PORK_STEPS (Default 1200).
 */

import { fal } from '@fal-ai/client'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, readdirSync } from 'fs'
import { execFileSync } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATASET = join(ROOT, 'training', 'lora-pork', 'dataset')

if (!process.env.FAL_KEY) { console.error('✖ FAL_KEY fehlt (nur in GitHub Actions verfügbar).'); process.exit(1) }
fal.config({ credentials: process.env.FAL_KEY })

// Trainings-Datensatz: alle JPGs aus training/lora-pork/dataset/ (Dateiname = Cut-Slug).
// v3 (15.06.): reale, rechtefreie Iberico/Duroc-Cuts; Quelle entkoppelt von public/.
const SLUGS = readdirSync(DATASET)
  .filter((f) => /\.jpe?g$/i.test(f))
  .map((f) => f.replace(/\.jpe?g$/i, ''))
  .sort()
if (SLUGS.length === 0) { console.error('✖ Keine Bilder in training/lora-pork/dataset/.'); process.exit(1) }
const TRIGGER = 'sa_pork'
const STEPS = parseInt(process.env.PORK_STEPS || '1600', 10)

const caption = (slug) =>
  `${TRIGGER}, ${slug.replace(/-/g, ' ')}, a single fresh pale pink raw pork cut, `
  + `light blush-pink lean meat with soft creamy white fat, distinctly pale not red, `
  + `on a dark charcoal slate surface, studio product photography`

async function main() {
  // 1) Datensatz-Ordner: Bilder + .txt-Captions (Dateiname-Matching)
  const ds = '/tmp/pork-dataset'
  try { rmSync(ds, { recursive: true, force: true }) } catch {}
  mkdirSync(ds, { recursive: true })
  for (const slug of SLUGS) {
    copyFileSync(join(DATASET, `${slug}.jpg`), join(ds, `${slug}.jpg`))
    writeFileSync(join(ds, `${slug}.txt`), caption(slug))
  }
  console.log(`📦 Datensatz: ${SLUGS.length} Bilder + Captions`)

  // 2) Zip (ubuntu-runner hat `zip`)
  const zipPath = '/tmp/pork-dataset.zip'
  try { rmSync(zipPath, { force: true }) } catch {}
  execFileSync('zip', ['-q', '-r', zipPath, '.'], { cwd: ds })

  // 3) Upload zu fal-Storage
  const zipBuf = readFileSync(zipPath)
  const zipUrl = await fal.storage.upload(new Blob([zipBuf], { type: 'application/zip' }))
  console.log(`☁  Zip hochgeladen: ${zipUrl}`)

  // 4) Training (FLUX LoRA fast training)
  console.log(`🎛  Training startet — ${STEPS} steps, trigger "${TRIGGER}" (~15–30 Min)…`)
  const result = await fal.subscribe('fal-ai/flux-lora-fast-training', {
    input: {
      images_data_url: zipUrl,
      trigger_word: TRIGGER,
      steps: STEPS,
      is_style: false,
      create_masks: true,
    },
    logs: true,
    onQueueUpdate: (u) => {
      if (u.status === 'IN_PROGRESS') (u.logs || []).forEach((l) => l?.message && console.log('  ' + l.message))
    },
  })

  const data = result?.data ?? result
  const url = data?.diffusers_lora_file?.url
  if (!url) { console.error('✖ Keine LoRA-URL in der Antwort:', JSON.stringify(data).slice(0, 600)); process.exit(1) }
  console.log(`✅ LoRA fertig: ${url}`)

  // 5) Config schreiben → cut-images.mjs liest sie für species "schwein"
  const cfg = {
    url,
    trigger: TRIGGER,
    scale: 1.0,
    steps: STEPS,
    dataset: SLUGS,
    trained_at: new Date().toISOString().slice(0, 10),
  }
  writeFileSync(join(__dirname, 'pork-lora.json'), JSON.stringify(cfg, null, 2) + '\n')
  console.log('📝 scripts/pork-lora.json geschrieben.')
}

main().catch((e) => { console.error('✖ Training fehlgeschlagen:', e?.message || e); process.exit(1) })
