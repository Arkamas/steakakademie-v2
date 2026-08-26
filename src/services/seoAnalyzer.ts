/**
 * AuthorityOS — SEO Analyzer Service
 * ===================================================================
 * Pulls keyword universe + SERP intelligence for a given niche.
 *
 * Strategy pattern: one public class, swappable provider backends.
 *   - 'simulation' (default)  → deterministic mock data, no API calls
 *   - 'serper'                → real SERP via serper.dev
 *   - 'semrush' / 'ahrefs'    → real keyword universe + competition
 *   - 'dataforseo'            → unified alt (cheaper at scale)
 *
 * Simulation model is intentionally realistic:
 *   - Power-law volume distribution (Pareto 80/20 curve)
 *   - Intent inferred from keyword modifier signals, not random
 *   - Difficulty and CPC correlated to intent tier and volume
 *   - Deterministic: same niche string → same output (test-safe)
 * ===================================================================
 */

import type {
  Language,
  SeoMetrics,
  SeoProvider,
  KeywordData,
  SearchIntent,
  SerpFeature,
  CompetitorProfile,
  CompetitionMetrics,
} from '@/types/validator';

// ─── Config / DI ─────────────────────────────────────────────────────────────

export interface SeoAnalyzerConfig {
  provider?: SeoProvider;
  apiKey?:   string;
  /** Max keywords to request per analysis (cost control) */
  keywordLimit?: number;
  /** Max competitors to profile */
  competitorLimit?: number;
  /** Per-request timeout in ms */
  timeoutMs?: number;
}

const DEFAULTS = {
  provider:        'simulation' as SeoProvider,
  keywordLimit:    100,
  competitorLimit: 10,
  timeoutMs:       12_000,
};

// ─── Intent signal vocabulary ─────────────────────────────────────────────────
// Each modifier list is ordered: earlier entries get stronger signal weight.
// Multilingual: covers EN + DE (most AuthorityOS niches are one or both).

const INTENT_SIGNALS: Record<SearchIntent, string[]> = {
  transactional: [
    // EN
    'buy', 'order', 'shop', 'purchase', 'price', 'cheap', 'deal',
    'discount', 'sale', 'coupon', 'amazon', 'ebay', 'store',
    // DE
    'kaufen', 'bestellen', 'preis', 'günstig', 'billig', 'angebot',
    'rabatt', 'versand', 'lieferung', 'shop',
  ],
  commercial: [
    // EN
    'best', 'top', 'review', 'vs', 'comparison', 'alternative',
    'worth it', 'should i', 'recommendation', 'ranking', 'rated',
    // DE
    'beste', 'besten', 'vergleich', 'test', 'empfehlung', 'lohnt',
    'lohnenswert', 'erfahrung', 'erfahrungen', 'bewertung', 'alternativ',
    'welches', 'welcher', 'welche',
  ],
  informational: [
    // EN
    'how', 'what is', 'why', 'guide', 'tutorial', 'tips', 'tricks',
    'beginner', 'learn', 'basics', 'explained', 'overview', 'meaning',
    // DE
    'wie', 'was ist', 'warum', 'anleitung', 'tipps', 'tricks',
    'anfänger', 'lernen', 'grundlagen', 'erklärt', 'selber',
    'selbst', 'diy', 'verstehen',
  ],
  navigational: [
    '.com', '.de', '.co.uk', 'login', 'account', 'official',
    'website', 'homepage', 'app', 'offiziel',
  ],
};

// ─── Keyword template groups ──────────────────────────────────────────────────
// Each template has a declared base intent + volume tier.
// Volume tier determines realistic search volume range:
//   head  → 8 000–50 000/mo (competitive head terms)
//   mid   → 400–5 000/mo   (body of the niche)
//   tail  → 30–400/mo      (long-tail opportunities)

interface TemplateSpec {
  tpl:        (n: string) => string;
  baseIntent: SearchIntent;
  tier:       'head' | 'mid' | 'tail';
}

