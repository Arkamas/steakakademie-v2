/**
 * Gemeinsame Konstanten des Kontaktformulars (KAN-70).
 *
 * Der Einwilligungstext steht hier und nicht zweimal: Das Formular zeigt ihn,
 * die Route speichert ihn als Nachweis nach Art. 5 Abs. 2 DSGVO. Zwei Kopien
 * wuerden frueher oder spaeter auseinanderlaufen — und dann belegt die
 * Datenbank eine Einwilligung, die so nie auf dem Bildschirm stand.
 */

export const CONSENT_TEXT =
  'Ich bin damit einverstanden, dass meine Angaben zur Beantwortung meiner Anfrage ' +
  'gespeichert und verarbeitet werden. Die Einwilligung kann jederzeit per E-Mail ' +
  'an pitmaster@steakakademie.de widerrufen werden.';

/** Zieladresse aller Kontaktnachrichten. Begruendung siehe /api/kontakt. */
export const KONTAKT_EMPFAENGER = 'pitmaster@steakakademie.de';
