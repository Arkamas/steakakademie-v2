/**
 * POST /api/niche-validator/analyze
 *
 * Streams a structured NicheAnalysis object via Vercel AI SDK `streamObject`.
 * Client consumes via `experimental_useObject` from 'ai/react'.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { streamObject } from 'ai';
import { NextResponse } from 'next/server';
import { NicheAnalysisSchema } from '@/lib/niche-validator/schema';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/niche-validator/prompts';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured.' },
      { status: 500 },
    );
  }

  let niche: string | undefined;
  try {
    const body = await req.json();
    niche = typeof body?.niche === 'string' ? body.niche : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!niche || niche.trim().length < 2) {
    return NextResponse.json(
      { error: 'Niche must be at least 2 characters.' },
      { status: 400 },
    );
  }

  if (niche.length > 120) {
    return NextResponse.json(
      { error: 'Niche must be shorter than 120 characters.' },
      { status: 400 },
    );
  }

  const result = streamObject({
    model: anthropic('claude-sonnet-4-5'),
    schema: NicheAnalysisSchema,
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(niche),
    maxTokens: 2400,
    temperature: 0.4,
  });

  return result.toTextStreamResponse();
}
