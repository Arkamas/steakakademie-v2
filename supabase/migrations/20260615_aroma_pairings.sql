-- ============================================================
-- Foodpairing — Aroma-Netzwerk (geteilte Aromamoleküle)
-- Migration: 20260615_aroma_pairings
--
-- Speichert ein bipartites Zutat<->Aromamolekül-Netzwerk und beantwortet
-- "Was passt zu X?" über die Zahl GETEILTER Moleküle (Food-Pairing-Prinzip
-- nach Ahn et al. 2011, DOI 10.1038/srep00196). Quelle-agnostisch: importiert wird ein offenes,
-- kommerziell freigegebenes Dataset (siehe docs/foodpairing-steckbrief.md).
--
-- KEINE Embeddings — reines Graph-/Mengen-Modell. Idempotent (re-runnable).
-- ============================================================

-- ── 1. Tabellen ──────────────────────────────────────────────
-- Zutaten (id = ID aus dem Quelldatensatz, damit Import idempotent ist)
CREATE TABLE IF NOT EXISTS aroma_ingredient (
  id        integer PRIMARY KEY,
  name      text NOT NULL,
  slug      text NOT NULL,                 -- slug(name) für Lookup
  category  text
);
CREATE UNIQUE INDEX IF NOT EXISTS aroma_ingredient_slug_idx ON aroma_ingredient (slug);

-- Aromamoleküle. is_hub = "Schaltzentrale" (Hub-Aromastoff = oberste Ebene, an die
-- alles andockt); hub_role beschreibt die Nabe. cas/pubchem_cid = Anker auf
-- öffentliche Stammdaten (z.B. PubChem).
CREATE TABLE IF NOT EXISTS aroma_compound (
  id           integer PRIMARY KEY,
  name         text NOT NULL,
  cas          text,
  pubchem_cid  text,
  is_hub       boolean NOT NULL DEFAULT false,
  hub_role     text
);
-- Spalten nachziehen, falls Tabelle schon existierte
ALTER TABLE aroma_compound ADD COLUMN IF NOT EXISTS is_hub   boolean NOT NULL DEFAULT false;
ALTER TABLE aroma_compound ADD COLUMN IF NOT EXISTS hub_role text;
CREATE INDEX IF NOT EXISTS aroma_compound_hub_idx ON aroma_compound (is_hub) WHERE is_hub;

-- Bipartite Kante: Zutat enthält Molekül
CREATE TABLE IF NOT EXISTS aroma_ingredient_compound (
  ingredient_id integer NOT NULL REFERENCES aroma_ingredient (id) ON DELETE CASCADE,
  compound_id   integer NOT NULL REFERENCES aroma_compound (id)   ON DELETE CASCADE,
  PRIMARY KEY (ingredient_id, compound_id)
);
CREATE INDEX IF NOT EXISTS aroma_ic_compound_idx ON aroma_ingredient_compound (compound_id);

-- ── 2. Pairing-RPC (geteilte Moleküle, on-the-fly) ───────────
-- Liefert zu einer Zutat die Partner mit den meisten gemeinsamen Aromamolekülen
-- plus bis zu 3 Beispielmoleküle für die Klartext-Erklärung im UI.
CREATE OR REPLACE FUNCTION match_foodpairing(
  p_ingredient text,
  p_limit      int DEFAULT 20
)
RETURNS TABLE (
  partner         text,
  category        text,
  shared          int,
  shared_examples text[]
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH target AS (
    SELECT id FROM aroma_ingredient
    WHERE slug = lower(regexp_replace(p_ingredient, '[^a-zA-Z0-9]+', '_', 'g'))
       OR name ILIKE p_ingredient
    ORDER BY (name ILIKE p_ingredient) DESC
    LIMIT 1
  ),
  my_comp AS (
    SELECT compound_id FROM aroma_ingredient_compound
    WHERE ingredient_id = (SELECT id FROM target)
  )
  SELECT i.name AS partner,
         i.category,
         count(*)::int AS shared,
         (array_agg(c.name ORDER BY c.name))[1:3] AS shared_examples
  FROM aroma_ingredient_compound ic
  JOIN aroma_ingredient i ON i.id = ic.ingredient_id
  JOIN aroma_compound   c ON c.id = ic.compound_id
  WHERE ic.compound_id IN (SELECT compound_id FROM my_comp)
    AND ic.ingredient_id <> (SELECT id FROM target)
  GROUP BY i.name, i.category
  ORDER BY shared DESC, partner
  LIMIT p_limit
$$;

-- ── 2b. Hub-Ebene (Schaltzentralen / oberste Ebene) ─────────
-- Übersicht der Hub-Aromastoffe mit Reichweite (Anzahl andockender Zutaten) und
-- Beispiel-Zutaten. Das ist die "oberste Ebene", an die jede Zutat/jedes Rezept andockt.
CREATE OR REPLACE FUNCTION aroma_hub_overview()
RETURNS TABLE (
  hub        text,
  hub_role   text,
  zutaten    int,
  beispiele  text[]
)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT c.name, c.hub_role,
         count(ic.ingredient_id)::int AS zutaten,
         (array_agg(i.name ORDER BY i.name))[1:5] AS beispiele
  FROM aroma_compound c
  LEFT JOIN aroma_ingredient_compound ic ON ic.compound_id = c.id
  LEFT JOIN aroma_ingredient i ON i.id = ic.ingredient_id
  WHERE c.is_hub
  GROUP BY c.name, c.hub_role
  ORDER BY zutaten DESC
$$;

-- Qualitätsregel: Zutaten, die an KEINEN Hub-Aromastoff andocken (sollte leer sein).
CREATE OR REPLACE VIEW aroma_ingredient_ohne_hub AS
  SELECT i.id, i.name, i.category
  FROM aroma_ingredient i
  WHERE NOT EXISTS (
    SELECT 1 FROM aroma_ingredient_compound ic
    JOIN aroma_compound c ON c.id = ic.compound_id
    WHERE ic.ingredient_id = i.id AND c.is_hub
  );

-- ── 3. RLS — Zugriff ausschließlich server-seitig (service_role) ──
ALTER TABLE aroma_ingredient          ENABLE ROW LEVEL SECURITY;
ALTER TABLE aroma_compound            ENABLE ROW LEVEL SECURITY;
ALTER TABLE aroma_ingredient_compound ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_aroma_ingredient" ON aroma_ingredient;
CREATE POLICY "service_role_all_aroma_ingredient"
  ON aroma_ingredient FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_aroma_compound" ON aroma_compound;
CREATE POLICY "service_role_all_aroma_compound"
  ON aroma_compound FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_aroma_ic" ON aroma_ingredient_compound;
CREATE POLICY "service_role_all_aroma_ic"
  ON aroma_ingredient_compound FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON FUNCTION match_foodpairing(text, int) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION match_foodpairing(text, int) TO service_role;
REVOKE ALL ON FUNCTION aroma_hub_overview() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION aroma_hub_overview() TO service_role;
