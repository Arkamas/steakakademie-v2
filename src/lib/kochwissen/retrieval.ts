/**
 * Geteilte Retrieval-Logik der Kochwissen-Datenbank.
 * Wird von /api/kochwissen (Frage→Antwort) und /api/kochwissen/generieren
 * (Wissen→neues Rezept/Artikel) genutzt.
 *
 * Zweistufig seit 22.08.2026:
 *   1. Vektor-Recall (pgvector, match_kochwissen) holt ÜBERZÄHLIGE Kandidaten,
 *   2. Voyage-Reranker (Cross-Encoder) sortiert sie nach echter Relevanz und
 *      schneidet auf das gewünschte Limit zu.
 * Fällt der Reranker aus, wird die Vektor-Reihenfolge unverändert genutzt —
 * die Suche darf dadurch nie kaputtgehen. Abschaltbar: VOYAGE_RERANK=off.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { embedQuery } from './voyage';
import { rerank } from '@/lib/voyage/client';

export type Treffer = {
  id: string;
  titel: string;
  kategorie: string | null;
  cut_zutat: string | null;
  schwierigkeit: string | null;
  keywords: string[] | null;
  quelle: string | null;
  inhalt: string | null;
  similarity: number;
  /** Relevanz aus dem Reranker (0..1); nur gesetzt, wenn Reranking lief. */
  relevanz?: number;
};

export type SearchOpts = {
  kategorie?: string | null;
  cut?: string | null;
  limit?: number;
};

const RERANK_AKTIV = (process.env.VOYAGE_RERANK ?? 'on') !== 'off';

/** Sortiert Kandidaten per Voyage-Reranker; bei Fehler Original-Reihenfolge. */
export async function rerankTreffer<T extends { titel: string; inhalt: string | null }>(
  frage: string,
  kandidaten: T[],
  limit: number,
): Promise<(T & { relevanz?: number })[]> {
  if (!RERANK_AKTIV || kandidaten.length <= 1) return kandidaten.slice(0, limit);
  try {
    const docs = kandidaten.map((t) => `${t.titel}\n${(t.inhalt ?? '').slice(0, 4000)}`);
    const ranked = await rerank(frage, docs, { topK: limit });
    return ranked.map((r) => ({ ...kandidaten[r.index], relevanz: r.relevanceScore }));
  } catch (e) {
    console.warn('[kochwissen] Reranker nicht erreichbar — nutze Vektor-Reihenfolge:', e instanceof Error ? e.message : e);
    return kandidaten.slice(0, limit);
  }
}

/** Embeddet die Anfrage und holt die ähnlichsten Wissenseinträge via pgvector. */
export async function searchKochwissen(
  admin: SupabaseClient,
  frage: string,
  opts: SearchOpts = {},
): Promise<Treffer[]> {
  const limit = Math.min(Math.max(opts.limit ?? 8, 1), 20);
  // Überholen für den Reranker: mehr Kandidaten als am Ende gebraucht werden.
  const recallCount = RERANK_AKTIV ? Math.min(limit * 3, 20) : limit;

  const query_embedding = await embedQuery(frage);
  const { data, error } = await admin.rpc('match_kochwissen', {
    query_embedding,
    match_count: recallCount,
    filter_kategorie: opts.kategorie ?? null,
    filter_cut: opts.cut ?? null,
  });
  if (error) throw error;
  return rerankTreffer(frage, (data ?? []) as Treffer[], limit);
}

/** Baut den Claude-Kontextblock (nummeriert, mit Quelle-Fundstelle). */
export function buildKontext(treffer: Treffer[]): string {
  return treffer
    .map(
      (t, i) =>
        `[#${i + 1}] ${t.titel}${t.quelle ? ` (Quelle: ${t.quelle})` : ''}\n${t.inhalt ?? ''}`,
    )
    .join('\n\n');
}
