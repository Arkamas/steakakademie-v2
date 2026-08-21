/**
 * OpenTelemetry-Registrierung fuer Next.js.
 *
 * Next ruft register() genau einmal beim Start jeder Runtime auf (Node und Edge
 * getrennt) — vor dem ersten Request. Das ist der einzige Zeitpunkt, zu dem sich
 * ein TracerProvider global setzen laesst.
 *
 * Warum es diese Datei braucht: Das AI SDK holt seinen Tracer ueber
 * trace.getTracer('ai') aus @opentelemetry/api (siehe ai/dist/index.mjs). Ist
 * kein Provider registriert, liefert das einen No-op-Tracer — die Spans aus
 * experimental_telemetry in src/app/api/chat/route.ts entstehen dann zwar, aber
 * niemand sammelt sie ein. Ohne diese Registrierung ist die Telemetrie dort
 * eingeschaltet und trotzdem wirkungslos.
 *
 * registerOTel exportiert auf Vercel automatisch in die Vercel-Observability;
 * lokal (ohne OTEL_EXPORTER_OTLP_ENDPOINT) faellt es auf einen No-op zurueck und
 * kostet nichts.
 *
 * Aufgezeichnet wird bewusst wenig: Der Chat setzt recordInputs/recordOutputs
 * auf false, es gehen also Modell, Dauer und Token-Zahlen raus — keine Prompts,
 * keine Antworten, nichts Personenbezogenes (DSGVO).
 */
export async function register() {
  const { registerOTel } = await import('@vercel/otel');
  registerOTel({ serviceName: 'steakakademie' });
}
