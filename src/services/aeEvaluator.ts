/**
 * Steuerrechner Vereinigte Arabische Emirate (AE)
 * ===================================================================
 * Basis: Freelance Visa / Sole Establishment 2024
 *   Einkommensteuer: 0 % (keine Einkommensteuer in den VAE)
 *   Corporate Tax: 9 % ab 375.000 AED (~100.000 EUR) — Small Business Relief:
 *     Umsatz < 3 Mio. AED (~800k EUR) → 0 % CT wählbar (FY2024)
 *   Krankenversicherung: Pflicht in Dubai/Abu Dhabi, privat
 *   Freelance Visa: ~10.000–15.000 AED/Jahr (~2.500–4.000 EUR)
 *
 * Annahme: Umsatz < 3 Mio. AED → Small Business Relief (0 % CT)
 * Wechselkurs: 1 EUR = 4,0 AED (Richtwert 2024)
 * ===================================================================
 */

import type { TaxResult, TaxDeductions } from './taxCalculator';

export function calculateAE(monthlyGross: number): TaxResult {
  const annualEur  = monthlyGross * 12;
  const techMonthly = 150;

  // Freelance Visa-Kosten: ~3.200 €/Jahr (Mittelwert Dubai/Abu Dhabi)
  const visaYear   = 3_200;
  const visaMonthly = Math.round(visaYear / 12);

  // Krankenversicherung: Pflicht in Dubai, privat
  // Richtwert Solo-Person: ~4.800–9.600 AED/Jahr (~1.200–2.400 EUR)
  const kkMonthly  = 150;  // ~1.800 EUR/Jahr (konservativ)

  // Einkommensteuer: 0 %
  const incomeTax  = 0;

  // Corporate Tax: 0 % bei Small Business Relief (< 3 Mio. AED Umsatz)
  // Ab ~800k EUR: 9 % CT auf Gewinne über 375.000 AED (~100k EUR)
  const annualAED  = annualEur * 4.0;
  let corpTaxMonthly = 0;
  if (annualAED > 3_000_000) {
    // Über Small Business Relief Threshold: 9 % auf Gewinn > 375k AED
    const taxableAED = Math.max(0, annualAED - 375_000);
    corpTaxMonthly   = Math.round((taxableAED * 0.09) / 12 / 4.0);
  }

  const deductions: TaxDeductions = {
    healthInsurance: kkMonthly,            // Private KV (Pflicht)
    incomeTax:       incomeTax + corpTaxMonthly,
    techStack:       techMonthly,
    chamber:         visaMonthly,          // Freelance Visa
  };
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

  return {
    label:          'VAE / Dubai (AE)',
    country:        'AE',
    monthlyGross,
    deductions,
    totalDeductions,
    monthlyNet:     monthlyGross - totalDeductions,
    effectiveRate:  totalDeductions / monthlyGross,
    taxableIncome:  annualEur,
    annualTax:      corpTaxMonthly * 12,
    notes: [
      `Einkommensteuer: 0 % — keine persönliche Einkommensteuer in den VAE`,
      `Corporate Tax (2023): 9 % ab AED 375.000 Gewinn · Small Business Relief: 0 % bis 3 Mio. AED Umsatz`,
      `Freelance Visa: ~3.200 €/Jahr (Dubai/Abu Dhabi, Freezone-abhängig)`,
      `Krankenversicherung: Pflicht in Dubai · ~1.800–2.400 €/Jahr (privat, Solo)`,
      `Keine gesetzliche Rentenversicherung für Expatriates — eigene Vorsorge essentiell`,
      `⚠️ Wichtig: Wohnsitzverlegung nötig · Meldepflichten in DE/AT/CH bei Wegzug beachten`,
    ],
  };
}
