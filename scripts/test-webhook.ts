/**
 * Lokaler Digistore24-Webhook-Tester
 * ===================================
 * Simuliert echte Digistore-IPNs mit korrekter SHA-512 Signatur.
 *
 * Liest DIGISTORE_IPN_PASSPHRASE automatisch aus .env.local.
 * Override via PowerShell: $env:DIGISTORE_IPN_PASSPHRASE = "..."
 *
 * Usage:
 *   $env:TEST_EMAIL = "vecmahr+webhooktest@gmail.com"  # optional
 *   npx tsx scripts/test-webhook.ts <scenario>
 *
 * Scenarios: payment | duplicate | refund | unknown | bad_sig | missing
 */

import { config as loadEnv } from 'dotenv';
import { createHash } from 'crypto';

// .env.local zuerst, dann fallback .env
loadEnv({ path: '.env.local' });
loadEnv();

const WEBHOOK_URL = process.env.WEBHOOK_URL ?? 'http://localhost:3000/api/webhooks/digistore24';
const PASSPHRASE  = process.env.DIGISTORE_IPN_PASSPHRASE;

if (!PASSPHRASE) {
  console.error('[X] Set DIGISTORE_IPN_PASSPHRASE env var');
  process.exit(1);
}

function sign(params: Record<string, string>, passphrase: string): string {
  const keys   = Object.keys(params).filter((k) => k !== 'sha_sign').sort();
  const concat = keys.map((k) => params[k]).join(passphrase) + passphrase;
  return createHash('sha512').update(concat, 'utf8').digest('hex').toUpperCase();
}

async function send(
  params: Record<string, string>,
  opts: { breakSig?: boolean } = {},
): Promise<{ status: number; body: string }> {
  const signed = {
    ...params,
    sha_sign: opts.breakSig ? 'INVALID_SIGNATURE_TEST' : sign(params, PASSPHRASE!),
  };
  const body = new URLSearchParams(signed).toString();

  console.log(`\n-> POST ${WEBHOOK_URL}`);
  console.log(`   event=${params.event ?? '(none)'} order=${params.order_id ?? '(none)'} product=${params.product_id ?? '(none)'}`);

  const resp = await fetch(WEBHOOK_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await resp.text();
  const ok   = resp.status === 200;
  console.log(`   ${ok ? '[OK]' : '[!!]'} ${resp.status} ${text}`);
  return { status: resp.status, body: text };
}

const baseEmail = process.env.TEST_EMAIL ?? `webhooktest+${Date.now()}@example.com`;
const orderId   = `TEST-${Date.now()}`;

const scenarios: Record<string, () => Promise<unknown>> = {
  // 1) Happy Path: Kauf
  payment: () =>
    send({
      event:            'on_payment',
      order_id:         orderId,
      product_id:       '695797',
      email:            baseEmail,
      buyer_first_name: 'Webhook',
      buyer_last_name:  'Tester',
      amount:           '197.00',
      currency:         'EUR',
    }),

  // 2) Idempotenz: zweimal denselben Kauf
  duplicate: async () => {
    const dup = {
      event:      'on_payment',
      order_id:   `DUP-${Date.now()}`,
      product_id: '695797',
      email:      baseEmail,
      amount:     '197.00',
      currency:   'EUR',
    };
    console.log('First call:');
    await send(dup);
    console.log('Second call (should be OK duplicate):');
    await send(dup);
  },

  // 3) Refund (REFUND_ORDER_ID muss eine Order aus vorigem 'payment'-Run sein)
  refund: () =>
    send({
      event:      'on_refund',
      order_id:   process.env.REFUND_ORDER_ID ?? orderId,
      product_id: '695797',
      email:      baseEmail,
      amount:     '-197.00',
      currency:   'EUR',
    }),

  // 4) Unbekanntes Produkt
  unknown: () =>
    send({
      event:      'on_payment',
      order_id:   `UNK-${Date.now()}`,
      product_id: '999999',
      email:      baseEmail,
      amount:     '99.00',
      currency:   'EUR',
    }),

  // 5) Kaputte Signatur (erwartet 401)
  bad_sig: () =>
    send(
      {
        event:      'on_payment',
        order_id:   `BAD-${Date.now()}`,
        product_id: '695797',
        email:      baseEmail,
      },
      { breakSig: true },
    ),

  // 6) Pflichtfeld fehlt (erwartet 400)
  missing: () =>
    send({
      event:    'on_payment',
      order_id: `MISS-${Date.now()}`,
      email:    baseEmail,
      // product_id absichtlich weggelassen
    } as Record<string, string>),
};

const scenario = process.argv[2];
if (!scenario || !scenarios[scenario]) {
  console.log('Usage: tsx scripts/test-webhook.ts <scenario>');
  console.log('Scenarios:', Object.keys(scenarios).join(', '));
  process.exit(1);
}

scenarios[scenario]()
  .then(() => console.log('\nDone.\n'))
  .catch((err) => {
    console.error('[X] Test failed:', err);
    process.exit(1);
  });
