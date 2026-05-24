#!/usr/bin/env node
/**
 * Steakakademie SEO Image Optimizer
 *
 * Pipeline:
 *   1. SCAN    — Findet alle MDX-Dateien und deren Bild-Referenzen
 *   2. ANALYSE — Erkennt generische Dateinamen + fehlende/kurze Alt-Texte
 *   3. NAMING  — Generiert SEO-Dateinamen via Claude (nur generische Namen)
 *   4. ALTS    — Generiert präzise Alt-Attribute via Claude
 *   5. SYNC    — Benennt Dateien um + patcht alle MDX-Referenzen atomar
 *
 * Usage:
 *   node scripts/seo-image-optimizer.mjs           # Standard (Build/Dev)
 *   node scripts/seo-image-optimizer.mjs --dry-run # Vorschau ohne Änderungen
 *   node scripts/seo-image-optimizer.mjs --force   # Bereits Gecachtes erneut prüfen
 */

import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { readdir, readFile, writeFile, rename, access } from 'fs/promises'
import { join, extname, basename, dirname, relative } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT       = join(__dirname, '..')
const CONTENT    = join(ROOT, 'content')
const PUBLIC     = join(ROOT, 'public')
const CACHE_FILE = join(ROOT, '.seo-image-cache.json')

dotenv.config({ path: join(ROOT, '.env.local') })

const CONTENT_DIRS  = ['artikel', 'cuts', 'methoden', 'vergleich', 'persoenlichkeiten', 'usa']
const IMAGE_EXTS    = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const ALT_MIN_LEN   = 30   // Chars — kürzere Alts gelten als fehlend
const DRY_RUN       = process.argv.includes('--dry-run')
const FORCE         = process.argv.includes('--force')

// ─── GENERISCHE MUSTER ────────────────────────────────────────────────────────
// Dateinamen, die keine SEO-Relevanz tragen und umbenannt werden sollen

const GENERIC_PATTERNS = [
  /^img[_-]?\d+\./i,
  /^image[_-]?\d*\./i,
  /^screenshot[_-]?\d*\./i,
  /^photo[_-]?\d+\./i,
  /^pic[_-]?\d+\./i,
  /^pict[_-]?\d+\./i,
  /^dsc\w*\d+\./i,
  /^untitled[_-]?\d*\./i,
  /^unnamed[_-]?\d*\./i,
  /^file[_-]?\d+\./i,
  /^bild[_-]?\d+\./i,
  /^foto[_-]?\d+\./i,
  /^frame[_-]?\d+\./i,
  /^\d{8}[_-]\d{6}/,           // Kamera-Zeitstempel: 20240101_120000
  /^[a-f0-9]{8,}\./i,          // UUID/Hash-Namen
]

// ─── FARB-UTILS ───────────────────────────────────────────────────────────────

const c = {
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  red:    s => `\x1b[31m${s}\x1b[0m`,
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
}

// ─── CACHE ────────────────────────────────────────────────────────────────────

async function loadCache() {
  try { return JSON.parse(await readFile(CACHE_FILE, 'utf-8')) } catch { return {} }
}

async function saveCache(cache) {
  if (!DRY_RUN) await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2))
}

// ─── FRONTMATTER PARSER ───────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}

  const out = {}
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([a-zA-Z]\w*):\s*(.*)$/)
    if (!m) continue
    let val = m[2].trim()
    if (/^["']/.test(val) && /["']$/.test(val)) val = val.slice(1, -1)
    out[m[1]] = val
  }
  return out
}

/**
 * Ersetzt/fügt ein Frontmatter-Feld ein.
 * Bevorzugt: vorhandenes Feld überschreiben.
 * Fallback: nach `image:` einfügen, sonst vor `---` am Ende.
 */
function patchFrontmatterField(content, key, value) {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const re = new RegExp(`^(${key}:\\s*).*$`, 'm')

  if (re.test(content)) return content.replace(re, `${key}: "${escaped}"`)

  // Nach image: einfügen
  if (/^image:/m.test(content)) return content.replace(/^(image:.*)/m, `$1\n${key}: "${escaped}"`)

  // Vor schließendes ---
  return content.replace(/(\n---\n|\n---$)/, `\n${key}: "${escaped}"$1`)
}

// ─── HELFER ───────────────────────────────────────────────────────────────────

function isGeneric(filename) {
  return GENERIC_PATTERNS.some(p => p.test(filename))
}

function toSlug(raw) {
  return raw
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
}

// ─── 1. SCAN ──────────────────────────────────────────────────────────────────

async function findMdxFiles() {
  const files = []
  for (const dir of CONTENT_DIRS) {
    try {
      for (const e of await readdir(join(CONTENT, dir), { withFileTypes: true })) {
        if (e.isFile() && ['.mdx', '.md'].includes(extname(e.name).toLowerCase())) {
          files.push(join(CONTENT, dir, e.name))
        }
      }
    } catch { /* Verzeichnis existiert noch nicht */ }
  }
  return files
}

