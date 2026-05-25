/**
 * AuthorityOS — Steuerrechner Spanien (ES)
 * ===================================================================
 * Basis: Autónomo / Estimación Directa Simplificada 2024
 *   Cuota de Autónomos — progressive Reform ab 2023
 *   IRPF — Escala general (Estado + Comunidades Autónomas, kombiniert)
 *   Mínimo personal y familiar: 5.550 €
 * Kein API-Call, keine externen Dependencies.
 * ===================================================================
 */

import type { TaxResult, TaxDeductions } from './taxCalculator';

// ─── IRPF 2024 — Escala general ──────────────────────────────────────────────
// Kombinierte Sätze (Staat + Ø Autonome Gemeinschaften)
// Quelle: Art. 63 LIRPF + autonome Tarifstufen

function spanishIRPF(baseImponible: number): number {
  if (baseImponible <= 0) return 0;

  // [Tranche-Breite €, Steuersatz]
  const brackets: [number, number][] = [
    [12_450,   0.19],
    [ 7_750,   0.24],  // 12.450 – 20.200
    [15_000,   0.30],  // 20.200 – 35.200
    [24_800,   0.37],  // 35.200 – 60.000
    [240_000,  0.45],  // 60.000 – 300.000
    [Infinity, 0.47],
  ];

  let tax = 0;
  let remaining = baseImponible;
  for (const [size, rate] of brackets) {
    if (remaining <= 0) break;
    const chunk = size === Infinity ? remaining : Math.min(remaining, size);
    tax += chunk * rate;
    remaining -= chunk;
  }
  return Math.round(tax);
}

// ─── Cuota de Autónomos 2024 — progressive Tramos ────────────────────────────
// Seit der Reform (RDL 13/2022) gestaffelt nach Nettoeinkommen.
// Vereinfachte lineare Approximation der 15 offiziellen Tramos:
//   ≤ 3.000 €/Mo Brutto → ca. 300 €/Mo
//   ≥ 6.000 €/Mo Brutto → ca. 530 €/Mo

function cuotaAutonomos(monthlyGross: number): number {
  if (monthlyGross <= 3_000) return 300;
  if (monthlyGross >= 6_000) return 530;
  return Math.round(300 + (530 - 300) * (monthlyGross - 3_000) / (6_000 - 3_000));
}

// ─── Hauptberechnung ──────────────────────────────────────────────────────────

export function calculateSpanishNetto(monthlyGross: number): TaxResult {
  const annual          = monthlyGross * 12;
  const techMonthly     = 150;   // Tech-Stack
  const gestorMonthly   = 50;    // Gestor (Steuerberater, monatliches Äquivalent)

  // Cuota de Autónomos (Sozialversicherungspflicht)
  const cuota       = cuotaAutonomos(monthlyGross);
  const cuotaAnnual = cuota * 12;

  // Betriebsausgaben (steuerlich absetzbar)
  const expensesAnnual = (techMonthly + gestorMonthly) * 12;

  // IRPF-Bemessungsgrundlage: Nettoeinkommen nach Cuota und Betriebsausgaben
  const netIncome    = Math.max(0, annual - cuotaAnnual - expensesAnnual);

  // Mínimo personal y familiar 2024: 5.550 € (Steuerbefreiungsbetrag)
  const minPersonal  = 5_550;
  const baseImponible = Math.max(0, netIncome - minPersonal);

  const annualTax    = spanishIRPF(baseImponible);
  const taxMonthly   = Math.round(annualTax / 12);

  const deductions: TaxDeductions = {
    healthInsurance: cuota,          // Cuota de Autónomos
    incomeTax:       taxMonthly,     // IRPF
    techStack:       techMonthly,
    chamber:         gestorMonthly,  // Gestor (Asesoría fiscal)
  };
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

  return {
    label:          'Spanien (ES)',
    country:        'ES',
    monthlyGross,
    deductions,
    totalDeductions,
    monthlyNet:     monthlyGross - totalDeductions,
    effectiveRate:  totalDeductions / monthlyGross,
    taxableIncome:  baseImponible,
    annualTax,
    notes: [
      `Rendimiento neto: ${Math.round(netIncome).toLocaleString('de-DE')} €/Jahr (nach Cuota + Betriebsausgaben)`,
      `Cuota de Autónomos: ${cuota} €/Monat (progressiv nach Einkommen, Reform 2023)`,
      `IRPF-Bemessungsgrundlage: ${Math.round(baseImponible).toLocaleString('de-DE')} €/Jahr (nach Mínimo personal 5.550 €)`,
      'IRPF-Progression: 19 % (Einstieg) bis 47 % — Escala general 2024',
      `Gestor (Asesoría fiscal): ${gestorMonthly * 12} €/Jahr — vollständig absetzbar`,
    ],
  };
}

export const calculateES = calculateSpanishNetto;