const TEMPLATE_GROUPS_EN: TemplateSpec[] = [
  // ── Head ──
  { tpl: n => `best ${n}`,              baseIntent: 'commercial',    tier: 'head' },
  { tpl: n => `${n} review`,            baseIntent: 'commercial',    tier: 'head' },
  { tpl: n => `buy ${n}`,               baseIntent: 'transactional', tier: 'head' },

  // ── Mid ──
  { tpl: n => `${n} vs`,                baseIntent: 'commercial',    tier: 'mid'  },
  { tpl: n => `${n} guide`,             baseIntent: 'informational', tier: 'mid'  },
  { tpl: n => `${n} for beginners`,     baseIntent: 'informational', tier: 'mid'  },
  { tpl: n => `how to ${n}`,            baseIntent: 'informational', tier: 'mid'  },
  { tpl: n => `${n} tips`,              baseIntent: 'informational', tier: 'mid'  },
  { tpl: n => `${n} price`,             baseIntent: 'transactional', tier: 'mid'  },
  { tpl: n => `cheap ${n}`,             baseIntent: 'transactional', tier: 'mid'  },
  { tpl: n => `${n} comparison`,        baseIntent: 'commercial',    tier: 'mid'  },
  { tpl: n => `${n} worth it`,          baseIntent: 'commercial',    tier: 'mid'  },
  { tpl: n => `${n} 2026`,              baseIntent: 'commercial',    tier: 'mid'  },

  // ── Tail ──
  { tpl: n => `what is ${n}`,           baseIntent: 'informational', tier: 'tail' },
  { tpl: n => `${n} tutorial`,          baseIntent: 'informational', tier: 'tail' },
  { tpl: n => `${n} explained`,         baseIntent: 'informational', tier: 'tail' },
  { tpl: n => `${n} setup`,             baseIntent: 'informational', tier: 'tail' },
  { tpl: n => `${n} mistakes`,          baseIntent: 'informational', tier: 'tail' },
  { tpl: n => `${n} alternative`,       baseIntent: 'commercial',    tier: 'tail' },
  { tpl: n => `professional ${n}`,      baseIntent: 'commercial',    tier: 'tail' },
  { tpl: n => `${n} deal`,              baseIntent: 'transactional', tier: 'tail' },
  { tpl: n => `${n} discount`,          baseIntent: 'transactional', tier: 'tail' },
  { tpl: n => `is ${n} worth it`,       baseIntent: 'commercial',    tier: 'tail' },
];

const TEMPLATE_GROUPS_DE: TemplateSpec[] = [
  // ── Head ──
  { tpl: n => `beste ${n}`,             baseIntent: 'commercial',    tier: 'head' },
  { tpl: n => `${n} test`,              baseIntent: 'commercial',    tier: 'head' },
  { tpl: n => `${n} kaufen`,            baseIntent: 'transactional', tier: 'head' },

  // ── Mid ──
  { tpl: n => `${n} vergleich`,         baseIntent: 'commercial',    tier: 'mid'  },
  { tpl: n => `${n} empfehlung`,        baseIntent: 'commercial',    tier: 'mid'  },
  { tpl: n => `${n} anleitung`,         baseIntent: 'informational', tier: 'mid'  },
  { tpl: n => `wie ${n}`,               baseIntent: 'informational', tier: 'mid'  },
  { tpl: n => `${n} tipps`,             baseIntent: 'informational', tier: 'mid'  },
  { tpl: n => `${n} preis`,             baseIntent: 'transactional', tier: 'mid'  },
  { tpl: n => `günstig ${n}`,           baseIntent: 'transactional', tier: 'mid'  },
  { tpl: n => `${n} erfahrungen`,       baseIntent: 'commercial',    tier: 'mid'  },
  { tpl: n => `${n} lohnt sich`,        baseIntent: 'commercial',    tier: 'mid'  },
  { tpl: n => `${n} 2026`,              baseIntent: 'commercial',    tier: 'mid'  },

  // ── Tail ──
  { tpl: n => `was ist ${n}`,           baseIntent: 'informational', tier: 'tail' },
  { tpl: n => `${n} tutorial`,          baseIntent: 'informational', tier: 'tail' },
  { tpl: n => `${n} erklärt`,           baseIntent: 'informational', tier: 'tail' },
  { tpl: n => `${n} einrichten`,        baseIntent: 'informational', tier: 'tail' },
  { tpl: n => `${n} fehler`,            baseIntent: 'informational', tier: 'tail' },
  { tpl: n => `${n} alternative`,       baseIntent: 'commercial',    tier: 'tail' },
  { tpl: n => `professionell ${n}`,     baseIntent: 'commercial',    tier: 'tail' },
  { tpl: n => `${n} angebot`,           baseIntent: 'transactional', tier: 'tail' },
  { tpl: n => `${n} rabatt`,            baseIntent: 'transactional', tier: 'tail' },
  { tpl: n => `lohnt sich ${n}`,        baseIntent: 'commercial',    tier: 'tail' },
];