// ─── 2. ANALYSE ───────────────────────────────────────────────────────────────

async function analyzeFile(mdxPath) {
  const content  = await readFile(mdxPath, 'utf-8')
  const fm       = parseFrontmatter(content)

  const imageUrl = fm.image || ''
  const imageAlt = fm.imageAlt || ''
  const needsAlt = !imageAlt || imageAlt.length < ALT_MIN_LEN

  let localImagePath = null
  let needsRename    = false

  if (imageUrl.startsWith('/')) {
    const abs = join(PUBLIC, imageUrl.replace(/^\//, ''))
    try {
      await access(abs)
      localImagePath = abs
      needsRename    = isGeneric(basename(abs))
    } catch { /* Datei existiert nicht lokal */ }
  }

  return {
    mdxPath,
    content,
    title:    fm.title    || '',
    excerpt:  fm.excerpt  || '',
    imageUrl,
    imageAlt,
    needsAlt,
    localImagePath,
    needsRename,
  }
}

// ─── 3. SEO-DATEINAME GENERIEREN ─────────────────────────────────────────────

async function generateSeoFilename(title, excerpt, currentFile) {
  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    maxTokens: 80,
    messages: [{
      role: 'user',
      content: `SEO-Dateiname für ein Bild auf steakakademie.de (BBQ/Steak-Wissensplattform).

Artikel: "${title}"
Auszug: "${excerpt.slice(0, 180)}"
Aktueller Dateiname: "${currentFile}"

Regeln:
- Nur Kleinbuchstaben + Bindestriche (keine Umlaute, kein Unterstrich)
- 3–6 Keywords die das Bild + den Artikel-Kontext beschreiben
- Max. 65 Zeichen, kein Worte wie "bild", "foto", "image"
- Beispiel: "ribeye-steak-marmorierung-wagyu-grill"

Antworte NUR mit dem Dateinamen, ohne Dateiendung, ohne Erklärung.`,
    }],
  })
  return toSlug(text.trim().replace(/\.[a-z]+$/, ''))
}

// ─── 4. ALT-TEXT GENERIEREN ──────────────────────────────────────────────────

