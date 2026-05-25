/**
 * AuthorityOS — NL ZZP Evaluator
 * ===================================================================
 * Kombiniert die Nischen-Metadaten aus nlNiches.json mit der
 * steuerlichen Kalkulation (calculateNL / calculateDE) und gibt
 * ein strukturiertes Evaluationsobjekt zurück.
 *
 * Dieses Objekt ist die Datenquelle für den pageGenerator.
 * ===================================================================
 */

import { calculateNL, calculateDE, type TaxResult } from './taxCalculator';

// ─── Typen ─────────────────────────────────────────────────────────────────────

export interface NLNiche {
  slug:               string;
  title:              string;
  category:           string;
  averageGrossRevenue: number;
  hourlyRate:         number;
  demandLevel:        'hoog' | 'gemiddeld' | 'laag';
  targetKeyword:      string;
  secondaryKeywords:  string[];
  description:        string;
  typicalClient:      string;
}

export interface NLEvaluation {
  niche:           NLNiche;
  tax:             TaxResult;
  annualNet:       number;
  annualGross:     number;
  /** Monatlicher Netto-Vorteil NL vs. DE (positiv = NL besser) */
  savingsVsDE:     number;
  /** 0–100: composite aus Demand, Umsatz und Abgabenquote */
  marketScore:     number;
  viabilityLabel:  'Uitstekend' | 'Goed' | 'Matig';
  /** Fertige niederländische Bullet Points für die Landing Page */
  highlights:      string[];
}

// ─── Hilfsfunktionen ───────────────────────────────────────────────────────────

const DEMAND_WEIGHT: Record<NLNiche['demandLevel'], number> = {
  hoog:      100,
  gemiddeld:  65,
  laag:       35,
};

function computeMarketScore(niche: NLNiche, tax: TaxResult): number {
  const demandScore  = DEMAND_WEIGHT[niche.demandLevel];
  // Höheres Netto → höherer Score (normalisiert auf 5.000 € Referenzwert)
  const netScore     = Math.min(100, (tax.monthlyNet / 3_500) * 70);
  // Niedrigere Abgabenquote → besser
  const taxScore     = Math.round((1 - tax.effectiveRate) * 100);

  return Math.round(demandScore * 0.4 + netScore * 0.35 + taxScore * 0.25);
}

function formatEUR(n: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function buildHighlights(niche: NLNiche, tax: TaxResult, savingsVsDE: number): string[] {
  const pct = (tax.effectiveRate * 100).toFixed(0);
  return [
    `Gemiddeld netto inkomen als ZZP ${niche.title}: ${formatEUR(tax.monthlyNet)} / maand`,
    `Effectieve belastingdruk: slechts ${pct}% — dankzij zelfstandigenaftrek & MKB-winstvrijstelling`,
    `Zorgverzekering (incl. IAB): ${formatEUR(tax.deductions.healthInsurance)} / maand — lager dan in loondienst`,
    `Jaarlijks netto: ${formatEUR(tax.monthlyNet * 12)} bij ${formatEUR(niche.averageGrossRevenue)} bruto-omzet / maand`,
    ...(savingsVsDE > 0
      ? [`Als ZZP in Nederland verdien je netto ${formatEUR(savingsVsDE)} / maand méér dan als equivalent in Duitsland`]
      : []),
    `Uurtarief indicatie: ${formatEUR(niche.hourlyRate)} / uur — bij 20 declarabele uren / week`,
  ];
}

// ─── Haupt-Export ──────────────────────────────────────────────────────────────

export function evaluateNLNiche(niche: NLNiche): NLEvaluation {
  const tax      = calculateNL(niche.averageGrossRevenue);
  const taxDE    = calculateDE(niche.averageGrossRevenue);
  const savings  = tax.monthlyNet - taxDE.monthlyNet;
  const score    = computeMarketScore(niche, tax);

  const viabilityLabel: NLEvaluation['viabilityLabel'] =
    score >= 75 ? 'Uitstekend' : score >= 50 ? 'Goed' : 'Matig';

  return {
    niche,
    tax,
    annualNet:      tax.monthlyNet * 12,
    annualGross:    niche.averageGrossRevenue * 12,
    savingsVsDE:    savings,
    marketScore:    score,
    viabilityLabel,
    highlights:     buildHighlights(niche, tax, savings),
  };
}
