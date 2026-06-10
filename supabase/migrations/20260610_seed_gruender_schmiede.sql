-- Seed: Gründer-Schmiede (Digistore 695894) — Course + Mapping, idempotent.
-- Am 10.06.2026 via Supabase-MCP gegen Prod ausgeführt (verifiziert).
-- Preis-Entscheidung Uwe 07.06.2026: Einführungspreis 99 € (später 149 €).

INSERT INTO courses (slug, title, description, price, published)
VALUES (
  'gruender-schmiede',
  'Gründer-Schmiede',
  'KI-gesteuert ein digitales Business bauen — die Methode (6 Module), Das Komplettikon und der Arbeitszeit-Planer. Von Tag 1 dokumentiert.',
  99.00,
  true
)
ON CONFLICT (slug) DO UPDATE
  SET title = EXCLUDED.title,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      published = EXCLUDED.published;

INSERT INTO digistore_products (ds_product_id, course_id)
SELECT '695894', id FROM courses WHERE slug = 'gruender-schmiede'
ON CONFLICT (ds_product_id) DO UPDATE SET course_id = EXCLUDED.course_id;
