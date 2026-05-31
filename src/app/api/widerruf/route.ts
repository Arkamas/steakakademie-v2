/**
 * Widerrufsbutton — Eingangsverarbeitung (§ Button-Lösung Widerruf, ab 19.06.2026)
 * ===============================================================================
 * POST /api/widerruf
 *  1. Widerruf protokollieren (Tabelle `widerrufe`) → authoritative Eingangszeit.
 *  2. Elektronische Eingangsbestätigung per E-Mail (Loops), mit Datum/Uhrzeit.
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL · SUPABASE_SERVICE_ROLE_KEY
 *   LOOPS_API_KEY · LOOPS_WIDERRUF_TEMPLATE_ID  (Bestätigungs-Vorlage)
 *
 * Graceful: ohne Loops-Template wird trotzdem protokolliert + on-screen bestätigt.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 }); }

  const email    = String(body.email ?? '').trim().toLowerCase();
  const orderRef = String(body.orderRef ?? '').trim();
  const name     = String(body.name ?? '').trim().slice(0, 200);
  const product  = String(body.product ?? '').trim().slice(0, 300);
  const reason   = String(body.reason ?? '').trim().slice(0, 2000);

  // Identifikation: E-Mail ODER Bestell-/Vertragsnummer ist Pflicht.
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk && !orderRef) {
    return Response.json({ error: 'Bitte gib deine E-Mail-Adresse oder die Bestell-/Vertragsnummer an.' }, { status: 400 });
  }

  const receivedAt = new Date().toISOString();

  // 1) Protokollieren (Service-Role — RLS-geschützt)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    try {
      const supabase = createClient(url, key, { auth: { persistSession: false } });
      await supabase.from('widerrufe').insert({
        email: emailOk ? email : null,
        order_ref: orderRef || null,
        name: name || null,
        product: product || null,
        reason: reason || null,
        received_at: receivedAt,
      });
    } catch (e) {
      console.error('[widerruf] insert failed', e);
      // Nicht abbrechen — der Widerruf gilt trotzdem als eingegangen.
    }
  }

  // 2) Elektronische Eingangsbestätigung per E-Mail (nur wenn E-Mail + Template da)
  const apiKey     = process.env.LOOPS_API_KEY;
  const templateId = process.env.LOOPS_WIDERRUF_TEMPLATE_ID;
  let emailSent = false;
  if (emailOk && apiKey && templateId) {
    try {
      const d = new Date(receivedAt);
      const datum = d.toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
      const zeit  = d.toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' });
      const resp = await fetch('https://app.loops.so/api/v1/transactional', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionalId: templateId,
          email,
          dataVariables: {
            datum, zeit,
            order_ref: orderRef || '—',
            product:   product  || '—',
          },
        }),
      });
      emailSent = resp.ok;
      if (!resp.ok) console.error('[widerruf] loops failed', resp.status, await resp.text());
    } catch (e) {
      console.error('[widerruf] loops error', e);
    }
  }

  return Response.json({ ok: true, receivedAt, emailSent });
}
