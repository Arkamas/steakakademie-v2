/**
 * Steuerrechner Estland (EE) — OÜ-Modell (e-Residency)
 * ===================================================================
 * Basis: Optimale OÜ-Struktur für digitale Solopreneure 2024
 *   OÜ (Osaühing) = estnische GmbH
 *   Kernvorteil: 0 % Körperschaftsteuer auf thesaurierte Gewinne
 *   Dividendensteuer: 20/80 (= 25 % auf Netto-Dividende) bei Ausschüttung
 *
 * Modell: Mindestgehalt + Restgewinn thesaurieren (reinvestieren)
 *   Gehalt:    mind. 820 €/Monat (Mindestlohn 2024)
 *   Sozialmaks: 33 % auf Gehalt (Arbeitgeberanteil, zahlt die OÜ)
 *   TöötukindlustusM: 0,8 % Arbeitgeber + 1,6 % Arbeitnehmer (ALV-Äquivalent)
 *   Einkommensteuer auf Gehalt: 20 % (Freibetrag: 654 €/Monat)
 *   Thesaurierter Gewinn: 0 % Steuer — verbleibt steuerfrei in OÜ
 *
 * Annahme: Restgewinn wird NICHT ausgeschüttet (Reinvestition/Thesaurierung)
 * Hinweis: Tatsächlich benötigtes Cash = Gehalt — für Dividenden separate Kalkulation
 * ===================================================================
 */

import type { TaxResult, TaxDeductions } from './taxCalculator';

export function calculateEE(monthlyGross: number): TaxResult {
  const techMonthly = 150;

  // Gehalt: Mindestlohn 820 €/Monat (Richtwert für optimale Struktur)
  // Höheres Gehalt = mehr Sozialmaks → weniger optimal
  const salary     = Math.min(monthlyGross * 0.25, 2_000);  // max 25 % als Gehalt
  const salaryMin  = Math.max(820, salary);

  // Sozialmaks (Sozialbeitrag): 33 % auf Gehalt — zahlt die OÜ
  const socialTax  = Math.round(salaryMin * 0.33);

  // Töötukindlustus (Arbeitslosenversicherung)
  const uiEmployer = Math.round(salaryMin * 0.008);
  const uiEmployee = Math.round(salaryMin * 0.016);

  // Einkommensteuer auf Gehalt
  // Freibetrag 2024: 654 €/Monat (Basisfall, income-dependent)
  const taxFree    = Math.min(654, salaryMin);
  const taxableWage = Math.max(0, salaryMin - taxFree - uiEmployee);
  const wageIT     = Math.round(taxableWage * 0.20);

  // Gewinn nach Gehalt und OÜ-Kosten (Sozialmaks zahlt OÜ)
  const ouProfit   = Math.max(0, monthlyGross - salaryMin - socialTax - uiEmployer - techMonthly);

  // Cash-in für Eigentümer = Nettogehalt (Dividenden: 0, thesauriert)
  const netSalary  = salaryMin - wageIT - uiEmployee;

  // Effektive monatliche Steuerbelastung auf das Gesamteinkommen
  const totalTax   = socialTax + uiEmployer + uiEmployee + wageIT;
  const monthlyNet = netSalary + ouProfit;  // Netto-Gehalt + thesaurierter Gewinn (in OÜ)

  const deductions: TaxDeductions = {
    healthInsurance: socialTax + uiEmployer,  // Sozialmaks (inkl. Krankenversicherung)
    incomeTax:       wageIT + uiEmployee,
    techStack:       techMonthly,
    chamber:         0,  // Kein Pflichtbeitrag
  };
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

  return {
    label:          'Estland / OÜ (EE)',
    country:        'EE',
    monthlyGross,
    deductions,
    totalDeductions,
    monthlyNet,
    effectiveRate:  totalDeductions / monthlyGross,
    taxableIncome:  taxableWage * 12,
    annualTax:      totalTax * 12,
    notes: [
      `OÜ-Modell: Mindestgehalt ${salaryMin} €/Monat · Restgewinn ${Math.round(ouProfit)} €/Monat thesauriert`,
      `Sozialmaks (Arbeitgeber): 33 % auf Gehalt — umfasst Kranken- + Rentenversicherung`,
      `0 % Körperschaftsteuer auf thesaurierte Gewinne (Kernvorteil Estland)`,
      `Dividendensteuer: 20/80 bei Ausschüttung — nicht im Modell, da Thesaurierung`,
      `e-Residency: digitale Gründung möglich · Wohnsitz in EE für optimale Vorteile empfohlen`,
      `⚠️ Wichtig: Für EU-Bürger gilt "tatsächlicher Wohnsitz" — lokale Besteuerung beachten`,
    ],
  };
}
