-- Digistore24 Produkt-ID → Course-Mapping in der DB statt im Code.
-- Marketing kann neue Produkte ohne Code-Deploy anlegen.

CREATE TABLE IF NOT EXISTS digistore_products (
  ds_product_id TEXT PRIMARY KEY,
  course_id     UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE digistore_products ENABLE ROW LEVEL SECURITY;
-- service_role bypasst RLS — keine Policy nötig.

-- Initial-Mapping (idempotent, läuft ohne Fehler wenn schon vorhanden)
INSERT INTO digistore_products (ds_product_id, course_id)
SELECT '695797', id FROM courses WHERE slug = 'steuer-matrix'
ON CONFLICT (ds_product_id) DO NOTHING;

INSERT INTO digistore_products (ds_product_id, course_id)
SELECT '695894', id FROM courses WHERE slug = 'gruendung-sprint'
ON CONFLICT (ds_product_id) DO NOTHING;

INSERT INTO digistore_products (ds_product_id, course_id)
SELECT '695900', id FROM courses WHERE slug = 'agentur-killer-sprint'
ON CONFLICT (ds_product_id) DO NOTHING;
