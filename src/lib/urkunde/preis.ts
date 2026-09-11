/**
 * Preis und Einwilligungstext der gedruckten Urkunde — EINE Stelle.
 *
 * Vorher stand „9,99 € + 4,99 € Porto" fuenfmal in der Bestellseite und
 * einmal als Knopfbeschriftung auf /diplome. Beim Wechsel auf einen
 * Gesamtpreis war genau das die Fehlerquelle: sechs Stellen, eine vergessen.
 *
 * Kalkulation (Stand 10.09.2026, Gelato-API abgefragt):
 *   Druck A4, 250 g/m² seidenmatt   3,51 €
 *   Versand UPS Standard (getrackt) 8,70 €
 *   ------------------------------------
 *   Selbstkosten                   12,21 €
 * Bei 17,99 € bleiben 5,78 € fuer Zahlungsgebuehren, Fehldrucke und Aufwand.
 * Keine Umsatzsteuer: Kleinunternehmerregelung nach § 19 UStG.
 *
 * Reine Daten, keine Server-Abhaengigkeit — auch aus Client-Komponenten
 * importierbar.
 */

export const URKUNDE_PREIS_CENTS = 1799;

export function urkundePreisText(): string {
  return `${(URKUNDE_PREIS_CENTS / 100).toFixed(2).replace('.', ',')} €`;
}

/** Preis mit dem Zusatz, der ueberall danebenstehen soll. */
export function urkundePreisMitVersand(): string {
  return `${urkundePreisText()} (Versand inklusive)`;
}

export const URKUNDE_CONSENT_TEXT =
  'Ich bin einverstanden, dass meine Angaben zur Bearbeitung dieser Bestellung ' +
  'gespeichert und für Druck und Versand an unseren Druckdienstleister Gelato ' +
  'übermittelt werden.';

/** Länder, in die bestellt werden kann (ISO 3166-1 alpha-2). */
export const URKUNDE_LAENDER: readonly { code: string; name: string }[] = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'LU', name: 'Luxemburg' },
  { code: 'BE', name: 'Belgien' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'DK', name: 'Dänemark' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'IT', name: 'Italien' },
  { code: 'ES', name: 'Spanien' },
  { code: 'PL', name: 'Polen' },
  { code: 'CZ', name: 'Tschechien' },
] as const;
