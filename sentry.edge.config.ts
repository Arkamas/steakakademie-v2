/**
 * Sentry — Edge-Runtime
 * =====================
 * Betrifft /api/chat (Marco) — die Route laeuft bewusst auf Edge.
 *
 * WICHTIG (Unterschied zu Node): Auf Edge instrumentiert Sentry das AI SDK
 * NICHT automatisch. Die Integration muss hier explizit registriert werden,
 * UND jeder Aufruf braucht `experimental_telemetry: { isEnabled: true }` —
 * genau der Block, der in src/app/api/chat/route.ts bereits steht (mit
 * recordInputs/recordOutputs: false, DSGVO). Ohne beides entstehen keine
 * Spans, ohne Fehlermeldung.
 */
import * as Sentry from '@sentry/nextjs';

const isProd = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NODE_ENV,

  tracesSampleRate: isProd ? 0.1 : 1.0,

  sendDefaultPii: false,

  dataCollection: {
    genAI: { inputs: false, outputs: false },
  },

  integrations: [Sentry.vercelAIIntegration()],

  debug: false,
});