// ─── Service ─────────────────────────────────────────────────────────────────

export class SeoAnalyzer {
  /** Public so the engine can report provenance on every ValidationResult. */
  readonly provider:                SeoProvider;
  private readonly apiKey:          string | undefined;
  private readonly keywordLimit:    number;
  private readonly competitorLimit: number;
  private readonly timeoutMs:       number;

  constructor(config: SeoAnalyzerConfig = {}) {
    this.provider        = config.provider        ?? DEFAULTS.provider;
    this.apiKey          = config.apiKey;
    this.keywordLimit    = config.keywordLimit    ?? DEFAULTS.keywordLimit;
    this.competitorLimit = config.competitorLimit ?? DEFAULTS.competitorLimit;
    this.timeoutMs       = config.timeoutMs       ?? DEFAULTS.timeoutMs;

    if (this.provider !== 'simulation' && !this.apiKey) {
      throw new Error(`SeoAnalyzer: provider "${this.provider}" requires apiKey`);
    }
  }

  // ── Public API ──────────────────────────────────────────────────────────

  async analyzeNiche(niche: string, language: Language, region: string): Promise<SeoMetrics> {
    const keywords = await this.fetchKeywordUniverse(niche, language, region);
    return this.computeSeoMetrics(keywords);
  }

  async analyzeCompetition(niche: string, language: Language, region: string): Promise<CompetitionMetrics> {
    const competitors = await this.fetchTopCompetitors(niche, language, region);
    return this.computeCompetitionMetrics(competitors);
  }

  // ── Provider dispatch ───────────────────────────────────────────────────

  private async fetchKeywordUniverse(niche: string, language: Language, region: string): Promise<KeywordData[]> {
    switch (this.provider) {
      case 'simulation': return this.simulateKeywords(niche, language);
      // TODO: case 'serper':     return this.fetchFromSerper(niche, language, region);
      // TODO: case 'semrush':    return this.fetchFromSemrush(niche, language, region);
      // TODO: case 'ahrefs':     return this.fetchFromAhrefs(niche, language, region);
      // TODO: case 'dataforseo': return this.fetchFromDataForSeo(niche, language, region);
      default:
        throw new Error(`SeoAnalyzer: provider "${this.provider}" not yet implemented`);
    }
  }

  private async fetchTopCompetitors(niche: string, language: Language, region: string): Promise<CompetitorProfile[]> {
    switch (this.provider) {
      case 'simulation': return this.simulateCompetitors(niche);
      // TODO: real provider implementations
      default:
        throw new Error(`SeoAnalyzer: provider "${this.provider}" not yet implemented`);
    }
  }

  // ── Real-provider stubs (uncomment + implement when wiring) ──────────────

  // private async fetchFromSerper(niche: string, language: Language, region: string): Promise<KeywordData[]> {
  //   // POST https://google.serper.dev/search
  //   // Headers: 'X-API-KEY': this.apiKey
  //   // Body: { q: niche, gl: region.toLowerCase(), hl: language, num: this.keywordLimit }
  //   throw new Error('not implemented');
  // }

  // private async fetchFromSemrush(niche: string, language: Language, region: string): Promise<KeywordData[]> {
  //   // GET https://api.semrush.com/?type=phrase_related&phrase=...&database=us
  //   throw new Error('not implemented');
  // }

  // ── Metric computation ──────────────────────────────────────────────────

