-- ============================================================
-- Security-Advisor-Härtung (WARN-Findings)
-- Idempotent. Im Supabase SQL-Editor ausführen.
-- Behebt: "Function Search Path Mutable" (#1–4) + SECURITY DEFINER
-- "Public/Signed-In Can Execute" für rls_auto_enable (#5–6).
-- #7 (Leaked Password Protection) = Dashboard-Toggle, separat.
-- ============================================================

-- ── #1–4: search_path fixieren (verhindert search_path-Hijack bei SECURITY DEFINER) ──
-- public + pg_temp = fester Pfad; unqualifizierte public-Refs bleiben funktionsfähig.
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.update_updated_at()',
    'public.set_rls_on_new_table()',
    'public.grant_course_access(uuid, uuid)',
    'public.revoke_course_access(uuid, uuid)'
  ] LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'übersprungen (nicht vorhanden): %', fn;
    END;
  END LOOP;
END $$;

-- ── #5–6: rls_auto_enable() — search_path fixieren + öffentliche Ausführung entziehen ──
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public, pg_temp';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, public';
  END IF;
END $$;
