-- Hofladen-Radar: Direktvermarkter (Hoflaeden) aus OpenStreetMap, woechentlich
-- importiert (scripts/hoefe-import.mjs via .github/workflows/hoefe-import.yml).
-- Konzept + Entscheidungen: docs/hofladen-radar.md
--
-- Bewusst OHNE PostGIS: 7.000 Punkte in Deutschland brauchen keine Geometrie-
-- Extension. Umkreissuche = Bounding-Box-Vorfilter (btree auf lat/lng) +
-- Haversine in SQL. PostGIS kann spaeter kommen, wenn Polygone oder
-- Millionen Punkte ins Spiel kommen — nicht vorher.
--
-- Anwenden: `supabase db push` (Uwe) — nie ueber den MCP-Classifier.

CREATE TABLE IF NOT EXISTS hoefe (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Herkunft. osm_id ist der Upsert-Schluessel des Imports ("n123" / "w456",
  -- weil Node- und Way-IDs in OSM getrennte Zahlenraeume sind).
  osm_id             text UNIQUE,
  datenquelle        text NOT NULL DEFAULT 'osm',
  osm_tags           jsonb,
  letzter_import     timestamptz,

  -- Stammdaten
  name               text NOT NULL,
  slug               text UNIQUE NOT NULL,
  beschreibung       text,
  bio                boolean NOT NULL DEFAULT false,
  bio_zertifikat     text,
  -- NULL = unbekannt (OSM hat kein produce-Tag), true = Fleisch belegt,
  -- false = ausdruecklich kein Fleisch. Der Radar zeigt NULL als "nicht bestaetigt".
  verkauft_fleisch   boolean,
  fleischarten       text[] NOT NULL DEFAULT '{}',
  oeffnungszeiten    text,
  website            text,
  telefon            text,
  email              text,

  -- Lage
  lat                double precision NOT NULL CHECK (lat BETWEEN 47 AND 56),
  lng                double precision NOT NULL CHECK (lng BETWEEN 5 AND 16),
  strasse            text,
  plz                text,
  ort                text,

  -- Inhaber-Bereich (spaeter): ein beanspruchter Hof wird vom Import NICHT mehr
  -- ueberschrieben — siehe hoefe_import_upsert().
  beansprucht        boolean NOT NULL DEFAULT false,
  premium            boolean NOT NULL DEFAULT false,
  inhaber_user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  premium_bis        timestamptz,

  erstellt_am        timestamptz NOT NULL DEFAULT now(),
  geaendert_am       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hoefe_lat_lng_idx ON hoefe (lat, lng);
CREATE INDEX IF NOT EXISTS hoefe_fleisch_idx ON hoefe (verkauft_fleisch) WHERE verkauft_fleisch = true;
CREATE INDEX IF NOT EXISTS hoefe_premium_idx ON hoefe (premium) WHERE premium = true;

CREATE OR REPLACE FUNCTION hoefe_touch_geaendert()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.geaendert_am := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS hoefe_touch_geaendert ON hoefe;
CREATE TRIGGER hoefe_touch_geaendert BEFORE UPDATE ON hoefe
  FOR EACH ROW EXECUTE FUNCTION hoefe_touch_geaendert();

-- ── Zugriff ────────────────────────────────────────────────────────────────
-- Die Tabelle selbst ist fuer Clients unsichtbar (kein GRANT). Gelesen wird
-- ausschliesslich ueber die View hoefe_public, die E-Mail, Inhaber-ID und
-- OSM-Rohtags weglaesst. Schreiben: nur service_role (Import, spaeter Admin).
ALTER TABLE hoefe ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON hoefe FROM anon, authenticated;

DROP POLICY IF EXISTS "hoefe oeffentlich lesen" ON hoefe;
CREATE POLICY "hoefe oeffentlich lesen" ON hoefe
  FOR SELECT TO anon, authenticated
  USING (true);

-- View mit security_invoker: laeuft mit den Rechten des Aufrufers, die RLS der
-- Tabelle greift. Column-Grant unten begrenzt, welche Spalten die View lesen darf.
CREATE OR REPLACE VIEW hoefe_public
WITH (security_invoker = true) AS
  SELECT id, slug, name, beschreibung, bio, bio_zertifikat, verkauft_fleisch,
         fleischarten, oeffnungszeiten, website, telefon,
         lat, lng, strasse, plz, ort,
         beansprucht, premium, datenquelle, letzter_import, geaendert_am
  FROM hoefe;

GRANT SELECT (id, slug, name, beschreibung, bio, bio_zertifikat, verkauft_fleisch,
              fleischarten, oeffnungszeiten, website, telefon,
              lat, lng, strasse, plz, ort,
              beansprucht, premium, datenquelle, letzter_import, geaendert_am)
  ON hoefe TO anon, authenticated;
GRANT SELECT ON hoefe_public TO anon, authenticated;

-- ── Umkreissuche ───────────────────────────────────────────────────────────
-- Bounding-Box-Vorfilter (nutzt den Index), dann Haversine. 1 Breitengrad ≈ 111 km,
-- 1 Laengengrad ≈ 111 km · cos(lat). Ergebnis nach Entfernung, max. p_limit.
CREATE OR REPLACE FUNCTION hoefe_im_umkreis(
  p_lat double precision,
  p_lng double precision,
  p_km  double precision DEFAULT 30,
  p_nur_fleisch boolean DEFAULT false,
  p_limit int DEFAULT 200
)
RETURNS TABLE (
  id uuid, slug text, name text, bio boolean, verkauft_fleisch boolean,
  fleischarten text[], lat double precision, lng double precision,
  strasse text, plz text, ort text, website text, telefon text,
  beansprucht boolean, premium boolean, entfernung_km double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  WITH kandidaten AS (
    SELECT h.*
    FROM hoefe_public h
    WHERE h.lat BETWEEN p_lat - p_km / 111.0 AND p_lat + p_km / 111.0
      AND h.lng BETWEEN p_lng - p_km / (111.0 * greatest(cos(radians(p_lat)), 0.2))
                    AND p_lng + p_km / (111.0 * greatest(cos(radians(p_lat)), 0.2))
      AND (NOT p_nur_fleisch OR h.verkauft_fleisch = true)
  )
  SELECT k.id, k.slug, k.name, k.bio, k.verkauft_fleisch, k.fleischarten,
         k.lat, k.lng, k.strasse, k.plz, k.ort, k.website, k.telefon,
         k.beansprucht, k.premium,
         2 * 6371.0 * asin(sqrt(
           power(sin(radians(k.lat - p_lat) / 2), 2)
           + cos(radians(p_lat)) * cos(radians(k.lat))
           * power(sin(radians(k.lng - p_lng) / 2), 2)
         )) AS entfernung_km
  FROM kandidaten k
  WHERE 2 * 6371.0 * asin(sqrt(
           power(sin(radians(k.lat - p_lat) / 2), 2)
           + cos(radians(p_lat)) * cos(radians(k.lat))
           * power(sin(radians(k.lng - p_lng) / 2), 2)
         )) <= p_km
  ORDER BY k.premium DESC, entfernung_km ASC
  LIMIT least(greatest(p_limit, 1), 500)
$$;

GRANT EXECUTE ON FUNCTION hoefe_im_umkreis(double precision, double precision, double precision, boolean, int)
  TO anon, authenticated;

-- ── Import-Upsert ──────────────────────────────────────────────────────────
-- Beanspruchte Hoefe (beansprucht = true) behalten ihre Stammdaten; der Import
-- aktualisiert dort nur osm_tags und letzter_import. Sonst wuerde jeder
-- Wochenlauf die Angaben eines zahlenden Inhabers mit OSM ueberschreiben.
-- Aufruf nur mit service_role (kein GRANT an Clients).
CREATE OR REPLACE FUNCTION hoefe_import_upsert(p_rows jsonb)
RETURNS TABLE (eingefuegt int, aktualisiert int, uebersprungen int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ins int := 0;
  v_upd int := 0;
  v_skip int := 0;
  r jsonb;
  v_exists boolean;
  v_claimed boolean;
BEGIN
  FOR r IN SELECT * FROM jsonb_array_elements(p_rows) LOOP
    SELECT true, h.beansprucht INTO v_exists, v_claimed
      FROM hoefe h WHERE h.osm_id = r->>'osm_id';

    IF v_exists IS NULL THEN
      INSERT INTO hoefe (osm_id, datenquelle, osm_tags, letzter_import, name, slug,
                         beschreibung, bio, bio_zertifikat, verkauft_fleisch, fleischarten,
                         oeffnungszeiten, website, telefon, email, lat, lng, strasse, plz, ort)
      VALUES (r->>'osm_id', 'osm', r->'osm_tags', now(), r->>'name', r->>'slug',
              r->>'beschreibung', coalesce((r->>'bio')::boolean, false), r->>'bio_zertifikat',
              (r->>'verkauft_fleisch')::boolean,
              coalesce(array(SELECT jsonb_array_elements_text(r->'fleischarten')), '{}'),
              r->>'oeffnungszeiten', r->>'website', r->>'telefon', r->>'email',
              (r->>'lat')::double precision, (r->>'lng')::double precision,
              r->>'strasse', r->>'plz', r->>'ort')
      ON CONFLICT (slug) DO NOTHING;
      IF FOUND THEN v_ins := v_ins + 1; ELSE v_skip := v_skip + 1; END IF;
    ELSIF v_claimed THEN
      UPDATE hoefe SET osm_tags = r->'osm_tags', letzter_import = now()
       WHERE osm_id = r->>'osm_id';
      v_skip := v_skip + 1;
    ELSE
      UPDATE hoefe SET
        osm_tags = r->'osm_tags', letzter_import = now(),
        name = r->>'name', beschreibung = r->>'beschreibung',
        bio = coalesce((r->>'bio')::boolean, false), bio_zertifikat = r->>'bio_zertifikat',
        verkauft_fleisch = (r->>'verkauft_fleisch')::boolean,
        fleischarten = coalesce(array(SELECT jsonb_array_elements_text(r->'fleischarten')), '{}'),
        oeffnungszeiten = r->>'oeffnungszeiten', website = r->>'website',
        telefon = r->>'telefon', email = r->>'email',
        lat = (r->>'lat')::double precision, lng = (r->>'lng')::double precision,
        strasse = r->>'strasse', plz = r->>'plz', ort = r->>'ort'
       WHERE osm_id = r->>'osm_id';
      v_upd := v_upd + 1;
    END IF;
    v_exists := NULL; v_claimed := NULL;
  END LOOP;
  RETURN QUERY SELECT v_ins, v_upd, v_skip;
END $$;

REVOKE ALL ON FUNCTION hoefe_import_upsert(jsonb) FROM public, anon, authenticated;

COMMENT ON TABLE hoefe IS
  'Hofladen-Radar: Direktvermarkter aus OpenStreetMap (ODbL, Attribution Pflicht). Wochenimport via scripts/hoefe-import.mjs. Beanspruchte Hoefe werden vom Import nicht ueberschrieben. Konzept: docs/hofladen-radar.md';
