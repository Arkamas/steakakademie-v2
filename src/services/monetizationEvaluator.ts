/**
 * AuthorityOS — Monetization Evaluator
 * ===================================================================
 * Translates the SEO surface into expected revenue across four streams:
 *
 *   1. Affiliate         — Amazon / direct partner programs
 *   2. SaaS Tiers        — AuthorityOS-style Core/Pro/Atlas overlay
 *   3. Programmatic Ads  — Mediavine/Raptive-class display
 *   4. Digital Products  — Courses, ebooks, paid templates
 *
 * Each stream computes independently; composite score reflects the
 * portfolio outlook, not just the best stream.
 *
 * NOTE — no real API calls here yet. The provider switch is reserved
 * for hooking up Amazon PAAPI, AWIN, Impact, etc. in the next pass.
 * ===================================================================
 */

import type {
  SeoMetrics,
  KeywordData,
  MonetizationMetrics,
  AffiliateProjection,
  SaaSTierProjection,
  SaaSTierName,
} from '@/types/validator';

// ─── Niche category profiling ────────────────────────────────────────────────
// A coarse-grained taxonomy used to seed sensible defaults when we don't yet
// have real affiliate-network data. Will be replaced by live PAAPI lookups.

type NicheCategory =
  | 'consumer_electronics'
  | 'kitchen_food'
  | 'fitness_health'
  | 'finance'
  | 'fashion_beauty'
  | 'home_garden'
  | 'outdoor_travel'
  | 'software_saas'
  | 'hobby_craft'
  | 'pet'
  | 'baby_family'
  | 'auto_motor'
  | 'generic';

interface CategoryProfile {
  /** Typical affiliate commission % */
  avgCommissionPct: number;
  /** Typical AOV in EUR */
  avgOrderValueEur: number;
  /** Programmatic ad RPM in EUR */
  adRpmEur: number;
  /** Digital product feasibility 0–100 */
  digitalProductFeasibility: number;
  /** Sponsorship willingness 0–100 */
  sponsorshipFeasibility: number;
  /** Does this niche typically sustain a SaaS upsell? */
  saasAddOnViable: boolean;
}

const CATEGORY_PROFILES: Record<NicheCategory, CategoryProfile> = {
  consumer_electronics: { avgCommissionPct: 4,  avgOrderValueEur: 250, adRpmEur: 18, digitalProductFeasibility: 60, sponsorshipFeasibility: 80, saasAddOnViable: false },
  kitchen_food:         { avgCommissionPct: 7,  avgOrderValueEur: 90,  adRpmEur: 22, digitalProductFeasibility: 80, sponsorshipFeasibility: 70, saasAddOnViable: true  },
  fitness_health:       { avgCommissionPct: 12, avgOrderValueEur: 80,  adRpmEur: 28, digitalProductFeasibility: 90, sponsorshipFeasibility: 75, saasAddOnViable: true  },
  finance:              { avgCommissionPct: 25, avgOrderValueEur: 200, adRpmEur: 45, digitalProductFeasibility: 85, sponsorshipFeasibility: 60, saasAddOnViable: true  },
  fashion_beauty:       { avgCommissionPct: 10, avgOrderValueEur: 120, adRpmEur: 20, digitalProductFeasibility: 50, sponsorshipFeasibility: 85, saasAddOnViable: false },
  home_garden:          { avgCommissionPct: 6,  avgOrderValueEur: 180, adRpmEur: 19, digitalProductFeasibility: 65, sponsorshipFeasibility: 70, saasAddOnViable: false },
  outdoor_travel:       { avgCommissionPct: 8,  avgOrderValueEur: 350, adRpmEur: 24, digitalProductFeasibility: 75, sponsorshipFeasibility: 85, saasAddOnViable: true  },
  software_saas:        { avgCommissionPct: 30, avgOrderValueEur: 120, adRpmEur: 35, digitalProductFeasibility: 70, sponsorshipFeasibility: 50, saasAddOnViable: true  },
  hobby_craft:          { avgCommissionPct: 8,  avgOrderValueEur: 75,  adRpmEur: 16, digitalProductFeasibility: 85, sponsorshipFeasibility: 60, saasAddOnViable: true  },
  pet:                  { avgCommissionPct: 8,  avgOrderValueEur: 60,  adRpmEur: 18, digitalProductFeasibility: 70, sponsorshipFeasibility: 75, saasAddOnViable: false },
  baby_family:          { avgCommissionPct: 7,  avgOrderValueEur: 110, adRpmEur: 22, digitalProductFeasibility: 80, sponsorshipFeasibility: 85, saasAddOnViable: false },
  auto_motor:           { avgCommissionPct: 5,  avgOrderValueEur: 220, adRpmEur: 17, digitalProductFeasibility: 55, sponsorshipFeasibility: 90, saasAddOnViable: false },
  generic:              { avgCommissionPct: 6,  avgOrderValueEur: 100, adRpmEur: 18, digitalProductFeasibility: 65, sponsorshipFeasibility: 65, saasAddOnViable: false },
};

