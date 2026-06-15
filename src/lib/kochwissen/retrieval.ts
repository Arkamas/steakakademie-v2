/**
 * Geteilte Retrieval-Logik der Kochwissen-Datenbank.
 * Wird von /api/kochwissen (Frage→Antwort) und /api/kochwissen/generieren
 * (Wissen→neues Rezept/Artikel) genutzt.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { embedQuery } from './voyage';

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
};

export type SearchOpts = {
  kategorie?: string | null;
  cut?: string | null;
  limit?: number;
};

/** Embeddet die Anfrage und holt die ähnlichsten Wissenseinträge via pgvector. */
export async function searchKochwissen(
  admin: SupabaseClient,
  frage: string,
  opts: SearchOpts = {},
): Promise<Treffer[]> {
  const query_embedding = await embedQuery(frage);
  const { data, error } = await admin.rpc('match_kochwissen', {
    query_embedding,
    match_count: Math.min(Math.max(opts.limit ?? 8, 1), 20),
    filter_kategorie: opts.kategorie ?? null,
    filter_cut: opts.cut ?? null,
  });
  if (error) throw error;
  return (data ?? []) as Treffer[];
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
