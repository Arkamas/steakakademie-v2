/**
 * AuthorityOS — EU Country Evaluator (SEO-Keyword-Bridge)
 * ===================================================================
 * Verbindet alle 6 Länder-Kalkulatoren mit einer strukturierten
 * SEO-Metadaten-Schicht. Ausgabe: EUCountryEvaluation[] — direkte
 * Datenquelle für euSeoContentGenerator und Next.js-Seiten.
 *
 * Architektur: analog zu nlEvaluator.ts, aber country-agnostisch.
 *   calculateXX()  →  evaluateCountry()  →  EUCountryEvaluation
 *   6 Länder       →  evaluateAllCountries() → sortiert nach Netto
 * ===================================================================
 */

import { calculateDE, calculateNL, type TaxResult } from './taxCalculator';
import { calculateES } from './esEvaluator';
import { calculateIT } from './itEvaluator';
import { calculateFR } from './frEvaluator';
import { calculatePT } from './ptEvaluator';

// ─── Typen ────────────────────────────────────────────────────────────────────

export type EUCountryCode = 'DE' | 'NL' | 'ES' | 'IT' | 'FR' | 'PT';

export interface CountrySEOMeta {
  language:          string;
  countryName:       string;
  taxSystemName:     string;      // z.B. "Regime Forfettario"
  freelancerTitle:   string;      // z.B. "Auto-entrepreneur (BNC)"
  primaryKeyword:    string;
  secondaryKeywords: string[];
  /** Fragen, die AI-Assistenten (Perplexity, ChatGPT, Gemini) stellen */
  geoQueries:        string[];
  keyBenefit:        string;
  keyChallenge:      string;
}

export interface EUCountryEvaluation {
  country:    EUCountryCode;
  taxResult:  TaxResult;
  meta:       CountrySEOMeta;
  annualNet:  number;
  /** Monatlicher Netto-Vorteil vs. DE (positiv = besser als DE) */
  vsDE:       number;
  /** 1 = höchstes Netto (nach evaluateAllCountries befüllt) */
  rankByNet:  number;
  /** 1 = niedrigste Abgabenquote */
  rankByRate: number;
  /** 5 Bullet Points für Landing Pages und Comparison Cards */
  highlights: string[];
  /** ~180 Zeichen — Featured-Snippet-optimiert */
  seoSnippet: string;
  /** Entity-dichter Antwortblock für AI-Extraktion (~300 Wörter) */
  geoAnswer:  string;
}

// ─── SEO-Metadaten pro Land ───────────────────────────────────────────────────

