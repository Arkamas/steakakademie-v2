/**
 * Niche Authority Validator — Schema
 *
 * Defines the structured analysis Claude produces for any niche.
 * Used by both server (streamObject) and client (useObject) sides.
 */

import { z } from 'zod';

export const NicheAnalysisSchema = z.object({
  niche: z.string().describe('The exact niche being analyzed, cleaned and normalized'),

  verdict: z.object({
    decision: z.enum(['Go', 'Caution', 'Skip']).describe('Honest call: would you build here?'),
    headline: z.string().describe('One sentence verdict, max 110 chars'),
  }),

  tam: z.object({
    annualMarketSize: z.string().describe('e.g., "$4.2B globally" or "€800M DACH"'),
    monthlySearchVolume: z.string().describe('e.g., "850K / month aggregate"'),
    rationale: z.string().describe('2 sentences explaining the estimate basis'),
  }),

  difficulty: z.object({
    overall: z.number().min(1).max(10).describe('1=trivial, 10=brutally saturated'),
    reasoning: z.string().describe('1 sentence: why this score'),
  }),

  pillarPages: z
    .array(
      z.object({
        title: z.string().describe('Human-readable page title'),
        targetKeyword: z.string().describe('Primary keyword phrase'),
        searchDifficulty: z.number().min(1).max(100).describe('Estimated KD score 1-100'),
        angle: z.string().describe('Why this content angle wins'),
      }),
    )
    .length(5)
    .describe('Exactly 5 high-leverage pillar pages, ordered by ROI'),

  personas: z
    .array(
      z.object({
        archetype: z.string().describe('Short label, e.g., "The Returning Hobbyist"'),
        description: z.string().describe('1-2 sentences. Specific human, not demographic.'),
        painPoint: z.string().describe('The frustration this audience repeatedly searches for'),
        buyingPower: z.enum(['Low', 'Medium', 'High', 'Premium']),
      }),
    )
    .length(3)
    .describe('Exactly 3 buyer archetypes'),

  competitors: z
    .array(
      z.object({
        name: z.string().describe('Real site, brand, or publication if known; descriptor if not'),
        strength: z.string().describe('What they do well'),
        weakness: z.string().describe('Where a new entrant can outflank them'),
      }),
    )
    .length(3),

  revenueProjection: z.object({
    conservative: z.string().describe('Realistic floor by month 12, e.g., "€600-1,200/mo"'),
    realistic: z.string().describe('Most likely outcome by month 12'),
    aggressive: z.string().describe('Upper bound with strong execution'),
    assumptions: z.string().describe('1 sentence: traffic & commission assumptions'),
  }),

  uniqueAngle: z.string().describe(
    'ONE contrarian insight or differentiating angle most builders will miss. Specific, not generic.',
  ),
});

export type NicheAnalysis = z.infer<typeof NicheAnalysisSchema>;

// ─── Helpers for UI ─────────────────────────────────────────────────────────

export const VERDICT_STYLE: Record<
  NicheAnalysis['verdict']['decision'],
  { color: string; bg: string; border: string; label: string }
> = {
  Go: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/40',
    label: 'GO',
  },
  Caution: {
    color: 'text-brand-gold',
    bg: 'bg-brand-gold/8',
    border: 'border-brand-gold/40',
    label: 'CAUTION',
  },
  Skip: {
    color: 'text-brand-fire',
    bg: 'bg-brand-fire/8',
    border: 'border-brand-fire/40',
    label: 'SKIP',
  },
};

export const BUYING_POWER_DOTS: Record<
  NicheAnalysis['personas'][number]['buyingPower'],
  number
> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Premium: 4,
};
