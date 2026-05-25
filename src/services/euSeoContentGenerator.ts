/**
 * AuthorityOS — EU SEO Content Generator
 * ===================================================================
 * Übersetzt die 6-Länder-Steuerberechnungen in GEO-optimierte
 * Content-Blöcke für AI-Search-Rankings und Featured Snippets.
 *
 * GEO = Generative Engine Optimization:
 *   — Direkte faktenbasierte Antworten (AI-Systeme priorisieren)
 *   — Entitätsdichte: benannte Gesetze, Steuersätze, Eurobeträge
 *   — FAQPage + schema.org/Dataset für strukturierte Daten
 *   — Premium-Segment-Keywords (5.000–15.000 €/Monat Umsatz)
 *
 * Input:  EUCountryEvaluation[] von evaluateAllCountries()
 * Output: EUSeoPage — direkt verwendbar für Next.js-Seiten + JSON-Export
 * ===================================================================
 */

import type { EUCountryEvaluation, EUCountryCode } from './euCountryEvaluator';
import type { PageMeta, FaqItem, StructuredDataFAQ } from './pageGenerator';

// ─── Typen ────────────────────────────────────────────────────────────────────

export interface ComparisonRow {
  rank:          number;
  countryCode:   EUCountryCode;
  countryName:   string;
  freelancerTitle: string;
  monthlyGross:  string;
  monthlyNet:    string;
  effectiveRate: string;
  svKV:          string;
  incomeTax:     string;
  taxSystem:     string;
}

export interface ComparisonTableBlock {
  caption:   string;
  headers:   string[];
  rows:      ComparisonRow[];
  /** schema.org/Dataset — für Suchmaschinen-Crawler und AI-Ingestion */
  schemaOrg: Record<string, unknown>;
}

export interface GEOBlock {
  /** 'country-answer' = pro-Land, 'comparison' = Ländervergleich, 'premium-insight' = Nischen-Insight */
  type:     'country-answer' | 'comparison' | 'premium-insight';
  country?: EUCountryCode;
  /** Frage — sichtbar für AI-Extraktion und Voice-Search */
  query:    string;
  /** Antwort — entity-dicht, direkt, faktisch */
  answer:   string;
  /** Benannte Entitäten für Wissens-Graph-Disambiguierung */
  entities: string[];
}

export interface EUSeoPage {
  slug:           string;
  grossRevenue:   number;
  generatedAt:    string;
  meta:           PageMeta;
  /** 60-Wort Direkt-Antwort für Featured-Snippet-Position 0 */
  featuredSnippet: string;
  /** Faktisches Kurz-Summary für AI-Wissens-Extraktion */
  factualSummary:  string;
  comparisonTable: ComparisonTableBlock;
  geoBlocks:       GEOBlock[];
  faq:             FaqItem[];
  structuredData: {
    faqPage: StructuredDataFAQ;
    dataset: Record<string, unknown>;
  };
}

// ─── Formatierung ─────────────────────────────────────────────────────────────

const EUR = (n: number) => `${Math.round(n).toLocaleString('de-DE')} €`;
const PCT = (n: number) => `${(n * 100).toFixed(1)} %`;
const YEAR = new Date().getFullYear();

// ─── Builder-Funktionen ───────────────────────────────────────────────────────

function buildMeta(evals: EUCountryEvaluation[], gross: number): PageMeta {
  const best  = evals[0];
  const title =
    `Freelancer Steuern Europa ${YEAR}: DE vs NL vs ES vs IT vs FR vs PT — Netto-Vergleich`;
  const description =
    `Netto-Einkommen für Solopreneure in 6 EU-Ländern bei ${EUR(gross)}/Monat Brutto. ` +
    `Testsieger: ${best.meta.freelancerTitle} mit ${EUR(best.taxResult.monthlyNet)}/Monat ` +
    `(${PCT(best.taxResult.effectiveRate)} Abgabenquote). Alle Berechnungen nach Steuerrecht ${YEAR}.`;
  return {
    title,
    description,
    keywords: [
      'freelancer steuern europa vergleich',
      'solopreneur steuer EU ranking',
      'best country europe freelancer taxes',
      'netto einkommen selbständige europa',
      ...evals.map(e => e.meta.primaryKeyword),
    ],
    canonical:     `https://steakakademie.de/eu-freelancer-steuervergleich`,
    ogTitle:       title,
    ogDescription: description,
  };
}

