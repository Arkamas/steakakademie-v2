/**
 * POST /api/streitfall-beitrag   (application/json)
 *
 * Stufe 2 der Nutzerbeteiligung: Ein Erfahrungsbericht je Nutzer und
 * Streitfall, maximal 600 Zeichen. Der Beitrag landet mit status 'neu' in der
 * Moderations-Warteschlange (/admin/beitraege) und erscheint erst nach
 * manueller Freigabe als "Stimme aus der Praxis".
 *
 * Flow:
 *  1. Auth — eingeloggter Nutzer (die UNIQUE-Bedingung haengt an der user_id)
 *  2. Input validieren (Zod: slug, anzeigename, beitrag)
 *  3. Insert ueber den normalen Server-Client — RLS erzwingt eigene user_id
 *     und status 'neu'; keine Service-Role noetig.
 *  4. UNIQUE-Verletzung (ein Beitrag pro Nutzer und Streitfall) → 409 mit
 *     freundlicher Meldung.
 *
 * HINWEIS: Livegang erst nach anwaltlicher DSA-Pruefung +
 * Nutzungsbedingungen-Update — die Einbindung auf der Streitfall-Seite haengt
 * am Flag STREITFALL_BEITRAEGE_ENABLED (setzt Uwe).
 *
 * Konzept: docs/konzept-nutzerbeteiligung.md
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const InputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Ungültiger Streitfall.'),
  // Anzeigename nach dem Muster "Thomas aus Kassel" — Vorname und Ort,
  // kein Nachname (Konzept, Abschnitt 5). Die redaktionelle Pruefung des
  // Namens passiert bei der Freigabe.
  anzeigename: z.string().trim().min(2).max(40),
  beitrag: z.string().trim().min(20).max(600),
});

export async function POST(req: Request) {
  // 0) Feature-Flag — das DSA-Gate gilt auch fuer direkte POSTs, nicht nur
  //    fuer die UI-Einbindung. Ohne Flag nimmt die API nichts an.
  if (process.env.STREITFALL_BEITRAEGE_ENABLED !== '1') {
    return NextResponse.json(
      { error: 'Erfahrungsberichte sind noch nicht freigeschaltet.' },
      { status: 403 },
    );
  }

  // 1) Auth
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Bitte melde dich an, um einen Beitrag zu schreiben.', needsLogin: true },
      { status: 401 },
    );
  }

  // 2) Input
  let input: z.infer<typeof InputSchema>;
  try {
    const body = await req.json();
    input = InputSchema.parse(body);
  } catch {
    return NextResponse.json(
      { error: 'Ungültige Eingabe. Der Beitrag braucht 20 bis 600 Zeichen und einen Anzeigenamen.' },
      { status: 400 },
    );
  }

  // 3) Insert — RLS greift: eigene user_id, status 'neu' (Default in der DB).
  const { error } = await supabase.from('streitfall_beitraege').insert({
    slug: input.slug,
    user_id: user.id,
    anzeigename: input.anzeigename,
    beitrag: input.beitrag,
  });

  if (error) {
    // 4) UNIQUE (slug, user_id) — ein Beitrag pro Nutzer und Streitfall.
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Du hast zu diesem Streitfall schon einen Beitrag geschrieben.' },
        { status: 409 },
      );
    }
    console.error('[streitfall-beitrag] insert failed', error);
    return NextResponse.json(
      { error: 'Speichern fehlgeschlagen. Bitte später erneut versuchen.' },
      { status: 500 },
    );
  }

  // Erwartungsmanagement laut Konzept: keine Benachrichtigung, kein Anspruch
  // auf Veroeffentlichung.
  return NextResponse.json({
    ok: true,
    message: 'Danke. Beiträge werden gelegentlich gesichtet, veröffentlicht wird nur eine Auswahl.',
  });
}
