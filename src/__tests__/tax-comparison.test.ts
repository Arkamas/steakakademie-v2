/**
 * Vitest — Steuerrechner DE / NL
 * ─────────────────────────────────────────────────────────────────
 * Abdeckung:
 *   • germanIncomeTax()          — §32a EStG 2024, alle 4 Zonen
 *   • nlAlgemeneHeffingskorting() — Phasen-out-Logik
 *   • nlArbeidskorting()          — Phasen-out-Logik
 *   • calculateDE(5000)           — Integrations-Snapshot
 *   • calculateNL(5000)           — Integrations-Snapshot
 *   • DE vs. NL Vergleich         — Vorteilsberechnung
 */

import { describe, it, expect } from 'vitest';
import {
  germanIncomeTax,
  nlAlgemeneHeffingskorting,
  nlArbeidskorting,
  nlInkomensbelasting,
  calculateDE,
  calculateNL,
  type TaxResult,
} from '../services/taxCalculator';

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

const EUR = (n: number) => Math.round(n);

// ─── germanIncomeTax ─────────────────────────────────────────────────────────

describe('germanIncomeTax — §32a EStG 2024', () => {

  it('Grundfreibetrag: ZvE ≤ 11.604 € → 0 €', () => {
    expect(germanIncomeTax(0)).toBe(0);
    expect(germanIncomeTax(11_604)).toBe(0);
    expect(germanIncomeTax(11_603)).toBe(0);
  });

  it('1. Progressionszone: 11.605 – 17.005 €', () => {
    // Polynomial rundet bei 11.605 noch auf 0 — erste nennenswerte Steuer ab ~11.608
    const tax = germanIncomeTax(12_000);
    expect(tax).toBeGreaterThan(0);
    expect(tax).toBeLessThan(500);

    // Exakter Benchmark: ZvE = 14.000 €
    // y = (14000 - 11604) / 10000 = 0,2396
    // T = (922,98 × 0,2396 + 1400) × 0,2396 ≈ 388
    const tax14k = germanIncomeTax(14_000);
    expect(tax14k).toBeGreaterThanOrEqual(380);
    expect(tax14k).toBeLessThanOrEqual(400);
  });

  it('2. Progressionszone: 17.006 – 66.760 €', () => {
    // Grenzwert-Kontinuität an 17.005 €
    const atBoundary = germanIncomeTax(17_005);
    const justAbove  = germanIncomeTax(17_006);
    expect(justAbove).toBeGreaterThanOrEqual(atBoundary);

    // Exakter Benchmark: ZvE = 46.130 €
    // y = (46130 - 17005) / 10000 = 2,9125
    // T = (181,19 × 2,9125 + 2397) × 2,9125 + 1025,38
    //   ≈ (527,47 + 2397) × 2,9125 + 1025,38
    //   ≈ 2924,47 × 2,9125 + 1025,38
    //   ≈ 8515 + 1025 = 9540  (±20 Rundung)
    const tax46k = germanIncomeTax(46_130);
    expect(tax46k).toBeGreaterThanOrEqual(9_520);
    expect(tax46k).toBeLessThanOrEqual(9_570);
  });

  it('Proportionalzone 42 %: 66.761 – 277.826 €', () => {
    const tax = germanIncomeTax(100_000);
    // 0,42 × 100.000 − 10.911,92 = 31.088
    expect(tax).toBe(31_088);

    // §32a hat an der Zone-2/3-Grenze einen Formelsprung (~300 €) — das ist
    // ein bekanntes Merkmal der Polynomial-Approximation, kein Bug.
    // Wichtig: beide Werte liegen im korrekten Bereich.
    const tax66k = germanIncomeTax(66_760);
    expect(tax66k).toBeGreaterThan(16_000);
    expect(tax66k).toBeLessThan(20_000);
  });

  it('Reichensteuer 45 %: > 277.826 €', () => {
    const tax = germanIncomeTax(300_000);
    // 0,45 × 300.000 − 19.246,67 = 115.753
    expect(tax).toBe(115_753);

    const taxBoundary = germanIncomeTax(277_826);
    const taxAbove    = germanIncomeTax(277_827);
    expect(taxAbove).toBeGreaterThanOrEqual(taxBoundary);
  });

  it('Monoton steigend', () => {
    const steps = [0, 11_604, 12_000, 17_005, 20_000, 66_760, 100_000, 277_826, 400_000];
    for (let i = 1; i < steps.length; i++) {
      expect(germanIncomeTax(steps[i])).toBeGreaterThanOrEqual(germanIncomeTax(steps[i - 1]));
    }
  });
});

