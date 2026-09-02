'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Löst den Reduced-Motion-Vertrag aus globals.css für die framer-motion-Seite ein:
 * bei prefers-reduced-motion: reduce schaltet framer-motion Transform-Animationen
 * (x, y, scale, rotate) ab und behält Opacity — Bewegung entfällt, Rückmeldung bleibt.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
