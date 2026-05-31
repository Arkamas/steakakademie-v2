-- ── Widerrufsbutton — Eingangsprotokoll (Button-Lösung Widerruf, ab 19.06.2026) ─
-- Jeder über /widerruf eingegangene Widerruf wird hier mit authoritativer
-- Eingangszeit protokolliert. Idempotent.

CREATE TABLE IF NOT EXISTS public.widerrufe (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text,
  order_ref   text,
  name        text,
  product     text,
  reason      text,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.widerrufe ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='widerrufe' AND policyname='service_role_all_widerrufe') THEN
    CREATE POLICY "service_role_all_widerrufe" ON public.widerrufe FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT ALL ON public.widerrufe TO service_role;
