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

import { ValidatorEngine }       from './engine/validatorEngine';
import { SeoAnalyzer }           from './services/seoAnalyzer';
import { MonetizationEvaluator } from './services/monetizationEvaluator';
import { ContentMatchAnalyzer }  from './services/contentMatchAnalyzer';
import type { NicheInput, ValidationResult } from './types/validator';

// ─── Formatierung ─────────────────────────────────────────────────────────────

const EUR  = (n: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
const PCT  = (n: number) => (n * 100).toFixed(1).padStart(5) + ' %';
const W    = 64;
const SEP  = '─'.repeat(W);
const DSEP = '═'.repeat(W);

const rpad  = (s: string | number, n: number) => String(s).padEnd(n);
const lpad  = (s: string | number, n: number) => String(s).padStart(n);

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

function divider(char = '·') {
  console.log('│  ' + char.repeat(W - 2) + '  │'.slice(-3));
}

// ─── Steuermodul Deutschland (DE) ─────────────────────────────────────────────
// Basis: Einzelunternehmer / Freiberufler, Steuerrecht 2024
// Quellen: §32a EStG, §241a GKV-Beitragssatz, §55 SGB XI

function germanIncomeTax(zvE: number): number {
  // Grundfreibetrag 2024: 11.604 €
  if (zvE <= 11_604) return 0;

  // 1. Progressionszone: 11.604 – 17.005 €
  if (zvE <= 17_005) {
    const y = (zvE - 11_604) / 10_000;
    return Math.round((922.98 * y + 1_400) * y);
  }

  // 2. Progressionszone: 17.005 – 66.760 €
  if (zvE <= 66_760) {
    const y = (zvE - 17_005) / 10_000;
    return Math.round((181.19 * y + 2_397) * y + 1_025.38);
  }

  // Spitzensteuersatz: 66.760 – 277.826 €
  if (zvE <= 277_826) return Math.round(0.42 * zvE - 10_911.92);

  // Reichensteuer: > 277.826 €
  return Math.round(0.45 * zvE - 19_246.67);
}

function taxDE(monthlyGross: number) {
  const annual      = monthlyGross * 12;
  const tech        = 150;            // Tech-Stack €/Monat
  const ikhYear     = 250;            // IHK-Pauschalbeitrag €/Jahr

  // Sozialversicherung: Selbstständige zahlen Arbeitgeber- + Arbeitnehmeranteil
  const gkvRate     = 0.163;          // 14,6 % Allg. Beitrag + 1,7 % Zusatzbeitrag
  const pvRate      = 0.034;          // Pflegeversicherung (Kinderlos)
  const kvMonthly   = Math.round(monthlyGross * (gkvRate + pvRate));   // €985

  // Zu versteuerndes Einkommen (ZvE) nach Abzug aller Kosten
  const zvE = annual
    - kvMonthly * 12          // KV/PV als Sonderausgaben absetzbar
    - tech * 12               // Betriebsausgabe
    - ikhYear;                // Betriebsausgabe

  const annualTax   = germanIncomeTax(Math.max(0, zvE));
  const taxMonthly  = Math.round(annualTax / 12);
  const ikhMonthly  = Math.round(ikhYear / 12);

  const deductions  = kvMonthly + tech + ikhMonthly + taxMonthly;
  return {
    label:            'Deutschland (DE)',
    healthInsurance:  kvMonthly,
    incomeTax:        taxMonthly,
    techStack:        tech,
    chamber:          ikhMonthly,
    deductions,
    net:              monthlyGross - deductions,
    effectiveRate:    deductions / monthlyGross,
    zvE:              Math.round(zvE),
    annualTax,
    notes: [
      `ZvE: ${EUR(Math.round(zvE))}/Jahr nach Abzug aller Kosten`,
      'GKV 14,6 % + Zusatzbeitrag 1,7 % + PV 3,4 % (voll selbst getragen)',
      '§32a EStG progressive Einkommensteuer | Grundfreibetrag 11.604 €',
      'Soli-Zuschlag: entfällt bei diesem Einkommensniveau',
      'IHK-Pauschalbeitrag ~250 €/Jahr (umsatzabhängig)',
    ],
  };
}

// ─── Steuermodul Niederlande (NL) ─────────────────────────────────────────────
// Basis: ZZP (Zelfstandige zonder personeel), Steuerrecht 2024
// Quellen: Wet IB 2001, Art. 3.76, Art. 3.79a, Zvw 2024

function nlHeffingskortingen(inkomen: number): number {
  // Algemene heffingskorting: max 3.362 €, Abbau ab 24.813 € bis 75.520 €
  const ahk = inkomen <= 24_813 ? 3_362
    : inkomen >= 75_520 ? 0
    : Math.round(3_362 - ((inkomen - 24_813) / (75_520 - 24_813)) * 3_362);

  // Arbeidskorting (ZZP qualifiziert): max 5.158 €, Abbau ab 39.957 € à 6,51 %
  const ak  = inkomen <= 39_957 ? 5_158
    : Math.max(0, Math.round(5_158 - (inkomen - 39_957) * 0.0651));

  return ahk + ak;
}

function taxNL(monthlyGross: number) {
  const annual      = monthlyGross * 12;
  const tech        = 150;            // Tech-Stack €/Monat
  const kvkYear     = 75;             // KVK-Jahresgebühr (einmalige Registrierung)

  // ZZP-Gewinnermittlung
  const zelfAftr    = 3_750;          // Zelfstandigenaftrek 2024 (wird jährlich gesenkt)
  const winst       = annual - tech * 12 - kvkYear - zelfAftr;
  const mkbVrij     = Math.round(winst * 0.1331); // MKB-Winstvrijstelling 13,31 %
  const boxInkomen  = Math.max(0, winst - mkbVrij);

  // Box-1-Steuersatz 2024
  const baseTax     = boxInkomen <= 75_518
    ? boxInkomen * 0.3697
    : 75_518 * 0.3697 + (boxInkomen - 75_518) * 0.495;

  const credits     = nlHeffingskortingen(boxInkomen);
  const annualTax   = Math.max(0, Math.round(baseTax - credits));
  const taxMonthly  = Math.round(annualTax / 12);

  // Zorgverzekeringswet: Basispremie + Inkomensafhankelijke bijdrage (IAB)
  const zorBase     = 150;            // ~150 €/Monat Basispremie (2024 Richtwert)
  const zorIAB      = Math.round(boxInkomen * 0.0532 / 12);  // 5,32 % des Einkommens
  const zorMonthly  = zorBase + zorIAB;

  const kvkMonthly  = Math.round(kvkYear / 12);
  const deductions  = zorMonthly + tech + kvkMonthly + taxMonthly;

  return {
    label:            'Niederlande (NL)',
    healthInsurance:  zorMonthly,
    incomeTax:        taxMonthly,
    techStack:        tech,
    chamber:          kvkMonthly,
    deductions,
    net:              monthlyGross - deductions,
    effectiveRate:    deductions / monthlyGross,
    boxInkomen:       Math.round(boxInkomen),
    annualTax,
    notes: [
      `Belastbaar inkomen (Box 1): ${EUR(Math.round(boxInkomen))}/Jahr`,
      `Zelfstandigenaftrek: ${EUR(zelfAftr)} | MKB-Winstvrijstelling: 13,31 %`,
      `Box-1-Tarif bis 75.518 €: 36,97 %`,
      `Heffingskortingen: ${EUR(credits)} (Algemene + Arbeidskorting)`,
      `Zorgverzekering: Basispremie ${EUR(zorBase * 12)}/Jahr + IAB 5,32 %`,
    ],
  };
}

// ─── Hauptprogramm ────────────────────────────────────────────────────────────

async function main() {
  const NICHE         = 'Premium BBQ & Dry Aging Academy';
  const MONTHLY_GROSS = 5_000;

  header(`AUTHORITYOS — NICHE VALIDATION + STEUER-VERGLEICH DE vs. NL`);
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

  const deInput: NicheInput = { niche: NICHE, language: 'de', targetRegion: 'DE' };
  const nlInput: NicheInput = { niche: NICHE, language: 'nl', targetRegion: 'NL' };

  const [de, nl] = await Promise.all([engine.validate(deInput), engine.validate(nlInput)]);

  console.log(`✓  Abgeschlossen in ${Date.now() - t0} ms  (DE: ${de.durationMs} ms | NL: ${nl.durationMs} ms)\n`);

  // ── Authority Score ───────────────────────────────────────────────────────────

  section('AUTHORITY SCORE — Nischen-Validierung');
  row('',                     'Deutschland (DE)',       'Niederlande (NL)');
  row(SEP.slice(0,26),        '─'.repeat(17),           '─'.repeat(17));
  row('Verdict',              de.score.verdict,          nl.score.verdict);
  row('Overall',              `${de.score.overall}/100`, `${nl.score.overall}/100`);
  row('SEO',                  `${de.score.breakdown.seo}/100`,          `${nl.score.breakdown.seo}/100`);
  row('Competition',          `${de.score.breakdown.competition}/100`,  `${nl.score.breakdown.competition}/100`);
  row('Monetization',         `${de.score.breakdown.monetization}/100`, `${nl.score.breakdown.monetization}/100`);
  row('Content Match',        `${de.score.breakdown.contentMatch}/100`, `${nl.score.breakdown.contentMatch}/100`);
  row('Confidence',           de.score.confidence.toFixed(2),           nl.score.confidence.toFixed(2));
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
  console.log('│  ' + rpad(`Avg. Volumen: ${de.metrics.seo.avgSearchVolume.toLocaleString('de-DE')}/Mo  |  Avg. KD: ${de.metrics.seo.avgDifficulty}  |  Long-Tail-Quote: ${(de.metrics.seo.longTailRatio * 100).toFixed(0)} %`, W - 2) + '  │'.slice(-3));
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

  const deTax = taxDE(MONTHLY_GROSS);
  const nlTax = taxNL(MONTHLY_GROSS);

  section(`STEUER-VERGLEICH @ ${EUR(MONTHLY_GROSS)} / MONAT BRUTTOUMSATZ`);
  row('',                         'Deutschland (DE)',                    'Niederlande (NL)');
  row('─'.repeat(26),             '─'.repeat(17),                       '─'.repeat(17));
  row('Bruttoumsatz',             EUR(MONTHLY_GROSS),                    EUR(MONTHLY_GROSS));
  row('',                         '',                                    '');
  row('── Abzüge ──────────────', '──────────────────',                  '──────────────────');
  row('Kranken-/Pflegeversichers.', EUR(-deTax.healthInsurance),         EUR(-nlTax.healthInsurance));
  row('Einkommensteuer',           EUR(-deTax.incomeTax),                EUR(-nlTax.incomeTax));
  row('Tech-Stack',                EUR(-deTax.techStack),                EUR(-nlTax.techStack));
  row('IHK (DE) / KVK (NL)',      EUR(-deTax.chamber),                  EUR(-nlTax.chamber));
  row('',                         '',                                    '');
  row('Gesamt-Abzüge',            EUR(-deTax.deductions),               EUR(-nlTax.deductions));
  row('Effektive Abgabenquote',   PCT(deTax.effectiveRate),             PCT(nlTax.effectiveRate));
  row('─'.repeat(26),             '─'.repeat(17),                       '─'.repeat(17));
  row('★  NETTO CASH-IN',         EUR(deTax.net),                       EUR(nlTax.net));
  sectionEnd();

  // ── Delta ────────────────────────────────────────────────────────────────────

  const deltaMonthly = nlTax.net - deTax.net;
  const deltaYearly  = deltaMonthly * 12;
  const favours      = deltaMonthly > 0 ? 'NL' : 'DE';

  console.log(`\n  → ${favours}-Vorteil: ${EUR(Math.abs(deltaMonthly))} / Monat  |  ${EUR(Math.abs(deltaYearly))} / Jahr`);
  console.log(`  → DE Nettoquote: ${PCT(deTax.net / MONTHLY_GROSS)}  |  NL Nettoquote: ${PCT(nlTax.net / MONTHLY_GROSS)}`);

  // ── Erklärungen ──────────────────────────────────────────────────────────────

  for (const [label, mod] of [['DE', deTax], ['NL', nlTax]] as const) {
    section(`RECHTSGRUNDLAGEN & ANNAHMEN — ${label}`);
    for (const note of mod.notes) {
      console.log(`│  • ${rpad(note, W - 3)}│`);
    }
    sectionEnd();
  }

  // ── Engine-Reasoning ─────────────────────────────────────────────────────────

  section('ENGINE REASONING — Deutschland');
  for (const r of de.score.reasoning) console.log(`│  ✦  ${rpad(r, W - 4)}│`);
  if (de.score.warnings.length) {
    console.log('│  ' + '─'.repeat(W - 2) + '  │'.slice(-3));
    for (const w of de.score.warnings) console.log(`│  ⚠  ${rpad(w, W - 4)}│`);
  }
  sectionEnd();

  console.log(`\n  Next Action: ${de.score.nextAction}`);
  console.log(`  Engine v${de.engineVersion}  |  Simulation mode  |  Kein API-Call\n`);
}

main().catch(err => { console.error('FEHLER:', err); process.exit(1); });
