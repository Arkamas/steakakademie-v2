#!/usr/bin/env node
/**
 * Steakakademie Glossary Agent
 *
 * Pipeline:
 *   1. EXTRAKTION  — Scannt alle Content-MDX-Dateien auf BBQ/Kulinarik-Begriffe
 *   2. GENERIERUNG — Erzeugt via Claude Haiku eine standardisierte Akademie-Definition
 *   3. SPEICHERUNG — Schreibt MDX-Dateien nach content/glossar/<slug>.mdx
 *   4. INDEX       — Baut content/glossar/terms.json für Auto-Verlinkung
 *   5. AUTO-LINK   — (optional: --link) Verlinkt Begriffe in Content-Dateien
 *
 * Usage:
 *   node scripts/glossary-agent.mjs           # Nur Generierung (Build-Standard)
 *   node scripts/glossary-agent.mjs --link    # + Auto-Verlinkung in Content-Dateien
 *   node scripts/glossary-agent.mjs --dry-run # Vorschau ohne API-Calls / Datei-Schreibzugriff
 */

import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { readdir, readFile, writeFile, mkdir, access } from 'fs/promises'
import { join, extname, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

dotenv.config({ path: join(ROOT, '.env.local') })

const CONTENT_DIR  = join(ROOT, 'content')
const GLOSSAR_DIR  = join(CONTENT_DIR, 'glossar')
const CACHE_FILE   = join(GLOSSAR_DIR, '.processed.json')
const TERMS_INDEX  = join(GLOSSAR_DIR, 'terms.json')
const SCAN_DIRS    = ['artikel', 'cuts', 'methoden', 'vergleich', 'persoenlichkeiten']

// ─── SEED TERMS ───────────────────────────────────────────────────────────────
// Garantierter Grundbestand unabhängig vom Content

const SEED_TERMS = [
  'Maillard-Reaktion',
  'Reverse Sear',
  'Dry Aging',
  'Kerntemperatur',
  'Plateauphase',
  'Smoke Ring',
  'Bark',
  'Texas Crutch',
  'Marmorierung',
  'Enzymatische Reifung',
  'Kollagen',
  'Myoglobin',
  'Carryover Cooking',
  'Intramuskuläres Fett',
  'Dry Brining',
  'Wet Brining',
  'Rub',
  'Brine',
  'BMS-Score',
  'Low & Slow',
  'Sous-vide',
  'Stall',
  'Kamado',
  'Pelletgrill',
  'Offset-Smoker',
  'Oberhitzegrill',
  'Gusseisenpfanne',
  'Hackfleisch',
  'Fleischthermometer',
]

// ─── UTILS ────────────────────────────────────────────────────────────────────

const c = {
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  red:    s => `\x1b[31m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
}

function toSlug(term) {
  return term
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeFrontmatter(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

// ─── CACHE ────────────────────────────────────────────────────────────────────

async function loadCache() {
  try {
    return new Set(JSON.parse(await readFile(CACHE_FILE, 'utf-8')))
  } catch {
    return new Set()
  }
}

async function saveCache(cache) {
  await writeFile(CACHE_FILE, JSON.stringify([...cache].sort(), null, 2))
}

// ─── 1. EXTRAKTION ────────────────────────────────────────────────────────────

async function findContentFiles() {
  const files = []
  for (const dir of SCAN_DIRS) {
    try {
      for (const e of await readdir(join(CONTENT_DIR, dir), { withFileTypes: true })) {
        if (e.isFile() && ['.mdx', '.md'].includes(extname(e.name))) {
          files.push(join(CONTENT_DIR, dir, e.name))
        }
      }
    } catch { /* Ordner existiert noch nicht */ }
  }
  return files
}

const STOPWORD_PREFIXES = new Set([
  'Der', 'Die', 'Das', 'Ein', 'Eine', 'Und', 'Oder', 'Mit', 'Von',
  'Für', 'Wie', 'Was', 'Warum', 'Beim', 'Im', 'Nach', 'Zur', 'Zum',
  'So', 'Ab', 'Bis', 'Über', 'Unter', 'Ohne', 'Pro', 'Per',
])

// Ausschlussliste für generische Begriffe die kein Glossar-Eintrag werden sollen
const GENERIC_TERMS = new Set([
  'Fazit', 'Methode', 'Methoden', 'Setup', 'Option', 'Stärken', 'Schwächen',
  'Schritt', 'Ergebnis', 'Ergebnisse', 'Empfehlung', 'Übersicht', 'Zusammenfassung',
  'Transparenz', 'Hinweis', 'Kaufberatung', 'Bewertung', 'Testergebnis',
  'Fazit', 'Platz', 'Test', 'Preis', 'Zeit', 'Temp', 'Holz', 'Gewicht',
])

function isValidTerm(t) {
  // Muss zwischen 4 und 50 Zeichen sein
  if (t.length < 4 || t.length > 50) return false
  // Kein Satzfragment (Punkt, Ausrufezeichen, Fragezeichen)
  if (/[.!?]/.test(t)) return false
  // Keine Klammern, Schrägstriche, Doppelpunkte
  if (/[()/:[\]]/.test(t)) return false
  // Nicht mit Zahl beginnen
  if (/^\d/.test(t)) return false
  // Nicht mit Stopword beginnen
  const first = t.split(/\s+/)[0]
  if (STOPWORD_PREFIXES.has(first)) return false
  // Nicht in Ausschlussliste
  if (GENERIC_TERMS.has(t)) return false
  // Maximal 3 Wörter (echte Fachbegriffe sind kompakt)
  if (t.split(/\s+/).length > 3) return false
  return true
}

// BBQ-spezifische Prefix-Wurzeln für automatische Komposita-Erkennung
const BBQ_PREFIXES = /^(Bark|Smoke|Smoker|Rub|Brine|Kollagen|Maillard|Kerntemperatur|Dry|Wet|Carryover|Wagyu|Brisket|Pulled|Reverse|Packer|Boston|Offset|Pellet|Kamado|Sous|Infrarot|Oberhitze|Gusseisen|Fleischwolf|Fleischthermometer)/i

function extractTermsFromContent(raw) {
  const body = raw.replace(/^---[\s\S]*?---\n/, '')
  const candidates = new Set()

  // Nur Bindestrich-Komposita mit BBQ-Prefix extrahieren — kein Rauschen
  // Beispiele: Bark-Bildung, Kollagen-Transformation, Dry-Aged, Smoker-Finish
  for (const [t] of body.matchAll(/\b[A-ZÄÖÜ][a-zäöüßA-ZÄÖÜ]+-[A-ZÄÖÜa-zäöüß][a-zäöüßA-ZÄÖÜ]+\b/g)) {
    if (t.length >= 6 && t.length <= 35 && BBQ_PREFIXES.test(t) && isValidTerm(t)) {
      candidates.add(t)
    }
  }

  return [...candidates]
}

// ─── 2. GENERIERUNG via Claude ────────────────────────────────────────────────

async function generateEntry(term) {
  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    maxTokens: 700,
    temperature: 0.2,
    prompt: `Du bist Chefredakteur der Steakakademie — Deutschlands präziseste BBQ-Wissensplattform.

Erstelle einen Glossar-Eintrag für den Begriff: "${term}"

Antworte AUSSCHLIESSLICH mit gültigem JSON. Kein Markdown-Wrapper darum:
{
  "title": "Korrekter Begriffsname auf Deutsch",
  "category": "Exakt eine von: Chemie & Physik | Fleischkunde | Techniken & Methoden | Ausrüstung | Reifung | Würzung & Marinaden | Thermodynamik | Cuts & Teilstücke",
  "shortDefinition": "Präzise 1-2 Sätze. Direkt, kein Füllwort.",
  "background": "2-3 Sätze wissenschaftlicher oder kulinarischer Hintergrund — das Warum und Wie.",
  "praxistipp": "1-2 Sätze konkreter Praxistipp für den Grillmeister.",
  "seoDescription": "Meta-Description 140-155 Zeichen — enthält den Begriff und einen klaren Nutzenaspekt."
}`,
  })

  // JSON auch aus Markdown-Codeblock extrahieren, falls Claude ihn doch einbettet
  const match = text.match(/\{[\s\S]+\}/)
  if (!match) throw new Error(`Kein JSON in Claude-Antwort für "${term}"`)
  return JSON.parse(match[0])
}

// ─── 3. MDX-DATEI SCHREIBEN ───────────────────────────────────────────────────

function buildMdxContent(entry, slug) {
  const today = new Date().toISOString().split('T')[0]
  return `---
title: "${escapeFrontmatter(entry.title)}"
slug: "${slug}"
category: "${escapeFrontmatter(entry.category)}"
shortDefinition: "${escapeFrontmatter(entry.shortDefinition)}"
publishedAt: "${today}"
seoTitle: "${escapeFrontmatter(entry.title)} — BBQ-Glossar | Steakakademie"
seoDescription: "${escapeFrontmatter(entry.seoDescription || entry.shortDefinition.slice(0, 155))}"
---

## Definition

${entry.shortDefinition}

## Wissenschaftlicher Hintergrund

${entry.background}

## Praxistipp für den Grillmeister

${entry.praxistipp}
`
}

// ─── 4. TERMS-INDEX AUFBAUEN ──────────────────────────────────────────────────

async function buildTermsIndex() {
  const entries = []
  try {
    for (const f of await readdir(GLOSSAR_DIR)) {
      if (!f.endsWith('.mdx')) continue
      const content = await readFile(join(GLOSSAR_DIR, f), 'utf-8')
      const titleMatch = content.match(/^title:\s*"(.+)"/m)
      if (titleMatch) {
        entries.push({ term: titleMatch[1], slug: basename(f, '.mdx') })
      }
    }
  } catch { /* Glossar-Ordner noch leer */ }

  // Längste Begriffe zuerst → verhindert Teil-Ersetzungen bei Auto-Link
  entries.sort((a, b) => b.term.length - a.term.length)
  await writeFile(TERMS_INDEX, JSON.stringify(entries, null, 2))
  return entries
}

// ─── 5. AUTO-VERLINKUNG ───────────────────────────────────────────────────────
/**
 * Scannt eine Content-Datei und verlinkt beim ersten Auftreten jedes Glossarbegriffs.
 * Sicher: überspringt Codeblöcke, Überschriften, JSX-Zeilen und bereits verlinkte Begriffe.
 * Idempotent: bereits verlinkte Begriffe werden nicht doppelt verlinkt.
 */
async function autoLinkInFile(filePath, terms) {
  const raw = await readFile(filePath, 'utf-8')

  // Frontmatter-Grenze finden
  const fmEnd = raw.indexOf('\n---\n', 4)
  if (fmEnd === -1) return 0

  const frontmatter = raw.slice(0, fmEnd + 5)
  const body = raw.slice(fmEnd + 5)

  const linkedSlugs = new Set()
  let inCodeFence = false
  let count = 0

  const lines = body.split('\n').map(line => {
    // Code-Fence-Tracking
    if (/^```/.test(line)) { inCodeFence = !inCodeFence; return line }
    if (inCodeFence) return line

    // Zeilen überspringen, die keine normalen Paragraph-Texte sind
    if (/^#/.test(line))      return line  // Überschriften
    if (/^import\s/.test(line)) return line // MDX-Imports
    if (/^export\s/.test(line)) return line // MDX-Exports
    if (/^\s*</.test(line))   return line  // JSX-Zeilen
    if (/^\s*---/.test(line)) return line  // YAML-Trenner

    let result = line
    for (const { term, slug } of terms) {
      if (linkedSlugs.has(slug)) continue
      if (!result.includes(term)) continue

      // Bereits verlinkt? → Slug merken und überspringen
      if (new RegExp(`\\[${escapeRegex(term)}\\]`).test(result)) {
        linkedSlugs.add(slug)
        continue
      }

      // Erste unverlinkte Verwendung ersetzen (negative Lookbehind/Lookahead)
      const re = new RegExp(`(?<!\\[)${escapeRegex(term)}(?!\\])`)
      const newLine = result.replace(re, `[${term}](/glossar/${slug})`)
      if (newLine !== result) {
        result = newLine
        linkedSlugs.add(slug)
        count++
      }
    }
    return result
  })

  const modified = frontmatter + lines.join('\n')
  if (modified !== raw) await writeFile(filePath, modified, 'utf-8')
  return count
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2)
  const doLink  = args.includes('--link')
  const dryRun  = args.includes('--dry-run')

  console.log(`\n${c.bold('🔥 Steakakademie Glossary Agent')}${dryRun ? c.yellow(' [DRY RUN]') : ''}\n`)

  await mkdir(GLOSSAR_DIR, { recursive: true })

  // ── Schritt 1: Content scannen (immer, auch ohne API-Key) ───────────────────
  const cache = await loadCache()
  const contentFiles = await findContentFiles()
  console.log(`${c.dim('📄')} ${contentFiles.length} Content-Dateien gefunden`)

  const allTerms = new Set(SEED_TERMS)
  for (const file of contentFiles) {
    const content = await readFile(file, 'utf-8')
    for (const t of extractTermsFromContent(content)) allTerms.add(t)
  }

  const newTerms = [...allTerms].filter(t => !cache.has(toSlug(t)))
  const already  = allTerms.size - newTerms.length
  console.log(`${c.dim('✨')} ${c.bold(String(newTerms.length))} neue Begriffe ${c.dim(`(${already} bereits verarbeitet, ${allTerms.size} gesamt)`)}`)

  if (dryRun) {
    if (newTerms.length > 0) {
      console.log(`\n${c.yellow('Neue Begriffe (Vorschau):')}\n${newTerms.map(t => `  • ${t}`).join('\n')}\n`)
    } else {
      console.log(c.green('\n✓ Glossar ist aktuell — keine neuen Begriffe.\n'))
    }
    return
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(c.yellow('\n⚠  ANTHROPIC_API_KEY nicht gesetzt — Generierung übersprungen.'))
    await buildTermsIndex()
    console.log()
    process.exit(0)
  }

  // ── Schritt 2+3: Einträge generieren & speichern ────────────────────────────
  let created = 0, skipped = 0, errors = 0

  if (newTerms.length > 0) console.log()

  for (let i = 0; i < newTerms.length; i++) {
    const term    = newTerms[i]
    const slug    = toSlug(term)
    const outPath = join(GLOSSAR_DIR, `${slug}.mdx`)
    const prefix  = `  [${String(i + 1).padStart(String(newTerms.length).length)}/${newTerms.length}]`

    // Datei schon vorhanden? → Cache aktualisieren, überspringen
    try {
      await access(outPath)
      cache.add(slug)
      skipped++
      console.log(`${prefix} ${c.dim(term)} ${c.dim('(bereits vorhanden)')}`)
      continue
    } catch { /* Datei existiert noch nicht → generieren */ }

    try {
      process.stdout.write(`${prefix} ${term}... `)
      const entry   = await generateEntry(term)
      const mdxBody = buildMdxContent(entry, slug)
      await writeFile(outPath, mdxBody, 'utf-8')
      cache.add(slug)
      created++
      console.log(c.green('✓'))
    } catch (err) {
      errors++
      console.log(c.red(`✗  ${err.message}`))
    }

    // Rate-Limit-Puffer zwischen API-Calls
    if (i < newTerms.length - 1) await new Promise(r => setTimeout(r, 200))
  }

  // ── Schritt 4: Cache + Terms-Index aktualisieren ────────────────────────────
  await saveCache(cache)
  const termsIndex = await buildTermsIndex()

  console.log(`\n${c.dim('📚')} Glossar: ${c.green(`${created} erstellt`)}, ${c.dim(`${skipped} übersprungen`)}${errors ? ', ' + c.red(`${errors} Fehler`) : ''}`)
  console.log(`${c.dim('📑')} terms.json: ${termsIndex.length} Einträge → content/glossar/terms.json`)

  // ── Schritt 5: Auto-Verlinkung (opt-in) ────────────────────────────────────
  if (doLink && contentFiles.length > 0) {
    console.log(`\n${c.dim('🔗')} Auto-Verlinkung in Content-Dateien...`)
    let totalLinks = 0
    for (const file of contentFiles) {
      const n = await autoLinkInFile(file, termsIndex)
      if (n > 0) {
        console.log(`  ${c.dim(basename(file))}: ${c.green(`+${n} Link${n !== 1 ? 's' : ''}`)}`)
        totalLinks += n
      }
    }
    console.log(`  Gesamt: ${c.bold(String(totalLinks))} neue Links gesetzt\n`)
  } else if (!doLink) {
    console.log(`\n${c.dim('💡 Tipp: --link für Auto-Verlinkung in Content-Dateien')}\n`)
  }
}

main().catch(err => {
  console.error(c.red('\n❌ Glossary Agent Fehler:'), err.message)
  process.exit(0)  // exit 0 damit der Build nicht abbricht
})
