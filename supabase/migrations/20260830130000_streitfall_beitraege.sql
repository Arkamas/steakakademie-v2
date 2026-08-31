-- ============================================================
-- Streitfall-Beitraege (Stufe 2 der Nutzerbeteiligung)
-- Migration: 20260830130000_streitfall_beitraege
--
-- Modell: Unter jedem Streitfall optional ein kurzer Erfahrungsbericht,
-- maximal 600 Zeichen, EIN Beitrag je Nutzer und Streitfall. Nichts davon
-- erscheint automatisch: Jeder Beitrag landet mit status 'neu' in der
-- Warteschlange und wird erst nach manueller Freigabe im Admin-Bereich als
-- "Stimme aus der Praxis" sichtbar. Die Warteschlange selbst ist der Filter —
-- keine Pruefsoftware, keine Kosten pro Einsendung.
--
-- Drei Entscheidungen, die hier festgeschrieben sind:
--   1. Der UNIQUE-Index ueber (slug, user_id) ist die gesamte Missbrauchsabwehr.
--      Kein Rate-Limit, kein Captcha, keine IP-Speicherung noetig.
--   2. Clients koennen NUR einfuegen (eigener Beitrag, status 'neu' erzwungen)
--      und lesen (freigegebene fuer alle, den eigenen immer). Kein UPDATE,
--      kein DELETE — Statuswechsel laufen ausschliesslich ueber die
--      Service-Role im Admin-Bereich.
--   3. Der Anzeigename ("Thomas aus Kassel") ist Teil der Einsendung und
--      wird bei der Freigabe redaktionell mitgeprueft. Kein Nachname.
--
-- WICHTIG: Stufe 2 geht erst live nach anwaltlicher DSA-Pruefung und
-- Nutzungsbedingungen-Update (Konzept, Abschnitt 5). Bis dahin bleibt die
-- Einbindung hinter dem Feature-Flag STREITFALL_BEITRAEGE_ENABLED.
--
-- Konzept: docs/konzept-nutzerbeteiligung.md
-- Idempotent (re-runnable).
-- ============================================================

CREATE TABLE IF NOT EXISTS streitfall_beitraege (
  id           bigserial   PRIMARY KEY,
  slug         text        NOT NULL,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anzeigename  text        NOT NULL,
  beitrag      text        NOT NULL CHECK (char_length(beitrag) <= 600),
  status       text        NOT NULL DEFAULT 'neu'
                           CHECK (status IN ('neu', 'freigegeben', 'abgelehnt')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  moderated_at timestamptz,
  CONSTRAINT streitfall_beitraege_einmal_pro_nutzer UNIQUE (slug, user_id)
);

CREATE INDEX IF NOT EXISTS streitfall_beitraege_slug_idx
  ON streitfall_beitraege (slug);
-- Die Moderations-Warteschlange fragt gezielt nach status 'neu'.
CREATE INDEX IF NOT EXISTS streitfall_beitraege_status_idx
  ON streitfall_beitraege (status);

ALTER TABLE streitfall_beitraege ENABLE ROW LEVEL SECURITY;

-- Einfuegen: nur der eigene Beitrag, und nur mit status 'neu'. Ein Client kann
-- sich also nicht selbst freigeben — der Weg in die Oeffentlichkeit fuehrt
-- ausschliesslich durch die Warteschlange.
DROP POLICY IF EXISTS "eigenen beitrag einreichen" ON streitfall_beitraege;
CREATE POLICY "eigenen beitrag einreichen" ON streitfall_beitraege
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'neu');

-- Lesen: Freigegebene Beitraege sind Inhalt und stehen jedem offen — auch
-- nicht angemeldeten Besuchern und Suchmaschinen. Den eigenen Beitrag sieht
-- der Urheber immer (auch solange er in der Warteschlange steht), fremde
-- unveroeffentlichte Beitraege sieht niemand.
DROP POLICY IF EXISTS "freigegebene lesen" ON streitfall_beitraege;
CREATE POLICY "freigegebene lesen" ON streitfall_beitraege
  FOR SELECT TO anon, authenticated
  USING (status = 'freigegeben' OR auth.uid() = user_id);

-- Bewusst KEINE UPDATE- und KEINE DELETE-Policy fuer Clients: Moderation
-- (freigeben/ablehnen) laeuft ausschliesslich ueber die Service-Role in
-- /api/admin/beitraege. Bei Kontoloeschung raeumt ON DELETE CASCADE auf.

COMMENT ON TABLE streitfall_beitraege IS
  'Ein Erfahrungsbericht je Nutzer und Streitfall (max. 600 Zeichen). Erscheint erst nach manueller Freigabe (status freigegeben) als "Stimme aus der Praxis". Konzept: docs/konzept-nutzerbeteiligung.md';