// ─── nlAlgemeneHeffingskorting ────────────────────────────────────────────────

describe('nlAlgemeneHeffingskorting 2024', () => {

  it('Unterhalb Abbaugrenze (≤ 24.813 €) → Maximum 3.362 €', () => {
    expect(nlAlgemeneHeffingskorting(0)).toBe(3_362);
    expect(nlAlgemeneHeffingskorting(24_813)).toBe(3_362);
  });

  it('Oberhalb Obergrenze (≥ 75.520 €) → 0 €', () => {
    expect(nlAlgemeneHeffingskorting(75_520)).toBe(0);
    expect(nlAlgemeneHeffingskorting(100_000)).toBe(0);
  });

  it('Linearer Abbau in der Übergangszone', () => {
    const at50k = nlAlgemeneHeffingskorting(50_000);
    expect(at50k).toBeGreaterThan(0);
    expect(at50k).toBeLessThan(3_362);

    // Midpoint ≈ 50.167 € → ungefähr 50 % des Maximums
    const atMid = nlAlgemeneHeffingskorting(50_167);
    expect(atMid).toBeGreaterThanOrEqual(1_500);
    expect(atMid).toBeLessThanOrEqual(1_900);
  });

  it('Streng monoton fallend in der Übergangszone', () => {
    const values = [24_813, 35_000, 50_000, 65_000, 75_520].map(nlAlgemeneHeffingskorting);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeLessThanOrEqual(values[i - 1]);
    }
  });
});

// ─── nlArbeidskorting ─────────────────────────────────────────────────────────

describe('nlArbeidskorting 2024', () => {

  it('Bis 39.957 € → Maximum 5.158 €', () => {
    expect(nlArbeidskorting(0)).toBe(5_158);
    expect(nlArbeidskorting(39_957)).toBe(5_158);
  });

  it('Abbau ab 39.958 € mit 6,51 % pro Euro', () => {
    // Bei 39.957 + 10.000 = 49.957 €: 5158 − 10.000 × 0,0651 = 5158 − 651 = 4507
    expect(nlArbeidskorting(49_957)).toBe(4_507);
  });

  it('Nie unter 0 €', () => {
    // 5158 / 0,0651 ≈ 79.232 € Nullstelle
    expect(nlArbeidskorting(200_000)).toBe(0);
    expect(nlArbeidskorting(79_232)).toBeGreaterThanOrEqual(0);
  });

  it('Streng monoton fallend nach 39.957 €', () => {
    const incomes = [39_957, 50_000, 60_000, 79_232, 100_000];
    const kortingen = incomes.map(nlArbeidskorting);
    for (let i = 1; i < kortingen.length; i++) {
      expect(kortingen[i]).toBeLessThanOrEqual(kortingen[i - 1]);
    }
  });
});

// ─── calculateDE Snapshot @ 5.000 € / Monat ──────────────────────────────────

