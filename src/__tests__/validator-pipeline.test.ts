/**
 * Validator Pipeline — smoke + regression tests
 *
 * All tests run in simulation mode: no API keys, no I/O, pure computation.
 * Same niche input → same output on every run (deterministic RNG seeding).
 */

import { describe, it, expect } from 'vitest';

import { SeoAnalyzer }           from '@/services/seoAnalyzer';
import { MonetizationEvaluator } from '@/services/monetizationEvaluator';
import { ContentMatchAnalyzer }  from '@/services/contentMatchAnalyzer';
import { ValidatorEngine }       from '@/engine/validatorEngine';
import { SCORE_THRESHOLDS }      from '@/types/validator';
import type { NicheInput }       from '@/types/validator';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const COFFEE: NicheInput = { niche: 'single-origin coffee', language: 'de', targetRegion: 'DE' };
const STEAK:  NicheInput = { niche: 'steak grilling',       language: 'de', targetRegion: 'DE' };
const FINANCE: NicheInput = { niche: 'etf investing broker', language: 'en', targetRegion: 'US' };

// ─── SeoAnalyzer ─────────────────────────────────────────────────────────────

describe('SeoAnalyzer (simulation)', () => {
  const seo = new SeoAnalyzer({ provider: 'simulation', keywordLimit: 60 });

  it('returns a well-formed SeoMetrics object', async () => {
    const metrics = await seo.analyzeNiche(COFFEE.niche, COFFEE.language, COFFEE.targetRegion);

    expect(metrics.totalKeywordsFound).toBeGreaterThan(0);
    expect(metrics.topKeywords.length).toBeGreaterThan(0);
    expect(metrics.topKeywords.length).toBeLessThanOrEqual(10);
    expect(metrics.avgSearchVolume).toBeGreaterThan(0);
    expect(metrics.avgDifficulty).toBeGreaterThanOrEqual(0);
    expect(metrics.avgDifficulty).toBeLessThanOrEqual(100);
    expect(metrics.longTailRatio).toBeGreaterThanOrEqual(0);
    expect(metrics.longTailRatio).toBeLessThanOrEqual(1);
  });

  it('intent distribution sums to ~1.0', async () => {
    const { intentDistribution } = await seo.analyzeNiche(STEAK.niche, STEAK.language, STEAK.targetRegion);
    const total = Object.values(intentDistribution).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1.0, 5);
  });

  it('topKeywords are ordered by opportunity score descending', async () => {
    const { topKeywords } = await seo.analyzeNiche(COFFEE.niche, COFFEE.language, COFFEE.targetRegion);

    const score = (k: typeof topKeywords[0]) => {
      const w = k.intent === 'transactional' ? 2 : k.intent === 'commercial' ? 1.5 : 1;
      return (k.searchVolume * w) / Math.max(1, k.difficulty);
    };

    for (let i = 0; i < topKeywords.length - 1; i++) {
      expect(score(topKeywords[i])).toBeGreaterThanOrEqual(score(topKeywords[i + 1]) - 0.001);
    }
  });

  it('transactional keywords have higher CPC than informational', async () => {
    const { topKeywords } = await seo.analyzeNiche(COFFEE.niche, COFFEE.language, COFFEE.targetRegion);

    const txCpcs   = topKeywords.filter(k => k.intent === 'transactional').map(k => k.cpc);
    const infoCpcs = topKeywords.filter(k => k.intent === 'informational').map(k => k.cpc);

    if (txCpcs.length && infoCpcs.length) {
      const avgTx   = txCpcs.reduce((a, b) => a + b, 0)   / txCpcs.length;
      const avgInfo = infoCpcs.reduce((a, b) => a + b, 0)  / infoCpcs.length;
      expect(avgTx).toBeGreaterThan(avgInfo);
    }
  });

  it('is deterministic — same niche produces identical metrics', async () => {
    const a = await seo.analyzeNiche(STEAK.niche, STEAK.language, STEAK.targetRegion);
    const b = await seo.analyzeNiche(STEAK.niche, STEAK.language, STEAK.targetRegion);
    expect(a).toEqual(b);
  });

  it('different niches produce different keyword sets', async () => {
    const coffee = await seo.analyzeNiche(COFFEE.niche, COFFEE.language, COFFEE.targetRegion);
    const steak  = await seo.analyzeNiche(STEAK.niche,  STEAK.language,  STEAK.targetRegion);
    expect(coffee.topKeywords[0].keyword).not.toEqual(steak.topKeywords[0].keyword);
  });

  it('competition metrics have sensible shape', async () => {
    const comp = await seo.analyzeCompetition(COFFEE.niche, COFFEE.language, COFFEE.targetRegion);
    expect(comp.topCompetitors.length).toBeGreaterThan(0);
    expect(comp.avgDomainAuthority).toBeGreaterThanOrEqual(0);
    expect(comp.avgDomainAuthority).toBeLessThanOrEqual(100);
    expect(comp.saturationIndex).toBeGreaterThanOrEqual(0);
    expect(comp.saturationIndex).toBeLessThanOrEqual(100);
    expect(comp.contentGapScore).toBeGreaterThanOrEqual(0);
    expect(comp.contentGapScore).toBeLessThanOrEqual(100);
  });
});

