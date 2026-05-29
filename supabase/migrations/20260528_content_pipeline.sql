-- ── Content Pipeline — Draft-Tabelle ─────────────────────────────────────────
-- Speichert alle automatisch generierten Inhalts-Entwürfe.
-- Status-Flow: draft → review → approved | rejected

CREATE TABLE IF NOT EXISTS public.content_drafts (
  id                      TEXT PRIMARY KEY,
  source_briefing_id      TEXT,
  category                TEXT NOT NULL,
  title                   TEXT NOT NULL,
  slug                    TEXT NOT NULL UNIQUE,
  content_body            TEXT NOT NULL,
  seo_title               TEXT,
  seo_description         TEXT,
  image_prompt_en         TEXT,
  image_negative_prompt_en TEXT,
  image_aspect_ratio      TEXT,
  image_style_preset      TEXT,
  tone_check_passed       BOOLEAN DEFAULT TRUE,
  tone_violations         TEXT[] DEFAULT '{}',
  status                  TEXT NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'review', 'approved', 'rejected')),
  generated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatisches updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.content_drafts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.content_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index für schnelle Status-Abfragen
CREATE INDEX IF NOT EXISTS idx_content_drafts_status
  ON public.content_drafts(status);

CREATE INDEX IF NOT EXISTS idx_content_drafts_category
  ON public.content_drafts(category);

-- RLS: nur Service-Role darf schreiben, authentifizierte User lesen approved
ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_full_access" ON public.content_drafts;
CREATE POLICY "service_full_access" ON public.content_drafts
  FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "read_approved" ON public.content_drafts;
CREATE POLICY "read_approved" ON public.content_drafts
  FOR SELECT
  USING (status = 'approved');

-- Pipeline-Run-Log
CREATE TABLE IF NOT EXISTS public.pipeline_runs (
  run_id          TEXT PRIMARY KEY,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  articles_fetched INTEGER DEFAULT 0,
  briefings_created INTEGER DEFAULT 0,
  drafts_generated INTEGER DEFAULT 0,
  drafts_published INTEGER DEFAULT 0,
  errors          TEXT[] DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'running'
                    CHECK (status IN ('running', 'completed', 'failed'))
);