async function generateAltText(title, excerpt, imageUrl) {
  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    maxTokens: 120,
    messages: [{
      role: 'user',
      content: `Alt-Text für ein Bild auf steakakademie.de (BBQ/Steak-Wissensplattform).

Artikel: "${title}"
Auszug: "${excerpt.slice(0, 250)}"
Bild: "${imageUrl}"

Regeln:
- Auf Deutsch
- 40–100 Zeichen
- Beschreibt visuell was zu sehen ist (konkret: Farbe, Kontext, Produkt)
- Enthält Haupt-Keyword des Artikels natürlich
- Kein "Bild von", kein "Foto zeigt" am Anfang
- Kein Punkt am Ende

Antworte NUR mit dem Alt-Text, ohne Anführungszeichen, ohne Erklärung.`,
    }],
  })
  return text.trim().replace(/^["']|["']$/g, '').replace(/\.$/, '')
}

// ─── 5. SYNC ──────────────────────────────────────────────────────────────────

async function renameAndUpdateRefs(oldAbsPath, newSlug, allMdxFiles) {
  const ext       = extname(oldAbsPath)
  const newAbsPath = join(dirname(oldAbsPath), newSlug + ext)
  const oldUrl    = '/' + relative(PUBLIC, oldAbsPath).replace(/\\/g, '/')
  const newUrl    = '/' + relative(PUBLIC, newAbsPath).replace(/\\/g, '/')

  if (!DRY_RUN) await rename(oldAbsPath, newAbsPath)

  let patchedFiles = 0
  for (const mdxPath of allMdxFiles) {
    const src = await readFile(mdxPath, 'utf-8')
    if (!src.includes(oldUrl)) continue
    if (!DRY_RUN) await writeFile(mdxPath, src.replaceAll(oldUrl, newUrl), 'utf-8')
    patchedFiles++
  }

  return { oldUrl, newUrl, newAbsPath, patchedFiles }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(c.bold('\n┌─────────────────────────────────────────────┐'))
  console.log(c.bold('│  Steakakademie — SEO Image Optimizer        │'))
  console.log(c.bold('└─────────────────────────────────────────────┘\n'))

  if (DRY_RUN) console.log(c.yellow('  Dry-run — keine Änderungen werden gespeichert\n'))

  const hasApiKey = !!process.env.ANTHROPIC_API_KEY
  if (!hasApiKey) {
    console.log(c.yellow('  ANTHROPIC_API_KEY fehlt — Alt-Text-Generierung übersprungen'))
    console.log(c.dim('  Trage den Key in .env.local ein, um KI-Generierung zu aktivieren\n'))
  }

  const cache       = await loadCache()
  const mdxFiles    = await findMdxFiles()
  const analyses    = await Promise.all(mdxFiles.map(analyzeFile))

  const toRename    = analyses.filter(a => a.needsRename && a.localImagePath)
  const toAlt       = analyses.filter(a => a.needsAlt && a.imageUrl)

  console.log(`  ${mdxFiles.length} MDX-Dateien gescannt`)
  console.log(`  ${c.yellow(toRename.length + '')} Bilder mit generischem Namen`)
  console.log(`  ${c.yellow(toAlt.length + '')} Dateien ohne/kurzem Alt-Text\n`)

  if (toRename.length === 0 && toAlt.length === 0) {
    console.log(c.green('  Alles optimiert — nichts zu tun.\n'))
    return
  }

  let renamed = 0, altsSet = 0, skipped = 0

  // ─ Phase 3+5: Umbenennungen ────────────────────────────────────────────────
  if (toRename.length > 0 && hasApiKey) {
    console.log(c.bold('  Phase 1 — Dateinamen optimieren\n'))

    for (const item of toRename) {
      const cacheKey = `rename:${item.localImagePath}`
      if (!FORCE && cache[cacheKey]) {
        console.log(c.dim(`  ↷ ${basename(item.localImagePath)} (gecacht)`))
        skipped++
        continue
      }

      let slug
      try {
        slug = await generateSeoFilename(item.title, item.excerpt, basename(item.localImagePath))
      } catch (err) {
        console.log(c.red(`  ✗ ${basename(item.localImagePath)} — API-Fehler: ${err.message}`))
        continue
      }

      if (!slug || slug.length < 5) {
        console.log(c.yellow(`  ⚠ ${basename(item.localImagePath)} — Slug leer, übersprungen`))
        continue
      }

      const ext = extname(item.localImagePath)
      console.log(c.green(`  ✓ ${basename(item.localImagePath)} → ${slug}${ext}`))

      const result = await renameAndUpdateRefs(item.localImagePath, slug, mdxFiles)
      if (result.patchedFiles > 0) {
        console.log(c.dim(`    Pfad in ${result.patchedFiles} MDX-Datei(en) aktualisiert`))
      }

      cache[cacheKey] = { slug, at: new Date().toISOString() }
      renamed++
    }
    console.log()
  }

  // ─ Phase 4: Alt-Texte ─────────────────────────────────────────────────────
  if (toAlt.length > 0 && hasApiKey) {
    console.log(c.bold('  Phase 2 — Alt-Texte generieren\n'))

    for (const item of toAlt) {
      const cacheKey = `alt:${item.mdxPath}`
      if (!FORCE && cache[cacheKey]) {
        console.log(c.dim(`  ↷ ${basename(item.mdxPath)} (gecacht)`))
        skipped++
        continue
      }

      let alt
      try {
        alt = await generateAltText(item.title, item.excerpt, item.imageUrl)
      } catch (err) {
        console.log(c.red(`  ✗ ${basename(item.mdxPath)} — API-Fehler: ${err.message}`))
        continue
      }

      if (!alt || alt.length < 10) {
        console.log(c.yellow(`  ⚠ ${basename(item.mdxPath)} — Alt-Text leer, übersprungen`))
        continue
      }

      const wasLabel = item.imageAlt
        ? `"${item.imageAlt.slice(0, 35)}${item.imageAlt.length > 35 ? '…' : ''}"`
        : c.red('(fehlt)')

      // Lese aktuelle Version (könnte durch Umbenennung verändert worden sein)
      const currentContent = await readFile(item.mdxPath, 'utf-8')
      const patched = patchFrontmatterField(currentContent, 'imageAlt', alt)

      if (!DRY_RUN) await writeFile(item.mdxPath, patched, 'utf-8')

      console.log(c.green(`  ✓ ${basename(item.mdxPath)}`))
      console.log(c.dim(`    War:  ${wasLabel}`))
      console.log(c.dim(`    Neu:  "${alt}"`))

      cache[cacheKey] = { alt, at: new Date().toISOString() }
      altsSet++
    }
    console.log()
  }

  await saveCache(cache)

  // ─ Summary ────────────────────────────────────────────────────────────────
  console.log(c.bold('  ─────────────────────────────────────────────'))
  if (renamed > 0)  console.log(c.green(`  ✓ ${renamed} Bild(er) umbenannt`))
  if (altsSet > 0)  console.log(c.green(`  ✓ ${altsSet} Alt-Text(e) gesetzt`))
  if (skipped > 0)  console.log(c.dim(`    ${skipped} aus Cache übersprungen  (--force zum Neu-Generieren)`))
  if (renamed === 0 && altsSet === 0 && skipped === 0) {
    console.log(c.dim('    Keine Änderungen notwendig.'))
  }
  console.log()
}

main().catch(err => {
  // Kein process.exit(1) — Build darf nicht am Optimizer scheitern
  console.error(c.red(`\n  Optimizer-Fehler: ${err.message}\n`))
})
