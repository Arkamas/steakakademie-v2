/**
 * AuthorityOS — Validator Engine
 * ===================================================================
 * The central decision core. Orchestrates the SEO + Monetization
 * services (and, when wired up, the LLM-driven Content-Match analyzer),
 * normalizes their outputs into a 0–100 Authority Score, and emits a
 * binary verdict that controls whether the automated content slam fires.
 *
 *   ValidatorEngine.validate(input)
 *     → ValidationMetrics
 *     → AuthorityScore
 *     → (if GREEN_LIGHT) BlueprintConfig
 *
 * Services are injected → fully testable, fully swappable.
 * The engine itself is stateless: safe for Vercel Functions, Workers,
 * worker pools, or local CLI use.
 * ===================================================================
 */

import type {
  NicheInput,
  ValidationMetrics,
  ValidationResult,
  AuthorityScore,
  Verdict,
  SeoMetrics,
  CompetitionMetrics,
  MonetizationMetrics,
  ContentMatchMetrics,
  BlueprintConfig,
  PillarPageSpec,
  ContentPipelineSpec,
  MonetizationStackItem,
  DesignTokens,
  LlmProvider,
  DataProvenance,
  ContentMatchSource,
} from '@/types/validator';
import {
  NicheInputSchema,
  SCORE_THRESHOLDS,
} from '@/types/validator';
import { SeoAnalyzer }              from '@/services/seoAnalyzer';
import { MonetizationEvaluator }    from '@/services/monetizationEvaluator';
import { ContentMatchAnalyzer }     from '@/services/contentMatchAnalyzer';

// ─── Engine config / DI ──────────────────────────────────────────────────────

export const ENGINE_VERSION = '0.1.0';

/**
 * Dimensions of the Authority Score and their default weights.
 * Tune from outside via `customWeights` to test different risk profiles.
 */
export interface ScoreWeights {
  seo:          number;
  competition:  number;
  monetization: number;
  contentMatch: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  seo:          0.30,
  competition:  0.25,
  monetization: 0.30,
  contentMatch: 0.15,
};

export interface ValidatorEngineConfig {
  seo:           SeoAnalyzer;
  monetization:  MonetizationEvaluator;
  /** Optional — wire up once ContentMatchAnalyzer service exists */
  contentMatch?: ContentMatchAnalyzerLike;
  /** Override the scoring weights — must sum to 1.0 */
  customWeights?: Partial<ScoreWeights>;
  /** When true, the blueprint is built even for CAUTION verdicts (dry-run) */
  alwaysBuildBlueprint?: boolean;
}

/**
 * Minimal interface the content-match service must satisfy.
 * Implementing class will live in `src/services/contentMatchAnalyzer.ts`
 * and call Anthropic / OpenAI under the hood.
 */
