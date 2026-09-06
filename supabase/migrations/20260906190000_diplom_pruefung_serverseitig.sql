-- ============================================================
-- Diplom — Pruefungsergebnis nur noch serverseitig, Lesefortschritt, Kurs-Slug
-- Audit 06.09.2026 (AUDIT-Ausbildungssystem-2026-09-06.md, R2, R3, R13)
-- Idempotent.
-- ============================================================

-- ── 1. course_progress: der Browser darf nicht mehr selbst „bestanden" schreiben
-- Vorher erlaubten users_insert_own_progress / users_update_own_progress jedem
-- eingeloggten Konto, beliebige Zeilen (Stufe 5, Master of Steak) einzutragen —
-- die Policy pruefte nur user_id = auth.uid(). Schreiben tut jetzt ausschliesslich
-- /api/diplome/pruefung mit service_role. Lesen bleibt wie gehabt.
DROP POLICY IF EXISTS users_insert_own_progress ON course_progress;
DROP POLICY IF EXISTS users_update_own_progress ON course_progress;

-- ── 2. lesson_progress: „Lektion gelesen" je Nutzer und Lektion
-- Bis hierhin wurde nur der Modulabschluss gespeichert, nie der Lesestand.
-- Das ist KEIN Nachweis (kein Zertifikat haengt daran), deshalb darf der
-- Nutzer hier selbst schreiben — nur fuer sich.
CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lektion_slug text NOT NULL,
  stufe        int  NOT NULL,
  read_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lektion_slug)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_stufe ON lesson_progress(user_id, stufe);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lesson_progress' AND policyname = 'lesson_progress_select_own') THEN
    CREATE POLICY lesson_progress_select_own ON lesson_progress
      FOR SELECT USING ((SELECT auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lesson_progress' AND policyname = 'lesson_progress_insert_own') THEN
    CREATE POLICY lesson_progress_insert_own ON lesson_progress
      FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lesson_progress' AND policyname = 'lesson_progress_delete_own') THEN
    CREATE POLICY lesson_progress_delete_own ON lesson_progress
      FOR DELETE USING ((SELECT auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lesson_progress' AND policyname = 'lesson_progress_service_all') THEN
    CREATE POLICY lesson_progress_service_all ON lesson_progress
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 3. Der Diplom-Kurs als Buchungsziel
-- Der Digistore-Webhook ordnet Kaeufe ueber digistore_products einem Kurs-Slug
-- zu und ruft grant_course_access auf. Ohne diese Zeile gibt es nichts, worauf
-- eine Diplom-Buchung landen koennte. Preis = regulaerer Preis laut
-- docs/konzept-diplom-stufe-2-5.md; published bleibt false bis zum Verkaufsstart.
-- OFFEN (nur Uwe): die Digistore-Produkt-ID in digistore_products auf diesen
-- Slug mappen, sobald das Produkt in Digistore angelegt ist.
INSERT INTO courses (title, description, price, slug, published)
VALUES (
  'Grillmeister-Diplom',
  'Stufe 2 bis 5 der Grillmeister-Ausbildung: Silber-, Gold-, Platin-Zertifikat und Meister-Diplom. Stufe 1 ist frei.',
  149.00,
  'grillmeister-diplom',
  false
)
ON CONFLICT (slug) DO NOTHING;
