import { NextRequest, NextResponse } from 'next/server';
import { verifyDOIToken } from '@/lib/doi';
import { NEWSLETTER_CONSENT_HISTORY, NEWSLETTER_CONSENT_VERSION } from '@/lib/newsletter-consent';

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
 * Konform mit DSGVO Art. 6 Abs. 1 lit. a und UWG § 7 Abs. 2 Nr. 2.
 *
 * BEWEISLAST (ergänzt im Rechts-Audit 28.08.2026):
 * Art. 7 Abs. 1 DSGVO verlangt, dass der Verantwortliche die Einwilligung
 * NACHWEISEN kann. `subscribed: true` allein ist ein Ergebnis, kein Nachweis.
 * Deshalb wird am Kontakt festgeschrieben:
 *   consentVersion · consentText · signupIp · signupAt · confirmIp · doiConfirmedAt
 * Die ersten vier Werte stammen aus dem HMAC-signierten Token und sind seit der
 * Anmeldung nachweislich unverändert.
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

  // ── Einwilligungsnachweis zusammenstellen (Art. 7 Abs. 1 DSGVO) ────────────
  // Alles außer der Bestätigungs-IP stammt aus dem HMAC-signierten Token und ist
  // damit nachweislich unverändert seit der Anmeldung. Der Volltext wird
  // mitgeschrieben, nicht nur die Versions-ID: Das Protokoll muss auch dann noch
  // aussagekräftig sein, wenn dieses Repository nicht mehr vorliegt.
  const confirmIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '';
  const consentVersion = payload.cv ?? NEWSLETTER_CONSENT_VERSION;
  const consentText = NEWSLETTER_CONSENT_HISTORY[consentVersion] ?? '';
  const consentEvidence = {
    consentVersion,
    consentText,
    signupIp: payload.ip ?? '',
    signupAt: new Date(payload.iat).toISOString(),
    confirmIp,
    doiConfirmedAt: new Date().toISOString(),
  };

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
          ...consentEvidence,
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
            ...consentEvidence,
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
