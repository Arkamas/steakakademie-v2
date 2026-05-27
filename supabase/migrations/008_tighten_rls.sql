-- RLS-Härtung:
--  1. Self-Grant-Lücke schließen  → keine Selbst-Bookings via API
--  2. Dekorative service_role-Policies raus (bypasst RLS sowieso)
--  3. User sehen nur aktive/pending Bookings (refunded/cancelled ausgeblendet)
--  4. User sehen eigene Order-Historie (read-only)

-- 1) KRITISCH: Self-Insert auf bookings entfernen
DROP POLICY IF EXISTS "Users insert own bookings" ON bookings;

-- 2) Dekorative service_role-Policies entfernen (bypassen RLS bereits)
DROP POLICY IF EXISTS "Service role has full access to courses" ON courses;
DROP POLICY IF EXISTS "Service role full access courses"        ON courses;
DROP POLICY IF EXISTS "Service role can update booking status"  ON bookings;
DROP POLICY IF EXISTS "Service role update bookings"            ON bookings;
DROP POLICY IF EXISTS "service_role only"                       ON digistore_orders;

-- 3) Aktive Bookings-View nur für eigene aktive/pending Records
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users view own bookings"     ON bookings;
CREATE POLICY "Users view own active bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id AND status IN ('active','pending'));

-- 4) Eigene Order-Historie sichtbar (case-insensitive Email-Match)
CREATE POLICY "Users view own orders"
  ON digistore_orders FOR SELECT
  USING (lower(ds_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid())));