export interface ContentMatchAnalyzerLike {
  analyze(niche: string, language: string): Promise<ContentMatchMetrics>;
  /**
   * Optional — implementations that declare it get accurate provenance on the
   * ValidationResult. Omitting it reports the source as 'unknown'.
   */
  readonly provider?: LlmProvider;
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class ValidatorEngine {
  private readonly seo:           SeoAnalyzer;
  private readonly monetization:  MonetizationEvaluator;
  private readonly contentMatch:  ContentMatchAnalyzerLike | undefined;
  private readonly weights:       ScoreWeights;
  private readonly alwaysBuild:   boolean;

  constructor(config: ValidatorEngineConfig) {
    this.seo          = config.seo;
    this.monetization = config.monetization;
    this.contentMatch = config.contentMatch;
    this.alwaysBuild  = config.alwaysBuildBlueprint ?? false;

    const merged: ScoreWeights = { ...DEFAULT_WEIGHTS, ...config.customWeights };
    const sum = merged.seo + merged.competition + merged.monetization + merged.contentMatch;
    if (Math.abs(sum - 1.0) > 0.001) {
      throw new Error(`ValidatorEngine: weights must sum to 1.0 (got ${sum.toFixed(3)})`);
    }
    this.weights = merged;
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Run the full pipeline. This is the only method most callers ever touch.
   */
  async validate(input: NicheInput): Promise<ValidationResult> {
    const start = Date.now();
    const parsed = NicheInputSchema.parse(input); // throws on bad input

    // 1. Run independent analyses in parallel
    const [seoRaw, competition, contentMatch] = await Promise.all([
      this.seo.analyzeNiche(parsed.niche, parsed.language, parsed.targetRegion),
      this.seo.analyzeCompetition(parsed.niche, parsed.language, parsed.targetRegion),
      this.runContentMatch(parsed.niche, parsed.language),
    ]);

    // 2. Monetization depends on SEO output, so runs after
    const monetization = this.monetization.evaluate(parsed.niche, seoRaw);

    const metrics: ValidationMetrics = {
      seo: seoRaw,
      competition,
      monetization,
      contentMatch,
    };

    // 3. Score + verdict
    const score = this.computeAuthorityScore(metrics);

    // 4. Optional blueprint
    const blueprint = (score.verdict === 'GREEN_LIGHT' || this.alwaysBuild)
      ? this.buildBlueprint(parsed, metrics, score)
      : undefined;

    return {
      input: parsed,
      metrics,
      score,
      blueprint,
      durationMs:    Date.now() - start,
      engineVersion: ENGINE_VERSION,
      provenance:    this.describeProvenance(),
    };
  }

  /**
   * Report which source produced each metric block. Simulation providers emit
   * numbers shaped like market data, so a result that does not carry its own
   * provenance is indistinguishable from a live one.
   */
  private describeProvenance(): DataProvenance {
    const contentMatch: ContentMatchSource = this.contentMatch
      ? (this.contentMatch.provider ?? 'unknown')
      : 'heuristic';

    return {
      simulated:
        this.seo.provider === 'simulation' ||
        contentMatch === 'simulation' ||
        contentMatch === 'heuristic',
      seo:          this.seo.provider,
      contentMatch,
      monetization: 'derived',
    };
  }

  // ── Content-match — service or stub ─────────────────────────────────────

  private async runContentMatch(niche: string, language: string): Promise<ContentMatchMetrics> {
    if (this.contentMatch) {
      return this.contentMatch.analyze(niche, language);
    }
    // No content-match service wired yet → heuristic stub.
    // Replaces with real Claude/OpenAI call once ContentMatchAnalyzer ships.
    return this.heuristicContentMatch(niche);
  }

  private heuristicContentMatch(niche: string): ContentMatchMetrics {
    // Crude proxy: niches with concrete physical objects tend to be AI-friendly.
    const physicalSignals = ['recipe','grill','knife','watch','coffee','wine','tool','equipment','gear'];
    const opinionSignals  = ['politics','dating','spiritual','therapy','news'];
    const lower = niche.toLowerCase();

    const physicalHits = physicalSignals.reduce((n, t) => n + (lower.includes(t) ? 1 : 0), 0);
    const opinionHits  = opinionSignals.reduce ((n, t) => n + (lower.includes(t) ? 1 : 0), 0);

    const aiContentSuitability = Math.max(0, Math.min(100,
      55 + physicalHits * 12 - opinionHits * 25,
    ));

    return {
      aiContentSuitability,
      evergreenRatio:      opinionHits > 0 ? 0.4 : 0.85,
      expertiseRequired:   opinionHits > 0 ? 'high' : physicalHits > 0 ? 'medium' : 'medium',
      schemaLeverage:      physicalHits > 0 ? 80 : 50,
      topicalBreadth:      40 + physicalHits * 10,
    };
  }

  // ── Scoring ─────────────────────────────────────────────────────────────

  private computeAuthorityScore(metrics: ValidationMetrics): AuthorityScore {
    const seoScore          = this.normalizeSeo(metrics.seo);
    const competitionScore  = this.normalizeCompetition(metrics.competition);
    const monetizationScore = metrics.monetization.compositeScore;
    const contentMatchScore = this.normalizeContentMatch(metrics.contentMatch);

    const overall =
      seoScore          * this.weights.seo +
      competitionScore  * this.weights.competition +
      monetizationScore * this.weights.monetization +
      contentMatchScore * this.weights.contentMatch;

    const breakdown = {
      seo:          Math.round(seoScore),
      competition:  Math.round(competitionScore),
      monetization: Math.round(monetizationScore),
      contentMatch: Math.round(contentMatchScore),
    };

    const verdict    = this.deriveVerdict(overall, breakdown);
    const confidence = this.estimateConfidence(metrics, breakdown);

    return {
      overall:    Math.round(overall),
      breakdown,
      verdict,
      confidence: Number(confidence.toFixed(2)),
      reasoning:  this.buildReasoning(metrics, breakdown, verdict),
      warnings:   this.buildWarnings(metrics, breakdown),
      nextAction: this.buildNextAction(verdict, breakdown),
    };
  }

  // ── Dimension normalizers (raw metrics → 0–100) ─────────────────────────

  private normalizeSeo(s: SeoMetrics): number {
    // Volume head room (cap at 5000 avg)
    const volume    = Math.min(100, (s.avgSearchVolume / 5_000) * 100);
    // Long-tail leverage rewards >40% long-tail share
    const longTail  = Math.min(100, s.longTailRatio * 250);
    // Commercial intent quality
    const intent    = ((s.intentDistribution.commercial ?? 0) +
                       (s.intentDistribution.transactional ?? 0)) * 100 + 30;

    return Math.min(100,
      volume   * 0.40 +
      longTail * 0.30 +
      intent   * 0.30,
    );
  }

  private normalizeCompetition(c: CompetitionMetrics): number {
    // Lower saturation → higher score
    const saturationInverted = 100 - c.saturationIndex;
    // Big content gap is good
    const gap                = c.contentGapScore;
    // Vulnerable incumbents → exploitable
    const vulnerability      = Math.min(100, c.vulnerableIncumbentCount * 20);

    return Math.min(100,
      saturationInverted * 0.5 +
      gap                * 0.3 +
      vulnerability      * 0.2,
    );
  }

  private normalizeContentMatch(cm: ContentMatchMetrics): number {
    const expertisePenalty = cm.expertiseRequired === 'high' ? 30 : cm.expertiseRequired === 'medium' ? 10 : 0;
    return Math.min(100, Math.max(0,
      cm.aiContentSuitability * 0.50 +
      cm.evergreenRatio * 100 * 0.20 +
      cm.schemaLeverage * 0.15 +
      cm.topicalBreadth * 0.15 -
      expertisePenalty,
    ));
  }

  // ── Verdict & confidence ────────────────────────────────────────────────

  private deriveVerdict(overall: number, breakdown: AuthorityScore['breakdown']): Verdict {
    const dims    = Object.values(breakdown);
    const minDim  = Math.min(...dims);

    // Hard fail: a single dimension drops below the warn threshold
    if (minDim < SCORE_THRESHOLDS.PER_DIM_MIN_WARN)            return 'STOP';
    if (overall < SCORE_THRESHOLDS.CAUTION_MIN)                return 'STOP';
    if (overall < SCORE_THRESHOLDS.GREEN_LIGHT_MIN)            return 'CAUTION';
    if (minDim < SCORE_THRESHOLDS.PER_DIM_MIN_OK)              return 'CAUTION';

    return 'GREEN_LIGHT';
  }

  private estimateConfidence(metrics: ValidationMetrics, breakdown: AuthorityScore['breakdown']): number {
    // Confidence drops when (a) keyword sample is small, (b) dimensions disagree
    const sampleConfidence = Math.min(1, metrics.seo.totalKeywordsFound / 60);

    const dims = Object.values(breakdown);
    const mean = dims.reduce((a, b) => a + b, 0) / dims.length;
    const variance = dims.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dims.length;
    const agreement = Math.max(0, 1 - variance / 1000); // tighter spread → higher agreement

    return Math.min(1, sampleConfidence * 0.5 + agreement * 0.5);
  }

  // ── Operator-facing copy ────────────────────────────────────────────────

  private buildReasoning(m: ValidationMetrics, b: AuthorityScore['breakdown'], v: Verdict): string[] {
    const out: string[] = [];

    if (b.seo >= 70)      out.push(`Strong SEO surface: ${m.seo.totalKeywordsFound} keywords, ${m.seo.avgSearchVolume.toLocaleString()} avg volume, ${(m.seo.longTailRatio * 100).toFixed(0)}% long-tail leverage.`);
    else if (b.seo < 50)  out.push(`Weak keyword universe (${m.seo.totalKeywordsFound} keywords, ${m.seo.avgSearchVolume.toLocaleString()} avg volume). Volume floor too low to compound.`);

    if (b.competition >= 70) out.push(`Competitive landscape is exploitable: ${m.competition.vulnerableIncumbentCount} weak incumbents, content gap ${m.competition.contentGapScore}/100.`);
    else if (b.competition < 50) out.push(`SERP is saturated (${m.competition.saturationIndex}/100). Established players have ${m.competition.avgDomainAuthority} avg DA — entry will be expensive.`);

    if (b.monetization >= 70) out.push(`Strong monetization portfolio: affiliate ${m.monetization.affiliate.revenueAt10kVisits}€/mo at 10k visits, RPM ${m.monetization.adRpmEur}€.`);
    else if (b.monetization < 50) out.push(`Monetization ceiling is thin (composite ${m.monetization.compositeScore}/100). Affiliate alone won't carry the site.`);

    if (b.contentMatch >= 70) out.push(`AI content fits the niche cleanly — evergreen, structured, low-expertise risk.`);
    else if (b.contentMatch < 50) out.push(`Niche resists AI scaling: high expertise or low evergreen ratio.`);

    if (v === 'GREEN_LIGHT' && out.length === 0) out.push('All four dimensions pass thresholds without standouts. Solid average bet.');
    if (v === 'STOP'        && out.length === 0) out.push('Composite below 50 and / or a single dimension critically weak.');

    return out;
  }

  private buildWarnings(m: ValidationMetrics, b: AuthorityScore['breakdown']): string[] {
    const w: string[] = [];
    if (m.seo.avgDifficulty > 60)                 w.push(`Avg keyword difficulty ${m.seo.avgDifficulty}/100 — expect a 6+ month ramp.`);
    if (m.competition.avgDomainAuthority > 70)    w.push(`Top competitors avg DA ${m.competition.avgDomainAuthority} — outranking head terms unrealistic year 1.`);
    if (b.monetization < 40)                      w.push('Plan a second revenue lever beyond affiliate before launch.');
    if (m.contentMatch.expertiseRequired === 'high') w.push('Niche needs verified expert author or E-E-A-T signals will tank rankings.');
    return w;
  }

  private buildNextAction(v: Verdict, b: AuthorityScore['breakdown']): string {
    switch (v) {
      case 'GREEN_LIGHT':
        return 'Deploy AuthorityOS. Trigger initial content slam (50 pillar + cluster pages, 2 weeks).';
      case 'CAUTION': {
        const weakest = (Object.entries(b) as [keyof typeof b, number][])
          .sort((a, b) => a[1] - b[1])[0];
        return `Improve "${weakest[0]}" dimension or reposition niche before deploying. Run a second pass.`;
      }
      case 'STOP':
        return 'Skip this niche. Pick a different vertical and rerun the validator.';
    }
  }

  // ── Blueprint emission (GREEN_LIGHT only) ───────────────────────────────

  private buildBlueprint(input: NicheInput, m: ValidationMetrics, s: AuthorityScore): BlueprintConfig {
    const pillarPages       = this.buildPillarPages(m);
    const contentPipeline   = this.buildContentPipeline(m);
    const monetizationStack = this.buildMonetizationStack(m);
    const designTokens      = this.buildDesignTokens(input.niche);
    const fingerprint       = this.fingerprintInputs(input, s);

    // Time-to-profit estimate: weaker dimensions → longer ramp.
    const ramp =
      (s.breakdown.competition  < 60 ? 2 : 0) +
      (s.breakdown.seo          < 60 ? 2 : 0) +
      (s.breakdown.monetization < 60 ? 1 : 0);
    const estimatedTimeToProfitMonths = 4 + ramp;

    return {
      niche:        input.niche,
      language:     input.language,
      targetRegion: input.targetRegion,
      pillarPages,
      contentPipeline,
      monetizationStack,
      designTokens,
      estimatedTimeToProfitMonths,
      fingerprint,
    };
  }

  private buildPillarPages(m: ValidationMetrics): PillarPageSpec[] {
    return m.seo.topKeywords.slice(0, 5).map((kw, i) => ({
      slug:                 this.slugify(kw.keyword),
      title:                this.titleCase(kw.keyword),
      targetKeyword:        kw.keyword,
      estimatedDifficulty:  kw.difficulty,
      contentAngle:         this.angleFromIntent(kw.intent, kw.keyword),
      schemaType:           this.schemaFromIntent(kw.intent),
      wordCountTarget:      kw.intent === 'transactional' ? 2200 : 3200,
    } satisfies PillarPageSpec));
  }

  private buildContentPipeline(m: ValidationMetrics): ContentPipelineSpec {
    // Cost model: ~€0.02 per article body via Claude Haiku, ~€0.10 via Sonnet.
    // Default to Sonnet for the first 30 pages, Haiku for the long-tail tail.
    const initialBatchSize = 30;
    const cadencePerWeek   = 6;
    const totalIn90d       = initialBatchSize + cadencePerWeek * 12;
    const estimatedCostEur90d = Math.round(initialBatchSize * 0.10 + (totalIn90d - initialBatchSize) * 0.02);

    return {
      initialBatchSize,
      cadencePerWeek,
      recommendedModel: m.contentMatch.expertiseRequired === 'high'
        ? 'claude-sonnet-4-5'
        : 'claude-haiku-4-5',
      estimatedCostEur90d,
    };
  }

  private buildMonetizationStack(m: ValidationMetrics): MonetizationStackItem[] {
    const stack: MonetizationStackItem[] = [];

    if (m.monetization.affiliate.revenueAt10kVisits > 200) {
      stack.push({ type: 'affiliate', name: 'Amazon + direct partner programs', priority: 1, expectedTimeToFirstRevenueDays: 14 });
    }
    if (m.monetization.adRpmEur >= 18) {
      stack.push({ type: 'ads', name: 'Mediavine / Raptive (>50k sessions threshold)', priority: 2, expectedTimeToFirstRevenueDays: 90 });
    }
    if (m.monetization.saasTiers.length > 0 && m.monetization.saasTiers[0].projectedMrr > 500) {
      stack.push({ type: 'saas', name: 'AuthorityOS-style SaaS overlay', priority: 2, expectedTimeToFirstRevenueDays: 60 });
    }
    if (m.monetization.digitalProductFeasibility >= 70) {
      stack.push({ type: 'product', name: 'Premium course / ebook', priority: 3, expectedTimeToFirstRevenueDays: 120 });
    }
    if (m.monetization.sponsorshipFeasibility >= 70) {
      stack.push({ type: 'sponsorship', name: 'Newsletter / podcast sponsorship', priority: 3, expectedTimeToFirstRevenueDays: 180 });
    }
    return stack;
  }

  private buildDesignTokens(niche: string): DesignTokens {
    // Lookup table to be expanded; default = Bourbon-&-Tabak.
    const lower = niche.toLowerCase();
    if (/coffee|whisky|bourbon|cigar|bbq|steak|grill/.test(lower)) {
      return {
        paletteName:   'Bourbon & Tabak',
        primaryHex:    '#C8882A',
        accentHex:     '#E85018',
        surfaceDarkHex:'#0F0A06',
        typographyPair: ['Playfair Display', 'Source Serif 4'],
        visualMood:    'warm low-key, smoky highlights, aged leather, copper glow',
      };
    }
    if (/fitness|recovery|sleep|sauna|workout/.test(lower)) {
      return {
        paletteName:   'Clinical Edge',
        primaryHex:    '#1E88E5',
        accentHex:     '#00C853',
        surfaceDarkHex:'#0F1419',
        typographyPair: ['Inter', 'Source Sans 3'],
        visualMood:    'cool, precise, scientific minimalism, soft cyan accents',
      };
    }
    return {
      paletteName:   'Editorial Neutral',
      primaryHex:    '#1A1A1A',
      accentHex:     '#D4A373',
      surfaceDarkHex:'#0D0D0D',
      typographyPair: ['Inter', 'Source Serif 4'],
      visualMood:    'editorial monochrome with warm gold accent',
    };
  }

  // ── Misc helpers ────────────────────────────────────────────────────────

  private slugify(s: string): string {
    return s.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80);
  }

  private titleCase(s: string): string {
    return s.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
  }

  private angleFromIntent(intent: string, kw: string): string {
    switch (intent) {
      case 'transactional': return `Conversion-focused buyer guide for "${kw}" with comparison tables + affiliate CTAs.`;
      case 'commercial':    return `Pre-purchase research piece — pros/cons, brand comparisons, decision tree.`;
      case 'informational': return `Definitive educational resource — concept explanation, schema-rich, link magnet.`;
      default:              return `Branded entry-point page for "${kw}".`;
    }
  }

  private schemaFromIntent(intent: string): PillarPageSpec['schemaType'] {
    switch (intent) {
      case 'transactional': return 'Product';
      case 'commercial':    return 'Review';
      case 'informational': return 'HowTo';
      default:              return 'Article';
    }
  }

  private fingerprintInputs(input: NicheInput, score: AuthorityScore): string {
    const raw = `${input.niche}|${input.language}|${input.targetRegion}|${score.overall}|${ENGINE_VERSION}`;
    let h = 0;
    for (let i = 0; i < raw.length; i++) {
      h = ((h << 5) - h) + raw.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString(36);
  }
}

// ─── Factory helper ──────────────────────────────────────────────────────────
// Convenience for callers who don't want to wire services manually.

export function createDefaultEngine(opts: {
  seoProvider?:          'simulation' | 'serper' | 'semrush';
  seoApiKey?:            string;
  contentMatchProvider?: 'simulation' | 'anthropic';
  contentMatchApiKey?:   string;
} = {}): ValidatorEngine {
  return new ValidatorEngine({
    seo: new SeoAnalyzer({
      provider: opts.seoProvider ?? 'simulation',
      apiKey:   opts.seoApiKey,
    }),
    monetization: new MonetizationEvaluator(),
    contentMatch: new ContentMatchAnalyzer({
      provider: opts.contentMatchProvider ?? 'simulation',
      apiKey:   opts.contentMatchApiKey,
    }),
  });
}

// ─── Usage Example (commented — for docs / tests only) ──────────────────────
//
//   import { createDefaultEngine } from '@/engine/validatorEngine';
//
//   const engine = createDefaultEngine();         // simulation mode
//   const result = await engine.validate({
//     niche:        'single-origin coffee',
//     language:     'en',
//     targetRegion: 'US',
//   });
//
//   if (result.score.verdict === 'GREEN_LIGHT') {
//     console.log('Deploying blueprint:', result.blueprint?.fingerprint);
//   } else {
//     console.log('Verdict:', result.score.verdict);
//     console.log('Reasoning:', result.score.reasoning);
//   }
// ─────────────────────────────────────────────────────────────────────────────
