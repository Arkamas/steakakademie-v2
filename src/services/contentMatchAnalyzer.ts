/**
 * AuthorityOS — Content Match Analyzer Service
 * ===================================================================
 * Evaluates how well a niche suits AI-driven content production.
 *
 * Five output dimensions (→ ContentMatchMetrics):
 *   aiContentSuitability  — AI authoring headroom 0–100
 *   evergreenRatio        — Time-stability 0–1.0 (1 = fully evergreen)
 *   expertiseRequired     — E-E-A-T barrier: low | medium | high
 *   schemaLeverage        — Applicable Schema.org richness 0–100
 *   topicalBreadth        — Count of distinct pillar areas (int)
 *
 * Provider strategy:
 *   simulation  (default) — deterministic signal-word scoring, no API calls
 *   anthropic             — structured output via claude-haiku (cheap + fast)
 *   openai                — stub (wire when @ai-sdk/openai is added)
 * ===================================================================
 */

import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z }               from 'zod';

import type { ContentMatchMetrics, LlmProvider } from '@/types/validator';
import type { ContentMatchAnalyzerLike }          from '@/engine/validatorEngine';

// ─── Config ───────────────────────────────────────────────────────────────────

export interface ContentMatchAnalyzerConfig {
  provider?: LlmProvider;
  apiKey?:   string;
  /** Override model — default: claude-haiku-4-5-20251001 */
  model?:    string;
  /** Per-request timeout in ms */
  timeoutMs?: number;
}

const DEFAULT_MODEL   = 'claude-haiku-4-5-20251001';
const DEFAULT_TIMEOUT = 10_000;

// ─── Zod schema for LLM structured output ─────────────────────────────────────

const ContentMatchSchema = z.object({
  aiContentSuitability: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('How well AI can produce authoritative, useful content in this niche (0=impossible, 100=perfect fit)'),
  evergreenRatio: z
    .number()
    .min(0)
    .max(1)
    .describe('Fraction of content that stays accurate long-term without updates (0=news cycle, 1=timeless)'),
  expertiseRequired: z
    .enum(['low', 'medium', 'high'])
    .describe('E-E-A-T barrier: low=basic lifestyle, medium=skilled hobby/trade, high=medical/legal/financial'),
  schemaLeverage: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('How richly applicable Schema.org types are (Recipe, HowTo, Product, Review, FAQPage)'),
  topicalBreadth: z
    .number()
    .int()
    .min(1)
    .max(15)
    .describe('Number of distinct content pillar areas the niche naturally supports'),
});

// ─── Signal vocabulary (simulation mode) ──────────────────────────────────────

/**
 * Each list drives a directional score delta.
 * Positive = boosts the metric; negative = penalises it.
 * Weights are relative; the scoring function normalises to 0–100.
 */

const AI_SUITABILITY_SIGNALS = {
  positive: [
    'recipe', 'guide', 'tutorial', 'how to', 'how-to', 'review', 'comparison',
    'tips', 'tricks', 'beginner', 'setup', 'basics', 'buying guide',
    'best of', 'top ', 'ranked', 'explained', 'overview', 'checklist',
    'gear', 'equipment', 'product', 'coffee', 'steak', 'bbq', 'grill',
    'knife', 'whisky', 'wine', 'fitness', 'workout', 'travel', 'hiking',
    'photography', 'gardening', 'baking', 'sourdough', 'aquarium',
  ],
  negative: [
    'news', 'breaking', 'politics', 'therapy', 'counselling', 'counseling',
    'legal advice', 'medical diagnosis', 'stock tips', 'investment advice',
    'prescription', 'litigation', 'crisis', 'mental health treatment',
  ],
};

const EVERGREEN_SIGNALS = {
  positive: [
    'history', 'fundamentals', 'basics', 'technique', 'method', 'classic',
    'traditional', 'how to', 'guide', 'tutorial', 'science of', 'anatomy',
    'explained', 'overview', 'timeless', 'beginner', 'intro',
  ],
  negative: [
    'news', 'trending', 'latest', 'breaking', 'this week', 'today',
    'current events', 'seasonal', '2023', '2024', '2025', '2026',
    'live', 'real-time', 'ticker',
  ],
};

const EXPERTISE_HIGH_SIGNALS = [
  'medical', 'clinical', 'diagnosis', 'prescription', 'pharmaceutical',
  'legal', 'law', 'attorney', 'litigation', 'contract',
  'financial advisor', 'tax advice', 'investment', 'securities', 'fiduciary',
  'security research', 'penetration testing', 'exploit',
  'engineering', 'structural', 'architecture license',
];

const EXPERTISE_LOW_SIGNALS = [
  'recipe', 'steak', 'bbq', 'grill', 'hobby', 'craft', 'beginner',
  'simple', 'easy', 'diy', 'starter', 'fun', 'lifestyle', 'travel',
  'fashion', 'home decor', 'garden', 'pet', 'aquarium', 'bonsai',
  'board game', 'vinyl', 'coffee', 'tea', 'whisky',
];

