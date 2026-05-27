/**
 * Digistore24 IPN Webhook — v2
 * ============================
 * POST /api/webhooks/digistore24
 *
 * Erwartet form-encoded Body mit Digistore-Standard-Parametern + sha_sign.
 * Signatur-Schema (siehe docs.digistore24.com → Notifications):
 *   1. Alle Parameter außer sha_sign alphabetisch nach Key sortieren
 *   2. Werte mit IPN-Passphrase als Separator joinen, Passphrase ans Ende
 *   3. SHA-512 hashen, UPPERCASE-Hex vergleichen
 *
 * Env benötigt:
 *   DIGISTORE_IPN_PASSPHRASE       — aus Digistore24 → Einstellungen → IPN
 *   SUPABASE_SERVICE_ROLE_KEY      — Service-Role (NICHT anon)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   LOOPS_API_KEY                  — Transactional E-Mail
 *   LOOPS_MAGIC_LINK_TEMPLATE_ID   — Template-ID des Magic-Link-Templates
 */

export const runtime  = 'nodejs';
export const dynamic  = 'force-dynamic';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const TOOL_REDIRECT: Record<string, string> = {
  'steuer-matrix':         'https://steakakademie.de/auth/callback?next=/steuer-matrix/rechner',
  'gruendung-sprint':      'https://steakakademie.de/auth/callback?next=/mein-system',
  'agentur-killer-sprint': 'https://steakakademie.de/auth/callback?next=/mein-system',
};

const DEFAULT_REDIRECT = 'https://steakakademie.de/auth/callback?next=/mein-system';

function verifyDigistoreSignature(
  params: Record<string, string>,
  passphrase: string,
): boolean {
  const received = params['sha_sign'];
  if (!received) return false;
  const keys   = Object.keys(params).filter((k) => k !== 'sha_sign').sort();
  const concat = keys.map((k) => params[k]).join(passphrase) + passphrase;
  const expected = createHash('sha512').update(concat, 'utf8').digest('hex').toUpperCase();
  return expected === received.toUpperCase();
}