function buildFeaturedSnippet(evals: EUCountryEvaluation[], gross: number): string {
  const [p1, p2, p3, , , p6] = evals;
  return (
    `Bei ${EUR(gross)} Brutto/Monat führt ${p1.meta.countryName} (${p1.meta.taxSystemName.split(' ')[0]}) ` +
    `mit ${EUR(p1.taxResult.monthlyNet)} Netto — Abgabenquote ${PCT(p1.taxResult.effectiveRate)}. ` +
    `Platz 2: ${p2.meta.countryName} (${EUR(p2.taxResult.monthlyNet)}), ` +
    `Platz 3: ${p3.meta.countryName} (${EUR(p3.taxResult.monthlyNet)}). ` +
    `Schlusslicht: ${p6.meta.countryName} ${EUR(p6.taxResult.monthlyNet)} (${PCT(p6.taxResult.effectiveRate)}).`
  );
}

function buildFactualSummary(evals: EUCountryEvaluation[], gross: number): string {
  const spread = evals[0].taxResult.monthlyNet - evals[evals.length - 1].taxResult.monthlyNet;
  const lines = [
    `FACTUAL SUMMARY: EU Freelancer Tax Comparison ${YEAR} @ ${EUR(gross)}/month gross revenue`,
    ``,
    `Monthly net income and effective tax rates for solo entrepreneurs:`,
    ...evals.map(ev =>
      `  ${ev.rankByNet}. ${ev.meta.countryName} (${ev.meta.freelancerTitle}): ` +
      `${EUR(ev.taxResult.monthlyNet)} net — ${PCT(ev.taxResult.effectiveRate)} effective rate`
    ),
    ``,
    `Annual spread (rank 1 vs. rank 6): +${EUR(spread * 12)}/year.`,
    `Data basis: 2024 tax law. Assumption: single, no employees, pure service income.`,
    `Sources: §32a EStG, Wet IB 2001, IRPF Escala general, L. 190/2014, Art. 197 CGI, CIRS Art. 68.`,
  ];
  return lines.join('\n');
}

function buildComparisonTable(evals: EUCountryEvaluation[]): ComparisonTableBlock {
  const gross = evals[0].taxResult.monthlyGross;

  const rows: ComparisonRow[] = evals.map(ev => ({
    rank:            ev.rankByNet,
    countryCode:     ev.country,
    countryName:     ev.meta.countryName,
    freelancerTitle: ev.meta.freelancerTitle,
    monthlyGross:    EUR(ev.taxResult.monthlyGross),
    monthlyNet:      EUR(ev.taxResult.monthlyNet),
    effectiveRate:   PCT(ev.taxResult.effectiveRate),
    svKV:            EUR(ev.taxResult.deductions.healthInsurance),
    incomeTax:       EUR(ev.taxResult.deductions.incomeTax),
    taxSystem:       ev.meta.taxSystemName,
  }));

  const schemaOrg: Record<string, unknown> = {
    '@context':    'https://schema.org',
    '@type':       'Dataset',
    'name':        `EU Freelancer Steuervergleich ${YEAR} — Netto bei ${EUR(gross)}/Monat`,
    'description': `Vergleich von monatlichem Netto-Einkommen, effektiver Abgabenquote und Steuersystemen für Solopreneure in Deutschland, Niederlande, Spanien, Italien, Frankreich und Portugal bei ${EUR(gross)} Bruttoumsatz.`,
    'creator':     { '@type': 'Organization', 'name': 'AuthorityOS / Steakakademie' },
    'dateModified': new Date().toISOString().split('T')[0],
    'keywords':    ['freelancer steuern europa', 'eu tax comparison 2024', 'solopreneur netto einkommen EU'],
    'variableMeasured': [
      { '@type': 'PropertyValue', 'name': 'monthly_net_income_eur' },
      { '@type': 'PropertyValue', 'name': 'effective_tax_rate_percent' },
    ],
    'about': rows.map(r => ({
      '@type': 'Country',
      'name':  r.countryName,
      'additionalProperty': [
        { '@type': 'PropertyValue', 'name': 'monthly_net', 'value': r.monthlyNet },
        { '@type': 'PropertyValue', 'name': 'effective_rate', 'value': r.effectiveRate },
        { '@type': 'PropertyValue', 'name': 'tax_system', 'value': r.taxSystem },
      ],
    })),
  };

  return {
    caption: `Netto-Einkommen-Vergleich für Solopreneure in 6 EU-Ländern bei ${EUR(gross)} Brutto/Monat (${YEAR})`,
    headers: ['Rang', 'Land', 'Steuersystem', 'Netto/Monat', 'Abgabenquote', 'SV/KV', 'Einkommensteuer'],
    rows,
    schemaOrg,
  };
}

