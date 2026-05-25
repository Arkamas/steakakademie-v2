/**
 * AuthorityOS — Steuerrechner Portugal (PT)
 * ===================================================================
 * Basis: Trabalhador Independente — Regime Simplificado 2024
 *   Categoria B: Prestação de serviços — Coeficiente 0,75
 *   Segurança Social: 21,4 % sobre base de incidência 70 % do rendimento
 *   IRS: Escala progressiva 2024 (Art. 68 CIRS)
 *   Dedução pessoal à coleta: 600 € (Art. 78 CIRS)
 *   SS vollständig absetzbar vom IRS-Basis (Art. 25 CIRS)
 * Kein API-Call, keine externen Dependencies.
 * ===================================================================
 */

import type { TaxResult, TaxDeductions } from './taxCalculator';

// ─── IRS 2024 — Escala progressiva (Art. 68 CIRS) ────────────────────────────

function portugueseIRS(rendimentoColetavel: number): number {
  if (rendimentoColetavel <= 0) return 0;

  // [Tranche-Breite €, Steuersatz]
  const brackets: [number, number][] = [
    [ 7_703,    0.1325],
    [ 3_920,    0.18  ],  //  7.703 – 11.623
    [ 4_849,    0.23  ],  // 11.623 – 16.472
    [ 4_849,    0.26  ],  // 16.472 – 21.321
    [ 5_825,    0.3275],  // 21.321 – 27.146
    [12_645,    0.37  ],  // 27.146 – 39.791
    [12_206,    0.435 ],  // 39.791 – 51.997
    [29_202,    0.45  ],  // 51.997 – 81.199
    [Infinity,  0.48  ],
  ];

  let tax = 0;
  let remaining = rendimentoColetavel;
  for (const [size, rate] of brackets) {
    if (remaining <= 0) break;
    const chunk = size === Infinity ? remaining : Math.min(remaining, size);
    tax += chunk * rate;
    remaining -= chunk;
  }
  return Math.round(tax);
}

// ─── Hauptberechnung ──────────────────────────────────────────────────────────

export function calculatePortugueseNetto(monthlyGross: number): TaxResult {
  const annual              = monthlyGross * 12;
  const techMonthly         = 150;   // Tech-Stack
  const contabilistaMonthly = 50;    // TOC (Técnico Oficial de Contas)

  // Segurança Social — base de incidência: 70 % do rendimento (serviços Cat. B)
  const ssAnnual  = Math.round(annual * 0.70 * 0.214);
  const ssMonthly = Math.round(ssAnnual / 12);

  // IRS — Regime Simplificado Categoria B: coeficiente 0,75
  // SS paid is deductible from IRS base (Art. 25 CIRS)
  const rendimentoColetavel = Math.max(0, annual * 0.75 - ssAnnual);

  const irsGross      = portugueseIRS(rendimentoColetavel);
  const deducaoColeta = 600;   // Dedução pessoal à coleta (Art. 78 CIRS)
  const annualTax     = Math.max(0, irsGross - deducaoColeta);
  const taxMonthly    = Math.round(annualTax / 12);

  const deductions: TaxDeductions = {
    healthInsurance: ssMonthly,            // Segurança Social
    incomeTax:       taxMonthly,           // IRS
    techStack:       techMonthly,
    chamber:         contabilistaMonthly,  // TOC Contabilista
  };
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

  return {
    label:          'Portugal (PT)',
    country:        'PT',
    monthlyGross,
    deductions,
    totalDeductions,
    monthlyNet:     monthlyGross - totalDeductions,
    effectiveRate:  totalDeductions / monthlyGross,
    taxableIncome:  rendimentoColetavel,
    annualTax,
    notes: [
      `Regime Simplificado Cat. B: Rendimento coletável ${Math.round(rendimentoColetavel).toLocaleString('de-DE')} €/Jahr (Koeff. 0,75 − SS)`,
      `Segurança Social: 21,4 % × 70 % = ${ssAnnual.toLocaleString('de-DE')} €/Jahr (${ssMonthly} €/Monat)`,
      'IRS-Escala: 13,25 % → 18 % → 23 % → 26 % → 32,75 % → 37 % → 43,5 % → 45 % → 48 %',
      'SS vollständig vom IRS-Basis absetzbar (Art. 25 CIRS)',
      `Dedução pessoal à coleta: 600 € (Art. 78 CIRS) | TOC: ${contabilistaMonthly * 12} €/Jahr`,
    ],
  };
}

export const calculatePT = calculatePortugueseNetto;
