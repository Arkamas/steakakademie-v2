/**
 * JS-Fehler — Sammelpunkt fuer Browser-Fehler echter Besucher.
 *
 * Gegenstueck zu src/components/analytics/JsErrors.tsx und
 * src/lib/fehler-melden.ts. Ersetzt den gebuendelten Sentry-Browser-Client
 * (61,7 kB gzip auf JEDER Seite) durch rund 1 kB eigenen Code; die Abwaegung
 * steht in src/lib/fehler-melden.ts.
 *
 * KEINE PERSONENBEZOGENEN DATEN: Pfad, Meldung, Stack wie vom Browser
 * geliefert, Browser-Familie, Geraeteklasse, Git-SHA. Keine IP, kein voller
 * User-Agent, keine Nutzer- oder Sitzungs-ID, keine Query-Parameter.
 *
 * SCHUTZ: guardRequest deckt Herkunft (same-origin), Rate-Limit pro IP,
 * Body-Groesse und Zod-Schema ab. Der Client deckelt sich zusaetzlich auf
 * fuenf Meldungen je Seitenaufruf — eine Fehlerschleife soll die Route nicht
 * fluten. Antwort immer 204 ohne Inhalt.
 */

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { guardRequest, jsonError } from '@/lib/api/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  kind: z.enum(['error', 'unhandledrejection', 'render']),
  message: z.string().min(1).max(500),
  stack: z.string().max(4000).optional(),
  source: z.string().max(300).optional(),
  lineno: z.number().int().nonnegative().max(10_000_000).optional(),
  colno: z.number().int().nonnegative().max(10_000_000).optional(),
  digest: z.string().max(64).optional(),
  route: z.string().min(1).max(200),
  browser: z.enum(['chrome', 'safari', 'firefox', 'edge', 'opera', 'andere']),
  device: z.enum(['mobile', 'desktop']),
  release: z.string().max(40).optional(),
});

export async function POST(request: Request): Promise<Response> {
  const guard = await guardRequest(request, {
    key: 'js-errors',
    // Der Client sendet hoechstens fuenf je Seitenaufruf; 60 pro 10 Minuten
    // laesst normales Surfen durch und deckelt Schleifen und Skripte.
    rate: { limit: 60, windowMs: 10 * 60 * 1000 },
    schema,
    maxBodyBytes: 8192,
  });
  if (!guard.ok) return guard.response;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Fehlende Konfiguration darf im Browser des Besuchers nichts ausloesen.
  if (!url || !serviceRoleKey) return new Response(null, { status: 204 });

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from('js_errors').insert({
    kind: guard.body.kind,
    message: guard.body.message,
    stack: guard.body.stack ?? null,
    source: guard.body.source ?? null,
    lineno: guard.body.lineno ?? null,
    colno: guard.body.colno ?? null,
    digest: guard.body.digest ?? null,
    route: guard.body.route,
    browser: guard.body.browser,
    device: guard.body.device,
    release: guard.body.release ?? null,
  });

  if (error) {
    console.warn('[js-errors] Insert fehlgeschlagen:', error.message);
    return jsonError(500, 'insert-failed');
  }

  return new Response(null, { status: 204 });
}