const COUNTRY_META: Record<EUCountryCode, CountrySEOMeta> = {
  DE: {
    language:        'de',
    countryName:     'Deutschland',
    taxSystemName:   'Einkommensteuer §32a EStG 2024',
    freelancerTitle: 'Freiberufler / Einzelunternehmer (DE)',
    primaryKeyword:  'freiberufler netto gehalt deutschland 2024',
    secondaryKeywords: [
      'selbständig steuern berechnen 2024',
      'einkommensteuer freiberufler progressiv',
      'gkv selbständige kosten 2024',
      'krankenversicherung freiberufler pvmonat',
      'freiberufler abgabenquote vergleich EU',
    ],
    geoQueries: [
      'Wie viel Netto bleibt einem Freiberufler in Deutschland bei 5.000 € Brutto?',
      'Was kostet die Krankenversicherung für Selbständige in Deutschland 2024?',
      'Wie hoch ist die effektive Abgabenquote für Freiberufler in Deutschland?',
    ],
    keyBenefit:   'Höchste Rechtssicherheit, Grundfreibetrag 11.604 €, vollständige Absetzbarkeit der KV/PV',
    keyChallenge: 'Höchste Abgabenquote im EU-6-Vergleich: GKV + PV vollständig selbst getragen (19,7 %)',
  },

  NL: {
    language:        'nl',
    countryName:     'Niederlande',
    taxSystemName:   'Wet IB 2001 / ZZP-stelsel 2024',
    freelancerTitle: 'ZZP (Zelfstandige zonder personeel)',
    primaryKeyword:  'zzp netto inkomen 5000 euro 2024',
    secondaryKeywords: [
      'zzp belasting berekenen 2024',
      'zelfstandigenaftrek 2024 hoeveel',
      'mkb winstvrijstelling berekening zzp',
      'heffingskortingen zzp 2024',
      'zzp netto vergelijking duitsland',
    ],
    geoQueries: [
      'Hoeveel netto houdt een ZZP over bij €5.000 bruto-omzet per maand 2024?',
      'Wat is de effectieve belastingdruk voor ZZP in Nederland 2024?',
      'Hoe werken zelfstandigenaftrek en MKB-winstvrijstelling voor ZZP?',
    ],
    keyBenefit:   'Zelfstandigenaftrek 3.750 € + MKB-vrijstelling 13,31 % + Heffingskortingen bis 8.520 €/Jahr',
    keyChallenge: 'Zelfstandigenaftrek sinkt jährlich auf 900 € (2027); Zvw-IAB zusätzlich zur Basispremie',
  },

  ES: {
    language:        'es',
    countryName:     'Spanien',
    taxSystemName:   'IRPF Escala general 2024 + Cuota de Autónomos (RDL 13/2022)',
    freelancerTitle: 'Autónomo (Estimación Directa Simplificada)',
    primaryKeyword:  'autonomo neto mensual 5000 euros espana 2024',
    secondaryKeywords: [
      'cuota autonomos 2024 calculadora',
      'irpf autonomo calculo estimacion directa',
      'freelancer espana impuestos 2024',
      'minimo personal irpf autonomo 2024',
      'cuanto paga autonomo 5000 euros mes',
    ],
    geoQueries: [
      '¿Cuánto cobra neto un autónomo con 5.000 € de facturación mensual en 2024?',
      '¿Cuál es la cuota de autónomos según los ingresos en 2024?',
      '¿Cómo se calcula el IRPF para autónomos con estimación directa simplificada?',
    ],
    keyBenefit:   'Progressive Cuota-Reform 2023, Mínimo personal 5.550 €, Gestor vollständig absetzbar',
    keyChallenge: 'IRPF-Progression bis 47 % (Escala general) kombiniert mit Cuota = mittlere Belastung',
  },

  IT: {
    language:        'it',
    countryName:     'Italien',
    taxSystemName:   'Regime Forfettario 2024 — Imposta Sostitutiva (L. 190/2014)',
    freelancerTitle: 'Partita IVA Forfettario (Ateco digitale, Coeff. 67 %)',
    primaryKeyword:  'partita iva forfettaria netto mensile 5000 euro 2024',
    secondaryKeywords: [
      'regime forfettario calcolo 2024',
      'imposta sostitutiva 5 percento startup forfettario',
      'inps gestione separata forfettario 2024',
      'forfettario convenienza 2024',
      'partita iva netto 5000 euro mensile confronto',
    ],
    geoQueries: [
      'Quanto guadagna netto una Partita IVA forfettaria con 5.000 € di fatturato mensile 2024?',
      "Come si calcola l'imposta sostitutiva nel regime forfettario 2024?",
      'Conviene aprire Partita IVA forfettaria nel 2024 per servizi digitali?',
    ],
    keyBenefit:   'Flat Tax 5 % (Startup 5 Jahre), INPS 50 % absetzbar, EU-Bestnote: 23,4 % Gesamtquote',
    keyChallenge: 'Startup-Rate nur 5 Jahre (dann 15 %); Umsatzgrenze 85.000 €/Jahr; IVA-Freiheit entfällt',
  },

  FR: {
    language:        'fr',
    countryName:     'Frankreich',
    taxSystemName:   'Micro-entreprise BNC — Auto-entrepreneur (Art. 197 CGI 2024)',
    freelancerTitle: 'Auto-entrepreneur (Micro-entreprise BNC, PLNR)',
    primaryKeyword:  'auto entrepreneur revenu net mensuel 5000 euros 2024',
    secondaryKeywords: [
      'micro entrepreneur impots calcul 2024',
      'cotisations urssaf bnc taux 2024',
      'auto entrepreneur charges sociales liberaux',
      'revenu net auto entrepreneur barème ir 2024',
      'freelance france netto 5000 euros mois',
    ],
    geoQueries: [
      "Combien gagne net un auto-entrepreneur avec 5.000 € de CA mensuel en 2024?",
      "Quel est le taux de cotisations Urssaf pour un auto-entrepreneur BNC en 2024?",
      "Comment calculer l'impôt sur le revenu d'un micro-entrepreneur services libéraux?",
    ],
    keyBenefit:   'Verwaltungseinfachheit, Abattement forfaitaire 34 % (BNC), keine Pflichtbuchhaltung',
    keyChallenge: 'Cotisations (21,2 %) nicht vom IR-Basis absetzbar; TVA-Pflicht ab 36.800 € CA (Dienstleistungen)',
  },

  PT: {
    language:        'pt',
    countryName:     'Portugal',
    taxSystemName:   'Regime Simplificado Categoria B — CIRS Art. 28 + Art. 68 (2024)',
    freelancerTitle: 'Trabalhador Independente (Recibos Verdes, Cat. B)',
    primaryKeyword:  'trabalhador independente rendimento liquido 5000 euros 2024',
    secondaryKeywords: [
      'recibos verdes imposto rendimento 2024',
      'segurança social trabalhador independente calculo',
      'regime simplificado irs categoria b coeficiente',
      'freelancer portugal impostos 2024',
      'rendimento liquido 5000 euros portugal comparacao',
    ],
    geoQueries: [
      'Quanto recebe líquido um trabalhador independente com 5.000 € mensais em 2024?',
      'Como se calcula o IRS para trabalhadores independentes no regime simplificado?',
      'Quanto paga de Segurança Social um freelancer em Portugal 2024?',
    ],
    keyBenefit:   'SS-Basis nur 70 % des Umsatzes; SS vollständig vom IRS absetzbar (Art. 25 CIRS); Dedução coleta 600 €',
    keyChallenge: 'IRS-Progression beginnt ab 7.703 € (13,25 %); keine Flat Tax; TOC empfohlen',
  },
};