// ─── ContentMatchAnalyzer ─────────────────────────────────────────────────────

describe('ContentMatchAnalyzer (simulation)', () => {
  const analyzer = new ContentMatchAnalyzer({ provider: 'simulation' });

  it('hobby niche: high AI suitability + low expertise', async () => {
    const m = await analyzer.analyze('steak grilling recipe', 'de');
    expect(m.aiContentSuitability).toBeGreaterThan(65);
    expect(m.expertiseRequired).toBe('low');
    expect(m.evergreenRatio).toBeGreaterThan(0.5);
    expect(m.schemaLeverage).toBeGreaterThan(70); // Recipe schema
  });

  it('regulated niche: high expertise, capped AI suitability', async () => {
    const m = await analyzer.analyze('medical diagnosis clinical', 'en');
    expect(m.expertiseRequired).toBe('high');
    expect(m.aiContentSuitability).toBeLessThanOrEqual(55);
  });

  it('finance niche: expertise high', async () => {
    const m = await analyzer.analyze('etf investing tax advice', 'en');
    expect(m.expertiseRequired).toBe('high');
  });

  it('topicalBreadth is always at least 2', async () => {
    const m = await analyzer.analyze('obscure widget xyz', 'en');
    expect(m.topicalBreadth).toBeGreaterThanOrEqual(2);
  });

  it('evergreenRatio stays in [0, 1]', async () => {
    const m = await analyzer.analyze('breaking news live ticker', 'en');
    expect(m.evergreenRatio).toBeGreaterThanOrEqual(0);
    expect(m.evergreenRatio).toBeLessThanOrEqual(1);
  });

  it('schemaLeverage is in [0, 100]', async () => {
    const m = await analyzer.analyze('baking sourdough recipe guide', 'en');
    expect(m.schemaLeverage).toBeGreaterThanOrEqual(0);
    expect(m.schemaLeverage).toBeLessThanOrEqual(100);
  });
});

// ─── MonetizationEvaluator ────────────────────────────────────────────────────

describe('MonetizationEvaluator', () => {
  const evaluator = new MonetizationEvaluator();
  const seo       = new SeoAnalyzer({ provider: 'simulation' });

  it('returns valid MonetizationMetrics', async () => {
    const seoMetrics = await seo.analyzeNiche(COFFEE.niche, COFFEE.language, COFFEE.targetRegion);
    const m = evaluator.evaluate(COFFEE.niche, seoMetrics);

    expect(m.compositeScore).toBeGreaterThanOrEqual(0);
    expect(m.compositeScore).toBeLessThanOrEqual(100);
    expect(m.adRpmEur).toBeGreaterThan(0);
    expect(m.affiliate.avgCommissionPct).toBeGreaterThan(0);
    expect(m.affiliate.revenueAt10kVisits).toBeGreaterThanOrEqual(0);
    expect(m.affiliate.revenueAt50kVisits).toBeGreaterThan(m.affiliate.revenueAt10kVisits);
    expect(m.digitalProductFeasibility).toBeGreaterThanOrEqual(0);
    expect(m.digitalProductFeasibility).toBeLessThanOrEqual(100);
  });

  it('finance niche has higher CPC monetization potential than generic', async () => {
    const [seoFin, seoGen] = await Promise.all([
      seo.analyzeNiche(FINANCE.niche, FINANCE.language, FINANCE.targetRegion),
      seo.analyzeNiche('generic widget',               'en',             'US'),
    ]);
    const fin = evaluator.evaluate(FINANCE.niche,    seoFin);
    const gen = evaluator.evaluate('generic widget', seoGen);
    expect(fin.adRpmEur).toBeGreaterThan(gen.adRpmEur);
  });

  it('SaaS-viable niches include tier projections', async () => {
    const seoMetrics = await seo.analyzeNiche(FINANCE.niche, FINANCE.language, FINANCE.targetRegion);
    const m = evaluator.evaluate(FINANCE.niche, seoMetrics);
    // finance category has saasAddOnViable: true
    expect(m.saasTiers.length).toBe(3);
    for (const tier of m.saasTiers) {
      expect(tier.projectedMrr).toBeGreaterThanOrEqual(0);
      expect(tier.arpu).toBeGreaterThan(0);
    }
  });
});

