/**
 * POST /api/foodpairing   (application/json)
 *
 * "Was passt zu X?" — liefert Zutaten, die mit der Eingabe die meisten
 * Aromamoleküle teilen (Food-Pairing-Prinzip nach Ahn et al. 2008).
 * Datenbasis: offenes Aroma-Netzwerk (siehe docs/foodpairing-steckbrief.md),
 * abgefragt über die RPC match_foodpairing (rein server-seitig, service_role).
 *
 * Body:    { zutat: string, limit?: number }
 * Antwort: { zutat, treffer: Array<{ partner, category, shared, shared_examples }> }
 *          404, wenn die Zutat nicht im Netzwerk ist.
 */

import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Pairing = {
  partner: string;
  category: string | null;
  shared: number;
  shared_examples: string[] | null;
};

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase-Konfiguration fehlt.' }, { status: 500 });
  }

  let zutat: string;
  let limit: number;
  try {
    const body = await req.json();
    zutat = String(body.zutat ?? '').trim();
    limit = Math.min(Math.max(parseInt(body.limit, 10) || 20, 1), 50);
    if (!zutat) throw new Error('leer');
  } catch {
    return NextResponse.json({ error: 'Ungültige Eingabe — "zutat" fehlt.' }, { status: 400 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data, error } = await admin.rpc('match_foodpairing', {
    p_ingredient: zutat,
    p_limit: limit,
  });

  if (error) {
    return NextResponse.json({ error: `Pairing fehlgeschlagen: ${error.message}` }, { status: 502 });
  }

  const treffer = (data ?? []) as Pairing[];
  if (treffer.length === 0) {
    return NextResponse.json(
      { error: `"${zutat}" ist (noch) nicht im Aroma-Netzwerk — kein Pairing möglich.` },
      { status: 404 },
    );
  }

  return NextResponse.json({ zutat, treffer });
}
