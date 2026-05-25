/**
 * AuthorityOS — Steuerrechner Italien (IT)
 * ===================================================================
 * Basis: Regime Forfettario 2024
 *   Ateco-Code 62.01 / 73.11 (digitale Dienstleistungen) — Koeffizient 67 %
 *   INPS Gestione Separata: 26,07 % des steuerlichen Gewinns
 *   Imposta Sostitutiva: 5 % (erste 5 Jahre, isStartup=true) | 15 % (Standard)
 *   Keine IRPF-Staffelung — Flat-Rate-Regime
 * Kein API-Call, keine externen Dependencies.
 * ===================================================================
 */

import type { TaxResult, TaxDeductions } from './taxCalculator';

// ─── Hauptberechnung ──────────────────────────────────────────────────────────

export function calculateItalianNetto(
  monthlyGross: number,
  isStartup: boolean = true,
): TaxResult {
  const annual                = monthlyGross * 12;
  const techMonthly           = 100;   // Tech-Stack
  const commercialistaMonthly = 50;    // Commercialista (Steuerberater)

  // Regime Forfettario — Ateco digitale: pauschal 67 % des Umsatzes als Gewinn
  const forfCoeff    = 0.67;
  const redditoLordo = annual * forfCoeff;

  // INPS Gestione Separata 2024: 26,07 % des redditoLordo
  // Teilweise absetzbar von der Steuerbemessungsgrundlage (33 % Pauschale)
  const inpsAnnual        = Math.round(redditoLordo * 0.2607);
  const inpsDeductible    = Math.round(inpsAnnual * 0.5); // 50 % absetzbar
  const redditoImponibile = Math.max(0, redditoLordo - inpsDeductible);

  // Imposta Sostitutiva (Flat Tax)
  const impostoRate   = isStartup ? 0.05 : 0.15;
  const impostoAnnual = Math.round(redditoImponibile * impostoRate);

  const inpsMonthly        = Math.round(inpsAnnual / 12);
  const impostoMonthly     = Math.round(impostoAnnual / 12);

  const deductions: TaxDeductions = {
    healthInsurance: inpsMonthly,          // INPS Gestione Separata
    incomeTax:       impostoMonthly,       // Imposta Sostitutiva
    techStack:       techMonthly,
    chamber:         commercialistaMonthly, // Commercialista
  };
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

  return {
    label:          `Italien (IT) — ${isStartup ? 'Startup 5 %' : 'Standard 15 %'}`,
    country:        'IT',
    monthlyGross,
    deductions,
    totalDeductions,
    monthlyNet:     monthlyGross - totalDeductions,
    effectiveRate:  totalDeductions / monthlyGross,
    taxableIncome:  redditoImponibile,
    annualTax:      impostoAnnual,
    notes: [
      `Regime Forfettario — Ateco digitale: Koeffizient 67 % → Reddito lordo ${Math.round(redditoLordo).toLocaleString('de-DE')} €/Jahr`,
      `INPS Gestione Separata: 26,07 % = ${inpsAnnual.toLocaleString('de-DE')} €/Jahr (${inpsMonthly} €/Monat)`,
      `Imposta Sostitutiva: ${(impostoRate * 100).toFixed(0)} % (${isStartup ? 'Startup-Tarif erste 5 Jahre' : 'Normaltarif'}) auf ${redditoImponibile.toLocaleString('de-DE')} €`,
      'Kein Vorsteuerabzug, keine IRPF-Staffelung — Flat-Rate-Regime',
      `Commercialista: ${commercialistaMonthly * 12} €/Jahr`,
    ],
  };
}

export const calculateIT = (monthlyGross: number) => calculateItalianNetto(monthlyGross);
