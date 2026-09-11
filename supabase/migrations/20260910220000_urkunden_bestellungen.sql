-- ── Gedruckte Urkunden — Bestellung, Nummernvergabe, Druckdateien ───────────
-- Stand 10.09.2026. Idempotent.
--
-- Vorgeschichte: Die Bestellung einer gedruckten Urkunde lief ueber
-- /api/kontakt — sie landete als Freitext-Mail in kontaktanfragen. Es gab
-- keinen Bestellstatus, keine Urkunden-Nummer, keinen Weg zur Druckerei.
-- Gedruckt und kuvertiert wurde von Hand.
--
-- Jetzt: Jede Bestellung ist eine Zeile mit Status. Nach manueller Freigabe
-- (Testphase, so ausdruecklich gewuenscht) rendert der Server die Urkunde,
-- legt sie im Storage ab und schickt den Auftrag an Gelato.
--
-- Die Versandfelder sind auf die Laengen der Gelato-Order-API v4 beschnitten
-- (firstName/lastName 25, addressLine1 35, city 30, postCode 15, country 2) —
-- lieber hier abschneiden als beim Druckdienst abgelehnt werden.

CREATE TABLE IF NOT EXISTS public.urkunden_bestellungen (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email             text NOT NULL,

  -- Was gedruckt wird
  stufe             int  NOT NULL CHECK (stufe BETWEEN 1 AND 5),
  level_id          int  CHECK (level_id BETWEEN 1 AND 10),
  name_auf_urkunde  text NOT NULL CHECK (char_length(name_auf_urkunde) <= 60),

  -- Wohin es geht
  vorname           text NOT NULL CHECK (char_length(vorname)  <= 25),
  nachname          text NOT NULL CHECK (char_length(nachname) <= 25),
  strasse           text NOT NULL CHECK (char_length(strasse)  <= 35),
  adresszusatz      text          CHECK (adresszusatz IS NULL OR char_length(adresszusatz) <= 35),
  plz               text NOT NULL CHECK (char_length(plz)  <= 15),
  ort               text NOT NULL CHECK (char_length(ort)  <= 30),
  land              text NOT NULL DEFAULT 'DE' CHECK (char_length(land) = 2),

  preis_cents       int  NOT NULL DEFAULT 1799,

  -- Ablauf
  status            text NOT NULL DEFAULT 'neu'
                      CHECK (status IN ('neu','bezahlt','gesendet','fehler','storniert')),
  urkunde_nr        text UNIQUE,          -- erst bei Freigabe vergeben
  druck_datei       text,                 -- Pfad im Bucket "urkunden"
  gelato_order_id   text,
  gelato_antwort    jsonb,
  fehler_text       text,

  -- Nachweis der Einwilligung (Art. 5 Abs. 2 DSGVO) — wie bei kontaktanfragen
  -- wird der Wortlaut mitgespeichert, nicht nur ein Haekchen.
  consent           boolean NOT NULL DEFAULT false,
  consent_at        timestamptz,
  consent_text      text,

  bestellt_am       timestamptz NOT NULL DEFAULT now(),
  freigegeben_am    timestamptz,
  aktualisiert_am   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS urkunden_bestellungen_status_idx
  ON public.urkunden_bestellungen (status, bestellt_am DESC);
CREATE INDEX IF NOT EXISTS urkunden_bestellungen_user_idx
  ON public.urkunden_bestellungen (user_id, bestellt_am DESC);

ALTER TABLE public.urkunden_bestellungen ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Schreiben ausschliesslich serverseitig (/api/urkunde/bestellen,
  -- /api/admin/urkunden/freigeben). Der Browser darf nur die eigenen
  -- Bestellungen lesen — Adressen anderer Leute gehen ihn nichts an.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='urkunden_bestellungen' AND policyname='urkunden_service_all') THEN
    CREATE POLICY urkunden_service_all ON public.urkunden_bestellungen
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='urkunden_bestellungen' AND policyname='urkunden_select_own') THEN
    CREATE POLICY urkunden_select_own ON public.urkunden_bestellungen
      FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

GRANT SELECT ON public.urkunden_bestellungen TO authenticated;
GRANT ALL    ON public.urkunden_bestellungen TO service_role;

-- ── Fortlaufende Urkunden-Nummer ────────────────────────────────────────────
-- Format SA-<Jahr>-<vier Stellen>, je Jahr bei 1 beginnend. Ein eigener
-- Zaehler statt einer Sequenz, weil die Nummer jahresweise neu anfaengt und
-- nachvollziehbar in einer Tabelle stehen soll.
--
-- Die Nummer wird erst bei der Freigabe vergeben, nicht schon bei der
-- Bestellung: sonst reissen stornierte Bestellungen Luecken in eine Nummer,
-- die auf einer Urkunde steht.

CREATE TABLE IF NOT EXISTS public.urkunden_zaehler (
  jahr      int PRIMARY KEY,
  letzte_nr int NOT NULL DEFAULT 0
);

ALTER TABLE public.urkunden_zaehler ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='urkunden_zaehler' AND policyname='urkunden_zaehler_service_all') THEN
    CREATE POLICY urkunden_zaehler_service_all ON public.urkunden_zaehler
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT ALL ON public.urkunden_zaehler TO service_role;

/**
 * Vergibt die naechste Urkunden-Nummer des Jahres und gibt sie formatiert
 * zurueck. INSERT ... ON CONFLICT DO UPDATE ... RETURNING sperrt die Jahres-
 * zeile fuer die Dauer der Anweisung — zwei gleichzeitige Freigaben koennen
 * damit nicht dieselbe Nummer bekommen.
 */
CREATE OR REPLACE FUNCTION public.naechste_urkundennummer(p_jahr int)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nr int;
BEGIN
  INSERT INTO public.urkunden_zaehler AS z (jahr, letzte_nr)
  VALUES (p_jahr, 1)
  ON CONFLICT (jahr) DO UPDATE SET letzte_nr = z.letzte_nr + 1
  RETURNING z.letzte_nr INTO v_nr;

  RETURN 'SA-' || p_jahr::text || '-' || lpad(v_nr::text, 4, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.naechste_urkundennummer(int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.naechste_urkundennummer(int) TO service_role;

-- ── Storage: die fertigen Druckdateien ──────────────────────────────────────
-- Privat. Gelato bekommt keinen offenen Link, sondern eine zeitlich begrenzte
-- signierte URL — auf der Urkunde steht ein Klarname, der nicht offen im Netz
-- liegen soll.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('urkunden', 'urkunden', false, 26214400, ARRAY['image/png'])
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.urkunden_bestellungen IS
  'Bestellungen gedruckter Urkunden. Schreibzugriff nur ueber die Service-Role. Nach Freigabe rendert /api/admin/urkunden/freigeben die Druckdatei und beauftragt Gelato.';
COMMENT ON TABLE public.urkunden_zaehler IS
  'Jahreszaehler fuer die Urkunden-Nummer SA-<Jahr>-<vier Stellen>. Startwert eines Jahres laesst sich durch Setzen von letzte_nr vorgeben.';
