/**
 * Sentry — Browser
 * ================
 * Next.js 14 laedt diese Datei automatisch. (Ab Next 15.3 heisst sie
 * instrumentation-client.ts — beim Next-Upgrade umbenennen.)
 *
 * Faengt das, was der Server nie sieht: JS-Fehler im Browser der Besucher
 * (CTA-Buttons, Gutschein-Dialog, Safari-Eigenheiten).
 *
 * Der Sentry-Endpunkt MUSS in der CSP in next.config.mjs unter connect-src
 * stehen (https://*.ingest.de.sentry.io) — sonst blockiert der Browser jeden
 * Event-Versand still und das Dashboard bleibt leer.
 */
import * as Sentry from '@sentry/nextjs';

const isProd = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NODE_ENV,

  tracesSampleRate: isProd ? 0.1 : 1.0,

  sendDefaultPii: false,

  // Kein Session Replay: zeichnet die Seite mit und waere ohne Einwilligung
  // nicht zulaessig.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  debug: false,
});
