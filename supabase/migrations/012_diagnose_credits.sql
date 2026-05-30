-- ============================================================
-- Steak-Beichte (Produkt A) — Credits-Modell + Diagnosen
-- Verbrauchbare Diagnosen (NICHT Booking-Gate wie Produkt B).
-- Idempotent: kann mehrfach ausgeführt werden.
-- ============================================================

-- ─── Credit-Konten ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diagnose_credits (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance     int  NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE diagnose_credits ENABLE ROW LEVEL SECURITY;

-- ─── Diagnosen ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diagnosen (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input        jsonb NOT NULL,
  image_path   text,
  report       jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diagnosen_user ON diagnosen(user_id, created_at DESC);

ALTER TABLE diagnosen ENABLE ROW LEVEL SECURITY;

-- ─── RLS ────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='diagnose_credits' AND policyname='service_role_all_credits') THEN
    CREATE POLICY "service_role_all_credits" ON diagnose_credits FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='diagnose_credits' AND policyname='users_own_credits') THEN
    CREATE POLICY "users_own_credits" ON diagnose_credits FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='diagnosen' AND policyname='service_role_all_diagnosen') THEN
    CREATE POLICY "service_role_all_diagnosen" ON diagnosen FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='diagnosen' AND policyname='users_own_diagnosen') THEN
    CREATE POLICY "users_own_diagnosen" ON diagnosen FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- ─── Storage-Bucket für optionale Fotos (privat) ────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('diagnose-images', 'diagnose-images', false)
ON CONFLICT (id) DO NOTHING;

-- ─── RPC: Credits gutschreiben (idempotenter Upsert) ────────
CREATE OR REPLACE FUNCTION grant_diagnose_credits(
  p_user_id  UUID,
  p_amount   INT
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_balance INT;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive: %', p_amount;
  END IF;

  INSERT INTO diagnose_credits (user_id, balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET balance = diagnose_credits.balance + p_amount,
               updated_at = timezone('utc', now())
  RETURNING balance INTO v_balance;

  RETURN v_balance;
END;
$$;

-- ─── RPC: 1 Credit verbrauchen (atomar, nur wenn > 0) ───────
CREATE OR REPLACE FUNCTION consume_diagnose_credit(
  p_user_id  UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE diagnose_credits
  SET balance = balance - 1,
      updated_at = timezone('utc', now())
  WHERE user_id = p_user_id AND balance > 0;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

-- ─── RPC: Credits zurücknehmen (Refund — clamp auf 0) ───────
CREATE OR REPLACE FUNCTION revoke_diagnose_credits(
  p_user_id  UUID,
  p_amount   INT
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_balance INT;
BEGIN
  UPDATE diagnose_credits
  SET balance = GREATEST(balance - p_amount, 0),
      updated_at = timezone('utc', now())
  WHERE user_id = p_user_id
  RETURNING balance INTO v_balance;

  RETURN COALESCE(v_balance, 0);
END;
$$;

-- Execute-Rechte hart einschränken
REVOKE ALL ON FUNCTION grant_diagnose_credits(UUID, INT)  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION consume_diagnose_credit(UUID)      FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION revoke_diagnose_credits(UUID, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION grant_diagnose_credits(UUID, INT)  TO service_role;
GRANT EXECUTE ON FUNCTION consume_diagnose_credit(UUID)      TO service_role;
GRANT EXECUTE ON FUNCTION revoke_diagnose_credits(UUID, INT) TO service_role;
