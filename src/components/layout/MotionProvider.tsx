'use client';

import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';

/**
 * Zwei Aufgaben in einem Wrapper:
 *
 * 1. Reduced-Motion-Vertrag aus globals.css für die framer-motion-Seite einlösen:
 *    bei prefers-reduced-motion: reduce schaltet framer-motion Transform-Animationen
 *    (x, y, scale, rotate) ab und behält Opacity — Bewegung entfällt, Rückmeldung bleibt.
 *
 * 2. Bundle-Deckel (Perf-Audit 02.09.2026): `LazyMotion` mit `domAnimation` statt des
 *    vollen `motion`-Imports. Vorher lag framer-motion mit ~54 kB (roh) in JEDEM
 *    First-Load-Bundle; `m` + `domAnimation` liefert dieselben Features, die wir
 *    tatsächlich nutzen (animate, exit/AnimatePresence, whileHover/whileTap,
 *    whileInView, variants) für einen Bruchteil davon. Nicht enthalten sind `drag`
 *    und `layout`-Animationen (`domMax`) — beides wird nirgends im Repo verwendet.
 *
 *    Vertrag für alle Komponenten: `import { m as motion } from 'framer-motion'`.
 *    `strict` sorgt dafür, dass ein versehentlicher `motion.`-Import (der das volle
 *    Bundle zurückholen würde) im Dev-Modus sofort mit einer Fehlermeldung auffällt,
 *    statt still 50 kB zu kosten.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
