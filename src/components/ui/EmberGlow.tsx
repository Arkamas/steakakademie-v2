'use client';

import { useEffect, useRef } from 'react';

/**
 * EmberGlow — reaktiver Glut-Schein als Ersatz für den SmokeEffect.
 *
 * Entscheidung (Uwe, 15.08.2026, Design-Audit): KEINE Dauerschleifen-Animation
 * (Gemini-Stil verworfen — Habituation, Lesbarkeit, INP). Stattdessen Bewegung
 * nur als REAKTION auf Nutzerhandlung:
 *
 *  - Der Farbton wandert mit der Scrolltiefe entlang des Gargrad-Spektrums
 *    (Rare → Medium Rare → Medium → Medium Well → Well Done). Der Verlauf ist
 *    damit bedeutungstragend: die Seite "gart" beim Lesen. Stufen-Namen =
 *    Kanon der Plattform; die Farbwerte sind gestalterische Interpretation,
 *    abgestimmt auf die Marken-DNA (Gold #C8882A / Fire #E85018 / Ink).
 *  - Während des Scrollens glimmt die Glut leicht auf, danach ruht sie.
 *  - Keine Timer, kein Animations-Loop: ein passiver, rAF-gedrosselter
 *    Scroll-Listener, der zwei CSS-Variablen setzt. Laufzeitkosten ~0.
 *  - prefers-reduced-motion: Übergänge werden hart statt weich — die (ohnehin
 *    nutzerinitiierte) Farbänderung bleibt, nichts pulsiert.
 *
 * Der alte SmokeEffect bleibt unangetastet im Repo (Ein-Zeilen-Revert in
 * layout.tsx möglich).
 */

/** Gargrad-Spektrum — Reihenfolge = kanonische Garstufen-Leiter. */
export const GARGRAD_STOPS: { label: string; hex: string }[] = [
  { label: 'Rare',        hex: '#8C2F39' }, // dunkles Blutrot
  { label: 'Medium Rare', hex: '#C0442E' }, // die Steakakademie-Empfehlung — nah an Brand-Fire
  { label: 'Medium',      hex: '#C97E52' }, // Rosé-Braun
  { label: 'Medium Well', hex: '#A9713D' }, // Karamell — nah an Brand-Gold
  { label: 'Well Done',   hex: '#6E4B2E' }, // Röstbraun
];

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const STOP_RGB = GARGRAD_STOPS.map((s) => hexToRgb(s.hex));

/** Lineare Interpolation über das gesamte Spektrum, t ∈ [0, 1]. */
function spectrumAt(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const seg = clamped * (STOP_RGB.length - 1);
  const i = Math.min(STOP_RGB.length - 2, Math.floor(seg));
  const f = seg - i;
  const [r1, g1, b1] = STOP_RGB[i];
  const [r2, g2, b2] = STOP_RGB[i + 1];
  const r = Math.round(r1 + (r2 - r1) * f);
  const g = Math.round(g1 + (g2 - g1) * f);
  const b = Math.round(b1 + (b2 - b1) * f);
  return `${r} ${g} ${b}`;
}

export default function EmberGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) el.style.transition = 'none';

    let ticking = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const t = max > 0 ? window.scrollY / max : 0;
      el.style.setProperty('--ember-rgb', spectrumAt(t));
      // Glimmen nur, solange der Nutzer wirklich scrollt.
      el.style.setProperty('--ember-alpha', '0.22');
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => el.style.setProperty('--ember-alpha', '0.13'), 600);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={
        {
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          '--ember-rgb': '140 47 57', // Rare — Startzustand am Seitenanfang
          '--ember-alpha': '0.13',
          background:
            'radial-gradient(58% 34% at 50% 102%, rgb(var(--ember-rgb) / var(--ember-alpha)) 0%, rgb(var(--ember-rgb) / calc(var(--ember-alpha) * 0.45)) 42%, transparent 74%)',
          transition: 'background 700ms ease',
          willChange: 'background',
        } as React.CSSProperties
      }
    />
  );
}
