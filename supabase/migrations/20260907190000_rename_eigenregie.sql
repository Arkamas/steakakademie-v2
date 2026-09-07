-- Produktumbenennung: "Agentur-Killer-Sprint" -> "Eigenregie" (Uwe, 07.09.2026)
-- ============================================================================
-- Grund: Der alte Name wertet den Wettbewerb ab und verstoesst damit gegen die
-- eigene Marken-Doktrin (CLAUDE.md §2 Regel 3, "keine abwertenden Aussagen ...
-- ueber Wettbewerber"). Neuer Name: Eigenregie, Claim auf der Seite:
-- „Dein Business „KOMPLETT" in Eigenregie."
--
-- WAS DIESE MIGRATION NICHT ANFASST — und warum das richtig ist:
--   digistore_products verknuepft ueber course_id (UUID), nicht ueber den Slug.
--   Die Zuordnung 695900 -> dieser Kurs bleibt durch das Umbenennen unberuehrt.
--   Ein zusaetzliches UPDATE dort waere ueberfluessig und koennte die einzige
--   funktionierende Verknuepfung zerschiessen.
--
-- Idempotent: Laeuft die Migration zweimal, findet der zweite Lauf keine Zeile
-- mehr mit dem alten Slug und aendert nichts. Ein bereits umbenannter Kurs
-- wird nicht doppelt angefasst.

UPDATE courses
SET slug  = 'eigenregie',
    title = 'Eigenregie'
WHERE slug = 'agentur-killer-sprint';

-- Sicherheitsnetz fuer eine FRISCHE Datenbank:
-- Migration 006 legt das Mapping 695900 -> Kurs ueber den ALTEN Slug an. Auf
-- einem leeren Projekt laeuft 006, bevor seed.sql den Kurs eintraegt — dort
-- findet die Abfrage nichts und das Mapping bleibt aus. Ohne Mapping kassiert
-- Digistore ohne Auslieferung (Regel in docs/confluence/03-OPERATIONS.md).
-- Auf der Produktion aendert die Zeile nichts: dort existiert das Mapping und
-- ON CONFLICT greift.
INSERT INTO digistore_products (ds_product_id, course_id)
SELECT '695900', id FROM courses WHERE slug = 'eigenregie'
ON CONFLICT (ds_product_id) DO NOTHING;
