/**
 * AuthorityOS — Steuerrechner Frankreich (FR)
 * ===================================================================
 * Basis: Auto-entrepreneur / Micro-entreprise BNC 2024
 *   Catégorie: Prestations de services libérales (BNC, PLNR)
 *   Cotisations sociales Urssaf: 21,2 % du CA (taux global 2024)
 *   IR: Abattement forfaitaire 34 % + Barème progressif (1 part)
 *   TVA: Franchise dépassée à 60k CA — TVA collectée, neutre en B2B
 * Kein API-Call, keine externen Dependencies.
 * ===================================================================
 */

import type { TaxResult, TaxDeductions } from './taxCalculator';

// ─── Barème IR 2024 — 1 part (célibataire) ────────────────────────────────────
// Art. 197 CGI — Tranches pour les revenus 2024

function frenchIR(revenuImposable: number): number {
  if (revenuImposable <= 0) return 0;

  // [Tranche-Breite €, Steuersatz]
  const brackets: [number, number][] = [
    [11_294,    0.00],
    [17_503,    0.11],  // 11.294 – 28.797
    [53_544,    0.30],  // 28.797 – 82.341
    [94_765,    0.41],  // 82.341 – 177.106
    [Infinity,  0.45],
  ];

  let tax = 0;
  let remaining = revenuImposable;
  for (const [size, rate] of brackets) {
    if (remaining <= 0) break;
    const chunk = size === Infinity ? remaining : Math.min(remaining, size);
    tax += chunk * rate;
    remaining -= chunk;
  }
  return Math.round(tax);
}

// ─── Hauptberechnung ──────────────────────────────────────────────────────────

export function calculateFrenchNetto(monthlyGross: number): TaxResult {
  const annual      = monthlyGross * 12;
  const techMonthly = 150;   // Tech-Stack
  const cgaMonthly  = 25;    // CGA (Centre de Gestion Agréé ~200 €/Jahr) + CFE

  // Cotisations sociales Urssaf — taux global BNC PLNR 2024: 21,2 %
  const cotRate     = 0.212;
  const cotMonthly  = Math.round(monthlyGross * cotRate);
  const cotAnnual   = cotMonthly * 12;

  // IR: Abattement forfaitaire 34 % (BNC) — cotisations NOT separately deductible
  // The abattement replaces all professional expense deductions
  const revenuImposable = Math.max(0, annual * (1 - 0.34));

  const annualTax   = frenchIR(revenuImposable);
  const taxMonthly  = Math.round(annualTax / 12);

  const deductions: TaxDeductions = {
    healthInsurance: cotMonthly,   // Cotisations sociales Urssaf
    incomeTax:       taxMonthly,   // Impôt sur le revenu
    techStack:       techMonthly,
    chamber:         cgaMonthly,   // CGA + CFE (Cotisation Foncière des Entreprises)
  };
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

  return {
    label:          'Frankreich (FR)',
    country:        'FR',
    monthlyGross,
    deductions,
    totalDeductions,
    monthlyNet:     monthlyGross - totalDeductions,
    effectiveRate:  totalDeductions / monthlyGross,
    taxableIncome:  revenuImposable,
    annualTax,
    notes: [
      `Micro-BNC: CA × 66 % = ${Math.round(revenuImposable).toLocaleString('de-DE')} €/Jahr — Abattement forfaitaire 34 %`,
      `Cotisations Urssaf (BNC PLNR): 21,2 % = ${cotAnnual.toLocaleString('de-DE')} €/Jahr (${cotMonthly} €/Monat)`,
      'Barème IR 2024: 0 % → 11 % → 30 % → 41 % → 45 % (Grundfreibetrag 11.294 €)',
      'Cotisations nicht vom IR-Basis absetzbar — Abattement ersetzt alle Abzüge',
      `CGA + CFE pauschal: ${cgaMonthly * 12} €/Jahr`,
    ],
  };
}

export const calculateFR = calculateFrenchNetto;
