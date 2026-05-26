/**
 * Steuerrechner Österreich (AT)
 * ===================================================================
 * Basis: Einzelunternehmer / Freiberufler 2024
 *   SVS (Sozialversicherung der Selbstständigen):
 *     KV 7,65 % + PV 18,5 % + UV 1,1 % = 27,25 %
 *     Mindestbeitragsgrundlage: ~505 €/Monat
 *   Einkommensteuer §33 EStG 1988 (Grundtabelle 2024)
 *   WKO-Mitgliedsbeitrag: ~200 €/Jahr (umsatzabhängig, vereinfacht)
 * ===================================================================
 */

import type { TaxResult, TaxDeductions } from './taxCalculator';

// ─── Einkommensteuer §33 EStG 1988 — Tarif 2024 ──────────────────────────────

function austrianIncomeTax(zvE: number): number {
  if (zvE <= 11_693) return 0;
  if (zvE <= 19_134) return Math.round((zvE - 11_693) * 0.20);
  if (zvE <= 32_075) return Math.round(1_488 + (zvE - 19_134) * 0.30);
  if (zvE <= 62_080) return Math.round(5_370 + (zvE - 32_075) * 0.41);
  if (zvE <= 93_120) return Math.round(17_672 + (zvE - 62_080) * 0.48);
  return Math.round(32_571 + (zvE - 93_120) * 0.50);
}

// ─── Hauptberechnung ──────────────────────────────────────────────────────────

export function calculateAT(monthlyGross: number): TaxResult {
  const annual     = monthlyGross * 12;
  const techMonthly = 150;
  const wkoYear     = 200;  // WKO-Pflichtbeitrag (Grundumlage, vereinfacht)

  // SVS: 27,25 % der Beitragsgrundlage (= Gewinn vor SVS)
  // Mindestbeitrag: ~505 €/Monat = 6.060 €/Jahr
  const svsRate    = 0.2725;
  const svsBasis   = Math.max(0, annual - techMonthly * 12 - wkoYear);
  const svsAnnual  = Math.max(6_060, Math.round(svsBasis * svsRate));
  const svsMonthly = Math.round(svsAnnual / 12);

  // ZvE: Gewinn − SVS (§ 4 Abs. 3 EStG, SVS als Betriebsausgabe)
  const zvE        = Math.max(0, svsBasis - svsAnnual);
  const annualTax  = austrianIncomeTax(zvE);
  const taxMonthly = Math.round(annualTax / 12);
  const wkoMonthly = Math.round(wkoYear / 12);

  const deductions: TaxDeductions = {
    healthInsurance: svsMonthly,   // SVS (KV + PV + UV)
    incomeTax:       taxMonthly,
    techStack:       techMonthly,
    chamber:         wkoMonthly,   // WKO-Beitrag
  };
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

  return {
    label:          'Österreich (AT)',
    country:        'AT',
    monthlyGross,
    deductions,
    totalDeductions,
    monthlyNet:     monthlyGross - totalDeductions,
    effectiveRate:  totalDeductions / monthlyGross,
    taxableIncome:  zvE,
    annualTax,
    notes: [
      `SVS-Beitrag: 27,25 % = ${svsAnnual.toLocaleString('de-DE')} €/Jahr (mind. 6.060 €/Jahr)`,
      `SVS umfasst KV 7,65 % + PV 18,5 % + UV 1,1 % — als Betriebsausgabe absetzbar`,
      `Zu versteuerndes Einkommen (ZvE): ${zvE.toLocaleString('de-DE')} €/Jahr`,
      `ESt-Tarif 2024: 0 % bis 11.693 € · 20 % bis 19.134 € · 30 % bis 32.075 € · 41 % bis 62.080 €`,
      `WKO-Pflichtmitgliedschaft: ~200 €/Jahr (Grundumlage, Sektion abhängig)`,
      `Kein Solidaritätszuschlag · Hinweis: Vorauszahlungsregelung für USt und ESt beachten`,
    ],
  };
}