  private computeSeoMetrics(keywords: KeywordData[]): SeoMetrics {
    const total = keywords.length;
    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

    const avgSearchVolume = total ? sum(keywords.map(k => k.searchVolume)) / total : 0;
    const avgDifficulty   = total ? sum(keywords.map(k => k.difficulty))   / total : 0;
    const longTail        = keywords.filter(k => k.searchVolume < 1_000);
    const longTailRatio   = total ? longTail.length / total : 0;

    // Intent distribution (normalized to 0–1, sums to 1.0)
    const intentDistribution: Record<SearchIntent, number> = {
      informational: 0, navigational: 0, commercial: 0, transactional: 0,
    };
    for (const k of keywords) intentDistribution[k.intent]++;
    for (const key of Object.keys(intentDistribution) as SearchIntent[]) {
      intentDistribution[key] = total ? intentDistribution[key] / total : 0;
    }

    // SERP feature frequency (absolute count — not normalized)
    const serpFeaturePresence: Record<SerpFeature, number> = {
      featured_snippet: 0, people_also_ask: 0, video_carousel: 0, image_pack: 0,
      shopping_results: 0, knowledge_panel: 0, local_pack: 0, sitelinks: 0,
    };
    for (const k of keywords) for (const f of k.serpFeatures) serpFeaturePresence[f]++;

    // Top keywords ranked by opportunity score (volume × intent weight ÷ difficulty)
    const scoreKw = (k: KeywordData) => {
      const intentWeight = k.intent === 'transactional' ? 2.0
                        : k.intent === 'commercial'     ? 1.5
                        : k.intent === 'informational'  ? 1.0
                        :                                 0.5;
      return (k.searchVolume * intentWeight) / Math.max(1, k.difficulty);
    };
    const topKeywords = [...keywords].sort((a, b) => scoreKw(b) - scoreKw(a)).slice(0, 10);

    return {
      totalKeywordsFound: total,
      avgSearchVolume:    Math.round(avgSearchVolume),
      avgDifficulty:      Math.round(avgDifficulty),
      longTailRatio:      Number(longTailRatio.toFixed(2)),
      topKeywords,
      intentDistribution,
      serpFeaturePresence,
    };
  }

