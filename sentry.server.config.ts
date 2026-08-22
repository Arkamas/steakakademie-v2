/**
 * Sentry — Server-Runtime (Node.js)
 * =================================
 * Geladen aus src/instrumentation.ts, sobald NEXT_RUNTIME === 'nodejs'.
 * Auf Node instrumentiert Sentry das AI SDK automatisch — die KI-Routen
 * (kochwissen, steak-beichte, niche-validator, …) liefern Agent-Spans
 * ohne weitere Aenderung.
 *
 * Datenschutz (Art. 6 / Art. 32 DSGVO, Stand 21.08.2026):
 *   sendDefaultPii: false  → keine IP-Adressen, keine Cookies, keine Header
 *                            mit Nutzerbezug im Event.
 *   dataCollection.genAI   → Prompts und Antworten der KI-Routen werden NICHT
 *                            an Sentry uebertragen. Ein Nutzer koennte im Chat
 *                            Klarnamen eingeben — das verlaesst den Server
 *                            nicht. Entspricht recordInputs/recordOutputs:
 *                            false in src/app/api/chat/route.ts.
 *
 * Kosten: tracesSampleRate 0.1 in Produktion. Bei 1.0 ist das Free-Tier-
 * Kontingent innerhalb weniger Tage aufgebraucht.
 */
import * as Sentry from '@sentry/nextjs';

const isProd = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NODE_ENV,

  // Tracing ist Voraussetzung fuers Agent-Monitoring der KI-Routen.
  tracesSampleRate: isProd ? 0.1 : 1.0,

  sendDefaultPii: false,

  dataCollection: {
    genAI: { inputs: false, outputs: false },
  },

  debug: false,
});
