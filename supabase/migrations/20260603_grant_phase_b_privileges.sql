-- ============================================================
-- Phase-B GRANT-Fix: Tabellen-Berechtigungen für RLS-Tabellen.
-- Per SQL erstellte Tabellen erhalten KEINE automatischen Rechte für
-- anon/authenticated (anders als über den Supabase Table-Editor).
-- RLS filtert nur Zeilen — der GRANT öffnet die Tabelle überhaupt erst.
-- Ohne das: "permission denied for table ..." trotz korrekter Policies.
-- Idempotent.
-- ============================================================
GRANT SELECT, INSERT, UPDATE ON public.profiles        TO authenticated;
GRANT SELECT                  ON public.profiles        TO anon;
GRANT SELECT, INSERT, UPDATE ON public.course_progress TO authenticated;
GRANT SELECT                  ON public.course_progress TO anon;
