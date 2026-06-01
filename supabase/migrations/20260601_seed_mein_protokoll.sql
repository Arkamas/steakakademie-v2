-- ── Mein Protokoll (Produkt B · Digistore 696396) — Auslieferung scharfschalten ──
-- Zwei Root-Causes im Course-Pfad (nie getestet, weil noch kein Course-Kauf lief):
--   1) courses/digistore_products in Prod ohne mein-protokoll-Eintrag → Webhook
--      findet kein Mapping → kassiert, liefert nicht.
--   2) bookings (aus 001) hat kein granted_at/revoked_at; grant_course_access setzt
--      beide → spätere CREATE TABLE IF NOT EXISTS war No-op → RPC schlägt fehl.
-- Alles idempotent.

-- 1) Fehlende bookings-Spalten nachrüsten (sonst scheitert grant_course_access)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS granted_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS revoked_at timestamptz;

-- 2) Course anlegen
INSERT INTO courses (slug, title)
VALUES ('mein-protokoll', 'Mein Protokoll')
ON CONFLICT (slug) DO NOTHING;

-- 3) Digistore-Produkt 696396 → Course mappen
INSERT INTO digistore_products (ds_product_id, course_id)
SELECT '696396', id FROM courses WHERE slug = 'mein-protokoll'
ON CONFLICT (ds_product_id) DO NOTHING;

-- 4) Verifikation — diese SELECTs müssen je 1 Zeile liefern:
SELECT 'course'  AS typ, slug, title FROM courses WHERE slug = 'mein-protokoll'
UNION ALL
SELECT 'mapping' AS typ, ds_product_id, course_id::text FROM digistore_products WHERE ds_product_id = '696396';