/**
 * Schema.org type clusters — each cluster carries its leverage score.
 * The niche must match ≥1 signal in the cluster to claim the score.
 */
const SCHEMA_CLUSTERS: Array<{ score: number; signals: string[] }> = [
  { score: 92, signals: ['recipe', 'steak', 'coffee', 'food', 'cooking', 'baking', 'bbq', 'grill', 'cuisine', 'sourdough', 'whisky', 'wine', 'tea'] },
  { score: 85, signals: ['product', 'gear', 'equipment', 'tool', 'device', 'gadget', 'camera', 'headphone', 'knife', 'thermometer', 'grill'] },
  { score: 80, signals: ['review', 'best', 'comparison', 'ranking', 'buying guide', 'top ', 'rated'] },
  { score: 75, signals: ['how to', 'how-to', 'tutorial', 'setup', 'installation', 'guide', 'anleitung'] },
  { score: 65, signals: ['faq', 'questions', 'explained', 'what is', 'was ist', 'definition'] },
  { score: 55, signals: ['workout', 'exercise', 'fitness', 'training', 'yoga', 'running', 'cycling'] },
  { score: 45, signals: ['travel', 'hiking', 'camping', 'adventure', 'outdoor'] },
  { score: 35, signals: ['finance', 'investing', 'etf', 'stock', 'crypto'] },
];

/**
 * Topical pillar clusters — each matching cluster counts as one pillar area.
 * topicalBreadth = number of clusters that fire.
 */
const PILLAR_CLUSTERS: Array<{ label: string; signals: string[] }> = [
  { label: 'techniques',   signals: ['technique', 'method', 'how to', 'approach', 'process', 'step'] },
  { label: 'equipment',    signals: ['equipment', 'gear', 'tool', 'kit', 'accessory', 'setup', 'device'] },
  { label: 'buying',       signals: ['best', 'review', 'buy', 'comparison', 'top', 'rated', 'buying'] },
  { label: 'ingredients',  signals: ['ingredient', 'material', 'supply', 'component', 'recipe'] },
  { label: 'troubleshoot', signals: ['fix', 'problem', 'issue', 'troubleshoot', 'error', 'repair'] },
  { label: 'nutrition',    signals: ['health', 'nutrition', 'benefit', 'calorie', 'protein', 'vitamin'] },
  { label: 'history',      signals: ['history', 'origin', 'tradition', 'culture', 'heritage', 'classic'] },
  { label: 'beginner',     signals: ['beginner', 'starter', 'basics', 'fundamentals', 'intro', 'learn'] },
  { label: 'advanced',     signals: ['advanced', 'professional', 'expert', 'master', 'competition'] },
  { label: 'community',    signals: ['community', 'forum', 'club', 'event', 'challenge', 'contest'] },
  { label: 'science',      signals: ['science', 'chemistry', 'physics', 'biology', 'research', 'study'] },
  { label: 'diy',          signals: ['diy', 'selber', 'selbst', 'build', 'make', 'craft', 'create'] },
];

// ─── Service ─────────────────────────────────────────────────────────────────

export class ContentMatchAnalyzer implements ContentMatchAnalyzerLike {
  /** Public so the engine can report provenance on every ValidationResult. */
  readonly provider:          LlmProvider;
  private readonly apiKey:    string | undefined;
  private readonly model:     string;
  private readonly timeoutMs: number;

  constructor(config: ContentMatchAnalyzerConfig = {}) {
    this.provider  = config.provider  ?? 'simulation';
    this.apiKey    = config.apiKey;
    this.model     = config.model     ?? DEFAULT_MODEL;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT;

    if (this.provider !== 'simulation' && !this.apiKey) {
      throw new Error(`ContentMatchAnalyzer: provider "${this.provider}" requires apiKey`);
    }
  }

  // ── Public API ──────────────────────────────────────────────────────────

  async analyze(niche: string, language: string): Promise<ContentMatchMetrics> {
    switch (this.provider) {
      case 'simulation': return this.simulateAnalysis(niche);
      case 'anthropic':  return this.analyzeWithAnthropic(niche, language);
      case 'openai':     throw new Error('ContentMatchAnalyzer: openai provider not yet implemented — add @ai-sdk/openai');
      default:
        throw new Error(`ContentMatchAnalyzer: unknown provider "${this.provider}"`);
    }
  }

  // ── Simulation ──────────────────────────────────────────────────────────

  private simulateAnalysis(niche: string): ContentMatchMetrics {
    const lower = niche.toLowerCase();

    const aiContentSuitability = this.scoreAiSuitability(lower);
    const evergreenRatio       = this.scoreEvergreenRatio(lower);
    const expertiseRequired    = this.classifyExpertise(lower);
    const schemaLeverage       = this.scoreSchemaLeverage(lower);
    const topicalBreadth       = this.countTopicalPillars(lower);

    return {
      aiContentSuitability,
      evergreenRatio,
      expertiseRequired,
      schemaLeverage,
      topicalBreadth,
    };
  }

  // ── Scoring helpers ─────────────────────────────────────────────────────

