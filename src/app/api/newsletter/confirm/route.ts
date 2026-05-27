import { NextRequest, NextResponse } from 'next/server';
import { verifyDOIToken } from '@/lib/doi';

/**
 * GET /api/newsletter/confirm?token=...
 *
 * Double-Opt-In Bestätigungs-Endpoint.
 * - Verifiziert den HMAC-signierten Token aus der Bestätigungs-E-Mail
 * - Prüft Tokenlaufzeit (max. 48 Stunden)
 * - Legt Kontakt in Loops an (subscribed: true)
 * - Leitet auf Homepage weiter
 *
 * RECHTLICHER HINWEIS:
 * Erst nach erfolgter Bestätigung hier wird der Kontakt in Loops angelegt.
 * Kein Kontakt in der Mailing-Liste ohne nachgewiesene Einwilligung.
 * Konform mit DSGVO Art. 6 Abs. 1 lit. a und UWG §7 Abs. 2 Nr. 3.
 */

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://steakakademie.de';

export async function GET(req: NextRequest) {
  const rawToken = req.nextUrl.searchParams.get('token');

  if (!rawToken) {
    return NextResponse.redirect(`${APP_URL}/?newsletter=invalid`);
  }

  const payload = verifyDOIToken(rawToken);
  if (!payload) {
    return NextResponse.redirect(`${APP_URL}/?newsletter=invalid`);
  }

  // Kontakt in Loops anlegen (subscribed: true — nachgewiesene Einwilligung)
  if (LOOPS_API_KEY) {
    try {
      const createRes = await fetch('https://app.loops.so/api/v1/contacts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOOPS_API_KEY}`,
        },
        body: JSON.stringify({
          email: payload.email,
          subscribed: true,
          source: `steakakademie-website-${payload.source ?? 'default'}-doi-confirmed`,
          userGroup: payload.userGroup ?? 'newsletter',
          doiConfirmedAt: new Date().toISOString(),
        }),
      });

      // 409 = Kontakt existiert bereits → update auf subscribed: true
      if (createRes.status === 409) {
        await fetch('https://app.loops.so/api/v1/contacts/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LOOPS_API_KEY}`,
          },
          body: JSON.stringify({
            email: payload.email,
            subscribed: true,
            doiConfirmedAt: new Date().toISOString(),
          }),
        });
      } else if (!createRes.ok) {
        console.error('[Newsletter/Confirm] Loops create error:', createRes.status);
      }
    } catch (err) {
      console.error('[Newsletter/Confirm] Loops API error:', err);
      // Nicht als Fehler für den User anzeigen — Weiterleitung trotzdem
    }
  } else {
    console.log(`[Newsletter/Confirm] DEV MODE — Kontakt würde angelegt: ${payload.email}`);
  }

  return NextResponse.redirect(`${APP_URL}/?newsletter=confirmed`);
}
