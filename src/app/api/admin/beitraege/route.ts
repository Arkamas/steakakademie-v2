// ── Beitrags-Moderation API (Stimmen aus der Praxis, Stufe 2) ────────────────
// GET   → listet Beitraege in der Warteschlange (status 'neu')
// PATCH → setzt status freigegeben|abgelehnt  (Body: { id, status })
// Auth: admin_auth Cookie === ADMIN_PASSWORD. Schreibt mit Service-Role —
// Clients haben per RLS bewusst kein UPDATE auf streitfall_beitraege.
//
// Konzept: docs/konzept-nutzerbeteiligung.md (Abschnitt 4 — Moderation).
// Kein E-Mail-Versand, keine Benachrichtigung an den Einsender: Wer freigibt,
// veroeffentlicht — mehr passiert hier nicht.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ beitraege: data ?? [] });
}

export async function PATCH(req: Request) {
  if (!authed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !['freigegeben', 'abgelehnt'].includes(status)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const supabase = service();
  const { error } = await supabase
    .from('streitfall_beitraege')
    .update({ status, moderated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
