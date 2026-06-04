// ── Rezept-Moderation API (Community-Einreichungen) ──────────────────────────
// GET   → listet zu prüfende User-Rezepte (status needs_review|pending)
// PATCH → setzt status approved|rejected  (Body: { id, status })
// Auth: admin_auth Cookie === ADMIN_PASSWORD. Schreibt mit Service-Role.

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
    .from('user_recipes')
    .select('id, slug, title, description, author_name, status, quality_score, moderation, ingredients, steps, created_at')
    .in('status', ['needs_review', 'pending'])
    .order('created_at', { ascending: false })
    .limit(80);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recipes: data ?? [] });
}

export async function PATCH(req: Request) {
  if (!authed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const supabase = service();
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'approved') patch.published_at = new Date().toISOString();

  const { error } = await supabase.from('user_recipes').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