// Lightweight keyword → category inference. Replace with embeddings-based
// classifier once content-match service goes live.
const CATEGORY_KEYWORD_MAP: Record<NicheCategory, string[]> = {
  consumer_electronics: ['camera','headphone','laptop','speaker','tv','phone','keyboard','monitor','audio','hifi'],
  kitchen_food:         ['coffee','wine','whisky','steak','bbq','grill','sourdough','tea','cheese','recipe','baking'],
  fitness_health:       ['workout','protein','sleep','recovery','calisthenics','running','cycling','yoga','sauna','nootropic'],
  finance:              ['etf','investing','broker','crypto','tax','wealth','retirement','dividend'],
  fashion_beauty:       ['watch','sneaker','skincare','perfume','makeup','jewelry','fashion'],
  home_garden:          ['garden','tools','furniture','plant','interior','decor','smart-home'],
  outdoor_travel:       ['hiking','camping','climbing','travel','backpacking','outdoor','tent','gear'],
  software_saas:        ['saas','tool','software','app','automation','ai','crm','crm'],
  hobby_craft:          ['knife','watch','keyboard','vinyl','board-game','model','craft','aquascaping','bonsai'],
  pet:                  ['dog','cat','aquarium','pet','training'],
  baby_family:          ['baby','toddler','parenting','stroller'],
  auto_motor:           ['car','motorcycle','tuning','tire','automotive'],
  generic:              [],
};

// ─── Service ─────────────────────────────────────────────────────────────────

export interface MonetizationEvaluatorConfig {
  /** Override category inference if caller already knows the niche type */
  forcedCategory?: NicheCategory;
  /** Assumed monthly visits the projection should anchor on */
  targetVisitsMonth12?: number;
  /** Override the SaaS-tier price ladder (EUR/month) */
  saasTierPrices?: Record<SaaSTierName, number>;
}

const DEFAULT_SAAS_PRICES: Record<SaaSTierName, number> = {
  core:  19,
  pro:   49,
  atlas: 149,
};

export class MonetizationEvaluator {
  private readonly forcedCategory:      NicheCategory | undefined;
  private readonly targetVisitsMonth12: number;
  private readonly saasTierPrices:      Record<SaaSTierName, number>;

  constructor(config: MonetizationEvaluatorConfig = {}) {
    this.forcedCategory      = config.forcedCategory;
    this.targetVisitsMonth12 = config.targetVisitsMonth12 ?? 30_000;
    this.saasTierPrices      = config.saasTierPrices      ?? DEFAULT_SAAS_PRICES;
  }

  // ── Public API ──────────────────────────────────────────────────────────

  evaluate(niche: string, seo: SeoMetrics): MonetizationMetrics {
    const category = this.forcedCategory ?? this.inferCategory(niche);
    const profile  = CATEGORY_PROFILES[category];

    const affiliate          = this.calculateAffiliate(seo, profile);
    const saasTiers          = this.calculateSaaSTiers(seo, profile);
    const adRpmEur           = profile.adRpmEur;
    const digitalProductFeas = profile.digitalProductFeasibility;
    const sponsorshipFeas    = profile.sponsorshipFeasibility;

    const compositeScore = this.computeCompositeScore({
      affiliate,
      saasTiers,
      adRpmEur,
      digitalProductFeasibility: digitalProductFeas,
      sponsorshipFeasibility:    sponsorshipFeas,
      seo,
    });

    return {
      affiliate,
      saasTiers,
      adRpmEur,
      digitalProductFeasibility: digitalProductFeas,
      sponsorshipFeasibility:    sponsorshipFeas,
      compositeScore,
    };
  }

  // ── Affiliate math ──────────────────────────────────────────────────────

