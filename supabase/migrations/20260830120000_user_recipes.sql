-- ============================================================
-- Community-Rezepte: user_recipes
-- Migration: 20260830120000_user_recipes
--
-- ZWECK: Diese Datei ist in erster Linie ein Protokoll, keine Änderung. Sie
-- schreibt den Live-Stand der Tabelle so auf, wie er am 30.08.2026 gegen die
-- Produktions-DB (Projekt bbgdrzhlellxzggbbqcm) verifiziert wurde: Spalten,
-- Typen, Defaults, Constraints, Indizes.
--
-- Warum das nötig war: Die Tabelle wurde remote per
-- 20260604122438_user_recipes_community angelegt (Dashboard/API — in der
-- Remote-Historie vorhanden, aber ohne Datei in supabase/migrations/). Lokal
-- fehlte sie damit vollständig. Ein Neuaufbau aus den Migrationen hätte eine
-- Tabelle erzeugt, die es in der Produktion so nie gab.
--
-- WICHTIG für künftige Änderungen: Auf einer DB, in der user_recipes bereits
-- existiert, ist CREATE TABLE IF NOT EXISTS wirkungslos. Diese Datei verändert
-- die Produktions-Tabelle also NICHT — mit der einen Ausnahme der Policies
-- weiter unten. Echte Schemaänderungen gehören in eine NEUE Migration mit
-- ALTER TABLE, niemals in diese hier.
--
-- Schreibzugriffe laufen ausschließlich über die Service-Role
-- (/api/rezept-einreichen, /api/admin/rezepte, /api/rezept-bild) und umgehen
-- RLS. Deshalb bewusst KEINE Insert-/Update-Policies für Clients.
--
-- Statusmodell (Quelle: /api/rezept-einreichen):
--   approved      quality_score >= 65 (KI-Moderation, Doppel-Tor safe+is_recipe)
--   needs_review  45–64 → Admin-Moderation /admin/rezepte
--   rejected      < 45 oder !safe/!is_recipe (rejection_reason = user_message)
--   pending       Spalten-Default; Alt-/Übergangsstatus im Admin-Endpoint
--
-- Idempotent (re-runnable).
-- ============================================================

CREATE TABLE IF NOT EXISTS user_recipes (
  id               uuid         NOT NULL DEFAULT gen_random_uuid(),
  -- NULLABLE + ON DELETE SET NULL ist eine bewusste Produktentscheidung, kein
  -- Versehen: Bei einer Kontolöschung bleiben die Rezepte als Community- und
  -- SEO-Inhalt bestehen und werden anonymisiert statt gelöscht. Der
  -- Personenbezug verschwindet, weil /api/konto-loeschen VOR dem Löschen
  -- author_name auf 'Ehemaliges Mitglied' setzt; user_id räumt anschließend
  -- dieser FK weg. Damit ist DSGVO Art. 17 erfüllt — personenbezogen ist hier
  -- allein der Name, nicht das Rezept.
  user_id          uuid         REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name      text         NOT NULL DEFAULT 'Gast-Pitmaster',
  slug             text         NOT NULL,
  title            text         NOT NULL,
  description      text         NOT NULL,
  portions         text,
  prep_time        text,
  -- [{ menge, einheit, name }] bzw. [{ beschreibung }] — Spiegel des Zod-Schemas
  ingredients      jsonb        NOT NULL DEFAULT '[]'::jsonb,
  steps            jsonb        NOT NULL DEFAULT '[]'::jsonb,
  status           text         NOT NULL DEFAULT 'pending',
  moderation       jsonb,
  rejection_reason text,
  quality_score    integer,
  image_url        text,
  created_at       timestamptz  NOT NULL DEFAULT now(),
  updated_at       timestamptz  NOT NULL DEFAULT now(),
  published_at     timestamptz,
  CONSTRAINT user_recipes_pkey PRIMARY KEY (id),
  CONSTRAINT user_recipes_slug_key UNIQUE (slug),
  CONSTRAINT user_recipes_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review'))
);

-- Indizes exakt wie live. user_recipes_slug_idx ist streng genommen redundant
-- (user_recipes_slug_key indiziert slug bereits unique), existiert in der
-- Produktion aber — hier mitgeführt, damit ein Neuaufbau demselben Stand
-- entspricht. Aufräumen ggf. in einer eigenen Migration.
CREATE INDEX IF NOT EXISTS user_recipes_slug_idx   ON user_recipes (slug);
CREATE INDEX IF NOT EXISTS user_recipes_status_idx ON user_recipes (status, published_at DESC);
CREATE INDEX IF NOT EXISTS user_recipes_user_idx   ON user_recipes (user_id);

ALTER TABLE user_recipes ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Policies — der EINZIGE Teil, der auch auf der bereits bestehenden
-- Produktions-Tabelle etwas verändert.
--
-- Live lagen dort zwei Policies mit englischen Namen und Rolle PUBLIC. Sie
-- werden hier explizit entfernt und durch die deutschen ersetzt, die auf
-- anon/authenticated eingegrenzt sind. Die Zugriffslogik bleibt inhaltlich
-- identisch (freigegeben ODER eigenes Rezept). Ohne den expliziten DROP
-- stünden am Ende vier sich überlappende SELECT-Policies auf der Tabelle.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "public read approved recipes" ON user_recipes;
DROP POLICY IF EXISTS "owner reads own recipes"      ON user_recipes;

DROP POLICY IF EXISTS "freigegebene rezepte lesen" ON user_recipes;
CREATE POLICY "freigegebene rezepte lesen" ON user_recipes
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

-- Eigene Einreichungen inkl. Status und rejection_reason — Grundlage für
-- "Meine Einreichungen". Nach einer Kontolöschung greift diese Policy nicht
-- mehr: user_id ist dann NULL, und auth.uid() = NULL ergibt NULL, nie true.
-- Nicht freigegebene Rezepte eines gelöschten Kontos sieht damit niemand mehr.
DROP POLICY IF EXISTS "eigene einreichungen lesen" ON user_recipes;
CREATE POLICY "eigene einreichungen lesen" ON user_recipes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE user_recipes IS
  'Community-Rezepte (Nutzer-Einreichungen). Schreibzugriff nur via Service-Role; Lesen: approved oeffentlich, eigene immer. Bei Kontoloeschung anonymisiert (author_name ueberschrieben, user_id via FK auf NULL) statt geloescht.';
