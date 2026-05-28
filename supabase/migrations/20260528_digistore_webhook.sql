-- ============================================================
-- Digistore24 Webhook — Tabellen + RPC-Funktionen
-- Migration: 20260528_digistore_webhook
-- ============================================================

-- ── 1. courses ─────────────────────────────────────────────
-- Kurse / digitale Produkte die über Digistore24 verkauft werden
CREATE TABLE IF NOT EXISTS courses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  title       text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 2. digistore_products ──────────────────────────────────
-- Mapping: Digistore24 product_id → interner course
CREATE TABLE IF NOT EXISTS digistore_products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ds_product_id text UNIQUE NOT NULL,   -- Digistore24 product_id aus IPN
  course_id     uuid REFERENCES courses(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── 3. bookings ────────────────────────────────────────────
-- Nutzer ↔ Kurs-Zugänge (Grant / Revoke)
CREATE TABLE IF NOT EXISTS bookings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,            -- auth.users.id
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  granted_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at  timestamptz,              -- NULL = aktiv
  UNIQUE (user_id, course_id)
);

-- ── 4. digistore_orders ────────────────────────────────────
-- IPN-Protokoll — vollständige Audit-Spur aller Webhooks
CREATE TABLE IF NOT EXISTS digistore_orders (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ds_order_id        text NOT NULL,
  ds_product_id      text NOT NULL,
  ds_email           text NOT NULL,
  ds_event           text NOT NULL,
  course_id          uuid REFERENCES courses(id),
  raw_payload        jsonb,
  raw_body           text,
  processing_status  text NOT NULL DEFAULT 'pending'
                       CHECK (processing_status IN ('pending','processed','failed')),
  error_message      text,
  booking_id         uuid REFERENCES bookings(id),
  processed_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ds_order_id, ds_event)       -- Idempotenz: kein doppeltes Processing
);

-- ── Indizes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_digistore_orders_email   ON digistore_orders(ds_email);
CREATE INDEX IF NOT EXISTS idx_digistore_orders_status  ON digistore_orders(processing_status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_course      ON bookings(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_active      ON bookings(user_id) WHERE revoked_at IS NULL;

-- ── 5. RPC: grant_course_access ────────────────────────────
-- Gibt Kurs-Zugang frei (insert oder reaktivieren bei Re-Kauf)
-- Gibt booking.id zurück
CREATE OR REPLACE FUNCTION grant_course_access(
  p_user_id   uuid,
  p_course_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id uuid;
BEGIN
  INSERT INTO bookings (user_id, course_id)
  VALUES (p_user_id, p_course_id)
  ON CONFLICT (user_id, course_id) DO UPDATE
    SET revoked_at = NULL,
        granted_at = now()
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

-- ── 6. RPC: revoke_course_access ──────────────────────────
-- Entzieht Kurs-Zugang (Refund / Chargeback)
-- Gibt Anzahl der widerrufenen Zugänge zurück (0 oder 1)
CREATE OR REPLACE FUNCTION revoke_course_access(
  p_user_id   uuid,
  p_course_id uuid
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE bookings
  SET    revoked_at = now()
  WHERE  user_id    = p_user_id
    AND  course_id  = p_course_id
    AND  revoked_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ── 7. Seed: Steakakademie-Produkte ──────────────────────
-- Kurse
INSERT INTO courses (id, slug, title) VALUES
  ('11111111-0001-0000-0000-000000000000', 'steak-beichte',      'Steak-Beichte'),
  ('11111111-0002-0000-0000-000000000000', 'mein-protokoll',     'Mein Protokoll'),
  ('11111111-0003-0000-0000-000000000000', 'bbq-grundkurs',      'BBQ Grundkurs')
ON CONFLICT (slug) DO NOTHING;

-- Digistore24 Product-ID → Course Mapping
-- !! Digistore-IDs anpassen falls abweichend !!
INSERT INTO digistore_products (ds_product_id, course_id) VALUES
  ('696394', '11111111-0001-0000-0000-000000000000'),  -- Steak-Beichte
  ('696396', '11111111-0002-0000-0000-000000000000'),  -- Mein Protokoll
  ('696399', '11111111-0003-0000-0000-000000000000')   -- BBQ Grundkurs
ON CONFLICT (ds_product_id) DO NOTHING;

-- ── 8. RLS (Row Level Security) ───────────────────────────
ALTER TABLE courses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE digistore_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE digistore_orders ENABLE ROW LEVEL SECURITY;

-- Service Role darf alles (Webhook läuft als service_role)
CREATE POLICY "service_role_all_courses"
  ON courses FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_ds_products"
  ON digistore_products FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_orders"
  ON digistore_orders FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_bookings"
  ON bookings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Nutzer sehen nur ihre eigenen Buchungen
CREATE POLICY "users_own_bookings"
  ON bookings FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND revoked_at IS NULL);
