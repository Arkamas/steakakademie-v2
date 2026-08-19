-- ── Kontaktformular — Eingangsprotokoll (KAN-70) ────────────────────────────
-- Jede über /kontakt eingegangene Nachricht wird hier gespeichert, BEVOR der
-- Mailversand versucht wird. Faellt Loops aus, ist die Nachricht trotzdem da.
--
-- Vorgeschichte: Das Formular hat von Juli bis 19.08.2026 gar nichts gesendet
-- (setTimeout statt Versand) und dem Absender trotzdem "Wir melden uns" gezeigt.
-- Diese Tabelle ist die Versicherung dagegen, dass so etwas unbemerkt bleibt.
--
-- consent_text wird mitgespeichert, nicht nur ein Häkchen-Flag: Der Nachweis
-- nach Art. 5 Abs. 2 DSGVO verlangt, belegen zu koennen, WOZU eingewilligt
-- wurde. Aendert sich der Text, bleibt die alte Fassung an der alten Anfrage.

CREATE TABLE IF NOT EXISTS public.kontaktanfragen (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  email        text NOT NULL,
  subject      text,                    -- Rohwert des Auswahlfelds
  betreff_tag  text,                    -- abgeleitetes Praefix, z. B. [Presse]
  message      text NOT NULL,
  consent      boolean NOT NULL DEFAULT false,
  consent_at   timestamptz,             -- serverseitig gesetzt, nicht vom Client
  consent_text text,                    -- Wortlaut, dem zugestimmt wurde
  mail_sent    boolean NOT NULL DEFAULT false,
  received_at  timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kontaktanfragen_received_at_idx
  ON public.kontaktanfragen (received_at DESC);

-- Offene Anfragen, bei denen der Mailversand scheiterte — die Liste, die man
-- ansehen muss, wenn Loops gestreikt hat.
CREATE INDEX IF NOT EXISTS kontaktanfragen_unsent_idx
  ON public.kontaktanfragen (received_at DESC) WHERE mail_sent = false;

ALTER TABLE public.kontaktanfragen ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='kontaktanfragen' AND policyname='service_role_all_kontaktanfragen') THEN
    CREATE POLICY "service_role_all_kontaktanfragen" ON public.kontaktanfragen FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT ALL ON public.kontaktanfragen TO service_role;