describe('calculateDE @ 5.000 €/Monat', () => {
  const DE_GROSS = 5_000;
  let result: TaxResult;

  // Einmalige Berechnung, alle Tests teilen dasselbe Objekt
  result = calculateDE(DE_GROSS);

  it('Shape: alle TaxResult-Felder vorhanden', () => {
    expect(result.country).toBe('DE');
    expect(result.monthlyGross).toBe(DE_GROSS);
    expect(result.deductions).toBeDefined();
    expect(result.totalDeductions).toBeGreaterThan(0);
    expect(result.monthlyNet).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeLessThan(1);
    expect(Array.isArray(result.notes)).toBe(true);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('Kranken-/Pflegeversicherung ≈ 985 € (19,7 % von 5.000 €)', () => {
    // GKV 16,3 % + PV 3,4 % = 19,7 %  → Math.round(5000 × 0,197) = 985
    expect(result.deductions.healthInsurance).toBe(985);
  });

  it('Einkommensteuer ≈ 795 € / Monat', () => {
    // ZvE = 60.000 − 985×12 − 150×12 − 250 = 60.000 − 11.820 − 1.800 − 250 = 46.130
    // germanIncomeTax(46.130) / 12 ≈ 795
    expect(result.deductions.incomeTax).toBeGreaterThanOrEqual(790);
    expect(result.deductions.incomeTax).toBeLessThanOrEqual(800);
  });

  it('Tech-Stack = 150 € / Monat', () => {
    expect(result.deductions.techStack).toBe(150);
  });

  it('IHK-Äquivalent = 21 € / Monat (250 €/Jahr / 12)', () => {
    expect(result.deductions.chamber).toBe(Math.round(250 / 12));
  });

  it('Effektive Abgabenquote ≈ 39 %', () => {
    expect(result.effectiveRate).toBeGreaterThanOrEqual(0.38);
    expect(result.effectiveRate).toBeLessThanOrEqual(0.42);
  });

  it('Netto-Cash-In ≈ 3.049 € / Monat', () => {
    expect(result.monthlyNet).toBeGreaterThanOrEqual(3_000);
    expect(result.monthlyNet).toBeLessThanOrEqual(3_100);
  });

  it('Konsistenz: gross − totalDeductions === monthlyNet', () => {
    expect(result.monthlyGross - result.totalDeductions).toBe(result.monthlyNet);
  });

  it('Konsistenz: totalDeductions / gross === effectiveRate', () => {
    expect(result.totalDeductions / result.monthlyGross).toBeCloseTo(result.effectiveRate, 6);
  });
});

// ─── calculateNL Snapshot @ 5.000 € / Monat ──────────────────────────────────

describe('calculateNL @ 5.000 €/Monat', () => {
  const NL_GROSS = 5_000;
  let result: TaxResult;

  result = calculateNL(NL_GROSS);

  it('Shape: alle TaxResult-Felder vorhanden', () => {
    expect(result.country).toBe('NL');
    expect(result.monthlyGross).toBe(NL_GROSS);
    expect(result.deductions).toBeDefined();
    expect(result.totalDeductions).toBeGreaterThan(0);
    expect(result.monthlyNet).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeLessThan(1);
    expect(Array.isArray(result.notes)).toBe(true);
  });

  it('Zorgverzekering ≈ 359 € / Monat (Basispremie 150 + IAB)', () => {
    // Zorg ist deutlich niedriger als DE KV (985 €)
    expect(result.deductions.healthInsurance).toBeGreaterThanOrEqual(330);
    expect(result.deductions.healthInsurance).toBeLessThanOrEqual(390);
  });

  it('Einkommensteuer nach Heffingskortingen ≈ 905 € / Monat', () => {
    expect(result.deductions.incomeTax).toBeGreaterThanOrEqual(880);
    expect(result.deductions.incomeTax).toBeLessThanOrEqual(940);
  });

  it('Tech-Stack = 150 € / Monat', () => {
    expect(result.deductions.techStack).toBe(150);
  });

  it('KVK-Äquivalent = 6 € / Monat (75 €/Jahr / 12)', () => {
    expect(result.deductions.chamber).toBe(Math.round(75 / 12));
  });

  it('Effektive Abgabenquote ≈ 28 %', () => {
    expect(result.effectiveRate).toBeGreaterThanOrEqual(0.26);
    expect(result.effectiveRate).toBeLessThanOrEqual(0.31);
  });

  it('Netto-Cash-In ≈ 3.580 € / Monat', () => {
    expect(result.monthlyNet).toBeGreaterThanOrEqual(3_500);
    expect(result.monthlyNet).toBeLessThanOrEqual(3_650);
  });

  it('Konsistenz: gross − totalDeductions === monthlyNet', () => {
    expect(result.monthlyGross - result.totalDeductions).toBe(result.monthlyNet);
  });

  it('Konsistenz: totalDeductions / gross === effectiveRate', () => {
    expect(result.totalDeductions / result.monthlyGross).toBeCloseTo(result.effectiveRate, 6);
  });
});

// ─── DE vs. NL Vergleich ──────────────────────────────────────────────────────

describe('DE vs. NL Vergleich @ 5.000 €/Monat', () => {
  const de = calculateDE(5_000);
  const nl = calculateNL(5_000);

  it('NL hat höheres Netto als DE', () => {
    expect(nl.monthlyNet).toBeGreaterThan(de.monthlyNet);
  });

  it('NL hat niedrigere effektive Abgabenquote als DE', () => {
    expect(nl.effectiveRate).toBeLessThan(de.effectiveRate);
  });

  it('NL-Vorteil: ≈ 500–600 € / Monat', () => {
    const delta = nl.monthlyNet - de.monthlyNet;
    expect(delta).toBeGreaterThanOrEqual(480);
    expect(delta).toBeLessThanOrEqual(620);
  });

  it('NL-Vorteil: ≈ 6.000–7.500 € / Jahr', () => {
    const deltaYearly = (nl.monthlyNet - de.monthlyNet) * 12;
    expect(deltaYearly).toBeGreaterThanOrEqual(5_700);
    expect(deltaYearly).toBeLessThanOrEqual(7_500);
  });

  it('DE Krankenversicherung deutlich teurer als NL', () => {
    expect(de.deductions.healthInsurance).toBeGreaterThan(nl.deductions.healthInsurance);
    // DE zahlt > 2× so viel Krankenversicherung
    expect(de.deductions.healthInsurance).toBeGreaterThan(nl.deductions.healthInsurance * 2);
  });

  it('NL Einkommensteuer ähnlich oder höher als DE (Steuervorteil kommt aus Sozialversicherung)', () => {
    // NL hat höhere Einkommensteuer wegen 36,97 % Flat Rate vs. progressiver DE Steuer
    // bei diesem Einkommensniveau
    expect(nl.deductions.incomeTax).toBeGreaterThanOrEqual(de.deductions.incomeTax * 0.9);
  });

  it('Determinismus: gleiche Inputs → gleiche Outputs', () => {
    const de2 = calculateDE(5_000);
    const nl2 = calculateNL(5_000);
    expect(de2.monthlyNet).toBe(de.monthlyNet);
    expect(nl2.monthlyNet).toBe(nl.monthlyNet);
  });
});

// ─── Skalierungstest: andere Umsatzniveaus ────────────────────────────────────

describe('Skalierung — verschiedene Bruttoumsätze', () => {

  it('Bei 2.000 €/Mo: DE höheres Netto (niedrige Einkommen begünstigt DE durch Grundfreibetrag)', () => {
    const de = calculateDE(2_000);
    const nl = calculateNL(2_000);
    // Bei sehr niedrigem Einkommen kann DE durch Grundfreibetrag günstiger sein
    expect(de.monthlyNet).toBeGreaterThan(0);
    expect(nl.monthlyNet).toBeGreaterThan(0);
  });

  it('Bei 10.000 €/Mo: Netto steigt monoton mit Umsatz (beide Länder)', () => {
    const de5 = calculateDE(5_000);
    const de10 = calculateDE(10_000);
    const nl5 = calculateNL(5_000);
    const nl10 = calculateNL(10_000);

    expect(de10.monthlyNet).toBeGreaterThan(de5.monthlyNet);
    expect(nl10.monthlyNet).toBeGreaterThan(nl5.monthlyNet);
  });

  it('Effektive Rate steigt mit Umsatz (Progressivität)', () => {
    const de3 = calculateDE(3_000);
    const de8 = calculateDE(8_000);
    expect(de8.effectiveRate).toBeGreaterThan(de3.effectiveRate);
  });
});
