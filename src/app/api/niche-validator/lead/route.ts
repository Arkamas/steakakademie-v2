/**
 * POST /api/niche-validator/lead
 *
 * Captures a qualified lead from the Niche Validator tool.
 * Sends to Loops.so tagged for the AuthorityOS drip campaign,
 * with the niche analyzed as a custom attribute (used for personalization).
 */

import { NextRequest, NextResponse } from 'next/server';

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const LOOPS_API_URL = 'https://app.loops.so/api/v1/contacts/create';

interface LeadPayload {
  email?: string;
  niche?: string;
  verdict?: 'Go' | 'Caution' | 'Skip';
  difficulty?: number;
}

export async function POST(req: NextRequest) {
  let body: LeadPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const niche = body.niche?.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
  }

  if (!niche) {
    return NextResponse.json({ error: 'Niche is required.' }, { status: 400 });
  }

  // Dev mode: no Loops key → just log and succeed
  if (!LOOPS_API_KEY) {
    console.log(
      `[NicheValidator] DEV — would capture: ${email} | niche="${niche}" | verdict=${body.verdict ?? '?'}`,
    );
    return NextResponse.json({ success: true, dev: true });
  }

  const payload = {
    email,
    source: 'authorityos-niche-validator',
    userGroup: 'authorityos_lead',
    // Custom attributes — visible in Loops contact view, usable in templates
    nicheValidated: niche,
    nicheVerdict: body.verdict ?? 'Unknown',
    nicheDifficulty: body.difficulty ?? null,
    validatedAt: new Date().toISOString(),
  };

  const res = await fetch(LOOPS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LOOPS_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    // Existing contact → still a success for the user
    if (res.status === 409) {
      return NextResponse.json({ success: true, existing: true });
    }
    console.error('[NicheValidator] Loops error:', res.status, errBody);
    return NextResponse.json({ error: 'Subscription failed.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
