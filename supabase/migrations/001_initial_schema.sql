-- ═══════════════════════════════════════════════════════════════
-- Steakakademie — Initial Schema
-- Migration: 001_initial_schema.sql
-- ═══════════════════════════════════════════════════════════════

-- Extension (Supabase: in Dashboard unter Database → Extensions aktivieren)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Courses ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS courses (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  title       TEXT        NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  slug        TEXT        UNIQUE NOT NULL,
  published   BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ─── Bookings ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id   UUID        NOT NULL REFERENCES courses(id)    ON DELETE RESTRICT,
  status      TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  -- Ein User kann sich nicht doppelt einschreiben
  UNIQUE (user_id, course_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS bookings_user_id_idx   ON bookings (user_id);
CREATE INDEX IF NOT EXISTS bookings_course_id_idx  ON bookings (course_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx     ON bookings (status);

-- ─── updated_at Trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE courses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Courses: nur publizierte Kurse sind öffentlich sichtbar
CREATE POLICY "Public can view published courses"
  ON courses FOR SELECT
  USING (published = true);

-- Courses: Service Role kann alles (für Admin-Panel / Seeding)
CREATE POLICY "Service role has full access to courses"
  ON courses FOR ALL
  USING (auth.role() = 'service_role');

-- Bookings: User sieht nur eigene Buchungen
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Bookings: User kann sich selbst einschreiben
CREATE POLICY "Users can insert own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Bookings: Status-Updates nur via Service Role (Digistore24-Webhook)
CREATE POLICY "Service role can update booking status"
  ON bookings FOR UPDATE
  USING (auth.role() = 'service_role');

-- ─── Seed: Erster Kurs ────────────────────────────────────────────────────────
-- Auskommentiert — erst aktivieren wenn Inhalt bereit ist

-- INSERT INTO courses (title, description, price, slug, published) VALUES
-- ('BBQ Grundkurs', 'Feuer, Temperatur, Grundtechniken — der systematische Einstieg.', 97.00, 'bbq-grundkurs', false),
-- ('Diplom Bronze', 'Stufe 1: Die Grundlagen des Pitmaster-Handwerks.', 47.00, 'diplom-bronze', false);