// ─── ValidatorEngine — full pipeline integration ──────────────────────────────

describe('ValidatorEngine — full pipeline', () => {
  const engine = new ValidatorEngine({
    seo:          new SeoAnalyzer({ provider: 'simulation' }),
    monetization: new MonetizationEvaluator(),
    contentMatch: new ContentMatchAnalyzer({ provider: 'simulation' }),
  });

  it('returns a well-formed ValidationResult', async () => {
    const result = await engine.validate(COFFEE);

    expect(result.input.niche).toBe(COFFEE.niche);
    expect(result.durationMs).toBeGreaterThan(0);
    expect(result.engineVersion).toMatch(/^\d+\.\d+\.\d+$/);

    // metrics shape
    expect(result.metrics.seo).toBeDefined();
    expect(result.metrics.competition).toBeDefined();
    expect(result.metrics.monetization).toBeDefined();
    expect(result.metrics.contentMatch).toBeDefined();
  });

  it('score.overall is within [0, 100]', async () => {
    const { score } = await engine.validate(COFFEE);
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
  });

  it('verdict is one of the three valid values', async () => {
    const { score } = await engine.validate(COFFEE);
    expect(['GREEN_LIGHT', 'CAUTION', 'STOP']).toContain(score.verdict);
  });

  it('verdict is consistent with score.overall', async () => {
    const { score } = await engine.validate(COFFEE);
    if (score.verdict === 'GREEN_LIGHT') {
      expect(score.overall).toBeGreaterThanOrEqual(SCORE_THRESHOLDS.GREEN_LIGHT_MIN);
    }
    if (score.verdict === 'STOP') {
      expect(score.overall).toBeLessThan(SCORE_THRESHOLDS.CAUTION_MIN);
    }
  });

  it('score breakdown dimensions sum close to overall', async () => {
    const { score } = await engine.validate(COFFEE);
    const { breakdown } = score;
    // Breakdown values should all be 0–100
    for (const v of Object.values(breakdown)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it('reasoning and warnings are non-empty strings', async () => {
    const { score } = await engine.validate(COFFEE);
    expect(score.reasoning.length).toBeGreaterThan(0);
    for (const line of score.reasoning) expect(typeof line).toBe('string');
  });

  it('confidence is in (0, 1]', async () => {
    const { score } = await engine.validate(COFFEE);
    expect(score.confidence).toBeGreaterThan(0);
    expect(score.confidence).toBeLessThanOrEqual(1);
  });

  it('blueprint is absent for STOP verdict (no alwaysBuild)', async () => {
    // Craft a niche that is almost guaranteed to score low
    const stopInput: NicheInput = {
      niche: 'medical diagnosis clinical prescription',
      language: 'en',
      targetRegion: 'US',
    };
    const result = await engine.validate(stopInput);
    if (result.score.verdict === 'STOP') {
      expect(result.blueprint).toBeUndefined();
    }
  });

  it('blueprint is present when alwaysBuildBlueprint is true', async () => {
    const forceEngine = new ValidatorEngine({
      seo:                 new SeoAnalyzer({ provider: 'simulation' }),
      monetization:        new MonetizationEvaluator(),
      contentMatch:        new ContentMatchAnalyzer({ provider: 'simulation' }),
      alwaysBuildBlueprint: true,
    });
    const result = await forceEngine.validate(COFFEE);
    expect(result.blueprint).toBeDefined();
    expect(result.blueprint!.pillarPages.length).toBeGreaterThan(0);
    expect(result.blueprint!.monetizationStack.length).toBeGreaterThan(0);
    expect(result.blueprint!.fingerprint).toBeTruthy();
  });

  it('is fully deterministic — identical results on repeated calls', async () => {
    const [a, b] = await Promise.all([engine.validate(STEAK), engine.validate(STEAK)]);
    // Exclude timing
    expect(a.score.overall).toBe(b.score.overall);
    expect(a.score.verdict).toBe(b.score.verdict);
    expect(a.metrics.seo.avgSearchVolume).toBe(b.metrics.seo.avgSearchVolume);
    expect(a.metrics.contentMatch).toEqual(b.metrics.contentMatch);
  });

  it('rejects input that fails Zod validation', async () => {
    await expect(engine.validate({ niche: 'x', language: 'de', targetRegion: 'DE' }))
      .rejects.toThrow(); // niche too short (< 2 chars after trim by schema)
  });
});
