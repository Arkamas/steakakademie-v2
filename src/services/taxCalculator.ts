/**
 * AuthorityOS — Steuerrechner DE / NL
 * ===================================================================
 * Berechnet den realistischen Netto-Cash-In für Solopreneure
 * auf Basis eines angenommenen monatlichen Bruttoumsatzes.
 *
 * Steuerrecht-Stand: 2024
 *   DE — Einzelunternehmer / Freiberufler
 *   NL — ZZP (Zelfstandige zonder personeel)
 *
 * Beide Module liefern ein einheitliches TaxResult-Objekt.
 * Kein API-Call, keine externen Dependencies.
 * ===================================================================
 */

// ─── Typen ────────────────────────────────────────────────────────────────────

export interface TaxDeductions {
  /** GKV+PV (DE) oder Zorgverzekering inkl. IAB (NL) — €/Monat */
  healthInsurance: number;
  /** Einkommensteuer / Inkomstenbelasting — monatliches Äquivalent */
  incomeTax: number;
  /** Tech-Stack-Kosten — €/Monat */
  techStack: number;
  /** IHK-Beitrag (DE) oder KVK-Jahresgebühr (NL) — monatliches Äquivalent */
  chamber: number;
}

export interface TaxResult {
  label:            string;
  country:          'DE' | 'NL' | 'ES' | 'IT' | 'FR' | 'PT' | 'AT' | 'CH' | 'GB' | 'EE' | 'AE';
  monthlyGross:     number;
  deductions:       TaxDeductions;
  /** Summe aller Abzüge — €/Monat */
  totalDeductions:  number;
  /** Verbleibendes Netto nach allen Abzügen — €/Monat */
  monthlyNet:       number;
  /** Gesamtabzüge / Bruttoumsatz */
  effectiveRate:    number;
  /** Zu versteuerndes Einkommen (DE: ZvE, NL: Box-1-Inkomen) — €/Jahr */
  taxableIncome:    number;
  /** Jahressteuer vor Monatisierung */
  annualTax:        number;
  /** Gesetzliche Grundlagen und Annahmen */
  notes:            string[];
}

// ─── Deutschland — §32a EStG 2024 ────────────────────────────────────────────

/**
 * Deutsche Einkommensteuer nach der Formel des §32a Abs. 1 EStG (Grundtabelle 2024).
 * Eingabe: zu versteuerndes Einkommen in EUR (ganzzahlig).
 * Ausgabe: Einkommensteuer in EUR (ganzzahlig, abgerundet).
 */
export function germanIncomeTax(zvE: number): number {
  if (zvE <= 11_604) return 0;

  // 1. Progressionszone: 11.604 – 17.005 €
  if (zvE <= 17_005) {
    const y = (zvE - 11_604) / 10_000;
    return Math.round((922.98 * y + 1_400) * y);
  }

  // 2. Progressionszone: 17.005 – 66.760 €
  if (zvE <= 66_760) {
    const y = (zvE - 17_005) / 10_000;
    return Math.round((181.19 * y + 2_397) * y + 1_025.38);
  }

  // Proportionalzone (Spitzensteuersatz 42 %): 66.760 – 277.826 €
  if (zvE <= 277_826) return Math.round(0.42 * zvE - 10_911.92);

  // Reichensteuer 45 %: > 277.826 €
  return Math.round(0.45 * zvE - 19_246.67);
}

/**
 * Vollständige Steuer- und Abgabenberechnung für einen deutschen
 * Einzelunternehmer / Freiberufler bei gegebenem Bruttoumsatz.
 */
export function calculateDE(monthlyGross: number): TaxResult {
  const annual     = monthlyGross * 12;
  const techMonthly = 150;             // Tech-Stack €/Monat (Vercel, API-Kosten …)
  const ikhYear     = 250;             // IHK-Pauschalbeitrag €/Jahr (umsatzabhängig)

  // Gesetzliche Kranken- und Pflegeversicherung
  // Selbstständige tragen Arbeitgeber- und Arbeitnehmeranteil allein.
  // GKV: 14,6 % (allg. Beitragssatz) + Ø 1,7 % Zusatzbeitrag = 16,3 %
  // PV:   3,4 % (Kinderlosenzuschlag inklusive, Stand 2024)
  const gkvRate    = 0.163;
  const pvRate     = 0.034;
  const kvMonthly  = Math.round(monthlyGross * (gkvRate + pvRate));

  // Zu versteuerndes Einkommen (ZvE)
  // KV/PV: als Sonderausgaben gem. §10 Abs. 1 Nr. 3 EStG voll absetzbar
  const zvE = Math.max(0, annual - kvMonthly * 12 - techMonthly * 12 - ikhYear);

  const annualTax   = germanIncomeTax(zvE);
  const taxMonthly  = Math.round(annualTax / 12);
  const chamberMo   = Math.round(ikhYear / 12);

  const deductions: TaxDeductions = {
    healthInsurance: kvMonthly,
    incomeTax:       taxMonthly,
    techStack:       techMonthly,
    chamber:         chamberMo,
  };
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

  return {
    label:           'Deutschland (DE)',
    country:         'DE',
    monthlyGross,
    deductions,
    totalDeductions,
    monthlyNet:      monthlyGross - totalDeductions,
    effectiveRate:   totalDeductions / monthlyGross,
    taxableIncome:   zvE,
    annualTax,
    notes: [
      `ZvE: ${zvE.toLocaleString('de-DE')} €/Jahr nach Abzug aller Kosten`,
      'GKV 14,6 % + Zusatzbeitrag 1,7 % + PV 3,4 % (voll selbst getragen)',
      '§32a EStG progressive Einkommensteuer | Grundfreibetrag 11.604 €',
      'Soli-Zuschlag: entfällt bei diesem Einkommensniveau',
      `IHK-Pauschalbeitrag ~${ikhYear} €/Jahr (umsatzabhängig)`,
    ],
  };
}

