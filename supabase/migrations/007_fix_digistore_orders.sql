-- Fixes für digistore_orders (UNIQUE-Fix ist bereits in 005_fix_digistore_unique erledigt):
--  1. course_id (FK) statt course_slug (TEXT)              → slug-renames sicher
--  2. processing_status + error_message + processed_at     → Forensik
--  3. raw_body                                              → echter Audit-Trail
--  4. Indexe für reale Queries

-- 1) course_id einführen, course_slug entfernen
ALTER TABLE digistore_orders ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE RESTRICT;

-- Bestehende course_slug-Werte in course_id übersetzen
UPDATE digistore_orders
  SET course_id = (SELECT id FROM courses WHERE slug = digistore_orders.course_slug)
  WHERE course_id IS NULL AND course_slug IS NOT NULL;

-- course_slug-Spalte droppen (drop existierender Index ds_orders_slug_idx passiert automatisch)
ALTER TABLE digistore_orders DROP COLUMN IF EXISTS course_slug;

-- 2) Audit-Felder
ALTER TABLE digistore_orders
  ADD COLUMN IF NOT EXISTS processing_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (processing_status IN ('pending','processed','failed')),
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS processed_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS raw_body      TEXT;

-- 3) Indexe (ds_orders_email_idx existiert schon aus Migration 004 — wir nutzen den)
CREATE INDEX IF NOT EXISTS digistore_orders_processing_failed_idx
  ON digistore_orders (processing_status)
  WHERE processing_status = 'failed';

CREATE INDEX IF NOT EXISTS digistore_orders_raw_payload_gin
  ON digistore_orders USING GIN (raw_payload);
