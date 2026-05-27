-- Authenticated User mit aktiver/pending Booking sehen den Kurs
-- auch wenn published = false ist (sonst bricht der Rechner-Zugriff
-- solange der Kurs noch nicht öffentlich gelistet ist).
-- Public-Policy bleibt parallel bestehen (OR-Semantik).

CREATE POLICY "Authenticated users view own purchased courses"
  ON courses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.course_id = courses.id
        AND bookings.user_id  = auth.uid()
        AND bookings.status   IN ('active','pending')
    )
  );
