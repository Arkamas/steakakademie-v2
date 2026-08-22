/**
 * Query-Embedding für die Kochwissen-Datenbank.
 *
 * Modell `voyage-3.5` → 1024 Dimensionen, passend zu `vector(1024)` in der
 * kochwissen-Tabelle. ACHTUNG: Das Modell muss zum Korpus passen — die 728
 * Einträge wurden mit voyage-3.5 eingebettet (scripts/kochwissen-ingest.mjs).
 * Umstieg auf voyage-4 (Free-Tier) NUR zusammen mit Re-Ingest:
 *   node scripts/kochwissen-ingest.mjs --force --model voyage-4
 *   + VOYAGE_MODEL=voyage-4 in .env.local/Netlify setzen.
 *
 * Transport läuft über den zentralen Client (Retry bei 429/5xx).
 */

import { embedQuery as clientEmbedQuery } from '@/lib/voyage/client';

const VOYAGE_MODEL = process.env.VOYAGE_MODEL ?? 'voyage-3.5';

/** Bettet eine Suchanfrage ein (input_type 'query'). */
export async function embedQuery(text: string): Promise<number[]> {
  return clientEmbedQuery(text, VOYAGE_MODEL);
}
