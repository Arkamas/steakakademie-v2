#!/usr/bin/env node
/**
 * Steakakademie — Foodpairing-Import
 *
 * Importiert ein bipartites Zutat<->Aromamolekül-Netzwerk in Supabase
 * (Tabellen aroma_ingredient / aroma_compound / aroma_ingredient_compound).
 * Quelle-agnostisch: erwartet drei TSV/CSV-Dateien im --dir.
 *
 * ⚖️  RECHTLICH: Nur ein offenes, kommerziell freigegebenes Dataset einspielen.
 *     Standard: unsere EIGENE Kuration (data/foodpairing/*.tsv, siehe SOURCES.md).
 *     ACHTUNG: Ahn-Flavor-Network (Sci. Rep. 2011) ist CC BY-NC — NICHT kommerziell.
 *     "Frei einsehbar" ≠ "frei weiterverbreitbar" — Lizenz vor Live-Gang prüfen
 *     (siehe docs/foodpairing-steckbrief.md). Dieses Skript lädt NICHTS herunter;
 *     die Dateien legst du selbst rechtssicher in data/foodpairing/ ab.
 *
 * Erwartete Dateien (Standard-Layout; Spalten tab- ODER komma-getrennt,
 * Kommentar-/Headerzeilen mit '#' werden übersprungen):
 *   ingr_info.tsv  ->  id  name  category
 *   comp_info.tsv  ->  id  name  CAS
 *   ingr_comp.tsv  ->  ingredient_id  compound_id
 *
 * Usage:
 *   node scripts/foodpairing-import.mjs --dir data/foodpairing
 *   node scripts/foodpairing-import.mjs --dir data/foodpairing --dry-run
 *
 * Env (.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
dotenv.config({ path: join(ROOT, '.env.local') })

// ─── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const flag = (name, def = undefined) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : def
}
const DIR     = String(flag('dir', 'data/foodpairing'))
const DRY_RUN = !!flag('dry-run', false)
const BATCH   = 1000

// ─── Helpers ─────────────────────────────────────────────────────────────────
const slug = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

/** Liest eine TSV/CSV: erkennt Trenner, überspringt '#'-/Leerzeilen. */
function readTable(file) {
  const raw = readFileSync(join(ROOT, DIR, file), 'utf8')
  const rows = []
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue
    rows.push(line.split(line.includes('\t') ? '\t' : ',').map((c) => c.trim()))
  }
  return rows
}

async function upsert(admin, table, rows, conflict) {
  if (DRY_RUN || rows.length === 0) return
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH)
    const { error } = await admin.from(table).upsert(chunk, { onConflict: conflict })
    if (error) throw new Error(`${table}: ${error.message}`)
    process.stdout.write(`   ${table}: ${Math.min(i + BATCH, rows.length)}/${rows.length}\r`)
  }
  process.stdout.write('\n')
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const ingrRows = readTable('ingr_info.tsv')
  const compRows = readTable('comp_info.tsv')
  const edgeRows = readTable('ingr_comp.tsv')

  const ingredients = ingrRows
    .map(([id, name, category]) => ({ id: parseInt(id, 10), name, slug: slug(name), category: category || null }))
    .filter((r) => Number.isFinite(r.id) && r.name)

  const compounds = compRows
    .map(([id, name, cas, hubRole]) => ({
      id: parseInt(id, 10),
      name,
      cas: cas || null,
      pubchem_cid: null,
      hub_role: hubRole && hubRole.trim() ? hubRole.trim() : null,
      is_hub: !!(hubRole && hubRole.trim()),
    }))
    .filter((r) => Number.isFinite(r.id) && r.name)

  const edges = edgeRows
    .map(([iid, cid]) => ({ ingredient_id: parseInt(iid, 10), compound_id: parseInt(cid, 10) }))
    .filter((r) => Number.isFinite(r.ingredient_id) && Number.isFinite(r.compound_id))

  console.log(`📥 Foodpairing-Import aus ${DIR}/${DRY_RUN ? '  (Trockenlauf)' : ''}`)
  console.log(`   Zutaten: ${ingredients.length} · Moleküle: ${compounds.length} · Kanten: ${edges.length}`)

  if (DRY_RUN) {
    console.log('   → Trockenlauf, kein Schreibvorgang. Beispiel-Zutat:', ingredients[0])
    return
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen.')
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

  await upsert(admin, 'aroma_ingredient', ingredients, 'id')
  // Robust: falls die Hub-Spalten (is_hub/hub_role) im Schema noch fehlen,
  // ohne sie importieren (Hub-Migration später nachziehen, Re-Import übernimmt sie).
  try {
    await upsert(admin, 'aroma_compound', compounds, 'id')
  } catch (e) {
    if (/is_hub|hub_role|column|schema cache/i.test(e.message)) {
      console.warn('   ⚠️ Hub-Spalten fehlen im Schema — importiere Moleküle ohne is_hub/hub_role.')
      const lean = compounds.map(({ is_hub: _h, hub_role: _r, ...rest }) => rest)
      await upsert(admin, 'aroma_compound', lean, 'id')
    } else throw e
  }
  await upsert(admin, 'aroma_ingredient_compound', edges, 'ingredient_id,compound_id')
  console.log('✅ Import abgeschlossen.')
}

main().catch((e) => {
  console.error('✖ Import fehlgeschlagen:', e.message)
  process.exit(1)
})
