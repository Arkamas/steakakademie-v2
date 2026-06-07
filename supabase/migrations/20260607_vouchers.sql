-- ============================================================
-- Geschenkgutscheine (produktspezifisch / Einzweckgutschein)
-- Migration: 20260607_vouchers
--
-- Modell: Käufer kauft einen "Geschenkgutschein <Kurs>" (eigene Digistore-
-- product_id mit is_voucher=true). Der Webhook erzeugt einen Code, schaltet
-- aber NICHTS frei. Der Beschenkte löst den Code ein → grant_course_access.
--
-- Einzweckgutschein (§3 Abs.14 UStG): Produkt + USt bei Ausstellung fix →
-- USt fällt beim Verkauf an → Digistore24 bucht sauber. 3 Jahre gültig (§195 BGB).
-- ============================================================

-- ── 1. Flag: welche Digistore-Produkte sind Gutscheine ───────
ALTER TABLE digistore_products
  ADD COLUMN IF NOT EXISTS is_voucher boolean NOT NULL DEFAULT false;

-- ── 2. vouchers ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vouchers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text UNIQUE NOT NULL,
  course_id       uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  ds_order_id     text,                     -- Audit-Link zum Kauf (Idempotenz)
  purchaser_email text,                     -- wer ihn gekauft hat
  gift_message    text,                     -- optionale persönliche Nachricht
  status          text NOT NULL DEFAULT 'issued'
                    CHECK (status IN ('issued','redeemed','revoked')),
  redeemed_by     uuid,                     -- auth.users.id des Beschenkten
  redeemed_at     timestamptz,
  issued_at       timestamptz NOT NULL DEFAULT now(),
  valid_until     timestamptz NOT NULL DEFAULT (now() + interval '3 years')
);

CREATE INDEX IF NOT EXISTS idx_vouchers_status      ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_purchaser   ON vouchers(purchaser_email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vouchers_order ON vouchers(ds_order_id) WHERE ds_order_id IS NOT NULL;

-- ── 3. Code-Generator (Alphabet ohne O/0/I/1/L → verwechslungsfrei) ──
CREATE OR REPLACE FUNCTION gen_voucher_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code     text := 'SA-';
  seg      int;
  i        int;
BEGIN
  FOR seg IN 1..2 LOOP
    FOR i IN 1..4 LOOP
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    IF seg = 1 THEN code := code || '-'; END IF;
  END LOOP;
  RETURN code;  -- Format: SA-XXXX-XXXX
END;
$$;

-- ── 4. create_voucher — idempotent pro ds_order_id, eindeutiger Code ──
CREATE OR REPLACE FUNCTION create_voucher(
  p_course_id       uuid,
  p_ds_order_id     text,
  p_purchaser_email text,
  p_gift_message    text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_try  int := 0;
BEGIN
  -- Idempotenz: existiert für diese Order schon ein Gutschein → den Code liefern
  IF p_ds_order_id IS NOT NULL THEN
    SELECT code INTO v_code FROM vouchers WHERE ds_order_id = p_ds_order_id LIMIT 1;
    IF FOUND THEN RETURN v_code; END IF;
  END IF;

  LOOP
    v_try  := v_try + 1;
    v_code := gen_voucher_code();
    BEGIN
      INSERT INTO vouchers (code, course_id, ds_order_id, purchaser_email, gift_message)
      VALUES (v_code, p_course_id, p_ds_order_id, p_purchaser_email, p_gift_message);
      RETURN v_code;
    EXCEPTION WHEN unique_violation THEN
      IF v_try > 10 THEN RAISE EXCEPTION 'voucher code generation failed after 10 tries'; END IF;
    END;
  END LOOP;
END;
$$;

-- ── 5. redeem_voucher — race-sicher (FOR UPDATE), ruft grant_course_access ──
CREATE OR REPLACE FUNCTION redeem_voucher(
  p_code    text,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v       vouchers;
  v_slug  text;
  v_title text;
BEGIN
  SELECT * INTO v FROM vouchers
    WHERE code = upper(replace(trim(p_code), ' ', ''))
    FOR UPDATE;

  IF NOT FOUND               THEN RETURN jsonb_build_object('status','not_found'); END IF;
  IF v.status = 'redeemed'   THEN RETURN jsonb_build_object('status','already_redeemed'); END IF;
  IF v.status = 'revoked'    THEN RETURN jsonb_build_object('status','revoked'); END IF;
  IF v.valid_until < now()   THEN RETURN jsonb_build_object('status','expired'); END IF;

  PERFORM grant_course_access(p_user_id, v.course_id);

  UPDATE vouchers
    SET status = 'redeemed', redeemed_by = p_user_id, redeemed_at = now()
    WHERE id = v.id;

  SELECT slug, title INTO v_slug, v_title FROM courses WHERE id = v.course_id;
  RETURN jsonb_build_object('status','ok','course_slug',v_slug,'course_title',v_title);
END;
$$;

-- ── 6. revoke_voucher — Refund/Chargeback (entzieht auch eingelösten Zugang) ──
CREATE OR REPLACE FUNCTION revoke_voucher(p_ds_order_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v vouchers;
BEGIN
  SELECT * INTO v FROM vouchers WHERE ds_order_id = p_ds_order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;

  IF v.status = 'redeemed' AND v.redeemed_by IS NOT NULL THEN
    PERFORM revoke_course_access(v.redeemed_by, v.course_id);
  END IF;

  UPDATE vouchers SET status = 'revoked' WHERE id = v.id;
  RETURN 'revoked';
END;
$$;

-- ── 7. RLS — nur Service-Role; Zugriff sonst ausschließlich über die RPCs ──
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_vouchers" ON vouchers;
CREATE POLICY "service_role_all_vouchers"
  ON vouchers FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RPC-Ausführung: nur Service-Role (Webhook + server-seitige Routen).
REVOKE ALL ON FUNCTION create_voucher(uuid, text, text, text) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION redeem_voucher(text, uuid)            FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION revoke_voucher(text)                  FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION create_voucher(uuid, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION redeem_voucher(text, uuid)            TO service_role;
GRANT EXECUTE ON FUNCTION revoke_voucher(text)                  TO service_role;

-- ── 8. Hinweis (kein Seed): Gutschein-Produkte legt Uwe in Digistore24 an,
--    dann hier mappen, z.B.:
--    INSERT INTO digistore_products (ds_product_id, course_id, is_voucher)
--    VALUES ('<DS_VOUCHER_ID>', '11111111-0003-0000-0000-000000000000', true);
--    (Course-id = bestehender Kurs, hier BBQ-Grundkurs.)
