-- ── Fix: fehlende Tabellen-GRANTs (Fehler 42501 "permission denied") ─────────
-- Ursache: frühere Migrationen erstellten Tabellen + RLS-Policies, aber ohne den
-- Supabase-Rollen die Tabellen-Privilegien zu vergeben. service_role umgeht RLS,
-- braucht aber trotzdem das GRANT. Folge: Webhook-Insert scheiterte (500).
-- Idempotent: mehrfach ausführbar.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- service_role: voller Zugriff (Webhook schreibt direkt in die Tabellen)
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- authenticated/anon: nur lesen (alle Schreibzugriffe laufen über service_role
-- bzw. SECURITY-DEFINER-RPCs). RLS bleibt aktiv und filtert die Zeilen.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- pipeline_runs hatte keine RLS — mit anon-GRANT sonst lesbar. RLS nachziehen.
ALTER TABLE IF EXISTS public.pipeline_runs ENABLE ROW LEVEL SECURITY;

-- Default-Privilegien für künftig erstellte Tabellen (Supabase-Standard).
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES  TO authenticated, anon;
