/**
 * Digistore24 IPN (Instant Payment Notification) Webhook
 * =========================================================
 * POST /api/webhooks/digistore24
 *
 * Digistore24 sendet einen HMAC-SHA256-signierten POST
 * bei jedem relevanten Bestellereignis.
 *
 * Env-Variables benötigt:
 *   DIGISTORE_IPN_SECRET   — aus Digistore24 Dashboard → Zahlungsintegration → IPN
 *   SUPABASE_SERVICE_ROLE  — service_role Key (NICHT anon key!)
 *
 * Events die verarbeitet werden:
 *   order_completed  → Zugang freischalten
 *   refund           → Zugang sperren
 *   chargeback       → Zugang sperren
 */

import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

// Slug-Mapping: Digistore24 Produkt-ID → Supabase Course Slug
// Eintragen sobald Produkte in Digistore24 angelegt sind
const PRODUCT_SLUG_MAP: Record<string, string> = {
  // 'DS_PRODUCT_ID_1': 'steuer-matrix',
  // 'DS_PRODUCT_ID_2': 'gruendung-sprint',
  // 'DS_PRODUCT_ID_3': 'agentur-killer-sprint',
};

function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    const expectedBuf = Buffer.from(expected, 'utf8');
    const sigBuf = Buffer.from(signature, 'utf8');
    if (expectedBuf.length !== sigBuf.length) return false;
    return timingSafeEqual(expectedBuf, sigBuf);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const secret = process.env.DIGISTORE_IPN_SECRET;
  if (!secret) {
    console.error('[digistore24] DIGISTORE_IPN_SECRET not configured');
    return new Response('Server misconfiguration', { status: 500 });
  }

  // Raw body für Signatur-Prüfung
  const rawBody = await req.text();
  const signature = req.headers.get('x-ds-signature') ?? '';

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn('[digistore24] Invalid signature — possible spoofed request');
    return new Response('Unauthorized', { status: 401 });
  }

  // Payload parsen (application/x-www-form-urlencoded oder JSON)
  let params: Record<string, string>;
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    params = JSON.parse(rawBody);
  } else {
    params = Object.fromEntries(new URLSearchParams(rawBody));
  }

  const {
    event,
    order_id,
    product_id,
    buyer_email: email,
  } = params as Record<string, string>;

  if (!order_id || !email || !product_id) {
    return new Response('Missing required fields', { status: 400 });
  }

  const courseSlug = PRODUCT_SLUG_MAP[product_id];
  if (!courseSlug) {
    // Unbekanntes Produkt — ignorieren ohne Fehler (andere DS-Produkte möglich)
    console.info(`[digistore24] Unknown product_id: ${product_id} — skipping`);
    return new Response('OK', { status: 200 });
  }

  // Service-Role Client — kann RLS bypassen
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
  );

  // Idempotenz: bereits verarbeitete Order überspringen
  const { data: existing } = await supabase
    .from('digistore_orders')
    .select('id')
    .eq('ds_order_id', order_id)
    .eq('ds_event', event)
    .maybeSingle();

  if (existing) {
    console.info(`[digistore24] Duplicate event ${event} for order ${order_id} — skipped`);
    return new Response('OK', { status: 200 });
  }

  let bookingId: string | null = null;

  if (event === 'order_completed') {
    const { data, error } = await supabase.rpc('grant_course_access', {
      p_email: email.toLowerCase().trim(),
      p_course_slug: courseSlug,
    });
    if (error) {
      console.error('[digistore24] grant_course_access failed:', error);
      return new Response('Internal error', { status: 500 });
    }
    bookingId = data;

    // Magic-Link-E-Mail versenden (Supabase Auth)
    const { error: emailError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase().trim(),
      options: {
        redirectTo: `https://steakakademie.de/steuer-matrix/rechner`,
        data: { source: 'digistore24', course: courseSlug },
      },
    });
    if (emailError) {
      // Nicht fatal — User kann später Magic Link anfordern
      console.warn('[digistore24] Magic link email failed:', emailError.message);
    }
  } else if (event === 'refund' || event === 'chargeback') {
    await supabase.rpc('revoke_course_access', {
      p_email: email.toLowerCase().trim(),
      p_course_slug: courseSlug,
    });
  }

  // Order loggen
  await supabase.from('digistore_orders').insert({
    ds_order_id:  order_id,
    ds_product_id: product_id,
    ds_email:     email.toLowerCase().trim(),
    ds_event:     event,
    course_slug:  courseSlug,
    booking_id:   bookingId,
    raw_payload:  params,
  });

  return new Response('OK', { status: 200 });
}
