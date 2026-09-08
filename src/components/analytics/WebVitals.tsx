'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Web Vitals — Messung der Core Web Vitals echter Besucher.
 *
 * Hintergrund: Der Perf-Audit vom 02.09.2026 hat das Sentry-Browser-Tracing
 * aus dem Client-Bundle entfernt (108 kB gespart) und damit unbeabsichtigt
 * auch die Messung. Seitdem fehlen LCP-, CLS- und INP-Werte aus dem Feld.
 * `useReportWebVitals` steckt bereits in Next.js — der Zusatz im Bundle liegt
 * bei rund 1 kB, gegenueber 108 kB fuer das Sentry-Tracing.
 *
 * Gesendet wird an /api/web-vitals; von dort in public.web_vitals.
 *
 * Was den Weg NICHT verlaesst: IP, User-Agent, Session, Nutzer-ID, Query-
 * Parameter. Kein Cookie, kein Local Storage. Deshalb einwilligungsfrei —
 * dieselbe Begruendung wie bei Plausible (§ 25 Abs. 2 TDDDG).
 *
 * Zwei Details, die leicht schiefgehen:
 *   1. `navigator.sendBeacon` scheidet aus: mit Content-Type application/json
 *      loest es einen Preflight aus, den ein Beacon nicht ausfuehren kann, und
 *      der Guard der Route besteht auf application/json. `fetch` mit
 *      `keepalive: true` ueberlebt den Seitenwechsel genauso und schickt den
 *      korrekten Header.
 *   2. CLS und INP werden erst beim Verlassen der Seite endgueltig gemeldet —
 *      genau deshalb ist `keepalive` Pflicht.
 */
export default function WebVitals() {
  useReportWebVitals((metric) => {
    // Nur echte Besucher zaehlen; lokale Entwicklung wuerde die Werte verzerren.
    if (process.env.NODE_ENV !== 'production') return;
    if (!['LCP', 'CLS', 'INP', 'FCP', 'TTFB'].includes(metric.name)) return;

    const body = {
      // Pfad ohne Query und Fragment — keine Suchbegriffe, keine Tracking-Parameter.
      route: window.location.pathname.slice(0, 200),
      metric: metric.name,
      value: Math.max(0, metric.value),
      rating: metric.rating,
      navigation: metric.navigationType,
      device: window.matchMedia('(pointer: coarse)').matches ? 'mobile' : 'desktop',
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 40),
    };

    try {
      void fetch('/api/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {
        // Messung ist Beiwerk: ein fehlgeschlagener Report darf nichts kosten
        // und nichts melden.
      });
    } catch {
      /* siehe oben */
    }
  });

  return null;
}
