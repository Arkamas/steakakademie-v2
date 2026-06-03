-- ============================================================
-- Diplom Phase B — Fortschritt pro Nutzer + öffentliche Profile
-- Idempotent: kann mehrfach ausgeführt werden.
-- Voraussetzung: Auth (auth.users) existiert bereits.
-- ============================================================

-- ── 1. course_progress — bestandene Module/Stufen je Nutzer ──────────────────
CREATE TABLE IF NOT EXISTS course_progress (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modul       text NOT NULL,                         -- ModuleKey, z.B. 'bronze','anatomie','thermometer','holz','kcbs'
  stufe       int,                                   -- 1–5 (für Anzeige)
  status      text NOT NULL DEFAULT 'bestanden',     -- 'bestanden'
  quiz_score  int,                                   -- erreichte Punktzahl
  badge       text,                                  -- freigeschalteter Badge-Name
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, modul)
);

CREATE INDEX IF NOT EXISTS idx_course_progress_user ON course_progress(user_id);

ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

-- ── 2. profiles — öffentliche Grillmeister-Vita (Opt-in) ─────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  user_id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slug         text UNIQUE,                          -- /griller/<slug>
  display_name text,
  is_public    boolean NOT NULL DEFAULT false,       -- standardmäßig PRIVAT
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug) WHERE slug IS NOT NULL;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ── 3. RLS-Policies ──────────────────────────────────────────────────────────
DO $$ BEGIN
  -- course_progress: Service-Role voll
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='course_progress' AND policyname='service_role_all_progress') THEN
    CREATE POLICY "service_role_all_progress" ON course_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  -- course_progress: Nutzer verwalten nur eigenen Fortschritt
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='course_progress' AND policyname='users_select_own_progress') THEN
    CREATE POLICY "users_select_own_progress" ON course_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='course_progress' AND policyname='users_insert_own_progress') THEN
    CREATE POLICY "users_insert_own_progress" ON course_progress FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='course_progress' AND policyname='users_update_own_progress') THEN
    CREATE POLICY "users_update_own_progress" ON course_progress FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  -- course_progress: öffentlich lesbar NUR wenn das zugehörige Profil öffentlich ist
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='course_progress' AND policyname='public_progress_for_public_profiles') THEN
    CREATE POLICY "public_progress_for_public_profiles" ON course_progress FOR SELECT TO anon, authenticated
      USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = course_progress.user_id AND p.is_public = true));
  END IF;

  -- profiles: Service-Role voll
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='service_role_all_profiles') THEN
    CREATE POLICY "service_role_all_profiles" ON profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  -- profiles: Nutzer verwalten eigenes Profil
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='users_select_own_profile') THEN
    CREATE POLICY "users_select_own_profile" ON profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='users_insert_own_profile') THEN
    CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='users_update_own_profile') THEN
    CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  -- profiles: öffentliche Profile sind für alle lesbar (für /griller/<slug>)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='public_profiles_readable') THEN
    CREATE POLICY "public_profiles_readable" ON profiles FOR SELECT TO anon, authenticated USING (is_public = true);
  END IF;
END $$;
