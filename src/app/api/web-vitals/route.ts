/**
 * Web Vitals — Sammelpunkt fuer die Messwerte echter Besucher.
 *
 * Gegenstueck zu src/components/analytics/WebVitals.tsx. Der Client meldet je
 * Seitenaufruf bis zu fuenf Werte (LCP, CLS, INP, FCP, TTFB), diese Route
 * schreibt sie in public.web_vitals.
 *
 * WARUM SELBST GEBAUT UND NICHT GEKAUFT
 * Der Perf-Audit vom 02.09.2026 hat das Sentry-Browser-Tracing aus dem Bundle
 * geworfen (108 kB) — und damit die Web-Vitals-Messung gleich mit. Ein
 * externer Dienst waere ein neuer Auftragsverarbeiter (Eintrag in der
 * Datenschutzerklaerung, laufende Kosten). next/web-vitals steckt dagegen
 * bereits im Framework; der Zusatz im Client-Bundle liegt bei rund 1 kB.
 *
 * KEINE PERSONENBEZOGENEN DATEN
 * Gespeichert werden Pfad, Metrik, Wert, Bewertung, Navigationsart, Geraeteklasse
 * und Git-SHA. Nicht gespeichert werden IP, User-Agent, Session- oder Nutzer-ID.
 * Die IP sieht nur die Netzwerkschicht (Vercel, Supabase) — sie landet nirgends
 * in der Tabelle. Deshalb ist die Messung einwilligungsfrei.
 *
 * SCHUTZ
 * guardRequest deckt Herkunft (same-origin), Rate-Limit pro IP, Body-Groesse
 * und Zod-Schema ab. Die Route antwortet immer 204 ohne Inhalt — ein Client,
 * der Messwerte meldet, erwartet keine Antwort und soll auch keine auswerten
 * koennen.
 */

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { guardRequest, jsonError } from '@/lib/api/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  route: z.string().min(1).max(200),
  metric: z.enum(['LCP', 'CLS', 'INP', 'FCP', 'TTFB']),
  value: z.number().nonnegative().lt(3_600_000),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  navigation: z.enum([
    'navigate',
    'reload',
    'back-forward',
    'back-forward-cache',
    'prerender',
    'restore',
  ]),
  device: z.enum(['mobile', 'desktop']),
  release: z.string().max(40).optional(),
});

export async function POST(request: Request): Promise<Response> {
  const guard = await guardRequest(request, {
    key: 'web-vitals',
    // Ein Seitenaufruf meldet bis zu fuenf Werte; 120 pro 10 Minuten laesst
    // normales Surfen durch und deckelt Skript-Schleifen.
    rate: { limit: 120, windowMs: 10 * 60 * 1000 },
    schema,
    maxBodyBytes: 2048,
  });
  if (!guard.ok) return guard.response;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Fehlende Konfiguration darf keinen Fehler im Browser des Besuchers
  // ausloesen — die Messung ist Beiwerk, nicht Funktion.
  if (!url || !serviceRoleKey) return new Response(null, { status: 204 });

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from('web_vitals').insert({
    route: guard.body.route,
    metric: guard.body.metric,
    value: guard.body.value,
    rating: guard.body.rating,
    navigation: guard.body.navigation,
    device: guard.body.device,
    release: guard.body.release ?? null,
  });

  if (error) {
    // Nicht laut scheitern: der Besucher merkt davon nichts, und ein voller
    // Sentry-Alarm wegen einer verlorenen Messzeile waere Laerm.
    console.warn('[web-vitals] Insert fehlgeschlagen:', error.message);
    return jsonError(500, 'insert-failed');
  }

  return new Response(null, { status: 204 });
}