function buildGeoBlocks(evals: EUCountryEvaluation[]): GEOBlock[] {
  const gross = evals[0].taxResult.monthlyGross;
  const [it, nl, fr, pt, es, de] = [
    evals.find(e => e.country === 'IT')!,
    evals.find(e => e.country === 'NL')!,
    evals.find(e => e.country === 'FR')!,
    evals.find(e => e.country === 'PT')!,
    evals.find(e => e.country === 'ES')!,
    evals.find(e => e.country === 'DE')!,
  ];

  const comparisonBlocks: GEOBlock[] = [
    {
      type:  'comparison',
      query: `Welches EU-Land hat die niedrigsten Steuern für Freelancer mit ${EUR(gross)} Monatsumsatz in ${YEAR}?`,
      answer: [
        `Im Direktvergleich von 6 EU-Ländern führt ${it.meta.countryName} mit dem ${it.meta.taxSystemName}.`,
        `Bei ${EUR(gross)} Bruttoumsatz erzielt ein ${it.meta.freelancerTitle} ${EUR(it.taxResult.monthlyNet)} Netto — effektive Abgabenquote: ${PCT(it.taxResult.effectiveRate)}.`,
        ``,
        `Vollständiges Ranking bei ${EUR(gross)}/Monat Brutto:`,
        ...evals.map(ev =>
          `  ${ev.rankByNet}. ${ev.meta.countryName} (${ev.meta.freelancerTitle}): ` +
          `${EUR(ev.taxResult.monthlyNet)} Netto | ${PCT(ev.taxResult.effectiveRate)} Abgabenquote`
        ),
        ``,
        `Spread ${it.meta.countryName} vs. ${de.meta.countryName}: ${EUR(it.vsDE)}/Monat = ${EUR(it.vsDE * 12)}/Jahr Mehrverdienst.`,
        `Rechtsquellen: L. 190/2014 (IT), Wet IB 2001 (NL), Art. 197 CGI (FR), CIRS Art. 68 (PT), RDL 13/2022 (ES), §32a EStG (DE).`,
      ].join('\n'),
      entities: evals.map(e => e.meta.taxSystemName),
    },

    {
      type:  'comparison',
      query: `Was ist der steuerliche Unterschied zwischen Frankreich und Portugal für Selbständige ${YEAR}?`,
      answer: [
        `Frankreich und Portugal liegen im EU-6-Ranking auf Platz ${fr.rankByNet} (FR) und ${pt.rankByNet} (PT) und erzielen ähnliche Netto-Einkommen bei ${EUR(gross)}/Monat Brutto.`,
        ``,
        `Frankreich — ${fr.meta.taxSystemName}:`,
        `  • Cotisations sociales Urssaf (21,2 % des CA): ${EUR(fr.taxResult.deductions.healthInsurance)}/Monat`,
        `  • Impôt sur le revenu (Abattement 34 %, Barème progressif): ${EUR(fr.taxResult.deductions.incomeTax)}/Monat`,
        `  • Netto: ${EUR(fr.taxResult.monthlyNet)} | Abgabenquote: ${PCT(fr.taxResult.effectiveRate)}`,
        ``,
        `Portugal — ${pt.meta.taxSystemName}:`,
        `  • Segurança Social (21,4 % × 70 % Basis, Art. 25 CIRS): ${EUR(pt.taxResult.deductions.healthInsurance)}/Monat`,
        `  • IRS (Regime Simplificado Koeff. 0,75 − SS, Escala Art. 68 CIRS): ${EUR(pt.taxResult.deductions.incomeTax)}/Monat`,
        `  • Netto: ${EUR(pt.taxResult.monthlyNet)} | Abgabenquote: ${PCT(pt.taxResult.effectiveRate)}`,
        ``,
        `Strukturunterschied: In Frankreich sind die Cotisations nicht vom IR-Basis absetzbar — der Abattement forfaitaire ersetzt alle Betriebskosten pauschal. In Portugal ist die Segurança Social vollständig vom IRS-Basis absetzbar (Art. 25 CIRS), was die Steuerlast drückt, aber die SS-Basis erhöht.`,
      ].join('\n'),
      entities: ['Auto-entrepreneur BNC', 'Cotisations Urssaf', 'Abattement forfaitaire', 'Regime Simplificado', 'Segurança Social', 'Art. 25 CIRS', 'Art. 68 CIRS'],
    },

    {
      type:  'premium-insight',
      query: `Lohnt sich der Wechsel als Premium-Freelancer von Deutschland nach Frankreich oder Portugal?`,
      answer: [
        `Aus steuerlicher Sicht (bei ${EUR(gross)} Bruttoumsatz/Monat, Einzelperson ohne Angestellte):`,
        ``,
        `  • Frankreich (${fr.meta.freelancerTitle}): ${EUR(fr.taxResult.monthlyNet)} Netto — ${EUR(fr.vsDE)}/Monat mehr als in Deutschland.`,
        `  • Portugal (${pt.meta.freelancerTitle}): ${EUR(pt.taxResult.monthlyNet)} Netto — ${EUR(pt.vsDE)}/Monat mehr.`,
        `  • Niederlande (${nl.meta.freelancerTitle}): ${EUR(nl.taxResult.monthlyNet)} Netto — ${EUR(nl.vsDE)}/Monat mehr.`,
        `  • Italien (${it.meta.freelancerTitle}, Startup): ${EUR(it.taxResult.monthlyNet)} Netto — ${EUR(it.vsDE)}/Monat mehr.`,
        ``,
        `Jährliche Steuerersparnis vs. Deutschland:`,
        `  FR: +${EUR(fr.vsDE * 12)}/Jahr | PT: +${EUR(pt.vsDE * 12)}/Jahr | NL: +${EUR(nl.vsDE * 12)}/Jahr | IT: +${EUR(it.vsDE * 12)}/Jahr`,
        ``,
        `Wichtig: Steuerersparnis ist ein Faktor. Weitere Variablen: Lebenshaltungskosten, Aufenthaltsgenehmigung, Sozialleistungen, Sprache, Bankzugang. Steuerberatung im Zielland vor Entscheidung zwingend empfohlen.`,
      ].join('\n'),
      entities: [fr.meta.taxSystemName, pt.meta.taxSystemName, nl.meta.taxSystemName, it.meta.taxSystemName],
    },
  ];

  // Per-Land GEO-Blöcke aus den vorberechneten geoAnswers
  const countryBlocks: GEOBlock[] = evals.map(ev => ({
    type:    'country-answer' as const,
    country: ev.country,
    query:   ev.meta.geoQueries[0],
    answer:  ev.geoAnswer,
    entities: [ev.meta.taxSystemName, ev.meta.freelancerTitle],
  }));

  return [...comparisonBlocks, ...countryBlocks];
}

