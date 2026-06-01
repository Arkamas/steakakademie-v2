-- ── Mein Protokoll (Produkt B · Digistore 696396) — fehlende Seed-Daten ──────────
-- Root-Cause: courses war in Prod leer, daher fand Migration 006 kein Course zum
-- Mappen → digistore_products leer → Webhook fand kein Mapping → kassiert, liefert
-- NICHT. mein-protokoll fehlte zudem ganz in 006.
-- Diese Migration legt Course + Produkt-Mapping an. Idempotent.

-- 1) Course anlegen (nur slug + title — beide Spalten existieren in allen Schemas)
INSERT INTO courses (slug, title)
VALUES ('mein-protokoll', 'Mein Protokoll')
ON CONFLICT (slug) DO NOTHING;

-- 2) Digistore-Produkt 696396 → Course mappen
INSERT INTO digistore_products (ds_product_id, course_id)
SELECT '696396', id FROM courses WHERE slug = 'mein-protokoll'
ON CONFLICT (ds_product_id) DO NOTHING;

-- Verifikation (zeigt die angelegten Zeilen im SQL-Editor):
-- SELECT * FROM courses WHERE slug = 'mein-protokoll';
-- SELECT * FROM digistore_products WHERE ds_product_id = '696396';
