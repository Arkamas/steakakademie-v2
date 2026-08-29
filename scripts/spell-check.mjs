#!/usr/bin/env node
/**
 * Steakakademie — Rechtschreibprüfung des Website-Contents (LanguageTool)
 *
 * Prüft alle MDX/MD-Dateien unter content/ (Fließtext + Frontmatter-title/
 * -description, also alles, was auf der Website sichtbar wird) gegen die
 * öffentliche LanguageTool-API (de-DE). Fachvokabular aus
 * data/rechtschreib-whitelist.txt löst keinen Alarm aus.
 *
 * INKREMENTELL: geprüfte, saubere Dateien werden mit Inhalts-Hash in
 * data/spell-check-cache.json vermerkt (committet). Im Netlify-postbuild
 * werden dadurch nur neue/geänderte Dateien geprüft — der Normalfall sind
 * null bis wenige API-Requests pro Build.
 *
 * REPORT-ONLY: Standard-Exitcode ist 0, auch bei Funden — Tippfehler dürfen
 * keinen Deploy blocken (--strict erzwingt Exitcode 1 bei Funden).
 *
 * API-Limits (öffentliche LT-API, ohne Account): 20 Req/min, 20 KB/Req.
 * Das Skript drosselt selbst (3,2 s Pause) und splittet lange Dateien.
 *
 * Usage:
 *   npm run spell:check              # inkrementell, Report
 *   npm run spell:check:full        # alles neu prüfen (--force)
 *   node scripts/spell-check.mjs --strict          # CI-Modus, Exit 1 bei Funden
 *   node scripts/spell-check.mjs --dir docs        # anderes Verzeichnis
 *   node scripts/spell-check.mjs --dry-run         # nur zählen, keine API-Calls
 */

import { readFile, writeFile, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : d }
const FORCE   = !!flag('force', false)
const STRICT  = !!flag('strict', false)
const DRY     = !!flag('dry-run', false)
const DIR     = String(flag('dir', 'content'))
const GRAMMAR = !!flag('grammar', false)
const API     = process.env.LANGUAGETOOL_API_URL || 'https://api.languagetool.org/v2/check'
const WAIT_MS = parseInt(flag('throttle-ms', '3200'), 10)
const MAX_REQ_CHARS = 18000 // < 20-KB-Limit der freien API

const CACHE_FILE     = join(ROOT, 'data', 'spell-check-cache.json')
const WHITELIST_FILE = join(ROOT, 'data', 'rechtschreib-whitelist.txt')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const c = { g: (s) => `\x1b[32m${s}\x1b[0m`, r: (s) => `\x1b[31m${s}\x1b[0m`, y: (s) => `\x1b[33m${s}\x1b[0m`, d: (s) => `\x1b[2m${s}\x1b[0m` }

/* ── Whitelist ──────────────────────────────────────────────────────────── */
async function loadWhitelist () {
  if (!existsSync(WHITELIST_FILE)) return new Set()
  const lines = (await readFile(WHITELIST_FILE, 'utf8')).split(/\r?\n/)
  return new Set(lines.map((l) => l.trim().toLowerCase()).filter((l) => l && !l.startsWith('#')))
}

