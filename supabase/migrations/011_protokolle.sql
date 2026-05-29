-- ============================================================
-- Mein Protokoll (Produkt B) — generierte 8-Wochen-Pläne
-- Idempotent: kann mehrfach ausgeführt werden
-- ============================================================

CREATE TABLE IF NOT EXISTS protokolle (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers     jsonb NOT NULL,
  plan        jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_protokolle_user ON protokolle(user_id, created_at DESC);

ALTER TABLE protokolle ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Service-Role: voller Zugriff (Generate-API schreibt mit Service-Role)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='protokolle' AND policyname='service_role_all_protokolle') THEN
    CREATE POLICY "service_role_all_protokolle" ON protokolle FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  -- Nutzer: nur eigene Pläne lesen
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='protokolle' AND policyname='users_own_protokolle') THEN
    CREATE POLICY "users_own_protokolle" ON protokolle FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;