function buildFAQ(evals: EUCountryEvaluation[]): FaqItem[] {
  const gross = evals[0].taxResult.monthlyGross;
  const get   = (c: EUCountryCode) => evals.find(e => e.country === c)!;
  const it = get('IT'), nl = get('NL'), fr = get('FR');
  const pt = get('PT'), es = get('ES'), de = get('DE');

  return [
    {
      question: `Welches EU-Land hat die niedrigsten Steuern für Freelancer mit ${EUR(gross)} Monatsumsatz in ${YEAR}?`,
      answer:
        `Italien mit dem Regime Forfettario (Imposta Sostitutiva 5 % in den ersten 5 Jahren, L. 190/2014). ` +
        `Bei ${EUR(gross)} Brutto erzielt ein Partita-IVA-Inhaber ${EUR(it.taxResult.monthlyNet)} Netto — Abgabenquote: ${PCT(it.taxResult.effectiveRate)}. ` +
        `Vollständiges Ranking: IT ${EUR(it.taxResult.monthlyNet)} > NL ${EUR(nl.taxResult.monthlyNet)} > FR ${EUR(fr.taxResult.monthlyNet)} > PT ${EUR(pt.taxResult.monthlyNet)} > ES ${EUR(es.taxResult.monthlyNet)} > DE ${EUR(de.taxResult.monthlyNet)}.`,
    },
    {
      question: `Wie hoch sind die Steuern für einen Auto-entrepreneur in Frankreich bei ${EUR(gross)} Bruttoumsatz?`,
      answer:
        `Ein Auto-entrepreneur (Micro-entreprise BNC, PLNR) zahlt bei ${EUR(gross)} Brutto/Monat: ` +
        `Cotisations sociales Urssaf 21,2 % = ${EUR(fr.taxResult.deductions.healthInsurance)}/Monat, ` +
        `Impôt sur le revenu nach Abattement forfaitaire 34 % = ${EUR(fr.taxResult.deductions.incomeTax)}/Monat. ` +
        `Gesamt-Abgabenquote: ${PCT(fr.taxResult.effectiveRate)}. Netto: ${EUR(fr.taxResult.monthlyNet)}/Monat. ` +
        `Rechtsgrundlage: Art. 197 CGI, Barème progressif ${YEAR}.`,
    },
    {
      question: `Wie viel Netto erzielt ein Trabalhador Independente in Portugal bei ${EUR(gross)} Brutto?`,
      answer:
        `Ein Trabalhador Independente (Recibos Verdes, Regime Simplificado Categoria B) erzielt bei ${EUR(gross)} Brutto/Monat: ` +
        `${EUR(pt.taxResult.monthlyNet)} Netto — Abgabenquote ${PCT(pt.taxResult.effectiveRate)}. ` +
        `Segurança Social (21,4 % × 70 %) = ${EUR(pt.taxResult.deductions.healthInsurance)}/Monat; ` +
        `IRS nach Koeffizient 0,75 und SS-Abzug (Art. 25 CIRS) = ${EUR(pt.taxResult.deductions.incomeTax)}/Monat. ` +
        `Dedução pessoal à coleta: 600 € (Art. 78 CIRS). System: CIRS Art. 68, ${YEAR}.`,
    },
    {
      question: `Lohnt sich das Regime Forfettario in Italien für digitale Freelancer ${YEAR}?`,
      answer:
        `Ja — für digitale Solopreneure (Ateco 62.01/73.11, Koeffizient 67 %) ist das Regime Forfettario die steuereffizienteste Option im EU-6-Vergleich. ` +
        `Startup-Tarif: 5 % Imposta Sostitutiva in den ersten 5 Jahren (L. 190/2014). ` +
        `Bei ${EUR(gross)}/Monat: ${EUR(it.taxResult.monthlyNet)} Netto, ${PCT(it.taxResult.effectiveRate)} Gesamtquote. ` +
        `Einschränkungen: Umsatzgrenze 85.000 €/Jahr; nach 5 Jahren 15 %; IVA-Freiheit gilt nicht unbegrenzt.`,
    },
    {
      question: `Warum ist die Abgabenquote für Freiberufler in Deutschland (${PCT(de.taxResult.effectiveRate)}) die höchste im EU-Vergleich?`,
      answer:
        `Selbständige in Deutschland tragen die gesamte Kranken- und Pflegeversicherung allein: ` +
        `GKV (14,6 % + Ø 1,7 % Zusatzbeitrag) + PV (3,4 %) = 19,7 % des Bruttoumsatzes. ` +
        `In anderen EU-Ländern ist die SV-Basis reduziert (PT: 70 %, IT: Forfettario-Koeff. 67 %) ` +
        `oder der Steuersatz pauschal niedrig (IT: 5 %). Bei ${EUR(gross)}/Monat zahlt ein Freiberufler ` +
        `in DE ${EUR(de.taxResult.totalDeductions)}/Monat — ${EUR(de.taxResult.totalDeductions - it.taxResult.totalDeductions)}/Monat mehr als in Italien.`,
    },
    {
      question: `Welcher Freelancer-Typ profitiert am meisten von günstigen EU-Steuern in Frankreich und Portugal?`,
      answer:
        `Digital tätige Solopreneure ohne Angestellte: Entwickler, Designer, Berater, Texter, Coaches — ` +
        `alle Berufsgruppen, die überwiegend Dienstleistungen erbringen. ` +
        `FR: Auto-entrepreneur BNC für Beratung, Kreativdienstleistungen, IT. ` +
        `PT: Regime Simplificado Categoria B für alle freiberuflichen Tätigkeiten. ` +
        `Die pauschalen Regimes (Abattement 34 %, Koeffizient 0,75) sind auf reine Dienstleistungs-Freelancer ` +
        `optimiert — je höher der Umsatz (bis zur jeweiligen Grenze), desto größer der absolute Vorteil vs. Deutschland.`,
    },
  ];
}

