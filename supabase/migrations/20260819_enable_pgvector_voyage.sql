-- =============================================================================
-- 20260819_enable_pgvector_voyage.sql
-- RAG-Infrastruktur: pgvector + knowledge_embeddings + match_knowledge RPC
-- Embedding-Modelle: voyage-3 (Text) / voyage-code-3 (Code) — beide 1024 Dim.
-- =============================================================================

-- 1. pgvector-Extension aktivieren
create extension if not exists vector;

-- 2. Tabelle für Wissens-Chunks
create table if not exists public.knowledge_embeddings (
  id        uuid primary key default gen_random_uuid(),
  content   text not null,
  metadata  jsonb not null default '{}'::jsonb,
  embedding vector(1024)
);

comment on table public.knowledge_embeddings is
  'RAG-Wissensbasis: Chunks aus Docs/Content mit Voyage-AI-Embeddings (1024 Dim.)';

-- Eindeutigkeit pro Datei + Chunk-Index, damit das Indexierungs-Skript
-- per Upsert überschreiben kann statt Duplikate anzulegen.
create unique index if not exists knowledge_embeddings_source_chunk_idx
  on public.knowledge_embeddings (((metadata->>'file_path')), ((metadata->>'chunk_index')));

-- 3. HNSW-Index für schnelle Kosinus-Ähnlichkeitssuche
create index if not exists knowledge_embeddings_embedding_hnsw_idx
  on public.knowledge_embeddings
  using hnsw (embedding vector_cosine_ops);

-- 4. RLS: Tabelle absichern — Zugriff nur über service_role (Server-seitig)
alter table public.knowledge_embeddings enable row level security;

-- 5. Match-Funktion für RPC-Aufrufe aus dem Client/Server-Code
create or replace function public.match_knowledge(
  query_embedding vector(1024),
  match_threshold float default 0.7,
  match_count     int   default 5
)
returns table (
  id         uuid,
  content    text,
  metadata   jsonb,
  similarity float
)
language sql
stable
set search_path = public
as $$
  select
    ke.id,
    ke.content,
    ke.metadata,
    1 - (ke.embedding <=> query_embedding) as similarity
  from public.knowledge_embeddings ke
  where ke.embedding is not null
    and 1 - (ke.embedding <=> query_embedding) > match_threshold
  order by ke.embedding <=> query_embedding
  limit match_count;
$$;