// ─── Niederlande — Wet IB 2001, Zvw 2024 ─────────────────────────────────────

/**
 * Algemene heffingskorting (2024).
 * Maximum 3.362 €, linearer Abbau zwischen 24.813 € und 75.520 €.
 */
export function nlAlgemeneHeffingskorting(inkomen: number): number {
  const MAX = 3_362;
  if (inkomen <= 24_813) return MAX;
  if (inkomen >= 75_520) return 0;
  return Math.round(MAX - ((inkomen - 24_813) / (75_520 - 24_813)) * MAX);
}

/**
 * Arbeidskorting (2024) — ZZP qualifiziert als werkende.
 * Maximum 5.158 €, Abbau ab 39.957 € mit 6,51 % pro zusätzlichem Euro.
 */
export function nlArbeidskorting(inkomen: number): number {
  const MAX = 5_158;
  if (inkomen <= 39_957) return MAX;
  return Math.max(0, Math.round(MAX - (inkomen - 39_957) * 0.0651));
}

/**
 * Niederländische Inkomstenbelasting Box 1 (2024) nach Heffingskortingen.
 * Eingabe: belastbaar inkomen. Ausgabe: zu zahlende Steuer in EUR.
 */
export function nlInkomensbelasting(boxInkomen: number): number {
  // Tarief 2024: ≤ 75.518 € → 36,97 % | > 75.518 € → 49,50 %
  const baseTax = boxInkomen <= 75_518
    ? boxInkomen * 0.3697
    : 75_518 * 0.3697 + (boxInkomen - 75_518) * 0.495;

  const kortingen = nlAlgemeneHeffingskorting(boxInkomen) + nlArbeidskorting(boxInkomen);
  return Math.max(0, Math.round(baseTax - kortingen));
}

/**
 * Vollständige Steuer- und Abgabenberechnung für einen niederländischen
 * ZZP (Zelfstandige zonder personeel) bei gegebenem Bruttoumsatz.
 */
export function calculateNL(monthlyGross: number): TaxResult {
  const annual     = monthlyGross * 12;
  const techMonthly = 150;             // Tech-Stack €/Monat
  const kvkYear     = 75;             // KVK eenmalige registratiekosten (p.a. amortisiert)

  // ZZP-Gewinnermittlung
  // Zelfstandigenaftrek 2024: 3.750 € (wird jährlich um 1.280 € gesenkt bis 900 € 2027)
  const zelfAftr   = 3_750;
  const winst      = Math.max(0, annual - techMonthly * 12 - kvkYear - zelfAftr);

  // MKB-Winstvrijstelling: 13,31 % des verbleibenden Gewinns steuerfrei
  const mkbVrij    = Math.round(winst * 0.1331);
  const boxInkomen = Math.max(0, winst - mkbVrij);

  const annualTax  = nlInkomensbelasting(boxInkomen);
  const taxMonthly = Math.round(annualTax / 12);

  // Zorgverzekeringswet (Zvw)
  // Basispremie: marktabhängig, Richtwert ~150 €/Monat (2024-Niveau)
  // Inkomensafhankelijke bijdrage (IAB): 5,32 % des belastbaar inkomen, max. 3.700 €/Jahr
  const zorBase    = 150;
  const zorIAB     = Math.min(3_700, Math.round(boxInkomen * 0.0532));
  const zorMonthly = zorBase + Math.round(zorIAB / 12);

  const chamberMo  = Math.round(kvkYear / 12);

  const deductions: TaxDeductions = {
    healthInsurance: zorMonthly,
    incomeTax:       taxMonthly,
    techStack:       techMonthly,
    chamber:         chamberMo,
  };
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
  const kortingen = nlAlgemeneHeffingskorting(boxInkomen) + nlArbeidskorting(boxInkomen);

  return {
    label:           'Niederlande (NL)',
    country:         'NL',
    monthlyGross,
    deductions,
    totalDeductions,
    monthlyNet:      monthlyGross - totalDeductions,
    effectiveRate:   totalDeductions / monthlyGross,
    taxableIncome:   boxInkomen,
    annualTax,
    notes: [
      `Belastbaar inkomen (Box 1): ${boxInkomen.toLocaleString('de-DE')} €/Jahr`,
      `Zelfstandigenaftrek: ${zelfAftr.toLocaleString('de-DE')} € | MKB-Winstvrijstelling: 13,31 %`,
      'Box-1-Tarif bis 75.518 €: 36,97 %',
      `Heffingskortingen: ${kortingen.toLocaleString('de-DE')} € (Algemene + Arbeidskorting)`,
      `Zorgverzekering: Basispremie ${(zorBase * 12).toLocaleString('de-DE')} €/Jahr + IAB 5,32 %`,
    ],
  };
}
