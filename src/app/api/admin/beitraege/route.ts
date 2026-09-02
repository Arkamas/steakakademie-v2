// ── Beitrags-Moderation API (Stimmen aus der Praxis, Stufe 2) ────────────────
// GET   → listet Beitraege in der Warteschlange (status 'neu')
// PATCH → setzt status freigegeben|abgelehnt  (Body: { id, status })
// Auth: admin_auth Cookie === ADMIN_PASSWORD, zusaetzlich gated die Middleware
// jeden /api/admin/*-Pfad (src/middleware.ts). Schreibt mit Service-Role —
// Clients haben per RLS bewusst kein UPDATE auf streitfall_beitraege.
//
// Konzept: docs/konzept-nutzerbeteiligung.md (Abschnitt 4 — Moderation).
// Kein E-Mail-Versand, keine Benachrichtigung an den Einsender: Wer freigibt,
// veroeffentlicht — mehr passiert hier nicht.
//
// OFFEN, NICHT HIER BEHOBEN (Review 02.09.2026): Das Cookie enthaelt das
// Admin-Passwort im Klartext statt eines abgeleiteten Tokens, und sameSite ist
// nicht gesetzt (Browser-Default "Lax" traegt den CSRF-Schutz, nicht der Code).
// Beides betrifft alle sechs Admin-Routen und gehoert in einen eigenen Umbau.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/** id ist bigserial (Migration 20260830130000), status haengt am CHECK-Constraint. */
const PatchSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(['freigegeben', 'abgelehnt']),
});

function authed(): boolean {
  return cookies().get('admin_auth')?.value === process.env.ADMIN_PASSWORD;
}

function service() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function GET() {
  if (!authed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = service();
  const { data, error } = await supabase
    .from('streitfall_beitraege')
    .select('id, slug, anzeigename, beitrag, created_at')
    .eq('status', 'neu')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    // Keine DB-Interna nach aussen: die Postgres-Meldung nennt Tabellen,
    // Spalten und Fehlercodes. Serverseitig vollstaendig, im Response generisch.
    console.error('[admin/beitraege] select failed', error);
    return NextResponse.json({ error: 'Laden fehlgeschlagen.' }, { status: 500 });
  }
  return NextResponse.json({ beitraege: data ?? [] });
}

export async function PATCH(req: Request) {
  if (!authed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Kaputter oder fehlender Body warf bisher und wurde zum 500er. Ein
  // ungueltiger id-Typ lief bis in die Datenbank und kam als 22P02 zurueck.
  let input: z.infer<typeof PatchSchema>;
  try {
    input = PatchSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: 'Ungueltige Anfrage. Erwartet: { id: <Zahl>, status: "freigegeben" | "abgelehnt" }' },
      { status: 400 },
    );
  }

  const supabase = service();
  // .select().maybeSingle(): Ein update() ohne select liefert bei NULL Treffern
  // weder Daten noch Fehler — die Route meldete dann Erfolg fuer eine ID, die
  // es nicht gibt. Mit maybeSingle ist "nicht gefunden" von "erledigt"
  // unterscheidbar (single() waere hier falsch: es wirft bei 0 Zeilen).
  const { data, error } = await supabase
    .from('streitfall_beitraege')
    .update({ status: input.status, moderated_at: new Date().toISOString() })
    .eq('id', input.id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[admin/beitraege] update failed', error);
    return NextResponse.json({ error: 'Aktualisierung fehlgeschlagen.' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Beitrag nicht gefunden.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
