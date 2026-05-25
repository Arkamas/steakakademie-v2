/**
 * AuthorityOS — Niche Validator Types
 * ===================================================================
 * Single source of truth for every type that flows through the
 * validation pipeline.
 *
 * Layer flow:
 *   NicheInput
 *     → SeoMetrics + CompetitionMetrics + MonetizationMetrics + ContentMatchMetrics
 *     → ValidationMetrics
 *     → AuthorityScore
 *     → (if GREEN_LIGHT) BlueprintConfig
 *
 * Zod schemas (at bottom) handle runtime validation for anything
 * coming from outside the system (API calls, user input, MCP).
 * ===================================================================
 */

import { z } from 'zod';

// ─── ENUMS / UNION TYPES ─────────────────────────────────────────────────────

export type Language       = 'en' | 'de' | 'es' | 'fr' | 'it' | 'pt' | 'nl' | 'ja';
export type SeoProvider    = 'simulation' | 'serper' | 'semrush' | 'ahrefs' | 'dataforseo';
export type LlmProvider    = 'anthropic' | 'openai' | 'simulation';
export type SearchIntent   = 'informational' | 'navigational' | 'commercial' | 'transactional';
export type Verdict        = 'GREEN_LIGHT' | 'CAUTION' | 'STOP';
export type SaaSTierName   = 'core' | 'pro' | 'atlas';

export type SerpFeature =
  | 'featured_snippet'
  | 'people_also_ask'
  | 'video_carousel'
  | 'image_pack'
  | 'shopping_results'
  | 'knowledge_panel'
  | 'local_pack'
  | 'sitelinks';

// ─── INPUT ───────────────────────────────────────────────────────────────────

/**
 * Everything the validator needs to start work. Only `niche` is strictly
 * required; the rest provides context that sharpens the analysis.
 */
export interface NicheInput {
  /** Free-text niche, e.g. "single-origin coffee" or "ultralight backpacking" */
  niche: string;
  /** Primary content language (drives keyword sourcing) */
  language: Language;
  /** ISO-3166-1 alpha-2 country code, e.g. "US", "DE", "GB" */
  targetRegion: string;
  /** Optional budget hint (EUR) — influences blueprint scope */
  budgetEur?: number;
  /** Optional planning horizon (months) — defaults to 12 in engine */
  timeHorizonMonths?: number;
  /** Optional caller metadata — useful for queueing / billing */
  meta?: {
    userId?: string;
    sessionId?: string;
    source?: string;
  };
}

// ─── METRIC PRIMITIVES ───────────────────────────────────────────────────────

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  /** SEO difficulty 1–100 (provider-normalized) */
  difficulty: number;
  /** Estimated CPC in EUR (commercial signal) */
  cpc: number;
  intent: SearchIntent;
  serpFeatures: SerpFeature[];
}

export interface CompetitorProfile {
  domain: string;
  /** Domain authority / rating 0–100 */
  authority: number;
  estimatedTraffic: number;
  backlinks: number;
  /** Topical depth — 0–100, share of SERP they occupy in the niche */
  topicalDominance: number;
  monetizationModel: ('affiliate' | 'ads' | 'saas' | 'course' | 'sponsored')[];
}

// ─── METRIC GROUPS ───────────────────────────────────────────────────────────

export interface SeoMetrics {
  totalKeywordsFound: number;
  avgSearchVolume: number;
  /** Avg KD across the sampled set */
  avgDifficulty: number;
  /** Share of keywords with volume < 1k (long-tail leverage) */
  longTailRatio: number;
  /** Top-N representative keywords, ordered by opportunity */
  topKeywords: KeywordData[];
  /** Distribution of intent across the keyword set, sums to 1.0 */
  intentDistribution: Record<SearchIntent, number>;
  /** Frequency of each SERP feature across queried keywords */
  serpFeaturePresence: Record<SerpFeature, number>;
}

export interface CompetitionMetrics {
  topCompetitors: CompetitorProfile[];
  /** Avg authority across the top-10 SERP holders */
  avgDomainAuthority: number;
  /** Median backlink count of top-10 */
  medianBacklinks: number;
  /** 0–100 — how much white-space exists between competitors' content */
  contentGapScore: number;
  /** 0–100 — how saturated the SERP is (higher = harder) */
  saturationIndex: number;
  /** Number of competitors with weak E-E-A-T (vulnerable incumbents) */
  vulnerableIncumbentCount: number;
}

export interface AffiliateProjection {
  /** Average commission % across category typical affiliate programs */
  avgCommissionPct: number;
  /** Mean order value, EUR */
  avgOrderValueEur: number;
  /** Realistic clickthrough on commercial-intent pages */
  ctrEstimate: number;
  /** Realistic on-site conversion rate (click → purchase) */
  conversionEstimate: number;
  /** Monthly revenue at 10k visits */
  revenueAt10kVisits: number;
  /** Monthly revenue at 50k visits */
  revenueAt50kVisits: number;
}

export interface SaaSTierProjection {
  tier: SaaSTierName;
  /** Realistic MAU at month 12 if niche supports SaaS layer */
  estimatedMau: number;
  /** Conversion to paid */
  paidConversion: number;
  /** EUR / month */
  arpu: number;
  /** Projected MRR at month 12 (EUR) */
  projectedMrr: number;
}

