/**
 * TEMP-Verifikation Mein Protokoll — NACH dem Test sofort löschen!
 * GET /api/_mp_verify?secret=...&email=...
 * Führt exakt die kritischen Webhook-Schritte aus (Course-Grant + Magic-Link),
 * ohne Digistore-Token. Service-Role liegt bereits in der Function-Env.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';

const SECRET = 'mp_verify_7Qx2Lp9rZk4Tn8Wv3Bs6Yd1Hc5Fg0Jm';

export async function GET(req: Request) {
  const u = new URL(req.url);
  if (u.searchParams.get('secret') !== SECRET) return new Response('not found', { status: 404 });

  const email = (u.searchParams.get('email') ?? '').toLowerCase().trim();
  if (!email) return Response.json({ error: 'email required' }, { status: 400 });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // 1) User finden oder anlegen
  let userId: string | null = null;
  const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  userId = list?.users?.find((x) => x.email?.toLowerCase() === email)?.id ?? null;
  if (!userId) {
    const { data: created, error: cErr } = await sb.auth.admin.createUser({ email, email_confirm: true });
    if (cErr) return Response.json({ step: 'createUser', error: cErr.message }, { status: 500 });
    userId = created?.user?.id ?? null;
  }
  if (!userId) return Response.json({ step: 'user', error: 'no user id' }, { status: 500 });

  // 2) Course mein-protokoll
  const { data: course, error: coErr } = await sb
    .from('courses').select('id').eq('slug', 'mein-protokoll').maybeSingle();
  if (coErr || !course) return Response.json({ step: 'course', error: coErr?.message ?? 'missing' }, { status: 500 });

  // 3) Course-Grant (testet granted_at-Fix + RPC)
  const { data: bookingId, error: gErr } = await sb.rpc('grant_course_access', {
    p_user_id: userId, p_course_id: course.id,
  });
  if (gErr) return Response.json({ step: 'grant_course_access', error: gErr.message, code: (gErr as any).code }, { status: 500 });

  // 4) Magic-Link (token_hash) bauen → next = Fragebogen
  const { data: linkData, error: lErr } = await sb.auth.admin.generateLink({ type: 'magiclink', email });
  if (lErr) return Response.json({ step: 'generateLink', error: lErr.message, bookingId }, { status: 500 });
  const hashed = (linkData as any)?.properties?.hashed_token;
  const loginUrl = `https://steakakademie.de/auth/callback?token_hash=${hashed}&type=magiclink&next=${encodeURIComponent('/mein-protokoll/fragebogen')}`;

  return Response.json({ ok: true, userId, courseId: course.id, bookingId, loginUrl });
}
