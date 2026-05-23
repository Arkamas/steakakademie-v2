import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import { join, extname, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

const DIRS = ['public']
const EXTS = ['.jpg', '.jpeg', '.png']
const MAX_WIDTH = 1200
const WEBP_QUALITY = 80

async function findImages(dir) {
  const results = []
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...await findImages(fullPath))
    } else if (EXTS.includes(extname(entry.name).toLowerCase())) {
      results.push(fullPath)
    }
  }
  return results
}

async function convertToWebP(inputPath) {
  const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp')
  const inputStat = await stat(inputPath)

  const image = sharp(inputPath)
  const meta = await image.metadata()

  const pipeline = image
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })

  await pipeline.toFile(outputPath)

  const outputStat = await stat(outputPath)
  const saving = Math.round((1 - outputStat.size / inputStat.size) * 100)
  const relInput = inputPath.replace(PROJECT_ROOT + '\\', '').replace(PROJECT_ROOT + '/', '')

  console.log(`✓ ${relInput}`)
  console.log(`  ${Math.round(inputStat.size/1024)}KB → ${Math.round(outputStat.size/1024)}KB  (${saving > 0 ? '-' : '+'}${Math.abs(saving)}%)  ${meta.width}x${meta.height}px`)
  return { inputPath, outputPath, savedBytes: inputStat.size - outputStat.size }
}

async function main() {
  console.log('Suche nach Bildern in:', DIRS.join(', '))

  let allImages = []
  for (const dir of DIRS) {
    allImages.push(...await findImages(join(PROJECT_ROOT, dir)))
  }

  if (allImages.length === 0) {
    console.log('Keine Bilder gefunden.')
    return
  }

  console.log(`\n${allImages.length} Bild(er) gefunden:\n`)

  let totalSaved = 0
  let errors = 0

  for (const img of allImages) {
    try {
      const result = await convertToWebP(img)
      totalSaved += result.savedBytes
    } catch (err) {
      console.error(`✗ Fehler bei ${img}: ${err.message}`)
      errors++
    }
  }

  console.log(`\nFertig: ${allImages.length - errors}/${allImages.length} konvertiert`)
  console.log(`Gespart: ${Math.round(totalSaved / 1024)} KB total`)
}

main()
