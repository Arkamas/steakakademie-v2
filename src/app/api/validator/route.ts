/**
 * POST /api/validator
 * ===================================================================
 * Runs the full AuthorityOS validation pipeline and returns a
 * ValidationResult JSON object.
 *
 * Request body: NicheInput (see src/types/validator.ts)
 *   { niche, language, targetRegion, budgetEur?, timeHorizonMonths?, meta? }
 *
 * Query params:
 *   ?mode=full       → use Anthropic for contentMatch (needs ANTHROPIC_API_KEY)
 *   ?blueprint       → force blueprint generation even for CAUTION verdicts
 *
 * Response: ValidationResult
 *   { input, metrics, score, blueprint?, durationMs, engineVersion }
 *
 * Rate limit: 10 req / hour / IP (in-process; replace with Upstash Redis
 * for production multi-instance deployments).
 * ===================================================================
 */

import { NextResponse }       from 'next/server';
import { ZodError }           from 'zod';
import { NicheInputSchema }   from '@/types/validator';
import { ValidatorEngine }    from '@/engine/validatorEngine';
import { SeoAnalyzer }        from '@/services/seoAnalyzer';
import { MonetizationEvaluator } from '@/services/monetizationEvaluator';
import { ContentMatchAnalyzer }  from '@/services/contentMatchAnalyzer';

export const runtime     = 'nodejs';
export const maxDuration = 30;

// ─── In-process rate limiter ──────────────────────────────────────────────────
// Ephemeral — resets on cold start, not shared across instances.
// Good enough for demo / MVP; swap Map → Upstash Redis before GA launch.

interface RateLimitEntry { count: number; resetAt: number }

const RL_WINDOW_MS = 60 * 60 * 1_000; // 1 hour
const RL_MAX_REQS  = 10;
const rlStore      = new Map<string, RateLimitEntry>();

function rateLimit(ip: string): { allowed: boolean; retryAfterSecs: number } {
  const now   = Date.now();
  const entry = rlStore.get(ip);

  if (!entry || entry.resetAt < now) {
    rlStore.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return { allowed: true, retryAfterSecs: 0 };
  }

  if (entry.count >= RL_MAX_REQS) {
    return { allowed: false, retryAfterSecs: Math.ceil((entry.resetAt - now) / 1_000) };
  }

  entry.count++;
  return { allowed: true, retryAfterSecs: 0 };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: Request) {

  // ── 1. Rate limit ──────────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  const { allowed, retryAfterSecs } = rateLimit(ip);

  const isDev = process.env.NODE_ENV === 'development';
  if (!allowed && !isDev) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSecs) } },
    );
  }

  // ── 2. Parse body ──────────────────────────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // ── 3. Validate input ──────────────────────────────────────────────────────
  const parsed = NicheInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:  'Input validation failed.',
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // ── 4. Resolve query-param options ────────────────────────────────────────
  const url            = new URL(req.url);
  const useFullMode    = url.searchParams.get('mode') === 'full';
  const forceBlueprint = url.searchParams.has('blueprint');

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (useFullMode && !apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured on this server. Use ?mode=simulation (default) or set the key.' },
      { status: 503 },
    );
  }

  // ── 5. Build engine ────────────────────────────────────────────────────────
  const engine = new ValidatorEngine({
    seo: new SeoAnalyzer({ provider: 'simulation' }),

    monetization: new MonetizationEvaluator(),

    contentMatch: new ContentMatchAnalyzer({
      provider: useFullMode ? 'anthropic' : 'simulation',
      apiKey:   useFullMode ? apiKey      : undefined,
    }),

    alwaysBuildBlueprint: forceBlueprint,
  });

  // ── 6. Run pipeline ────────────────────────────────────────────────────────
  try {
    const result = await engine.validate(input);

    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Simulation output is deterministic — safe to cache at CDN and browser.
    if (!useFullMode) {
      responseHeaders['Cache-Control'] = 'public, s-maxage=3600, stale-while-revalidate=86400';
    }

    return NextResponse.json(result, { headers: responseHeaders });

  } catch (err) {
    // Surface Zod errors from inside the engine (shouldn't happen after pre-validation,
    // but guard in case the engine re-parses or sub-services add stricter constraints).
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Internal schema mismatch.', issues: err.flatten() },
        { status: 422 },
      );
    }

    console.error('[POST /api/validator] pipeline error:', err);
    return NextResponse.json(
      { error: 'Validation pipeline failed. Check server logs.' },
      { status: 500 },
    );
  }
}

// ─── Method guard ─────────────────────────────────────────────────────────────

export function GET() {
  return NextResponse.json(
    {
      endpoint:   'POST /api/validator',
      version:    '0.1.0',
      bodySchema: {
        niche:             'string (2–120 chars, required)',
        language:          'en | de | es | fr | it | pt | nl | ja (required)',
        targetRegion:      'ISO-3166-1 alpha-2, e.g. "DE" (required)',
        budgetEur:         'number (optional)',
        timeHorizonMonths: 'integer 1–60 (optional)',
      },
      queryParams: {
        'mode=full': 'Use Anthropic LLM for contentMatch scoring (needs ANTHROPIC_API_KEY)',
        'blueprint': 'Force blueprint generation even for CAUTION verdicts',
      },
    },
    { status: 200 },
  );
}
