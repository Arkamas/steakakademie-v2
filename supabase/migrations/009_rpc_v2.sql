-- RPCs v2:
--  - Signaturen: by user_id + course_id (UUIDs)  statt by email + slug
--  - Kein Direkt-INSERT in auth.users mehr        → User-Bootstrap macht der Webhook via auth.admin.createUser
--  - SECURITY DEFINER mit gehärtetem search_path  → keine Privilege Escalation
--  - revoke gibt Rows-affected zurück             → kein stilles No-Op
--  - EXECUTE nur für service_role                 → kein PUBLIC-Aufruf

DROP FUNCTION IF EXISTS grant_course_access(TEXT, TEXT);
DROP FUNCTION IF EXISTS revoke_course_access(TEXT, TEXT);

-- INSERT-Policy für bookings ist nötig, weil wir die self-grant-Policy entfernt haben
-- und die RPC mit SECURITY DEFINER unter postgres-Owner läuft (bypasst RLS sowieso),
-- aber der explizite service_role-Pfad braucht eine WITH CHECK-Policy:
CREATE POLICY "Service role inserts bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ───────────────────────────────────────────────────────────────
-- grant_course_access: idempotenter UPSERT mit Status reset auf 'active'
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION grant_course_access(
  p_user_id   UUID,
  p_course_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_booking_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM courses WHERE id = p_course_id) THEN
    RAISE EXCEPTION 'Course not found: %', p_course_id;
  END IF;

  INSERT INTO bookings (user_id, course_id, status)
  VALUES (p_user_id, p_course_id, 'active')
  ON CONFLICT (user_id, course_id)
  DO UPDATE SET status = 'active', updated_at = timezone('utc', now())
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

-- ───────────────────────────────────────────────────────────────
-- revoke_course_access: gibt Zahl betroffener Rows zurück
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION revoke_course_access(
  p_user_id   UUID,
  p_course_id UUID
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE bookings
  SET status = 'refunded', updated_at = timezone('utc', now())
  WHERE user_id = p_user_id AND course_id = p_course_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Execute-Rechte hart einschränken
REVOKE ALL ON FUNCTION grant_course_access(UUID, UUID)  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION revoke_course_access(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION grant_course_access(UUID, UUID)  TO service_role;
GRANT EXECUTE ON FUNCTION revoke_course_access(UUID, UUID) TO service_role;
