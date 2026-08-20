/**
 * Redaktionsvorbehalt — der Filter, an dem die KI-Kennzeichnungsbefreiung haengt.
 *
 * compliance/ai-act-einstufung.md, Punkt 3 (Art. 50 Abs. 4): Die Text-Kennzeich-
 * nungspflicht entfaellt, WEIL jeder KI-Entwurf geprueft und verantwortet wird.
 * Diese Begruendung traegt nur, solange ungeprueftes Material die Seite nicht
 * erreicht. Genau das ist die Aufgabe dieser Funktion.
 *
 * Bewusst eine einzelne, zentrale Stelle statt eines `.filter()` pro Seite:
 * Das Gate scripts/check-redaktionsvorbehalt.mjs sucht statisch nach rohen
 * Collection-Zugriffen und verlangt, dass sie durch `nurVeroeffentlicht` laufen.
 * Ein handgeschriebener Inline-Filter waere fuer das Gate unsichtbar — und damit
 * genau die Zeile, die beim naechsten Refactor unbemerkt verschwindet.
 *
 * Die Bedingung ist absichtlich negativ formuliert (`!== 'draft'` statt
 * `=== 'published'`): Ein Dokument ohne `status` — der gesamte Altbestand — soll
 * sichtbar bleiben. Ein neuer, unbekannter Status-Wert wuerde bei positiver
 * Formulierung dagegen still alles ausblenden; das Gate faengt unbekannte Werte
 * ohnehin vorher ab.
 */

export interface Redaktionsstatus {
  status?: string | null;
  reviewed?: boolean | null;
}

/** Alles, was nicht Entwurf und nicht ausdruecklich ungeprueft ist. */
export function nurVeroeffentlicht<T extends Redaktionsstatus>(docs: readonly T[]): T[] {
  return docs.filter((d) => d.status !== 'draft' && d.status !== 'review' && d.reviewed !== false);
}

/** Gegenstueck fuer Vorschau-/Redaktionsansichten. */
export function nurEntwuerfe<T extends Redaktionsstatus>(docs: readonly T[]): T[] {
  return docs.filter((d) => d.status === 'draft' || d.status === 'review' || d.reviewed === false);
}

/**
 * Entwuerfe in der Entwicklung sichtbar machen, in Produktion nicht.
 *
 * Bewusst so herum formuliert, dass PRODUKTION der strikte Pfad ist: Wenn die
 * Umgebungserkennung je fehlschlaegt oder jemand die Bedingung umbaut, faellt das
 * Ergebnis auf nurVeroeffentlicht() zurueck — also auf „zu wenig anzeigen"
 * statt auf „ungeprueften KI-Text ausliefern". Der teurere Fehler ist hier der
 * zweite (siehe compliance/ai-act-einstufung.md Punkt 3).
 *
 * next build setzt NODE_ENV auf 'production', next dev auf 'development'.
 */
export function sichtbareArtikel<T extends Redaktionsstatus>(docs: readonly T[]): T[] {
  return process.env.NODE_ENV === 'production' ? nurVeroeffentlicht(docs) : [...docs];
}

/** True, wenn dieses Dokument nur wegen der Entwicklungsumgebung sichtbar ist. */
export function istEntwurf<T extends Redaktionsstatus>(doc: T): boolean {
  return doc.status === 'draft' || doc.status === 'review' || doc.reviewed === false;
}
