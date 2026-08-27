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
import { z } from 'zod';
import { guardRequest } from '@/lib/api/guard';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured.' },
      { status: 500 },
    );
  }

  // Sonnet + 2400 Output-Tokens pro Aufruf → knappes Limit.
  const guard = await guardRequest(req, {
    key: 'niche-validator',
    rate: { limit: 5, windowMs: 60 * 60_000 },
    schema: z.object({ niche: z.string().trim().min(2).max(120) }),
    maxBodyBytes: 4 * 1024,
  });
  if (!guard.ok) return guard.response;
  const { niche } = guard.body;

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