export interface MonetizationMetrics {
  affiliate: AffiliateProjection;
  saasTiers: SaaSTierProjection[];
  /** Programmatic ad RPM in EUR (Mediavine/Raptive class) */
  adRpmEur: number;
  /** Digital product (course/ebook) feasibility 0–100 */
  digitalProductFeasibility: number;
  /** Sponsorship feasibility 0–100 */
  sponsorshipFeasibility: number;
  /** Composite monetization score 0–100 */
  compositeScore: number;
}

export interface ContentMatchMetrics {
  /** How well AI can produce authoritative content here 0–100 */
  aiContentSuitability: number;
  /** Evergreen vs. news-cycle content; 1.0 = fully evergreen */
  evergreenRatio: number;
  /** Required expertise level: 'low' easy to fake, 'high' needs real auth */
  expertiseRequired: 'low' | 'medium' | 'high';
  /** Schema.org structured-data leverage (e.g. Recipe, Product, HowTo) */
  schemaLeverage: number; // 0–100
  /** Topical breadth — how many distinct pillar areas exist */
  topicalBreadth: number;
}

/**
 * The full diagnostic surface. Produced by the engine before any
 * scoring or verdict logic is applied.
 */
export interface ValidationMetrics {
  seo: SeoMetrics;
  competition: CompetitionMetrics;
  monetization: MonetizationMetrics;
  contentMatch: ContentMatchMetrics;
}

// ─── SCORING ─────────────────────────────────────────────────────────────────

export interface AuthorityScore {
  /** 0–100 composite */
  overall: number;
  breakdown: {
    seo: number;
    competition: number;
    monetization: number;
    contentMatch: number;
  };
  verdict: Verdict;
  /** 0–1 — how confident the engine is in this verdict */
  confidence: number;
  /** Operator-facing rationale lines, ordered by importance */
  reasoning: string[];
  /** Specific red flags worth surfacing even on GREEN_LIGHT */
  warnings: string[];
  /** Suggested next-step copy for the operator */
  nextAction: string;
}

// ─── BLUEPRINT (emitted on GREEN_LIGHT) ──────────────────────────────────────

export interface PillarPageSpec {
  slug: string;
  title: string;
  targetKeyword: string;
  estimatedDifficulty: number;
  contentAngle: string;
  schemaType?: 'Article' | 'HowTo' | 'Recipe' | 'Product' | 'FAQPage' | 'Review';
  wordCountTarget: number;
}

export interface ContentPipelineSpec {
  /** Initial batch of pages to generate */
  initialBatchSize: number;
  /** Sustainable publishing cadence */
  cadencePerWeek: number;
  /** LLM model recommended for body generation */
  recommendedModel: string;
  /** Estimated total Anthropic spend EUR for the first 90 days */
  estimatedCostEur90d: number;
}

export interface MonetizationStackItem {
  type: 'affiliate' | 'ads' | 'saas' | 'product' | 'sponsorship';
  name: string;
  priority: 1 | 2 | 3;
  expectedTimeToFirstRevenueDays: number;
}

export interface DesignTokens {
  /** Primary palette name */
  paletteName: string;
  primaryHex: string;
  accentHex: string;
  surfaceDarkHex: string;
  /** Font-family pair (serif headings / body) */
  typographyPair: [string, string];
  /** Vibe descriptor — drives Flux image prompts */
  visualMood: string;
}

export interface BlueprintConfig {
  niche: string;
  language: Language;
  targetRegion: string;
  pillarPages: PillarPageSpec[];
  contentPipeline: ContentPipelineSpec;
  monetizationStack: MonetizationStackItem[];
  designTokens: DesignTokens;
  /** Expected months until first €1k MRR */
  estimatedTimeToProfitMonths: number;
  /** Hash of inputs — useful as cache key */
  fingerprint: string;
}

// ─── ENGINE OUTPUT (top-level return type) ───────────────────────────────────

export interface ValidationResult {
  input: NicheInput;
  metrics: ValidationMetrics;
  score: AuthorityScore;
  /** Only emitted when verdict === 'GREEN_LIGHT' */
  blueprint?: BlueprintConfig;
  /** Wall-clock duration of the full pipeline */
  durationMs: number;
  /** Versioning for downstream consumers */
  engineVersion: string;
}

// ─── RUNTIME SCHEMAS (Zod — for boundary validation) ─────────────────────────

export const NicheInputSchema = z.object({
  niche:             z.string().min(2).max(120),
  language:          z.enum(['en','de','es','fr','it','pt','nl','ja']),
  targetRegion:      z.string().length(2).toUpperCase(),
  budgetEur:         z.number().positive().max(1_000_000).optional(),
  timeHorizonMonths: z.number().int().min(1).max(60).optional(),
  meta: z.object({
    userId:    z.string().optional(),
    sessionId: z.string().optional(),
    source:    z.string().optional(),
  }).optional(),
}) satisfies z.ZodType<NicheInput>;

export const VerdictSchema = z.enum(['GREEN_LIGHT','CAUTION','STOP']);

// Verdict thresholds — exported so callers can render gauges, configure
// custom risk tolerance, or run scenario analysis without re-implementing.
export const SCORE_THRESHOLDS = {
  GREEN_LIGHT_MIN:  70,
  CAUTION_MIN:      50,
  PER_DIM_MIN_OK:   40,
  PER_DIM_MIN_WARN: 30,
} as const;
