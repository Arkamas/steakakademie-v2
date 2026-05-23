import { NextRequest, NextResponse } from 'next/server';

/**
 * Newsletter API — Loops.so Integration
 *
 * Loops.so Onboarding-Sequenz (7 E-Mails):
 *  Email #1 (sofort)  — Willkommen + erste Technik
 *  Email #2 (Tag 2)   — Persönlichkeits-Teaser (Aaron Franklin)
 *  Email #3 (Tag 4)   — Fehler-basierter Artikel → Steak-Rettung
 *  Email #4 (Tag 7)   — Bronze-Herausforderung CTA (Haupt-Conversion)
 *  Email #5 (Tag 10)  — Social Proof Story
 *  Email #6 (Tag 14)  — Marco-Widget Adoption
 *  Email #7 (Tag 21)  — Roadmap-Teaser + Feedback-Request
 *
 * Source-Tags für Segmentierung:
 *  mid-article           → hohes Content-Engagement
 *  persoenlichkeiten-*   → Persönlichkeits-Interesse
 *  simulation-final-cta  → Höchste Konversionsbereitschaft
 *  exit-intent           → Fast abgesprungen, dann doch Subscribe
 *  footer                → Niedriges Commitment (generisch)
 *  homepage-banner       → Direkt-Besucher
 */

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const LOOPS_API_URL = 'https://app.loops.so/api/v1/contacts/create';

// Map source → Loops mailing list IDs / user groups
const SOURCE_CONFIG: Record<string, { userGroup: string; tags: string[] }> = {
  'simulation-final-cta': { userGroup: 'high_intent', tags: ['simulation_completed', 'diplom_interest'] },
  'exit-intent': { userGroup: 'recovered', tags: ['exit_intent', 'newsletter'] },
  'mid-article': { userGroup: 'content_engaged', tags: ['newsletter', 'content_reader'] },
  'footer': { userGroup: 'newsletter', tags: ['newsletter'] },
  'homepage-banner': { userGroup: 'newsletter', tags: ['newsletter', 'homepage'] },
  default: { userGroup: 'newsletter', tags: ['newsletter'] },
};

export async function POST(req: NextRequest) {
  try {
    const { email, source = 'default' } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // If no Loops API key, return success (dev mode)
    if (!LOOPS_API_KEY) {
      console.log(`[Newsletter] DEV MODE — would subscribe: ${email} (source: ${source})`);
      return NextResponse.json({ success: true, dev: true });
    }

    const config = SOURCE_CONFIG[source] ?? SOURCE_CONFIG.default;

    const loopsPayload = {
      email: email.toLowerCase().trim(),
      source: `steakakademie-website-${source}`,
      userGroup: config.userGroup,
      // Custom attributes for segmentation
      subscribeSource: source,
      subscribeDate: new Date().toISOString(),
      // Loops mailing lists — configure in Loops dashboard
      mailingLists: {
        // Replace with actual Loops mailing list IDs from dashboard
        // cm_newsletter: true,        // Main newsletter
        // cm_diplom_onboarding: source === 'simulation-final-cta' || source === 'mid-article',
      },
    };

    const response = await fetch(LOOPS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify(loopsPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Loops returns 409 for existing subscribers — treat as success
      if (response.status === 409) {
        return NextResponse.json({ success: true, existing: true });
      }
      console.error('[Newsletter] Loops API error:', response.status, errorData);
      return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Newsletter] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