/* ── MDX → prüfbarer Fließtext ──────────────────────────────────────────── */
function extractText (raw) {
  let fmText = ''
  let body = raw
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (fm) {
    body = raw.slice(fm[0].length)
    for (const key of ['title', 'description', 'seoTitle', 'seoDescription']) {
      const m = fm[1].match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'))
      if (m) fmText += m[1] + '\n'
    }
  }
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')            // Codeblöcke
    .replace(/`[^`\n]*`/g, ' ')                  // Inline-Code
    .replace(/<[^>\n]{1,200}>/g, ' ')            // JSX/HTML-Tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')       // Bilder
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')     // Links → Linktext
    .replace(/^\s*(import|export)\s.+$/gm, ' ')  // MDX-Imports
    .replace(/https?:\/\/\S+/g, ' ')             // nackte URLs
    .replace(/^[|:\-\s|]+$/gm, ' ')              // Tabellen-Trennzeilen
    .replace(/[*_#>|]/g, ' ')                    // Markdown-Zeichen
  return (fmText + text).replace(/[ \t]+/g, ' ')
}

/* ── LanguageTool-Call mit Retry ────────────────────────────────────────── */
async function ltCheck (text, attempt = 1) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      text, language: 'de-DE', level: 'default',
      // Standard: NUR Rechtschreibung (TYPOS). Der erste Voll-Lauf mit allen
      // Regeln meldete 379/392 Dateien — fast alles Grammatik-/Komma-Pedanterie
      // und unbekannte Fachbegriffe. Grammatik gezielt per --grammar zuschalten.
      ...(GRAMMAR
        ? { disabledCategories: 'STYLE,COLLOQUIALISMS,REDUNDANCY,TYPOGRAPHY' }
        : { enabledCategories: 'TYPOS', enabledOnly: 'true' }),
    }),
  })
  if ((res.status === 429 || res.status >= 500) && attempt < 5) {
    await sleep(15000 * attempt)
    return ltCheck(text, attempt + 1)
  }
  if (!res.ok) throw new Error(`LanguageTool ${res.status}: ${(await res.text()).slice(0, 150)}`)
  return (await res.json()).matches || []
}

/* ── Hauptlauf ──────────────────────────────────────────────────────────── */
async function walk (dir, out = []) {
  if (!existsSync(dir)) return out
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name)
    if (e.isDirectory()) { if (!e.name.startsWith('.') && e.name !== 'node_modules') await walk(full, out) }
    else if (/\.(md|mdx)$/.test(e.name)) out.push(full)
  }
  return out
}

const whitelist = await loadWhitelist()
const cache = existsSync(CACHE_FILE) ? JSON.parse(await readFile(CACHE_FILE, 'utf8')) : {}
const files = await walk(join(ROOT, DIR))
console.log(`\n📝 Rechtschreibprüfung (${DIR}/): ${files.length} Datei(en), Whitelist ${whitelist.size} Begriffe${DRY ? ' — dry-run' : ''}\n`)

let checked = 0, skipped = 0, findings = 0, unpruefbar = 0
const report = []
const wortFrequenz = {}

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  const raw = await readFile(file, 'utf8')
  const hash = createHash('sha256').update(raw).digest('hex').slice(0, 16)
  if (!FORCE && cache[rel] === hash) { skipped++; continue }
  const text = extractText(raw)
  if (DRY) { checked++; console.log(c.d(`  ~ ${rel} (${text.length} Zeichen)`)); continue }

  let matches = []
  try {
    for (let i = 0; i < text.length; i += MAX_REQ_CHARS) {
      matches.push(...await ltCheck(text.slice(i, i + MAX_REQ_CHARS)))
      await sleep(WAIT_MS)
    }
  } catch (err) {
    // Report-only: API nicht erreichbar/limitiert -> warnen, Datei bleibt
    // ungecacht (wird beim naechsten Lauf erneut geprueft), Build laeuft weiter.
    unpruefbar++
    console.log(c.y(`  ⚠ ${rel} — nicht prüfbar: ${err.message}`))
    continue
  }
  // Whitelist: gemeldetes Wort (oder Bindestrich-Bestandteile) bekannt → kein Fund
  matches = matches.filter((m) => {
    const wort = m.context.text.slice(m.context.offset, m.context.offset + m.context.length).trim()
    const parts = wort.toLowerCase().split(/[-\s]/)
    if (whitelist.has(wort.toLowerCase()) || parts.every((p) => !p || whitelist.has(p))) return false
    if (m.rule?.id === 'GERMAN_SPELLER_RULE') wortFrequenz[wort] = (wortFrequenz[wort] || 0) + 1
    return true
  })

  checked++
  if (matches.length === 0) {
    cache[rel] = hash
    console.log(c.g(`  ✓ ${rel}`))
  } else {
    findings += matches.length
    console.log(c.r(`  ✗ ${rel} — ${matches.length} Fund(e)`))
    for (const m of matches) {
      const zeige = report.filter((r) => r.file === rel).length < 10
      const ctx = m.context.text
      const mark = ctx.slice(0, m.context.offset) + '»' + ctx.slice(m.context.offset, m.context.offset + m.context.length) + '«' + ctx.slice(m.context.offset + m.context.length)
      const vorschlag = (m.replacements || []).slice(0, 3).map((r) => r.value).join(' | ')
      if (zeige) console.log(`      ${mark.trim()}${vorschlag ? c.d(`  → ${vorschlag}`) : ''}`)
      report.push({ file: rel, kontext: mark.trim(), vorschlag, regel: m.rule?.id })
    }
    if (matches.length > 10) console.log(c.d(`      … ${matches.length - 10} weitere`))
  }
}

if (!DRY) {
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 1) + '\n')
  const topWoerter = Object.entries(wortFrequenz).sort((a, b) => b[1] - a[1])
  await writeFile(join(ROOT, 'data', 'spell-check-report.json'),
    JSON.stringify({ stand: new Date().toISOString(), modus: GRAMMAR ? 'grammatik' : 'nur-rechtschreibung',
      funde: report, haeufigste_unbekannte_woerter: topWoerter }, null, 1) + '\n')
  if (report.length) console.log(c.d(`   Voller Report: data/spell-check-report.json (${report.length} Funde)`))
}

console.log(`\n🏁 ${checked} geprüft, ${skipped} unverändert übersprungen${unpruefbar ? c.y(`, ${unpruefbar} nicht prüfbar (API)`) : ''}, ${c[findings ? 'r' : 'g'](findings + ' Fund(e)')}`)
if (findings) console.log(c.y('   Fehlalarm? Begriff in data/rechtschreib-whitelist.txt eintragen.\n'))
process.exit(STRICT && findings ? 1 : 0)
