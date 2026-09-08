/**
 * Eigene JS-Fehlermeldung — Ersatz fuer den Sentry-Browser-Client.
 *
 * Entscheidung Uwe, 08.09.2026: Der gebuendelte Sentry-Client lag mit
 * 61,7 kB (gzip) in JEDER Seite, auch in reinen Inhaltsseiten ohne eigenes
 * JavaScript — gut die Haelfte des gemeinsamen 121-kB-Bundles. Tracing und
 * Replay waren bereits abgeschaltet; das war der Rest, den reine
 * Fehlererfassung kostet. Diese Datei erledigt dasselbe in rund 1 kB.
 *
 * WAS WIR DAFUER AUFGEBEN: symbolisierte Stacktraces (Source Maps),
 * Gruppierung gleichartiger Fehler, Alarm-E-Mails. Was bleibt: Meldung,
 * Stack wie ihn der Browser liefert, Pfad, Browser-Familie, Zeitpunkt.
 * Server-seitiges Sentry (API-Routen, KI-Monitoring) ist unberuehrt — dort
 * kostet die SDK kein Byte im Browser.
 *
 * KEIN PERSONENBEZUG: kein User-Agent im Original, keine IP, keine Nutzer-
 * oder Sitzungs-ID, keine Query-Parameter. Die Browser-Familie wird hier
 * grob abgeleitet (chrome/safari/firefox/edge/andere) — das reicht fuer
 * "geht nur im Safari kaputt" und identifiziert niemanden.
 */

export type FehlerArt = 'error' | 'unhandledrejection' | 'render';

type Meldung = {
  kind: FehlerArt;
  message: string;
  stack?: string;
  source?: string;
  lineno?: number;
  colno?: number;
  digest?: string;
};

function browserFamilie(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'edge';
  if (/OPR\/|Opera/.test(ua)) return 'opera';
  if (/Firefox\//.test(ua)) return 'firefox';
  if (/Chrome\//.test(ua)) return 'chrome';
  if (/Safari\//.test(ua)) return 'safari';
  return 'andere';
}

/** Verhindert, dass eine Fehlerschleife die Route flutet. */
let gesendet = 0;
const MAX_PRO_SEITE = 5;

export function meldeJsFehler(m: Meldung): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;
  if (gesendet >= MAX_PRO_SEITE) return;
  gesendet += 1;

  const body = {
    kind: m.kind,
    message: String(m.message ?? '').slice(0, 500),
    stack: m.stack ? String(m.stack).slice(0, 4000) : undefined,
    source: m.source ? String(m.source).slice(0, 300) : undefined,
    lineno: Number.isFinite(m.lineno) ? m.lineno : undefined,
    colno: Number.isFinite(m.colno) ? m.colno : undefined,
    digest: m.digest ? String(m.digest).slice(0, 64) : undefined,
    route: window.location.pathname.slice(0, 200),
    browser: browserFamilie(),
    device: window.matchMedia('(pointer: coarse)').matches ? 'mobile' : 'desktop',
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 40),
  };

  try {
    void fetch('/api/js-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {
      /* Eine verlorene Fehlermeldung darf keinen zweiten Fehler ausloesen. */
    });
  } catch {
    /* siehe oben */
  }
}
