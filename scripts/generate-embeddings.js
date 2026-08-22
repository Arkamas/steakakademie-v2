#!/usr/bin/env node
/**
 * generate-embeddings.js — RAG-Indexierung der Steakakademie-Wissensbasis
 *
 * Durchsucht docs/ und content/ nach Markdown-Dateien (optional src/lib nach
 * TypeScript-Modulen via --code), zerlegt sie in Chunks (~500-1000 Zeichen),
 * erzeugt Voyage-AI-Embeddings und lädt sie nach Supabase (knowledge_embeddings).
 *
 * Modelle: voyage-3 (Text/Markdown), voyage-code-3 (Code) — beide 1024 Dim.
 * Pro Datei werden Alt-Chunks gelöscht und neu geschrieben (Overwrite-Semantik).
 *
 * Env (.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VOYAGE_API_KEY
 *
 * Aufruf:
 *   npm run index:knowledge            # Markdown aus docs/ + content/ (inkrementell)
 *   node scripts/generate-embeddings.js --code    # zusätzlich src/lib/**.ts
 *   node scripts/generate-embeddings.js --dry-run # nur zählen, nichts hochladen
 *   node scripts/generate-embeddings.js --force   # alles neu embedden (Hash ignorieren)
 *
 * Inkrementell: pro Datei wird ein Inhalts-Hash gespeichert; unveränderte Dateien
 * werden übersprungen. Bei Voyage-429 (Free Tier: 3 RPM / 10K TPM) wartet das
 * Skript automatisch und macht weiter — Abbruch + Neustart ist ebenfalls sicher.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { VoyageAIClient } = require('voyageai');
const { createClient } = require('@supabase/supabase-js');

const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env.local') });

const DRY_RUN = process.argv.includes('--dry-run');
const INCLUDE_CODE = process.argv.includes('--code');
const FORCE = process.argv.includes('--force');

const MIN_CHUNK = 500;
const MAX_CHUNK = 1000;
// Batch-Budget in geschätzten Tokens (~3.3 Zeichen/Token bei deutschem Text).
// Klein genug für das reduzierte Free-Tier-Limit von Voyage (10K TPM),
// bei Standard-Limits (2M TPM) trotzdem effizient.
const BATCH_TOKEN_BUDGET = 8000;
const MAX_BATCH_ITEMS = 128; // Voyage-Hardlimit pro Request
const RATE_LIMIT_WAIT_MS = 25_000; // Wartezeit bei 429 (Free Tier: 3 Requests/Minute)
const MAX_RATE_LIMIT_RETRIES = 30;

const runStartedAt = new Date().toISOString(); // Zeitstempel des Indexlaufs
const estimateTokens = (text) => Math.ceil(text.length / 3.3);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SOURCES = [
  { dir: 'docs', extensions: ['.md', '.mdx'], category: 'docs', model: 'voyage-3' },
  { dir: 'content', extensions: ['.md', '.mdx'], category: 'content', model: 'voyage-3' },
];
if (INCLUDE_CODE) {
  SOURCES.push({ dir: 'src/lib', extensions: ['.ts', '.tsx'], category: 'code', model: 'voyage-code-3' });
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value || /hier-eintragen|your-|xxx/i.test(value)) {
    console.error(`❌ Env-Variable ${name} fehlt oder ist noch ein Platzhalter (.env.local).`);
    process.exit(1);
  }
  return value;
}

function walk(dir, extensions, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walk(full, extensions, files);
    } else if (extensions.includes(path.extname(entry.name)) && !/\.(test|spec)\./.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

/** Titel aus Frontmatter oder erster Markdown-Überschrift ziehen. */
function extractTitle(text, filePath) {
  const fm = text.match(/^---\s*[\r\n]+[\s\S]*?title:\s*["']?([^"'\r\n]+)/m);
  if (fm) return fm[1].trim();
  const heading = text.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  return path.basename(filePath);
}

/** Zerlegt Text an Absatzgrenzen in Chunks zwischen ~MIN_CHUNK und MAX_CHUNK Zeichen. */
function chunkText(text) {
  const paragraphs = text.split(/\r?\n\s*\r?\n/);
  const chunks = [];
  let current = '';

  const flush = () => {
    const trimmed = current.trim();
    if (trimmed.length > 0) chunks.push(trimmed);
    current = '';
  };

  for (const para of paragraphs) {
    if (para.trim().length === 0) continue;
    if (current.length + para.length + 2 > MAX_CHUNK && current.length >= MIN_CHUNK) flush();

    if (para.length > MAX_CHUNK) {
      // Überlanger Absatz (z. B. Tabelle/Codeblock): hart an MAX_CHUNK splitten
      flush();
      for (let i = 0; i < para.length; i += MAX_CHUNK) {
        chunks.push(para.slice(i, i + MAX_CHUNK).trim());
      }
      continue;
    }
    current += (current ? '\n\n' : '') + para;
  }
  flush();
  return chunks.filter((c) => c.length >= 40); // Mini-Fragmente (nackte Trennzeilen etc.) verwerfen
}

/** Zerlegt Chunks in Batches, die das Token-Budget pro Request einhalten. */
function buildBatches(chunks) {
  const batches = [];
  let batch = [];
  let batchTokens = 0;
  for (const chunk of chunks) {
    const tokens = estimateTokens(chunk);
    if (batch.length > 0 && (batchTokens + tokens > BATCH_TOKEN_BUDGET || batch.length >= MAX_BATCH_ITEMS)) {
      batches.push(batch);
      batch = [];
      batchTokens = 0;
    }
    batch.push(chunk);
    batchTokens += tokens;
  }
  if (batch.length > 0) batches.push(batch);
  return batches;
}

/** Embedding-Request mit Retry bei Rate-Limit (429). Free Tier: 3 RPM / 10K TPM. */
async function embedBatch(voyage, texts, model) {
  for (let attempt = 1; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    try {
      const response = await voyage.embed({ input: texts, model, inputType: 'document' });
      return response.data.map((d) => d.embedding);
    } catch (error) {
      const status = error.statusCode ?? error.status ?? (String(error.message).includes('429') ? 429 : null);
      if (status !== 429 || attempt === MAX_RATE_LIMIT_RETRIES) throw error;
      process.stdout.write(`  ⏳ Rate-Limit (429) — warte ${RATE_LIMIT_WAIT_MS / 1000}s (Versuch ${attempt}/${MAX_RATE_LIMIT_RETRIES})\n`);
      await sleep(RATE_LIMIT_WAIT_MS);
    }
  }
  throw new Error('embedBatch: Retry-Limit erreicht');
}

/** Prüft, ob die Datei mit identischem Inhalt bereits indexiert ist (Resume/Skip). */
async function isAlreadyIndexed(supabase, relPath, fileHash) {
  const { count, error } = await supabase
    .from('knowledge_embeddings')
    .select('id', { count: 'exact', head: true })
    .contains('metadata', { file_path: relPath, file_hash: fileHash });
  if (error) throw new Error(`Existenz-Check für ${relPath} fehlgeschlagen: ${error.message}`);
  return (count ?? 0) > 0;
}

async function main() {
  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = DRY_RUN ? null : requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const voyageKey = DRY_RUN ? null : requireEnv('VOYAGE_API_KEY');

  const voyage = DRY_RUN ? null : new VoyageAIClient({ apiKey: voyageKey });
  const supabase = DRY_RUN
    ? null
    : createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  let totalFiles = 0;
  let totalChunks = 0;

  for (const source of SOURCES) {
    const absDir = path.join(ROOT, source.dir);
    const files = walk(absDir, source.extensions);
    console.log(`\n📂 ${source.dir}: ${files.length} Datei(en) [${source.model}]`);

    for (const file of files) {
      const relPath = path.relative(ROOT, file).replace(/\\/g, '/');
      const text = fs.readFileSync(file, 'utf8');
      const chunks = chunkText(text);
      if (chunks.length === 0) continue;

      if (DRY_RUN) {
        totalFiles += 1;
        totalChunks += chunks.length;
        console.log(`  · ${relPath} → ${chunks.length} Chunk(s)`);
        continue;
      }

      // Resume-Logik: unveränderte, bereits indexierte Dateien überspringen
      const fileHash = crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
      if (!FORCE && (await isAlreadyIndexed(supabase, relPath, fileHash))) {
        console.log(`  ⏭️  ${relPath} — unverändert, übersprungen`);
        continue;
      }

      totalFiles += 1;
      totalChunks += chunks.length;

      const title = extractTitle(text, file);
      const embeddings = [];
      for (const batch of buildBatches(chunks)) {
        embeddings.push(...(await embedBatch(voyage, batch, source.model)));
      }

      const rows = chunks.map((content, index) => ({
        content,
        metadata: {
          file_path: relPath,
          chunk_index: String(index),
          category: source.category,
          title,
          model: source.model,
          file_hash: fileHash,
        },
        embedding: embeddings[index],
        indexed_at: runStartedAt,
      }));

      // Overwrite-Semantik: Alt-Chunks der Datei entfernen, dann neu einfügen
      const { error: deleteError } = await supabase
        .from('knowledge_embeddings')
        .delete()
        .contains('metadata', { file_path: relPath });
      if (deleteError) throw new Error(`Delete für ${relPath} fehlgeschlagen: ${deleteError.message}`);

      const { error: insertError } = await supabase.from('knowledge_embeddings').insert(rows);
      if (insertError) throw new Error(`Insert für ${relPath} fehlgeschlagen: ${insertError.message}`);

      console.log(`  ✅ ${relPath} → ${chunks.length} Chunk(s) indexiert`);
    }
  }

  console.log(`\n🏁 Fertig: ${totalFiles} Datei(en), ${totalChunks} Chunk(s)${DRY_RUN ? ' (Dry-Run, nichts hochgeladen)' : ''}`);
}

main().catch((error) => {
  console.error('❌ Indexierung abgebrochen:', error.message);
  process.exit(1);
});
