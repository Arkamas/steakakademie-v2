import { NextRequest, NextResponse } from 'next/server';
import { createDOIToken } from '@/lib/doi';

/**
 * Newsletter API — Loops.so Integration mit Double-Opt-In (DOI)
 *
 * DOI-Flow:
 *  1. POST /api/newsletter   → generiert signierten Token, schickt Bestätigungs-E-Mail
 *  2. GET  /api/newsletter/confirm?token=... → verifiziert Token, legt Kontakt in Loops an
 *
 * Benötigte Umgebungsvariablen (Vercel):
 *  LOOPS_API_KEY              — Loops.so API Key
 *  LOOPS_DOI_TEMPLATE_ID      — ID der transaktionalen Bestätigungs-E-Mail in Loops
 *  NEWSLETTER_DOI_SECRET      — HMAC-Geheimnis (min. 32 zufällige Zeichen)
 *  NEXT_PUBLIC_APP_URL        — z.B. https://steakakademie.de
 *
 * Loops-Onboarding-Sequenz (7 E-Mails — erst NACH DOI-Bestätigung):
 *  Email #1 (sofort)  — Willkommen + erste Technik
 *  Email #2 (Tag 2)   — Persönlichkeits-Teaser (Aaron Franklin)
 *  Email #3 (Tag 4)   — Fehler-basierter Artikel → Steak-Rettung
 *  Email #4 (Tag 7)   — Bronze-Herausforderung CTA (Haupt-Conversion)
 *  Email #5 (Tag 10)  — Social Proof Story
 *  Email #6 (Tag 14)  — Marco-Widget Adoption
 *  Email #7 (Tag 21)  — Roadmap-Teaser + Feedback-Request
 */

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const LOOPS_API_BASE = 'https://app.loops.so/api/v1';
const DOI_TEMPLATE_ID = process.env.LOOPS_DOI_TEMPLATE_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://steakakademie.de';

// Map source → Loops user groups for post-confirmation segmentation
const SOURCE_CONFIG: Record<string, { userGroup: string }> = {
  'simulation-final-cta': { userGroup: 'high_intent' },
  'exit-intent': { userGroup: 'recovered' },
  'mid-article': { userGroup: 'content_engaged' },
  'footer': { userGroup: 'newsletter' },
  'homepage-banner': { userGroup: 'newsletter' },
  default: { userGroup: 'newsletter' },
};

export async function POST(req: NextRequest) {
  try {
    const { email, source = 'default' } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Dev-Modus: kein Loops API Key → simulierte Antwort
    if (!LOOPS_API_KEY) {
      console.log(`[Newsletter] DEV MODE — DOI-E-Mail würde gesendet: ${normalizedEmail} (source: ${source})`);
      return NextResponse.json({ success: true, doi: true, dev: true });
    }

    // DOI-Token und Bestätigungs-URL generieren
    const token = createDOIToken(normalizedEmail);
    const confirmUrl = `${APP_URL}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
    const config = SOURCE_CONFIG[source] ?? SOURCE_CONFIG.default;

    // Bestätigungs-E-Mail via Loops transactional senden (BEVOR Kontakt angelegt wird)
    if (DOI_TEMPLATE_ID) {
      const txRes = await fetch(`${LOOPS_API_BASE}/transactional`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOOPS_API_KEY}`,
        },
        body: JSON.stringify({
          transactionalId: DOI_TEMPLATE_ID,
          email: normalizedEmail,
          dataVariables: {
            confirmUrl,
            source,
            userGroup: config.userGroup,
          },
        }),
      });
      if (!txRes.ok) {
        console.error('[Newsletter] Loops transactional error:', txRes.status, await txRes.text().catch(() => ''));
        // Nicht als Fehler für den User melden — DOI-E-Mail-Fehler sind intern
      }
    } else {
      console.warn(
        '[Newsletter] LOOPS_DOI_TEMPLATE_ID fehlt — Bestätigungs-E-Mail wird NICHT gesendet. ' +
        'Transaktionale E-Mail-Vorlage in Loops anlegen und ID in Vercel eintragen.',
      );
    }

    // Kontakt wird erst nach Bestätigung angelegt (in /api/newsletter/confirm)
    // Dadurch: kein Eintrag in Loops ohne nachgewiesene Einwilligung (DSGVO Art. 6 + UWG §7)
    return NextResponse.json({ success: true, doi: true });

  } catch (error) {
    console.error('[Newsletter] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
