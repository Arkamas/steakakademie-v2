/**
 * Einwilligungstext — versioniert, Single Source of Truth.
 *
 * WARUM VERSIONIERT?
 * Art. 7 Abs. 1 DSGVO: Der Verantwortliche MUSS nachweisen können, dass eine
 * wirksame Einwilligung vorlag. Der Nachweis ist nur so gut wie die Antwort auf
 * die Frage „worin genau wurde eingewilligt?". Ändert sich der Text, ohne dass
 * die alte Fassung erhalten bleibt, ist die Beweiskette für den Altbestand
 * gerissen.
 *
 * REGEL BEI TEXTÄNDERUNGEN:
 *  1. Neuen Eintrag in NEWSLETTER_CONSENT_HISTORY anlegen — alte Einträge NIE löschen oder
 *     bearbeiten. Sie sind das Beweismittel für bereits erteilte Einwilligungen.
 *  2. NEWSLETTER_CONSENT_VERSION auf die neue ID setzen.
 *  3. Datenschutzerklärung § 7 gegenlesen (Inhalte müssen deckungsgleich sein).
 *
 * RECHTSGRUNDLAGEN
 *  - Art. 6 Abs. 1 lit. a, Art. 7 DSGVO (Einwilligung, Nachweispflicht)
 *  - § 7 Abs. 2 Nr. 2 UWG (ausdrückliche Einwilligung in Werbung)
 *  - BGH I ZR 3/06 („Payback"), I ZR 218/07 („Happy Digits"): Aus der
 *    Einwilligung muss hervorgehen, WOFÜR geworben wird.
 */

export const NEWSLETTER_CONSENT_VERSION = '2026-08-28-v2';

/**
 * Der Wortlaut, dem der Nutzer per Checkbox zustimmt.
 *
 * Enthält bewusst das Wort „Werbung" und benennt den beworbenen Produktbereich.
 * Vorgängerfassung (v1) sprach nur vom „Wissens-Brief" und deckte die tatsächlich
 * versendeten Produktempfehlungen und Affiliate-Links nicht ab — § 7 Abs. 2 Nr. 2
 * UWG war damit nicht erfüllt.
 *
 * Die Datenschutzerklärung ist hier bewusst NICHT Gegenstand der Einwilligung:
 * Sie ist eine Information nach Art. 13 DSGVO, kein zustimmungsfähiger
 * Gegenstand. Eine Kopplung beider in einer Checkbox erzeugt eine gebündelte
 * Einwilligung und schwächt ihre Bestimmtheit (Art. 4 Nr. 11 DSGVO).
 */
export const NEWSLETTER_CONSENT_TEXT =
  'Ja, ich möchte den kostenlosen Wissens-Brief der Steakakademie per E-Mail erhalten. ' +
  'Er enthält BBQ-Wissen sowie Produktempfehlungen und Werbung rund um Grill-, BBQ- und ' +
  'Küchenprodukte, auch von Partnern über Affiliate-Links. Meine Einwilligung kann ich ' +
  'jederzeit mit Wirkung für die Zukunft widerrufen — über den Abmeldelink in jeder ' +
  'E-Mail oder per Nachricht an pitmaster@steakakademie.de.';

/**
 * Archiv aller je verwendeten Fassungen. Append-only.
 * Wird gebraucht, um für einen Altkontakt zu belegen, worin er eingewilligt hat.
 */
export const NEWSLETTER_CONSENT_HISTORY: Record<string, string> = {
  // Fassung bis 28.08.2026. Rechtlich unzureichend (kein Werbehinweis, DSE
  // gekoppelt) — bleibt als Beweismittel für Kontakte aus diesem Zeitraum stehen.
  '2026-08-28-v1':
    'Ja, ich möchte den Wissens-Brief per E-Mail erhalten und bin mit der ' +
    'Datenschutzerklärung einverstanden. Abmeldung jederzeit mit einem Klick.',
  '2026-08-28-v2': NEWSLETTER_CONSENT_TEXT,
};

/**
 * ACHTUNG — Öffnungs- und Klick-Tracking ist von dieser Einwilligung NICHT gedeckt.
 *
 * § 25 Abs. 1 TDDDG verlangt für das Setzen/Auslesen von Informationen auf dem
 * Endgerät (Zählpixel) eine eigene Einwilligung. Die Ausnahme in Abs. 2 greift
 * nicht, weil Erfolgsmessung im Interesse des Versenders liegt, nicht des
 * Empfängers. Ein Hinweis in der Datenschutzerklärung genügt dafür NICHT.
 *
 * Solange dieser Wert `false` ist, MUSS das Tracking in Loops deaktiviert sein
 * (Settings → Sending). Wer es einschaltet, braucht zusätzlich eine gesonderte,
 * freiwillige Checkbox und einen passenden Passus in § 7 der DSE.
 */
export const EMAIL_TRACKING_CONSENT_IMPLEMENTED = false;
