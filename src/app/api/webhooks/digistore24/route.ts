/**
 * Digistore24 Webhook — v3
 * ========================
 * POST /api/webhooks/digistore24?token=DIGISTORE_WEBHOOK_TOKEN
 *
 * Sicherheit: Secret-Token als URL-Parameter (Digistore24 Webhook-Typ
 * unterstützt keine sha_sign-Passphrase — nur der ältere IPN-Typ tut das).
 *
 * Webhook-URL in Digistore24 eintragen:
 *   https://steakakademie.de/api/webhooks/digistore24?token=<DIGISTORE_WEBHOOK_TOKEN>
 *
 * Env benötigt:
 *   DIGISTORE_WEBHOOK_TOKEN        — Secret-Token in der Webhook-URL
 *   SUPABASE_SERVICE_ROLE_KEY      — Service-Role (NICHT anon)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   LOOPS_API_KEY                  — Transactional E-Mail
 *   LOOPS_MAGIC_LINK_TEMPLATE_ID   — Template-ID des Magic-Link-Templates
 */

export const runtime  = 'nodejs';
export const dynamic  = 'force-dynamic';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const TOOL_REDIRECT: Record<string, string> = {
  'steuer-matrix':         'https://steakakademie.de/auth/callback?next=/steuer-matrix/rechner',
  'gruendung-sprint':      'https://steakakademie.de/auth/callback?next=/mein-system',
  'agentur-killer-sprint': 'https://steakakademie.de/auth/callback?next=/mein-system',
  'mein-protokoll':        'https://steakakademie.de/auth/callback?next=/mein-protokoll/fragebogen',
  'steak-beichte':         'https://steakakademie.de/auth/callback?next=/steak-beichte/diagnose',
};

const DEFAULT_REDIRECT = 'https://steakakademie.de/auth/callback?next=/mein-system';

/**
 * Steak-Beichte (Produkt A) — Credits-Modell (verbrauchbar, KEIN Course-Gate).
 * Modell A: getrennte product_ids pro Stufe.
 *   696394                          → 1 Credit (Einzeldiagnose 7€)
 *   DIGISTORE_PRODUCT_BEICHTE_5ER   → 5 Credits (5er-Pack 25€) — von Uwe nach Anlage gesetzt
 */
const CREDIT_PRODUCTS: Record<string, number> = {
  '696394': 1,
  ...(process.env.DIGISTORE_PRODUCT_BEICHTE_5ER
    ? { [process.env.DIGISTORE_PRODUCT_BEICHTE_5ER]: 5 }
    : {}),
};
const CREDIT_COURSE_SLUG = 'steak-beichte';

export async function POST(req: Request) {
  // Token-Verifikation via URL-Parameter
  const url   = new URL(req.url);
  const token = url.searchParams.get('token');
  const expectedToken = process.env.DIGISTORE_WEBHOOK_TOKEN;

  if (!expectedToken) {
    console.error('[ds-webhook] DIGISTORE_WEBHOOK_TOKEN not set');
    return new Response('Server misconfiguration', { status: 500 });
  }
  if (!token || token !== expectedToken) {
    console.warn('[ds-webhook] invalid or missing token');
    return new Response('Unauthorized', { status: 401 });
  }

  const rawBody = await req.text();
  const params  = Object.fromEntries(new URLSearchParams(rawBody));

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

  // 0) Credit-Produkte (Steak-Beichte) — eigener Pfad, kein Course-Gate.
  const creditAmount = CREDIT_PRODUCTS[productId];
  if (creditAmount) {
    return handleCreditProduct(supabase, {
      event, orderId, productId, email, params, rawBody, creditAmount,
    });
  }

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

// ─── Credit-Produkt-Handler (Steak-Beichte, Produkt A) ───────────────────────

async function handleCreditProduct(
  supabase: SupabaseClient,
  args: {
    event: string; orderId: string; productId: string; email: string;
    params: Record<string, string>; rawBody: string; creditAmount: number;
  },
): Promise<Response> {
  const { event, orderId, productId, email, params, rawBody, creditAmount } = args;

  // Order protokollieren (course_id null — Credits sind kein Course).
  // UNIQUE(ds_order_id, ds_event) → Idempotenz.
  const { data: orderRow, error: orderErr } = await supabase
    .from('digistore_orders')
    .insert({
      ds_order_id:       orderId,
      ds_product_id:     productId,
      ds_email:          email,
      ds_event:          event,
      course_id:         null,
      raw_payload:       params,
      raw_body:          rawBody,
      processing_status: 'pending',
      error_message:     `credit product: ${creditAmount} credit(s)`,
    })
    .select('id')
    .single();

  if (orderErr) {
    if (orderErr.code === '23505') {
      return new Response('OK (duplicate)', { status: 200 });
    }
    console.error('[ds-webhook] credit order insert failed', orderErr);
    return new Response('Internal error', { status: 500 });
  }

  try {
    if (event === 'on_payment' || event === 'on_rebill_resumed') {
      const userId = await ensureUser(supabase, email, CREDIT_COURSE_SLUG);

      const { error: grantErr } = await supabase.rpc('grant_diagnose_credits', {
        p_user_id: userId,
        p_amount:  creditAmount,
      });
      if (grantErr) throw new Error(`grant_diagnose_credits failed: ${grantErr.message}`);

      await sendMagicLink(supabase, email, CREDIT_COURSE_SLUG, 'deiner Steak-Beichte');

      await supabase
        .from('digistore_orders')
        .update({ processing_status: 'processed', processed_at: new Date().toISOString() })
        .eq('id', orderRow.id);

      return new Response('OK', { status: 200 });
    }

    if (event === 'on_refund' || event === 'on_chargeback') {
      const userId = await findUserId(supabase, email);
      if (!userId) throw new Error(`refund for unknown user: ${email}`);

      const { error: revokeErr } = await supabase.rpc('revoke_diagnose_credits', {
        p_user_id: userId,
        p_amount:  creditAmount,
      });
      if (revokeErr) throw new Error(`revoke_diagnose_credits failed: ${revokeErr.message}`);

      await supabase
        .from('digistore_orders')
        .update({ processing_status: 'processed', processed_at: new Date().toISOString() })
        .eq('id', orderRow.id);

      return new Response('OK', { status: 200 });
    }

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
    console.error('[ds-webhook] credit processing failed', err);
    await supabase
      .from('digistore_orders')
      .update({ processing_status: 'failed', error_message: err?.message ?? 'unknown error' })
      .eq('id', orderRow.id);
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
  const nextPath   = new URL(redirectTo).searchParams.get('next') ?? '/mein-system';

  const { data, error } = await supabase.auth.admin.generateLink({
    type:    'magiclink',
    email,
    options: { redirectTo },
  });
  if (error || !data?.properties?.hashed_token) {
    throw new Error(`magic link generation failed: ${error?.message}`);
  }

  // Eigenen Link auf unseren Callback bauen (token_hash → verifyOtp).
  // NICHT action_link nutzen: der liefert Tokens im URL-Hash, die ein
  // Server-Route-Handler nicht lesen kann → Login schlug fehl.
  const magicLink =
    `https://steakakademie.de/auth/callback` +
    `?token_hash=${encodeURIComponent(data.properties.hashed_token)}` +
    `&type=magiclink&next=${encodeURIComponent(nextPath)}`;

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
        magic_link:   magicLink,
        course_title: courseTitle ?? 'deinem Kurs',
      },
    }),
  });
  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`loops email failed (${resp.status}): ${errBody}`);
  }
}

// deploy: pick up Vercel env vars
