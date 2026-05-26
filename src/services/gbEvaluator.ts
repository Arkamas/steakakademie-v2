/**
 * Steuerrechner Vereinigtes Königreich (GB)
 * ===================================================================
 * Basis: Sole Trader 2024/25
 *   Income Tax: Personal Allowance £12.570 · Basic 20 % · Higher 40 %
 *   National Insurance Class 4: 6 % (£12.570–£50.270) + 2 % darüber
 *   National Insurance Class 2: entfällt ab April 2024
 *   NHS: via National Insurance (keine separate Prämie)
 *   Wechselkurs: 1 GBP = 1,17 EUR (Richtwert 2024)
 * ===================================================================
 */

import type { TaxResult, TaxDeductions } from './taxCalculator';

const EUR_TO_GBP = 0.855;
const GBP_TO_EUR = 1 / EUR_TO_GBP;  // ~1.17

// ─── UK Income Tax 2024/25 ────────────────────────────────────────────────────

function ukIncomeTax(profitGbp: number): number {
  const pa = 12_570;   // Personal Allowance
  // Tapering: Personal Allowance reduced by £1 for every £2 above £100k
  const adjustedPa = profitGbp > 100_000
    ? Math.max(0, pa - Math.floor((profitGbp - 100_000) / 2))
    : pa;
  const taxable = Math.max(0, profitGbp - adjustedPa);
  if (taxable <= 0) return 0;
  const basic    = Math.min(taxable, 50_270 - pa);
  const higher   = Math.max(0, Math.min(taxable - basic, 125_140 - 50_270));
  const addl     = Math.max(0, taxable - basic - higher);
  return Math.round(basic * 0.20 + higher * 0.40 + addl * 0.45);
}

// ─── National Insurance Class 4 2024/25 ──────────────────────────────────────

function ukNI4(profitGbp: number): number {
  const lower = 12_570;
  const upper = 50_270;
  if (profitGbp <= lower) return 0;
  const band1 = Math.min(profitGbp, upper) - lower;
  const band2 = Math.max(0, profitGbp - upper);
  return Math.round(band1 * 0.06 + band2 * 0.02);
}

// ─── Hauptberechnung ──────────────────────────────────────────────────────────

export function calculateGB(monthlyGross: number): TaxResult {
  const annualEur  = monthlyGross * 12;
  const annualGbp  = annualEur * EUR_TO_GBP;
  const techMonthly = 150;
  const accountant  = 600;   // Accountant GBP/Jahr — in UK Standard für Sole Traders

  const profitGbp  = Math.max(0, annualGbp - techMonthly * 12 * EUR_TO_GBP - accountant);

  const itGbp      = ukIncomeTax(profitGbp);
  const ni4Gbp     = ukNI4(profitGbp);
  const taxMonthly = Math.round(((itGbp + ni4Gbp) * GBP_TO_EUR) / 12);
  const acctMonthly = Math.round((accountant * GBP_TO_EUR) / 12);

  // NHS via NI — keine separate KV-Prämie für Sole Traders
  const nhsMonthly = 0;

  const deductions: TaxDeductions = {
    healthInsurance: nhsMonthly,   // NHS via NI (in taxMonthly enthalten)
    incomeTax:       taxMonthly,   // Income Tax + NI Class 4 kombiniert
    techStack:       techMonthly,
    chamber:         acctMonthly,  // Accountant (de-facto Pflicht)
  };
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

  return {
    label:          'Vereinigtes Königreich (GB)',
    country:        'GB',
    monthlyGross,
    deductions,
    totalDeductions,
    monthlyNet:     monthlyGross - totalDeductions,
    effectiveRate:  totalDeductions / monthlyGross,
    taxableIncome:  Math.round(profitGbp * GBP_TO_EUR),
    annualTax:      Math.round((itGbp + ni4Gbp) * GBP_TO_EUR),
    notes: [
      `Wechselkurs: 1 GBP = ${GBP_TO_EUR.toFixed(2)} EUR (Richtwert 2024)`,
      `Personal Allowance: £12.570 steuerfrei · Basic Rate 20 % bis £50.270 · Higher Rate 40 %`,
      `NI Class 4: 6 % auf £12.570–£50.270 + 2 % darüber (Class 2 seit April 2024 abgeschafft)`,
      `NHS-Versorgung über National Insurance — keine separate Krankenversicherungsprämie`,
      `Accountant-Kosten: ~£600/Jahr (de-facto Standard für Sole Traders)`,
      `Hinweis: Post-Brexit keine EU-Freizügigkeit · Visa-Anforderungen beachten`,
    ],
  };
}