  private scoreAiSuitability(lower: string): number {
    let score = 55; // neutral baseline

    for (const signal of AI_SUITABILITY_SIGNALS.positive) {
      if (lower.includes(signal)) score += 6;
    }
    for (const signal of AI_SUITABILITY_SIGNALS.negative) {
      if (lower.includes(signal)) score -= 20;
    }

    // Cross-signal: high-expertise niches cap AI headroom
    const expertise = this.classifyExpertise(lower);
    if (expertise === 'high')   score = Math.min(score, 55);
    if (expertise === 'medium') score = Math.min(score, 85);

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  private scoreEvergreenRatio(lower: string): number {
    let score = 0.65; // most content niches lean evergreen

    for (const signal of EVERGREEN_SIGNALS.positive) {
      if (lower.includes(signal)) score += 0.06;
    }
    for (const signal of EVERGREEN_SIGNALS.negative) {
      if (lower.includes(signal)) score -= 0.15;
    }

    return Number(Math.min(1.0, Math.max(0.0, score)).toFixed(2));
  }

  private classifyExpertise(lower: string): 'low' | 'medium' | 'high' {
    const highHits = EXPERTISE_HIGH_SIGNALS.filter(s => lower.includes(s)).length;
    const lowHits  = EXPERTISE_LOW_SIGNALS.filter(s => lower.includes(s)).length;

    if (highHits >= 1)              return 'high';
    if (lowHits >= 2)               return 'low';
    if (lowHits >= 1 && highHits === 0) return 'low';
    return 'medium';
  }

  private scoreSchemaLeverage(lower: string): number {
    let best = 0;

    for (const cluster of SCHEMA_CLUSTERS) {
      const fires = cluster.signals.some(s => lower.includes(s));
      if (fires && cluster.score > best) best = cluster.score;
    }

    // Combine with all matching clusters (secondary bonus)
    const secondary = SCHEMA_CLUSTERS
      .filter(c => c.signals.some(s => lower.includes(s)) && c.score < best)
      .reduce((acc, c) => acc + c.score * 0.08, 0);

    return Math.round(Math.min(100, best + secondary));
  }

  private countTopicalPillars(lower: string): number {
    const fired = PILLAR_CLUSTERS.filter(cluster =>
      cluster.signals.some(s => lower.includes(s))
    ).length;

    // Every niche has at least 2 implied pillars (beginner intro + buying guide),
    // even when no explicit signals fire.
    return Math.max(2, Math.min(12, fired));
  }

  // ── Anthropic (real LLM call) ────────────────────────────────────────────

  private async analyzeWithAnthropic(niche: string, language: string): Promise<ContentMatchMetrics> {
    const client = createAnthropic({ apiKey: this.apiKey });

    const { object } = await generateObject({
      model:       client(this.model),
      schema:      ContentMatchSchema,
      maxTokens:   512,
      temperature: 0.2, // low temp → consistent ratings across runs
      system: `You are a content-strategy AI rating niches for AI-driven authority sites.
Return precise numeric scores — no hedging, no ranges.
Calibrate against real niches: "best kitchen knives" = suitability 90, expertise low, evergreen 0.85.
"medical diagnosis AI" = suitability 30, expertise high, evergreen 0.50.`,
      prompt: buildAnalysisPrompt(niche, language),
    });

    return {
      aiContentSuitability: object.aiContentSuitability,
      evergreenRatio:       object.evergreenRatio,
      expertiseRequired:    object.expertiseRequired,
      schemaLeverage:       object.schemaLeverage,
      topicalBreadth:       object.topicalBreadth,
    };
  }
}

// ─── Prompt builder ────────────────────────────────────────────────────────────

function buildAnalysisPrompt(niche: string, language: string): string {
  return `Evaluate this content niche for an AI-powered authority website:

Niche: "${niche}"
Primary language: ${language}

Rate it on five dimensions:

1. **aiContentSuitability** (0–100)
   How effectively can an LLM produce genuinely useful, authoritative content?
   Penalise niches needing real-world experience (live events, hands-on repair, breaking news).
   Reward niches with well-structured evergreen formats (recipes, buying guides, how-tos).

2. **evergreenRatio** (0.0–1.0)
   What fraction of the content will stay accurate without constant updates?
   News/trends/sports = near 0. Cooking techniques / gear reviews = 0.7–0.9.

3. **expertiseRequired** ("low" | "medium" | "high")
   - low:    Anyone can write it authentically (hobbies, lifestyle, simple recipes)
   - medium: Skilled practitioner knowledge needed (cooking techniques, photography, fitness)
   - high:   Regulated or high-stakes field (medical, legal, financial, advanced engineering)

4. **schemaLeverage** (0–100)
   How richly applicable are Schema.org types?
   Recipes (Recipe) = 90+. Products (Product + Review) = 85. How-To guides = 75.
   General articles with no structured schema = 30.

5. **topicalBreadth** (integer 1–15)
   How many distinct content pillar areas exist?
   "steak grilling" → techniques + cuts + equipment + recipes + sourcing + temperature = 6 pillars.
   "sous vide thermometer" → buying guide + setup + troubleshoot = 3 pillars.`;
}
