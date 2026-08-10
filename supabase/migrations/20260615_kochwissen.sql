-- ============================================================
-- Kochwissen — Wissensdatenbank (RAG / Vektorsuche)
-- Migration: 20260615_kochwissen
--
-- Speicher + Vektor-Index fuer die wachsende Kochwissen-Datenbank.
-- Notion/CSV bleibt Single Source of Truth; diese Tabelle ist der
-- abgeleitete, jederzeit neu aufbaubare Index (siehe
-- docs/wissensdatenbank-architektur.md).
--
-- Embeddings: Voyage AI (Modell voyage-3.5 -> 1024 Dimensionen).
-- Bei Modellwechsel mit anderer Dimension: Spalte neu anlegen und
-- alle Eintraege neu einbetten (re-embed) — pgvector ist anbieter-agnostisch.
--
-- Idempotent (re-runnable): IF NOT EXISTS / CREATE OR REPLACE.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ── 1. Tabelle ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kochwissen (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source        text        NOT NULL DEFAULT 'default',   -- Herkunfts-Namespace (z.B. Buch/Lieferung)
  titel         text        NOT NULL,
  titel_key     text        NOT NULL,                     -- slug(titel) — Dedup/Merge-Schluessel je source
  kategorie     text,
  cut_zutat     text,
  schwierigkeit text,
  keywords      text[]      NOT NULL DEFAULT '{}',
  quelle        text,                                     -- Quelle-Fundstelle, 1:1 (z.B. "S. 267", "Grillen: Physik")
  quelle_key    text,                                     -- normalisierter Anker (z.B. "modernist:s267") zum spaeteren Aufloesen
  inhalt        text,                                     -- Inhalt_normalisiert, 1:1; NULL = Index-Platzhalter (noch ohne Volltext)
  embedding     vector(1024),                             -- ueber titel + inhalt; NULL solange kein Volltext vorhanden
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Spalten nachziehen, falls Tabelle schon existierte
ALTER TABLE kochwissen ADD COLUMN IF NOT EXISTS source     text NOT NULL DEFAULT 'default';
ALTER TABLE kochwissen ADD COLUMN IF NOT EXISTS quelle_key text;

-- ── 2. Indizes ───────────────────────────────────────────────
-- Dedup/Merge: ein atomarer Eintrag pro (source, titel_key)
CREATE UNIQUE INDEX IF NOT EXISTS kochwissen_source_titel_key ON kochwissen (source, titel_key);
-- Anker-Lookup (Index-Platzhalter <-> spaeterer Volltext)
CREATE INDEX IF NOT EXISTS kochwissen_quelle_key_idx ON kochwissen (quelle_key);
CREATE INDEX IF NOT EXISTS kochwissen_kategorie_idx  ON kochwissen (kategorie);
-- Vektor-Aehnlichkeit (Cosine). lists ggf. an Korpusgroesse anpassen.
CREATE INDEX IF NOT EXISTS kochwissen_embedding_idx
  ON kochwissen USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ── 3. Retrieval-RPC (Vektor + optionale Metadaten-Filter) ───
CREATE OR REPLACE FUNCTION match_kochwissen(
  query_embedding   vector(1024),
  match_count       int  DEFAULT 8,
  filter_kategorie  text DEFAULT NULL,
  filter_cut        text DEFAULT NULL
)
RETURNS TABLE (
  id            uuid,
  titel         text,
  kategorie     text,
  cut_zutat     text,
  schwierigkeit text,
  keywords      text[],
  quelle        text,
  inhalt        text,
  similarity    float
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT id, titel, kategorie, cut_zutat, schwierigkeit, keywords, quelle, inhalt,
         1 - (embedding <=> query_embedding) AS similarity
  FROM kochwissen
  WHERE embedding IS NOT NULL
    AND (filter_kategorie IS NULL OR kategorie = filter_kategorie)
    AND (filter_cut       IS NULL OR cut_zutat ILIKE '%' || filter_cut || '%')
  ORDER BY embedding <=> query_embedding
  LIMIT match_count
$$;

-- ── 4. RLS — Zugriff ausschliesslich server-seitig (service_role) ──
ALTER TABLE kochwissen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_kochwissen" ON kochwissen;
CREATE POLICY "service_role_all_kochwissen"
  ON kochwissen FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON FUNCTION match_kochwissen(vector, int, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION match_kochwissen(vector, int, text, text) TO service_role;