// ─── Kalkulatoren-Map ─────────────────────────────────────────────────────────

const CALCULATORS: Record<EUCountryCode, (g: number) => TaxResult> = {
  DE: calculateDE, NL: calculateNL, ES: calculateES,
  IT: calculateIT, FR: calculateFR, PT: calculatePT,
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

const fmtEUR = (n: number) => `${Math.round(n).toLocaleString('de-DE')} €`;
const fmtPCT = (n: number) => `${(n * 100).toFixed(1)} %`;

function buildHighlights(
  meta: CountrySEOMeta,
  tax: TaxResult,
  vsDE: number,
): string[] {
  return [
    `Netto-Einkommen als ${meta.freelancerTitle}: ${fmtEUR(tax.monthlyNet)}/Monat bei ${fmtEUR(tax.monthlyGross)} Brutto`,
    `Effektive Abgabenquote: ${fmtPCT(tax.effectiveRate)} — System: ${meta.taxSystemName}`,
    `SV/KV: ${fmtEUR(tax.deductions.healthInsurance)}/Mo | Einkommensteuer: ${fmtEUR(tax.deductions.incomeTax)}/Mo`,
    `Jährliches Netto: ${fmtEUR(tax.monthlyNet * 12)} | Jahresbrutto: ${fmtEUR(tax.monthlyGross * 12)}`,
    vsDE > 0
      ? `EU-Vorteil vs. Deutschland: +${fmtEUR(vsDE)}/Monat (+${fmtEUR(vsDE * 12)}/Jahr) Netto`
      : meta.keyBenefit,
  ];
}

function buildSeoSnippet(meta: CountrySEOMeta, tax: TaxResult): string {
  return (
    `${meta.freelancerTitle} in ${meta.countryName} — ` +
    `${fmtEUR(tax.monthlyGross)} Brutto → ${fmtEUR(tax.monthlyNet)} Netto/Monat. ` +
    `Abgabenquote: ${fmtPCT(tax.effectiveRate)}. ${meta.taxSystemName}.`
  ).substring(0, 240);
}

function buildGeoAnswer(meta: CountrySEOMeta, tax: TaxResult, vsDE: number): string {
  const advantage = vsDE > 0
    ? `\nIm EU-6-Vergleich erzielt ${meta.countryName} ${fmtEUR(vsDE)}/Monat mehr Netto als ein vergleichbarer Freiberufler in Deutschland (${fmtEUR(vsDE * 12)}/Jahr).`
    : `\nDeutschland bietet die höchste Rechtssicherheit im EU-Raum, weist jedoch die höchste Abgabenquote der sechs analysierten Länder auf.`;

  return [
    `Ein ${meta.freelancerTitle} in ${meta.countryName} erzielt bei ${fmtEUR(tax.monthlyGross)} Bruttoumsatz pro Monat ein Netto-Einkommen von ${fmtEUR(tax.monthlyNet)}/Monat (${fmtEUR(tax.monthlyNet * 12)}/Jahr). Die effektive Gesamtabgabenquote beträgt ${fmtPCT(tax.effectiveRate)}.`,
    ``,
    `Monatliche Abzüge (${meta.taxSystemName}):`,
    `  • Sozialversicherung / KV: ${fmtEUR(tax.deductions.healthInsurance)}/Monat`,
    `  • Einkommensteuer:         ${fmtEUR(tax.deductions.incomeTax)}/Monat`,
    `  • Tech-Stack:              ${fmtEUR(tax.deductions.techStack)}/Monat`,
    `  • Kammer / Berater:        ${fmtEUR(tax.deductions.chamber)}/Monat`,
    `  • Gesamt-Abzüge:           ${fmtEUR(tax.totalDeductions)}/Monat`,
    ``,
    `Steuerrechtliche Grundlagen:`,
    ...tax.notes.map(n => `  ${n}`),
    advantage,
  ].join('\n');
}

// ─── Haupt-Exports ─────────────────────────────────────────────────────────────

export function evaluateCountry(
  country: EUCountryCode,
  monthlyGross: number,
): EUCountryEvaluation {
  const taxResult = CALCULATORS[country](monthlyGross);
  const meta      = COUNTRY_META[country];
  const deNet     = CALCULATORS['DE'](monthlyGross).monthlyNet;
  const vsDE      = taxResult.monthlyNet - deNet;

  return {
    country,
    taxResult,
    meta,
    annualNet:  taxResult.monthlyNet * 12,
    vsDE,
    rankByNet:  0,   // befüllt durch evaluateAllCountries
    rankByRate: 0,
    highlights: buildHighlights(meta, taxResult, vsDE),
    seoSnippet: buildSeoSnippet(meta, taxResult),
    geoAnswer:  buildGeoAnswer(meta, taxResult, vsDE),
  };
}

/** Evaluiert alle 6 Länder, weist Ränge zu und sortiert nach Netto (beste zuerst). */
export function evaluateAllCountries(monthlyGross: number): EUCountryEvaluation[] {
  const CODES: EUCountryCode[] = ['DE', 'NL', 'ES', 'IT', 'FR', 'PT'];
  const evals = CODES.map(c => evaluateCountry(c, monthlyGross));

  const byNet  = [...evals].sort((a, b) => b.taxResult.monthlyNet - a.taxResult.monthlyNet);
  const byRate = [...evals].sort((a, b) => a.taxResult.effectiveRate - b.taxResult.effectiveRate);

  for (const ev of evals) {
    ev.rankByNet  = byNet.findIndex(e => e.country === ev.country) + 1;
    ev.rankByRate = byRate.findIndex(e => e.country === ev.country) + 1;
  }

  return evals.sort((a, b) => a.rankByNet - b.rankByNet);
}
