/**
 * Steuerrechner Schweiz (CH)
 * ===================================================================
 * Basis: Selbstständigerwerbende 2024
 *   AHV/IV/EO: 10,55 % des Einkommens (Arbeitgeber- + Arbeitnehmeranteil)
 *   ALV: 2,2 % bis CHF 148.200/Jahr
 *   Krankenversicherung: obligatorisch, privat ~430 CHF/Monat (Richtwert)
 *   Direkte Bundessteuer: §214 DBG (Tarif für natürliche Personen)
 *   Kantonssteuer: pauschal ~9 % (Kanton Zürich, Gemeinde Mittelwert)
 *   Wechselkurs: 1 EUR = 0,96 CHF (Richtwert 2024)
 * ===================================================================
 */

import type { TaxResult, TaxDeductions } from './taxCalculator';

const EUR_TO_CHF = 0.96;
const CHF_TO_EUR = 1 / EUR_TO_CHF;

// ─── Direkte Bundessteuer (CHF) — Tarif Alleinstehende 2024 ──────────────────

function swissFederalTax(taxableChf: number): number {
  if (taxableChf <= 17_800) return 0;
  if (taxableChf <= 31_600)  return Math.round((taxableChf - 17_800) * 0.0077);
  if (taxableChf <= 41_400)  return Math.round(106 + (taxableChf - 31_600) * 0.0088);
  if (taxableChf <= 55_200)  return Math.round(192 + (taxableChf - 41_400) * 0.0264);
  if (taxableChf <= 72_500)  return Math.round(556 + (taxableChf - 55_200) * 0.0297);
  if (taxableChf <= 78_100)  return Math.round(1_070 + (taxableChf - 72_500) * 0.0594);
  if (taxableChf <= 103_600) return Math.round(1_403 + (taxableChf - 78_100) * 0.0660);
  if (taxableChf <= 134_600) return Math.round(3_086 + (taxableChf - 103_600) * 0.0880);
  if (taxableChf <= 176_000) return Math.round(5_814 + (taxableChf - 134_600) * 0.1100);
  return Math.round(10_368 + (taxableChf - 176_000) * 0.1320);
}

// ─── Hauptberechnung ──────────────────────────────────────────────────────────

export function calculateCH(monthlyGross: number): TaxResult {
  const annualEur  = monthlyGross * 12;
  const annualChf  = annualEur * EUR_TO_CHF;
  const techMonthly = 150;

  // AHV/IV/EO: 10,55 % (Selbstständige tragen vollen Beitrag)
  const ahvRate    = 0.1055;
  const ahvAnnual  = Math.round(annualChf * ahvRate);
  const ahvMonthly = Math.round((ahvAnnual * CHF_TO_EUR) / 12);

  // ALV: 2,2 % bis 148.200 CHF
  const alvBasis   = Math.min(annualChf, 148_200);
  const alvAnnual  = Math.round(alvBasis * 0.022);
  const alvMonthly = Math.round((alvAnnual * CHF_TO_EUR) / 12);

  // Krankenversicherung: Prämie obligatorisch, privat ~430 CHF/Monat
  const kkMonthly  = Math.round(430 * CHF_TO_EUR);   // ~448 EUR

  // Zu versteuerndes Einkommen: Gewinn − AHV/IV/EO − ALV
  const zvEchf     = Math.max(0, annualChf - ahvAnnual - alvAnnual - techMonthly * 12 * EUR_TO_CHF);

  // Bundessteuer
  const fedTaxChf  = swissFederalTax(zvEchf);
  // Kantonssteuer Zürich: ~9 % (Richtwert Gemeinde Mittelalb.)
  const cantonTaxChf = Math.round(zvEchf * 0.09);
  const totalTaxChf = fedTaxChf + cantonTaxChf;
  const taxMonthly  = Math.round((totalTaxChf * CHF_TO_EUR) / 12);

  const deductions: TaxDeductions = {
    healthInsurance: kkMonthly + ahvMonthly + alvMonthly,  // KK + AHV + ALV
    incomeTax:       taxMonthly,
    techStack:       techMonthly,
    chamber:         0,  // Keine Kammerpflicht für natürliche Personen
  };
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

  return {
    label:          'Schweiz (CH)',
    country:        'CH',
    monthlyGross,
    deductions,
    totalDeductions,
    monthlyNet:     monthlyGross - totalDeductions,
    effectiveRate:  totalDeductions / monthlyGross,
    taxableIncome:  Math.round(zvEchf * CHF_TO_EUR),
    annualTax:      Math.round(totalTaxChf * CHF_TO_EUR),
    notes: [
      `Wechselkurs: 1 EUR = ${EUR_TO_CHF} CHF (Richtwert 2024)`,
      `AHV/IV/EO: 10,55 % (Selbstständige = voll Arbeitgeber + Arbeitnehmer)`,
      `ALV: 2,2 % bis CHF 148.200 Jahreseinkommen`,
      `KK-Prämie: ~CHF 430/Monat Richtwert — individuell sehr unterschiedlich`,
      `Bundessteuer + Kanton Zürich: vereinfacht, andere Kantone (Zug, Schwyz) deutlich günstiger`,
      `Hinweis: Kantonsunterschiede erheblich — Zug/Schwyz ca. 4–6 % Kantonssteuer`,
    ],
  };
}
