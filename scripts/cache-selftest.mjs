#!/usr/bin/env node
/**
 * scripts/cache-selftest.mjs — Beweis, dass automatisches Caching greift.
 *
 *   node scripts/cache-selftest.mjs              # Modell-Default
 *   node scripts/cache-selftest.mjs --model claude-opus-5
 *   ANTHROPIC_CACHE_TTL=1h node scripts/cache-selftest.mjs
 *
 * Test A: mehrstufige Konversation mit KLEINEM Prefix -> zeigt ehrlich,
 *         dass unterhalb der Mindestlänge NICHTS gecacht wird.
 * Test B: gleiche Konversation mit stabilem Gross-Prefix (Marken-DNA +
 *         Kerntemperatur-Referenz) -> Cache-Write in Turn 1, Cache-Read ab Turn 2.
 */
import { Conversation, loadSharedContext, cacheMinFor, estTokens, printCacheStats, resolveApiKey } from './lib/anthropic.mjs'

const arg   = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d }
const MODEL = arg('--model', 'claude-haiku-4-5-20251001')
const TURNS = ['Mein Name ist Alex. Ich arbeite an Machine Learning.', 'Woran arbeite ich?', 'Und wie heiße ich?']

const u = r => `in=${r.usage.input_tokens} write=${r.usage.cache_creation_input_tokens || 0} read=${r.usage.cache_read_input_tokens || 0} out=${r.usage.output_tokens}`

async function run (name, system) {
  console.log(`\n── ${name} — System-Prefix ~${estTokens(system)} Tok (Mindestmaß ${cacheMinFor(MODEL) ?? '?'} Tok)`)
  const chat = new Conversation({ model: MODEL, system, max_tokens: 256, label: name })
  for (const [i, t] of TURNS.entries()) {
    const r = await chat.ask(t)
    console.log(`  Turn ${i + 1}: ${u(r)}  → ${r.text.slice(0, 60).replace(/\s+/g, ' ')}…`)
  }
}

if (!(await resolveApiKey())) { console.log('⚠ ANTHROPIC_API_KEY fehlt — Abbruch.'); process.exit(0) }

console.log(`\n🧪 Cache-Selftest · Modell ${MODEL}`)
await run('A_klein', 'Du bist ein hilfreicher Assistent, der sich an unser Gespräch erinnert.')
await run('B_gross', 'Du bist ein hilfreicher Assistent, der sich an unser Gespräch erinnert.\n\n' +
  await loadSharedContext('marketing_agent.txt', 'data/kerntemperatur-referenz.yaml'))

console.log('')
printCacheStats('  ')
console.log('\n  Lesart: write>0 in Turn 1 und read>0 ab Turn 2 = Caching greift.')
console.log('  Beide 0 = Prefix zu kurz (kein Fehler, kein Aufpreis — nur kein Nutzen).\n')
