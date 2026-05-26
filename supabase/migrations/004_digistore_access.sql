-- ═══════════════════════════════════════════════════════════════
-- Migration 004 — Digistore24 IPN + Course Access Gate
-- Run in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── Digistore24 Orders (Idempotenz-Tabelle) ─────────────────────────────────
-- Verhindert doppelte Buchungen bei Webhook-Retries

CREATE TABLE IF NOT EXISTS digistore_orders (
  id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  ds_order_id       TEXT        NOT NULL UNIQUE,   -- Digistore24 Order-ID
  ds_product_id     TEXT        NOT NULL,
  ds_email          TEXT        NOT NULL,
  ds_event          TEXT        NOT NULL,          -- 'order_completed', 'refund', etc.
  course_slug       TEXT        NOT NULL REFERENCES courses(slug) ON DELETE RESTRICT,
  booking_id        UUID        REFERENCES bookings(id) ON DELETE SET NULL,
  raw_payload       JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS ds_orders_email_idx    ON digistore_orders (ds_email);
CREATE INDEX IF NOT EXISTS ds_orders_slug_idx     ON digistore_orders (course_slug);

-- ─── RLS für digistore_orders ─────────────────────────────────────────────────
ALTER TABLE digistore_orders ENABLE ROW LEVEL SECURITY;

-- Nur service_role (Webhook API) darf schreiben
CREATE POLICY "service_role only" ON digistore_orders
  FOR ALL USING (auth.role() = 'service_role');

-- ─── Bookings: status 'active' hinzufügen ────────────────────────────────────
-- Bisherige stati: pending | confirmed | cancelled | refunded
-- Neu: 'active' = durch Digistore24-Payment vollständig freigeschaltet

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'active', 'cancelled', 'refunded'));

-- ─── Helper-Function: grant_course_access ────────────────────────────────────
-- Wird vom Webhook aufgerufen: sucht oder erstellt User per Email,
-- erstellt Booking mit status='active'.
-- Gibt booking_id zurück.

CREATE OR REPLACE FUNCTION grant_course_access(
  p_email      TEXT,
  p_course_slug TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   UUID;
  v_course_id UUID;
  v_booking_id UUID;
BEGIN
  -- Course holen
  SELECT id INTO v_course_id FROM courses WHERE slug = p_course_slug;
  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Course not found: %', p_course_slug;
  END IF;

  -- User per Email suchen (auth.users)
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

  -- Falls noch kein Account: Platzhalter anlegen (wird bei Magic-Link-Login aktiviert)
  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, email, email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, aud, role
    ) VALUES (
      uuid_generate_v4(),
      p_email,
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO v_user_id;
  END IF;

  -- Booking anlegen oder auf active setzen
  INSERT INTO bookings (user_id, course_id, status)
  VALUES (v_user_id, v_course_id, 'active')
  ON CONFLICT (user_id, course_id)
  DO UPDATE SET status = 'active', updated_at = now()
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

-- ─── Helper-Function: revoke_course_access ───────────────────────────────────
-- Für Refund-Event: setzt Booking auf 'refunded'

CREATE OR REPLACE FUNCTION revoke_course_access(
  p_email       TEXT,
  p_course_slug TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   UUID;
  v_course_id UUID;
BEGIN
  SELECT id INTO v_user_id  FROM auth.users WHERE email = p_email;
  SELECT id INTO v_course_id FROM courses    WHERE slug  = p_course_slug;

  IF v_user_id IS NOT NULL AND v_course_id IS NOT NULL THEN
    UPDATE bookings
    SET status = 'refunded', updated_at = now()
    WHERE user_id = v_user_id AND course_id = v_course_id;
  END IF;
END;
$$;