export async function POST(req: Request) {
  const passphrase = process.env.DIGISTORE_IPN_PASSPHRASE;
  if (!passphrase) {
    console.error('[ds-webhook] DIGISTORE_IPN_PASSPHRASE not set');
    return new Response('Server misconfiguration', { status: 500 });
  }

  const rawBody = await req.text();
  const params  = Object.fromEntries(new URLSearchParams(rawBody));

  if (!verifyDigistoreSignature(params, passphrase)) {
    console.warn('[ds-webhook] signature verification failed', {
      order_id: params.order_id,
    });
    return new Response('Unauthorized', { status: 401 });
  }

  const event     = params.event;
  const orderId   = params.order_id;
  const productId = params.product_id;
  const email     = (params.email ?? params.buyer_email ?? '').toLowerCase().trim();

  if (!event || !orderId || !productId || !email) {
    return new Response('Missing required fields', { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // 1) Produkt → Course Mapping aus DB
  const { data: mapping } = await supabase
    .from('digistore_products')
    .select('course_id, courses(slug, title)')
    .eq('ds_product_id', productId)
    .maybeSingle();

  const courseId    = mapping?.course_id ?? null;
  const courseSlug  = (mapping?.courses as any)?.slug  ?? null;
  const courseTitle = (mapping?.courses as any)?.title ?? null;

  // 2) Order immer protokollieren — auch unbekannte Produkte (Forensik).
  //    UNIQUE(ds_order_id, ds_event) garantiert Idempotenz: zweiter Aufruf → 23505.
  const { data: orderRow, error: orderErr } = await supabase
    .from('digistore_orders')
    .insert({
      ds_order_id:        orderId,
      ds_product_id:      productId,
      ds_email:           email,
      ds_event:           event,
      course_id:          courseId,
      raw_payload:        params,
      raw_body:           rawBody,
      processing_status:  courseId ? 'pending' : 'failed',
      error_message:      courseId ? null : `Unknown product_id: ${productId}`,
    })
    .select('id')
    .single();

  if (orderErr) {
    if (orderErr.code === '23505') {
      return new Response('OK (duplicate)', { status: 200 });
    }
    console.error('[ds-webhook] order insert failed', orderErr);
    return new Response('Internal error', { status: 500 });
  }

  if (!courseId) {
    console.error('[ds-webhook] unknown product_id', productId);
    return new Response('OK (unknown product logged)', { status: 200 });
  }

  // 3) Event-Routing
  try {
    if (event === 'on_payment' || event === 'on_rebill_resumed') {
      const userId      = await ensureUser(supabase, email, courseSlug);

      const { data: bookingId, error: grantErr } = await supabase.rpc('grant_course_access', {
        p_user_id:   userId,
        p_course_id: courseId,
      });
      if (grantErr) throw new Error(`grant_course_access failed: ${grantErr.message}`);

      await sendMagicLink(supabase, email, courseSlug, courseTitle);

      await supabase
        .from('digistore_orders')
        .update({
          processing_status: 'processed',
          processed_at:      new Date().toISOString(),
          booking_id:        bookingId,
        })
        .eq('id', orderRow.id);

      return new Response('OK', { status: 200 });
    }

    if (event === 'on_refund' || event === 'on_chargeback') {
      const userId = await findUserId(supabase, email);
      if (!userId) throw new Error(`refund for unknown user: ${email}`);

      const { data: count, error: revokeErr } = await supabase.rpc('revoke_course_access', {
        p_user_id:   userId,
        p_course_id: courseId,
      });
      if (revokeErr) throw new Error(`revoke_course_access failed: ${revokeErr.message}`);
      if (count === 0) {
        console.warn('[ds-webhook] refund had no booking to revoke', { email, courseId });
      }

      await supabase
        .from('digistore_orders')
        .update({
          processing_status: 'processed',
          processed_at:      new Date().toISOString(),
        })
        .eq('id', orderRow.id);

      return new Response('OK', { status: 200 });
    }

    // Andere Events nur loggen (z.B. on_payment_missed)
    await supabase
      .from('digistore_orders')
      .update({
        processing_status: 'processed',
        processed_at:      new Date().toISOString(),
        error_message:     `event recorded, no action: ${event}`,
      })
      .eq('id', orderRow.id);

    return new Response('OK (event recorded)', { status: 200 });
  } catch (err: any) {
    console.error('[ds-webhook] processing failed', err);
    await supabase
      .from('digistore_orders')
      .update({
        processing_status: 'failed',
        error_message:     err?.message ?? 'unknown error',
      })
      .eq('id', orderRow.id);
    // 500 → Digistore retried
    return new Response('Processing failed', { status: 500 });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function findUserId(supabase: SupabaseClient, email: string): Promise<string | null> {
  const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  const found    = data?.users?.find((u) => u.email?.toLowerCase() === email);
  return found?.id ?? null;
}

async function ensureUser(
  supabase: SupabaseClient,
  email: string,
  courseSlug: string | null,
): Promise<string> {
  const existing = await findUserId(supabase, email);
  if (existing) return existing;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { source: 'digistore24', course: courseSlug ?? null },
  });
  if (error || !data?.user) {
    throw new Error(`createUser failed: ${error?.message}`);
  }
  return data.user.id;
}

async function sendMagicLink(
  supabase: SupabaseClient,
  email: string,
  courseSlug: string | null,
  courseTitle: string | null,
) {
  const redirectTo = (courseSlug && TOOL_REDIRECT[courseSlug]) ?? DEFAULT_REDIRECT;

  const { data, error } = await supabase.auth.admin.generateLink({
    type:    'magiclink',
    email,
    options: { redirectTo },
  });
  if (error || !data?.properties?.action_link) {
    throw new Error(`magic link generation failed: ${error?.message}`);
  }

  // generateLink GENERIERT — sendet NICHT. Loops macht den Versand.
  const apiKey     = process.env.LOOPS_API_KEY;
  const templateId = process.env.LOOPS_MAGIC_LINK_TEMPLATE_ID;
  if (!apiKey || !templateId) {
    throw new Error('LOOPS_API_KEY or LOOPS_MAGIC_LINK_TEMPLATE_ID not set');
  }

  const resp = await fetch('https://app.loops.so/api/v1/transactional', {
    method:  'POST',
    headers: {
      Authorization:   `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      transactionalId: templateId,
      email,
      dataVariables: {
        magic_link:   data.properties.action_link,
        course_title: courseTitle ?? 'deinem Kurs',
      },
    }),
  });
  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`loops email failed (${resp.status}): ${errBody}`);
  }
}
