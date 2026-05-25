/**
 * AuthorityOS — Live Test Runner
 * ═══════════════════════════════════════════════════════════════
 * Validierungs-Pipeline + Steuer-Vergleich DE vs. NL
 *
 * Nische:  Premium BBQ & Dry Aging Academy
 * Umsatz:  5.000 € / Monat (Bruttoumsatz angenommen)
 *
 * Ausführen: npx tsx src/test-runner.ts
 * ═══════════════════════════════════════════════════════════════
 */

import { ValidatorEngine }          from './engine/validatorEngine';
import { SeoAnalyzer }              from './services/seoAnalyzer';
import { MonetizationEvaluator }    from './services/monetizationEvaluator';
import { ContentMatchAnalyzer }     from './services/contentMatchAnalyzer';
import { calculateDE, calculateNL } from './services/taxCalculator';
import type { NicheInput }          from './types/validator';

// ─── Formatierung ─────────────────────────────────────────────────────────────

const EUR  = (n: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
const PCT  = (n: number) => (n * 100).toFixed(1).padStart(5) + ' %';
const W    = 64;
const SEP  = '─'.repeat(W);
const DSEP = '═'.repeat(W);

const rpad = (s: string | number, n: number) => String(s).padEnd(n);
const lpad = (s: string | number, n: number) => String(s).padStart(n);

function header(title: string) {
  console.log('\n' + DSEP);
  console.log('  ' + title);
  console.log(DSEP);
}

function section(title: string) {
  console.log('\n┌' + SEP + '┐');
  console.log('│  ' + rpad(title, W - 2) + '│');
  console.log('├' + SEP + '┤');
}

function sectionEnd() {
  console.log('└' + SEP + '┘');
}

function row(label: string, de: string, nl: string) {
  const L = 26, C = 17, R = 17;
  console.log('│  ' + rpad(label, L) + lpad(de, C) + lpad(nl, R) + '  │');
}

// ─── Hauptprogramm ────────────────────────────────────────────────────────────

async function main() {
  const NICHE         = 'Premium BBQ & Dry Aging Academy';
  const MONTHLY_GROSS = 5_000;

  header('AUTHORITYOS — NICHE VALIDATION + STEUER-VERGLEICH DE vs. NL');
  console.log(`  Nische:  ${NICHE}`);
  console.log(`  Umsatz:  ${EUR(MONTHLY_GROSS)} / Monat (Bruttoumsatz)`);

  // ── Engine ───────────────────────────────────────────────────────────────────

  const engine = new ValidatorEngine({
    seo:          new SeoAnalyzer({ provider: 'simulation', keywordLimit: 80 }),
    monetization: new MonetizationEvaluator(),
    contentMatch: new ContentMatchAnalyzer({ provider: 'simulation' }),
  });

  console.log('\n▶  Validierungs-Engine läuft …');
  const t0 = Date.now();

  const [de, nl] = await Promise.all([
    engine.validate({ niche: NICHE, language: 'de', targetRegion: 'DE' } satisfies NicheInput),
    engine.validate({ niche: NICHE, language: 'nl', targetRegion: 'NL' } satisfies NicheInput),
  ]);

  console.log(`✓  Abgeschlossen in ${Date.now() - t0} ms  (DE: ${de.durationMs} ms | NL: ${nl.durationMs} ms)\n`);

  // ── Authority Score ───────────────────────────────────────────────────────────

  section('AUTHORITY SCORE — Nischen-Validierung');
  row('',              'Deutschland (DE)',                'Niederlande (NL)');
  row(SEP.slice(0,26), '─'.repeat(17),                   '─'.repeat(17));
  row('Verdict',       de.score.verdict,                  nl.score.verdict);
  row('Overall',       `${de.score.overall}/100`,         `${nl.score.overall}/100`);
  row('SEO',           `${de.score.breakdown.seo}/100`,          `${nl.score.breakdown.seo}/100`);
  row('Competition',   `${de.score.breakdown.competition}/100`,  `${nl.score.breakdown.competition}/100`);
  row('Monetization',  `${de.score.breakdown.monetization}/100`, `${nl.score.breakdown.monetization}/100`);
  row('Content Match', `${de.score.breakdown.contentMatch}/100`, `${nl.score.breakdown.contentMatch}/100`);
  row('Confidence',    de.score.confidence.toFixed(2),            nl.score.confidence.toFixed(2));
  sectionEnd();

  // ── Top Keywords (DE) ────────────────────────────────────────────────────────

  section('TOP KEYWORDS — DE-Simulation (opportunity-ranked)');
  console.log('│  ' + rpad('Keyword', 36) + lpad('Vol/Mo', 8) + lpad('KD', 5) + lpad('Intent', 14) + '  │');
  console.log('│  ' + '─'.repeat(W - 2) + '  │'.slice(-3));
  de.metrics.seo.topKeywords.slice(0, 5).forEach(k => {
    console.log('│  ' +
      rpad(k.keyword, 36) +
      lpad(k.searchVolume.toLocaleString('de-DE'), 8) +
      lpad(k.difficulty, 5) +
      lpad(k.intent, 14) +
      '  │');
  });
  const { avgSearchVolume, avgDifficulty, longTailRatio } = de.metrics.seo;
  console.log('│  ' + rpad(
    `Avg. Volumen: ${avgSearchVolume.toLocaleString('de-DE')}/Mo  |  Avg. KD: ${avgDifficulty}  |  Long-Tail-Quote: ${(longTailRatio * 100).toFixed(0)} %`,
    W - 2,
  ) + '  │'.slice(-3));
  sectionEnd();

  // ── Monetization Snapshot ────────────────────────────────────────────────────

  const aff = de.metrics.monetization.affiliate;
  section('MONETIZATION SNAPSHOT — auf Basis Engine-Simulation');
  console.log(`│  Affiliate Rev.   @ 10k Besucher/Mo:   ${lpad(EUR(aff.revenueAt10kVisits), 12)}                  │`);
  console.log(`│  Affiliate Rev.   @ 50k Besucher/Mo:   ${lpad(EUR(aff.revenueAt50kVisits), 12)}                  │`);
  console.log(`│  Programmatic RPM (Mediavine-Klasse):  ${lpad(EUR(de.metrics.monetization.adRpmEur) + '/1k Sessions', 18)}             │`);
  console.log(`│  Digital Product-Score:                ${lpad(de.metrics.monetization.digitalProductFeasibility + '/100', 8)}                       │`);
  console.log(`│  Sponsoring-Score:                     ${lpad(de.metrics.monetization.sponsorshipFeasibility + '/100', 8)}                       │`);
  if (de.metrics.monetization.saasTiers.length) {
    const tiers = de.metrics.monetization.saasTiers.map(t => `${t.tier}: ${EUR(t.projectedMrr)} MRR`).join('  |  ');
    console.log(`│  SaaS-Tiers:  ${rpad(tiers, W - 14)}│`);
  }
  sectionEnd();

  // ── Steuer-Vergleich ─────────────────────────────────────────────────────────

  const deTax = calculateDE(MONTHLY_GROSS);
  const nlTax = calculateNL(MONTHLY_GROSS);

  section(`STEUER-VERGLEICH @ ${EUR(MONTHLY_GROSS)} / MONAT BRUTTOUMSATZ`);
  row('',                          'Deutschland (DE)',  'Niederlande (NL)');
  row('─'.repeat(26),              '─'.repeat(17),      '─'.repeat(17));
  row('Bruttoumsatz',              EUR(MONTHLY_GROSS),  EUR(MONTHLY_GROSS));
  row('',                          '',                  '');
  row('── Abzüge ──────────────',  '──────────────────', '──────────────────');
  row('Kranken-/Pflegeversichers.', EUR(-deTax.deductions.healthInsurance), EUR(-nlTax.deductions.healthInsurance));
  row('Einkommensteuer',            EUR(-deTax.deductions.incomeTax),       EUR(-nlTax.deductions.incomeTax));
  row('Tech-Stack',                 EUR(-deTax.deductions.techStack),       EUR(-nlTax.deductions.techStack));
  row('IHK (DE) / KVK (NL)',       EUR(-deTax.deductions.chamber),         EUR(-nlTax.deductions.chamber));
  row('',                          '',                  '');
  row('Gesamt-Abzüge',             EUR(-deTax.totalDeductions),            EUR(-nlTax.totalDeductions));
  row('Effektive Abgabenquote',    PCT(deTax.effectiveRate),               PCT(nlTax.effectiveRate));
  row('─'.repeat(26),              '─'.repeat(17),      '─'.repeat(17));
  row('★  NETTO CASH-IN',          EUR(deTax.monthlyNet),                  EUR(nlTax.monthlyNet));
  sectionEnd();

  // ── Delta ────────────────────────────────────────────────────────────────────

  const deltaMonthly = nlTax.monthlyNet - deTax.monthlyNet;
  const deltaYearly  = deltaMonthly * 12;
  const favours      = deltaMonthly > 0 ? 'NL' : 'DE';

  console.log(`\n  → ${favours}-Vorteil: ${EUR(Math.abs(deltaMonthly))} / Monat  |  ${EUR(Math.abs(deltaYearly))} / Jahr`);
  console.log(`  → DE Nettoquote: ${PCT(deTax.monthlyNet / MONTHLY_GROSS)}  |  NL Nettoquote: ${PCT(nlTax.monthlyNet / MONTHLY_GROSS)}`);

  // ── Rechtsgrundlagen ─────────────────────────────────────────────────────────

  for (const [label, mod] of [['DE', deTax], ['NL', nlTax]] as const) {
    section(`RECHTSGRUNDLAGEN & ANNAHMEN — ${label}`);
    for (const note of mod.notes) {
      console.log(`│  • ${rpad(note, W - 3)}│`);
    }
    sectionEnd();
  }

  // ── Engine-Reasoning ─────────────────────────────────────────────────────────

  section('ENGINE REASONING — Deutschland');
  for (const r of de.score.reasoning)  console.log(`│  ✦  ${rpad(r, W - 4)}│`);
  if (de.score.warnings.length) {
    console.log('│  ' + '─'.repeat(W - 2) + '  │'.slice(-3));
    for (const w of de.score.warnings) console.log(`│  ⚠  ${rpad(w, W - 4)}│`);
  }
  sectionEnd();

  console.log(`\n  Next Action: ${de.score.nextAction}`);
  console.log(`  Engine v${de.engineVersion}  |  Simulation mode  |  Kein API-Call\n`);
}

main().catch(err => { console.error('FEHLER:', err); process.exit(1); });
