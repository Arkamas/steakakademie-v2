'use client';

import { useRef } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

/** Messgroessen, die genau einmal je echtem Seitenaufruf entstehen. */
const LADEZEIT_METRIKEN = new Set(['TTFB', 'FCP', 'LCP']);

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
 * Drei Details, die leicht schiefgehen:
 *   1. `navigator.sendBeacon` scheidet aus: mit Content-Type application/json
 *      loest es einen Preflight aus, den ein Beacon nicht ausfuehren kann, und
 *      der Guard der Route besteht auf application/json. `fetch` mit
 *      `keepalive: true` ueberlebt den Seitenwechsel genauso und schickt den
 *      korrekten Header.
 *   2. CLS und INP werden erst beim Verlassen der Seite endgueltig gemeldet —
 *      genau deshalb ist `keepalive` Pflicht.
 *   3. TTFB, FCP und LCP gehoeren zum HARTEN Seitenaufruf, nicht zur Route,
 *      die gerade im Adressfeld steht. Dieses Bauteil haengt im Root-Layout und
 *      ueberlebt jede Soft-Navigation; Next meldet diese drei Werte dabei
 *      erneut. Ohne Gegenmassnahme landet derselbe Messwert unter mehreren
 *      Routen — am 08.09.2026 im Feld belegt: TTFB 2633 ms gleichzeitig unter
 *      /diplome/profil, /diplome/urkunde und /ueber-uns, obwohl nur ein
 *      einziger Server-Aufruf stattfand. Deshalb: je `metric.id` nur einmal
 *      senden und den Pfad des ersten Aufrufs festhalten. CLS und INP bleiben
 *      davon unberuehrt, sie duerfen sich im Verlauf einer Sitzung fortschreiben.
 */
export default function WebVitals() {
  // Pfad des harten Seitenaufrufs, eingefroren beim ersten Rendern.
  const startPfad = useRef<string | null>(null);
  // Bereits gesendete Ladezeit-Messungen, damit Soft-Navigationen nichts doppeln.
  const gesendet = useRef<Set<string>>(new Set());

  if (startPfad.current === null && typeof window !== 'undefined') {
    startPfad.current = window.location.pathname;
  }

  useReportWebVitals((metric) => {
    // Nur echte Besucher zaehlen; lokale Entwicklung wuerde die Werte verzerren.
    if (process.env.NODE_ENV !== 'production') return;
    // ... und nur die echte Domain. Ein lokal gestarteter Produktions-Build
    // (`npm run build && npm start`) hat ebenfalls NODE_ENV=production und
    // schrieb bis 08.09.2026 in dieselbe Tabelle: 34 Zeilen an einem Tag, alle
    // auf `/`, alle mit TTFB 3,7-5,7 s, weil dort ohne CDN und ueber die
    // Hausleitung gerendert wird. Solche Werte verderben jedes p75. Dasselbe
    // gilt fuer Preview-Deployments unter *.vercel.app.
    if (!/(^|\.)steakakademie\.de$/.test(window.location.hostname)) return;
    if (!['LCP', 'CLS', 'INP', 'FCP', 'TTFB'].includes(metric.name)) return;

    const istLadezeit = LADEZEIT_METRIKEN.has(metric.name);

    if (istLadezeit) {
      if (gesendet.current.has(metric.id)) return;
      gesendet.current.add(metric.id);
    }

    const body = {
      // Pfad ohne Query und Fragment — keine Suchbegriffe, keine Tracking-Parameter.
      // Ladezeiten gehoeren zum Pfad des harten Aufrufs, CLS/INP zum aktuellen.
      route: (istLadezeit
        ? startPfad.current ?? window.location.pathname
        : window.location.pathname
      ).slice(0, 200),
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
