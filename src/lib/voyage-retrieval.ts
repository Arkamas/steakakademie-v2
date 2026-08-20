/**
 * voyage-retrieval.ts — RAG-Retrieval gegen die knowledge_embeddings-Tabelle
 *
 * NUR SERVER-SEITIG verwenden (Route Handler, Server Components, Server Actions):
 * nutzt SUPABASE_SERVICE_ROLE_KEY und VOYAGE_API_KEY, die nie in den Client dürfen.
 *
 * Voraussetzung: Migration 20260819_enable_pgvector_voyage.sql ist eingespielt
 * und `npm run index:knowledge` wurde mindestens einmal ausgeführt.
 *
 * Hinweis: Die Query wird standardmäßig mit `voyage-3` eingebettet und matcht
 * damit die Text-Chunks (docs/content). Mit --code indexierte Chunks nutzen
 * `voyage-code-3` — für Code-Suchen das Modell per Option angleichen.
 */
import { VoyageAIClient } from 'voyageai'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

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
  /** Embedding-Modell für die Query — muss zum Indexierungs-Modell passen */
  model?: 'voyage-3' | 'voyage-code-3'
}

let voyageClient: VoyageAIClient | null = null
let supabaseAdmin: SupabaseClient | null = null

function getVoyage(): VoyageAIClient {
  if (!voyageClient) {
    const apiKey = process.env.VOYAGE_API_KEY
    if (!apiKey) throw new Error('VOYAGE_API_KEY fehlt in der Umgebung (.env.local)')
    voyageClient = new VoyageAIClient({ apiKey })
  }
  return voyageClient
}

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
  const { matchThreshold = 0.7, model = 'voyage-3' } = options

  const embedResponse = await getVoyage().embed({
    input: [query],
    model,
    inputType: 'query',
  })
  const queryEmbedding = embedResponse.data?.[0]?.embedding
  if (!queryEmbedding) throw new Error('Voyage AI hat kein Embedding für die Query geliefert')

  const { data, error } = await getSupabase().rpc('match_knowledge', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: limit,
  })
  if (error) throw new Error(`match_knowledge RPC fehlgeschlagen: ${error.message}`)

  return (data ?? []) as KnowledgeMatch[]
}
