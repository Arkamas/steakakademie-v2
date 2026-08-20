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
