-- ANGEWENDET am 27.08.2026 auf Projekt bbgdrzhlellxzggbbqcm (per MCP apply_migration).
-- Im Ledger supabase_migrations.schema_migrations als Version 20260827203759
-- verzeichnet — deshalb traegt die Datei genau diesen Zeitstempel. Wer hier eine
-- offene Migration vermutet: erst `list_migrations` bzw. das Ledger pruefen.
-- Alle Anweisungen unten sind wiederholbar (ALTER/REVOKE/CREATE OR REPLACE).
-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase Security Advisor (27.08.2026): zwei Views liefen als SECURITY DEFINER
-- und umgingen damit die RLS der zugrunde liegenden Tabellen fuer JEDEN Aufrufer.
-- Beide werden auf security_invoker = true umgestellt — die View laeuft dann mit
-- den Rechten des Aufrufers, RLS greift.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) aroma_ingredient_ohne_hub — reine QA-Ansicht (Zutaten ohne Hub-Aromastoff).
--    Die Aroma-Tabellen sind RLS-geschuetzt und nur fuer service_role lesbar;
--    service_role umgeht RLS ohnehin. Fuer anon/authenticated gibt es keinen
--    Anwendungsfall → Leserecht entziehen.
ALTER VIEW public.aroma_ingredient_ohne_hub SET (security_invoker = true);
REVOKE SELECT ON public.aroma_ingredient_ohne_hub FROM anon, authenticated;

-- 2) streitfall_ergebnis — Summen je Option, oeffentlich (Inhalt, kein Geheimnis).
--    Mit security_invoker sieht ein Aufrufer nur noch die Zeilen, die RLS ihm
--    erlaubt: anon nichts, authenticated nur die eigene Stimme. Das oeffentliche
--    Ergebnis kommt deshalb ab jetzt aus einer SECURITY-DEFINER-FUNKTION mit
--    festem search_path: sie gibt ausschliesslich Aggregate heraus, nie
--    Einzelstimmen — genau die Eigenschaft, die die View vorher hatte, aber
--    explizit und vom Linter als Funktion akzeptiert.
ALTER VIEW public.streitfall_ergebnis SET (security_invoker = true);

CREATE OR REPLACE FUNCTION public.streitfall_ergebnis_summen(p_slug text)
RETURNS TABLE (option_key text, stimmen int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT option_key, count(*)::int AS stimmen
  FROM   public.streitfall_votes
  WHERE  slug = p_slug
  GROUP  BY option_key
$$;

REVOKE ALL ON FUNCTION public.streitfall_ergebnis_summen(text) FROM public;
GRANT EXECUTE ON FUNCTION public.streitfall_ergebnis_summen(text) TO anon, authenticated;

COMMENT ON FUNCTION public.streitfall_ergebnis_summen(text) IS
  'Oeffentliche Stimmen-Summen je Streitfall. SECURITY DEFINER, weil streitfall_votes per RLS nur die eigene Stimme freigibt; die Funktion gibt nur Aggregate heraus.';