  private calculateAffiliate(seo: SeoMetrics, profile: CategoryProfile): AffiliateProjection {
    // Share of traffic that lands on commercial-intent pages
    const commercialShare =
      (seo.intentDistribution.commercial ?? 0) +
      (seo.intentDistribution.transactional ?? 0);

    // CTR on commercial pages — base 7%, modulated by SERP shopping presence
    const shoppingPresence = seo.serpFeaturePresence.shopping_results ?? 0;
    const ctrEstimate = Math.min(0.18, 0.05 + (shoppingPresence / Math.max(1, seo.totalKeywordsFound)) * 0.15);

    // Conversion — anchored by category, scaled by intent quality
    const baseConversion = 0.025;
    const intentBoost    = (seo.intentDistribution.transactional ?? 0) * 0.5;
    const conversionEstimate = Math.min(0.08, baseConversion + intentBoost);

    const revenuePerVisit =
      commercialShare *
      ctrEstimate *
      conversionEstimate *
      profile.avgOrderValueEur *
      (profile.avgCommissionPct / 100);

    return {
      avgCommissionPct: profile.avgCommissionPct,
      avgOrderValueEur: profile.avgOrderValueEur,
      ctrEstimate:      Number(ctrEstimate.toFixed(3)),
      conversionEstimate: Number(conversionEstimate.toFixed(3)),
      revenueAt10kVisits: Math.round(revenuePerVisit * 10_000),
      revenueAt50kVisits: Math.round(revenuePerVisit * 50_000),
    };
  }

  // ── SaaS tier math ──────────────────────────────────────────────────────

  private calculateSaaSTiers(seo: SeoMetrics, profile: CategoryProfile): SaaSTierProjection[] {
    if (!profile.saasAddOnViable) return [];

    // Audience reachable for a SaaS upsell scales with informational traffic
    // (people consuming guides → may want tools that complement them).
    const informationalShare = seo.intentDistribution.informational ?? 0;
    const reachableMau       = Math.round(this.targetVisitsMonth12 * informationalShare * 0.12);

    // Tier conversion ladder — Core has the broadest funnel,
    // Atlas converts the smallest paying base but at highest ARPU.
    const tiers: Array<{ name: SaaSTierName; convRate: number }> = [
      { name: 'core',  convRate: 0.020 },
      { name: 'pro',   convRate: 0.006 },
      { name: 'atlas', convRate: 0.0015 },
    ];

    return tiers.map(({ name, convRate }) => {
      const arpu        = this.saasTierPrices[name];
      const payingUsers = Math.round(reachableMau * convRate);
      return {
        tier:            name,
        estimatedMau:    reachableMau,
        paidConversion:  convRate,
        arpu,
        projectedMrr:    Math.round(payingUsers * arpu),
      };
    });
  }

  // ── Composite score (0–100) ─────────────────────────────────────────────

  private computeCompositeScore(args: {
    affiliate: AffiliateProjection;
    saasTiers: SaaSTierProjection[];
    adRpmEur: number;
    digitalProductFeasibility: number;
    sponsorshipFeasibility: number;
    seo: SeoMetrics;
  }): number {
    // Anchor each stream to a 0–100 scale
    const affiliateScore =
      Math.min(100, (args.affiliate.revenueAt10kVisits / 1500) * 100); // €1500/mo at 10k visits → 100

    const saasScore = args.saasTiers.length === 0 ? 0 :
      Math.min(100, (args.saasTiers.reduce((s, t) => s + t.projectedMrr, 0) / 5000) * 100); // €5k MRR → 100

    const adScore =
      Math.min(100, (args.adRpmEur / 40) * 100); // €40 RPM = top-tier

    const portfolioScore =
      affiliateScore * 0.45 +
      saasScore      * 0.20 +
      adScore        * 0.15 +
      args.digitalProductFeasibility * 0.10 +
      args.sponsorshipFeasibility    * 0.10;

    return Math.round(Math.min(100, Math.max(0, portfolioScore)));
  }

  // ── Category inference ──────────────────────────────────────────────────

  private inferCategory(niche: string): NicheCategory {
    const lower = niche.toLowerCase();
    let bestCategory: NicheCategory = 'generic';
    let bestHits = 0;

    for (const [cat, terms] of Object.entries(CATEGORY_KEYWORD_MAP) as [NicheCategory, string[]][]) {
      const hits = terms.reduce((n, t) => n + (lower.includes(t) ? 1 : 0), 0);
      if (hits > bestHits) {
        bestHits = hits;
        bestCategory = cat;
      }
    }
    return bestCategory;
  }
}