  private computeCompetitionMetrics(competitors: CompetitorProfile[]): CompetitionMetrics {
    if (competitors.length === 0) {
      return {
        topCompetitors: [],
        avgDomainAuthority: 0,
        medianBacklinks: 0,
        contentGapScore: 50,
        saturationIndex: 0,
        vulnerableIncumbentCount: 0,
      };
    }

    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    const median = (xs: number[]) => {
      const sorted = [...xs].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const avgDomainAuthority = sum(competitors.map(c => c.authority)) / competitors.length;
    const medianBacklinks    = median(competitors.map(c => c.backlinks));
    const avgDominance       = sum(competitors.map(c => c.topicalDominance)) / competitors.length;

    const contentGapScore    = Math.max(0, Math.min(100, 100 - avgDominance));
    const saturationIndex    = Math.min(100, Math.round((avgDomainAuthority * 0.7) + (Math.log10(medianBacklinks + 1) * 5)));
    const vulnerableIncumbentCount = competitors.filter(c => c.authority < 40 && c.topicalDominance < 30).length;

    return {
      topCompetitors: competitors,
      avgDomainAuthority: Math.round(avgDomainAuthority),
      medianBacklinks: Math.round(medianBacklinks),
      contentGapScore,
      saturationIndex,
      vulnerableIncumbentCount,
    };
  }

  // ── Simulation (deterministic, realistic) ───────────────────────────────

  /**
   * Deterministic hash: same niche string → same RNG seed → same output.
   * Critical for snapshot tests and UI reproducibility.
   */
  private seed(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  private rng(seed: number) {
    let state = seed || 1;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  /**
   * Power-law volume by tier — mirrors how real keyword universes are shaped.
   * A handful of head terms attract most searches; the long tail is vast but thin.
   */
  private volumeByTier(tier: 'head' | 'mid' | 'tail', rand: () => number): number {
    switch (tier) {
      case 'head': return Math.round(8_000 + rand() * 42_000); // 8 000 – 50 000
      case 'mid':  return Math.round(400   + rand() * 4_600);  //   400 –  5 000
      case 'tail': return Math.round(30    + rand() * 370);    //    30 –    400
    }
  }

  /**
   * Difficulty correlated to intent + volume tier.
   * Commercial head terms are the most contested.
   */
  private difficultyFor(intent: SearchIntent, tier: 'head' | 'mid' | 'tail', rand: () => number): number {
    const base: Record<SearchIntent, number> = {
      transactional: 55,
      commercial:    60,
      informational: 35,
      navigational:  20,
    };
    const tierOffset: Record<'head' | 'mid' | 'tail', number> = {
      head: 20, mid: 0, tail: -15,
    };
    const raw = base[intent] + tierOffset[tier] + (rand() * 20 - 10);
    return Math.round(Math.min(95, Math.max(5, raw)));
  }

  /**
   * CPC correlated to intent (transactional commands premium bids).
   */
  private cpcForIntent(intent: SearchIntent, rand: () => number): number {
    const ranges: Record<SearchIntent, [number, number]> = {
      transactional: [1.5, 8.0],
      commercial:    [0.8, 4.5],
      informational: [0.15, 1.5],
      navigational:  [0.05, 0.6],
    };
    const [lo, hi] = ranges[intent];
    return Number((lo + rand() * (hi - lo)).toFixed(2));
  }

  /**
   * Infer intent from actual keyword text.
   * Returns the intent category with the most matching signal words.
   * Falls back to 'informational' when no signal fires.
   */
  private inferIntentFromText(keyword: string): SearchIntent {
    const lower = keyword.toLowerCase();
    const scores: Record<SearchIntent, number> = {
      transactional: 0, commercial: 0, informational: 0, navigational: 0,
    };
    for (const [intent, signals] of Object.entries(INTENT_SIGNALS) as [SearchIntent, string[]][]) {
      for (const signal of signals) {
        if (lower.includes(signal)) scores[intent]++;
      }
    }
    const best = (Object.entries(scores) as [SearchIntent, number][])
      .sort((a, b) => b[1] - a[1])[0];
    return best[1] > 0 ? best[0] : 'informational';
  }

  /**
   * SERP features that realistically co-occur with each intent.
   */
  private serpFeaturesForIntent(intent: SearchIntent, rand: () => number): SerpFeature[] {
    const pools: Record<SearchIntent, SerpFeature[]> = {
      informational:  ['featured_snippet', 'people_also_ask', 'video_carousel', 'image_pack'],
      commercial:     ['people_also_ask', 'shopping_results', 'image_pack', 'featured_snippet'],
      transactional:  ['shopping_results', 'sitelinks', 'image_pack', 'local_pack'],
      navigational:   ['sitelinks', 'knowledge_panel'],
    };
    return pools[intent].filter(() => rand() > 0.55);
  }

  private simulateKeywords(niche: string, language: Language): KeywordData[] {
    const rand     = this.rng(this.seed(niche));
    const isGerman = language === 'de';
    const groups   = isGerman ? TEMPLATE_GROUPS_DE : TEMPLATE_GROUPS_EN;

    // Expand each template with niche-specific variants (budget, premium, 2026, …)
    const VARIANTS = ['', 'premium', 'budget', 'starter', 'expert', 'online', 'pdf'];
    const out: KeywordData[] = [];

    for (const spec of groups) {
      const baseKeyword = spec.tpl(niche);

      for (let v = 0; v < Math.min(VARIANTS.length, Math.ceil(this.keywordLimit / groups.length)); v++) {
        if (out.length >= this.keywordLimit) break;

        const suffix  = VARIANTS[v] ? ` ${VARIANTS[v]}` : '';
        const keyword = v === 0 ? baseKeyword : `${baseKeyword}${suffix}`;

        // First variant uses the declared base intent; subsequent variants are re-inferred
        // from the full keyword text (variant modifiers can shift intent).
        const intent  = v === 0 ? spec.baseIntent : this.inferIntentFromText(keyword);
        const tier    = (v === 0 ? spec.tier : v === 1 ? 'mid' : 'tail') as 'head' | 'mid' | 'tail';

        out.push({
          keyword,
          searchVolume: this.volumeByTier(tier, rand),
          difficulty:   this.difficultyFor(intent, tier, rand),
          cpc:          this.cpcForIntent(intent, rand),
          intent,
          serpFeatures: this.serpFeaturesForIntent(intent, rand),
        });
      }
      if (out.length >= this.keywordLimit) break;
    }

    // Sort descending by volume — mirrors how real tools present keyword tables.
    return out.sort((a, b) => b.searchVolume - a.searchVolume);
  }

  private simulateCompetitors(niche: string): CompetitorProfile[] {
    const rand = this.rng(this.seed(niche) ^ 0xc0ffee);
    const out: CompetitorProfile[] = [];
    const monetizationOptions: CompetitorProfile['monetizationModel'][number][] =
      ['affiliate', 'ads', 'saas', 'course', 'sponsored'];

    for (let i = 0; i < this.competitorLimit; i++) {
      const authority = Math.round(20 + rand() * 75);
      const models = monetizationOptions.filter(() => rand() > 0.5);
      out.push({
        domain:            `competitor-${i + 1}.com`,
        authority,
        estimatedTraffic:  Math.round(2_000 + rand() * 400_000),
        backlinks:         Math.round(Math.pow(10, 2 + rand() * 4)),
        topicalDominance:  Math.round(rand() * 80),
        monetizationModel: models.length ? models : ['ads'],
      });
    }
    return out.sort((a, b) => b.authority - a.authority);
  }
}