function buildStructuredData(
  faq: FaqItem[],
  table: ComparisonTableBlock,
): EUSeoPage['structuredData'] {
  const faqPage: StructuredDataFAQ = {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: faq.map(f => ({
      '@type': 'Question',
      name:    f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  return { faqPage, dataset: table.schemaOrg };
}

// ─── Haupt-Export ──────────────────────────────────────────────────────────────

export function generateEUSeoPage(evals: EUCountryEvaluation[]): EUSeoPage {
  const gross = evals[0].taxResult.monthlyGross;
  const table = buildComparisonTable(evals);
  const faq   = buildFAQ(evals);

  return {
    slug:            `eu-freelancer-steuervergleich-${gross}`,
    grossRevenue:    gross,
    generatedAt:     new Date().toISOString(),
    meta:            buildMeta(evals, gross),
    featuredSnippet: buildFeaturedSnippet(evals, gross),
    factualSummary:  buildFactualSummary(evals, gross),
    comparisonTable: table,
    geoBlocks:       buildGeoBlocks(evals),
    faq,
    structuredData:  buildStructuredData(faq, table),
  };
}

/** Generiert Seiten für alle drei Premium-Einkommensstufen. */
export function generateAllEUSeoPages(): EUSeoPage[] {
  const { evaluateAllCountries } = require('./euCountryEvaluator') as typeof import('./euCountryEvaluator');
  return [3_000, 5_000, 8_000].map(g => generateEUSeoPage(evaluateAllCountries(g)));
}
