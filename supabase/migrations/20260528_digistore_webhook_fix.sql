-- ============================================================
-- Digistore24 Webhook — Fix für bestehende Schema-Teile
-- Idempotent: kann mehrfach ausgeführt werden
-- ============================================================

-- ── Fehlende Spalten nachrüsten ────────────────────────────
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS revoked_at timestamptz;

-- ── Tabellen anlegen falls noch nicht vorhanden ────────────
CREATE TABLE IF NOT EXISTS courses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  title       text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digistore_products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ds_product_id text UNIQUE NOT NULL,
  course_id     uuid REFERENCES courses(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

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
  UNIQUE (ds_order_id, ds_event)
);

-- ── Indizes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_digistore_orders_email  ON digistore_orders(ds_email);
CREATE INDEX IF NOT EXISTS idx_digistore_orders_status ON digistore_orders(processing_status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_course     ON bookings(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_active     ON bookings(user_id) WHERE revoked_at IS NULL;

-- ── RPC: grant_course_access ──────────────────────────────
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

-- ── RPC: revoke_course_access ─────────────────────────────
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

-- ── Seed: Kurse + Digistore-Mapping ──────────────────────
INSERT INTO courses (id, slug, title) VALUES
  ('11111111-0001-0000-0000-000000000000', 'steak-beichte',  'Steak-Beichte'),
  ('11111111-0002-0000-0000-000000000000', 'mein-protokoll', 'Mein Protokoll'),
  ('11111111-0003-0000-0000-000000000000', 'bbq-grundkurs',  'BBQ Grundkurs')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO digistore_products (ds_product_id, course_id) VALUES
  ('696394', '11111111-0001-0000-0000-000000000000'),
  ('696396', '11111111-0002-0000-0000-000000000000'),
  ('696399', '11111111-0003-0000-0000-000000000000')
ON CONFLICT (ds_product_id) DO NOTHING;

-- ── RLS ───────────────────────────────────────────────────
ALTER TABLE courses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE digistore_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE digistore_orders   ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='courses' AND policyname='service_role_all_courses') THEN
    CREATE POLICY "service_role_all_courses" ON courses FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='digistore_products' AND policyname='service_role_all_ds_products') THEN
    CREATE POLICY "service_role_all_ds_products" ON digistore_products FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='digistore_orders' AND policyname='service_role_all_orders') THEN
    CREATE POLICY "service_role_all_orders" ON digistore_orders FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='bookings' AND policyname='service_role_all_bookings') THEN
    CREATE POLICY "service_role_all_bookings" ON bookings FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='bookings' AND policyname='users_own_bookings') THEN
    CREATE POLICY "users_own_bookings" ON bookings FOR SELECT TO authenticated
      USING (user_id = auth.uid() AND revoked_at IS NULL);
  END IF;
END $$;
