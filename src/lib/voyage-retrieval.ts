/**
 * voyage-retrieval.ts — RAG-Retrieval gegen die knowledge_embeddings-Tabelle
 *
 * NUR SERVER-SEITIG verwenden (Route Handler, Server Components, Server Actions):
 * nutzt SUPABASE_SERVICE_ROLE_KEY und VOYAGE_API_KEY, die nie in den Client dürfen.
 *
 * Voraussetzung: Migration 20260819_enable_pgvector_voyage.sql ist eingespielt
 * und `npm run index:knowledge` wurde mindestens einmal ausgeführt.
 *
 * Modell-Erkennung (22.08.2026): Das Query-Embedding-Modell wird NICHT mehr
 * hartkodiert, sondern aus dem Korpus gelesen (metadata->>'model' der Chunks,
 * Mehrheitsentscheid, 10 min gecacht). Damit folgt die Suche automatisch, wenn
 * der Nacht-Index den Korpus auf ein neues Modell umbettet (voyage-3 → voyage-4),
 * ohne dass hier etwas angefasst werden muss. Override: options.model.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { embedQuery } from '@/lib/voyage/client'

export interface KnowledgeMatch {
  id: string
  content: string
  metadata: {
    file_path: string
    chunk_index: string
    category: string
    title: string
    model: string
  }
  similarity: number
}

export interface SearchContextOptions {
  /** Mindest-Kosinus-Ähnlichkeit (0-1), Default 0.7 */
  matchThreshold?: number
  /** Embedding-Modell für die Query — muss zum Indexierungs-Modell passen.
   *  Ohne Angabe wird das Korpus-Modell automatisch erkannt. */
  model?: string
}

let supabaseAdmin: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceRoleKey) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt (.env.local)')
    }
    supabaseAdmin = createClient(url, serviceRoleKey, { auth: { persistSession: false } })
  }
  return supabaseAdmin
}

/* Korpus-Modell-Erkennung: Mehrheitsentscheid über eine Stichprobe der Chunks. */
const MODEL_CACHE_MS = 10 * 60 * 1000
let cachedModel: { value: string; at: number } | null = null

async function detectCorpusModel(): Promise<string> {
  if (cachedModel && Date.now() - cachedModel.at < MODEL_CACHE_MS) return cachedModel.value
  const fallback = process.env.VOYAGE_KNOWLEDGE_MODEL ?? 'voyage-3'
  try {
    const { data, error } = await getSupabase()
      .from('knowledge_embeddings')
      .select('metadata->>model')
      .limit(200)
    if (error || !data?.length) return fallback
    const counts = new Map<string, number>()
    for (const row of data as Record<string, string>[]) {
      const m = row.model
      if (m) counts.set(m, (counts.get(m) ?? 0) + 1)
    }
    const winner = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback
    cachedModel = { value: winner, at: Date.now() }
    return winner
  } catch {
    return fallback
  }
}

/**
 * Sucht die semantisch passendsten Wissens-Chunks zur Query.
 *
 * @param query  Freitext-Suchanfrage
 * @param limit  Maximale Anzahl Treffer (Default 5)
 */
export async function searchContext(
  query: string,
  limit: number = 5,
  options: SearchContextOptions = {},
): Promise<KnowledgeMatch[]> {
  const { matchThreshold = 0.7 } = options
  const model = options.model ?? (await detectCorpusModel())

  const queryEmbedding = await embedQuery(query, model)

  const { data, error } = await getSupabase().rpc('match_knowledge', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: limit,
  })
  if (error) throw new Error(`match_knowledge RPC fehlgeschlagen: ${error.message}`)

  return (data ?? []) as KnowledgeMatch[]
}
