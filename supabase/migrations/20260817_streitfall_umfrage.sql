-- ============================================================
-- Streitfall-Umfrage (Stufe 1 der Nutzerbeteiligung)
-- Migration: 20260817_streitfall_umfrage
--
-- Modell: Unter jedem Streitfall genau eine Frage mit festen Antworten.
-- Ein Klick, ein Datensatz, fertig. Kein Freitext — deshalb gibt es nichts zu
-- moderieren und keine laufenden Kosten pro Nutzung.
--
-- Zwei Entscheidungen, die hier festgeschrieben sind:
--   1. Der UNIQUE-Index über (slug, user_id) ist die gesamte Missbrauchsabwehr.
--      Kein Rate-Limit, kein Captcha, keine IP-Speicherung nötig.
--   2. Einzelstimmen sind für niemanden lesbar — auch nicht für andere Nutzer.
--      Nach außen geht ausschließlich die aggregierte Ansicht. Wer wie
--      abgestimmt hat, ist niemandes Sache.
--
-- Konzept: docs/konzept-nutzerbeteiligung.md
-- Idempotent (re-runnable).
-- ============================================================

CREATE TABLE IF NOT EXISTS streitfall_votes (
  id         bigserial   PRIMARY KEY,
  slug       text        NOT NULL,
  option_key text        NOT NULL,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT streitfall_votes_einmal_pro_nutzer UNIQUE (slug, user_id)
);

CREATE INDEX IF NOT EXISTS streitfall_votes_slug_idx ON streitfall_votes (slug);

ALTER TABLE streitfall_votes ENABLE ROW LEVEL SECURITY;

-- Einfügen: nur die eigene Stimme.
DROP POLICY IF EXISTS "eigene stimme abgeben" ON streitfall_votes;
CREATE POLICY "eigene stimme abgeben" ON streitfall_votes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ändern: die eigene Stimme darf korrigiert werden.
DROP POLICY IF EXISTS "eigene stimme aendern" ON streitfall_votes;
CREATE POLICY "eigene stimme aendern" ON streitfall_votes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Lesen: ausschließlich die eigene Stimme, damit die Oberfläche weiß, ob und
-- wie der Nutzer bereits abgestimmt hat. Fremde Stimmen sind nicht lesbar.
DROP POLICY IF EXISTS "eigene stimme lesen" ON streitfall_votes;
CREATE POLICY "eigene stimme lesen" ON streitfall_votes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ── Aggregierte Ansicht ──────────────────────────────────────
-- security_invoker = false (Standard bei Views): Die Ansicht laeuft mit den
-- Rechten ihres Eigentuemers und umgeht damit bewusst die RLS der Tabelle.
-- Genau das ist hier gewollt — sie gibt nur Summen heraus, nie Einzelstimmen.
DROP VIEW IF EXISTS streitfall_ergebnis;
CREATE VIEW streitfall_ergebnis AS
  SELECT slug, option_key, count(*)::int AS stimmen
  FROM   streitfall_votes
  GROUP  BY slug, option_key;

-- Das Ergebnis ist Inhalt, nicht Geheimnis: Es steht auch nicht angemeldeten
-- Besuchern offen und soll von Suchmaschinen gelesen werden koennen.
GRANT SELECT ON streitfall_ergebnis TO anon, authenticated;

COMMENT ON TABLE streitfall_votes IS
  'Eine Stimme je Nutzer und Streitfall. Einzelstimmen sind nur fuer den Urheber lesbar; nach aussen nur die Ansicht streitfall_ergebnis.';
