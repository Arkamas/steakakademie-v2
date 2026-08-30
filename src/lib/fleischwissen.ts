// ─────────────────────────────────────────────────────────────────────────────
// Fleischwissen — Serienlogik und Erscheinungssperre
//
// Die Serie erscheint gestaffelt: Teil 1 am 02.10.2026, Teil 2 am 09.10.,
// Teil 3 am 16.10. Vor dem jeweiligen Datum darf ein Teil NICHT verlinkt und
// NICHT in der Sitemap auftauchen — die Uebersicht zeigt ihn als „erscheint
// am …" ohne Ziel.
//
// Warum das hier steht und nicht als `.filter()` auf jeder Seite:
// Der Filter muss an drei Orten identisch gelten (Uebersicht, Detailseite,
// Sitemap). Drei handgeschriebene Datumsvergleiche driften auseinander, und
// zwar still — der Fehler faellt erst auf, wenn ein unfertiger Artikel im
// Index steht. Dieselbe Ueberlegung wie bei nurVeroeffentlicht() in
// src/lib/redaktion.ts, nur fuer die zweite, unabhaengige Sperre.
//
// VIERTE STELLE, die dieselbe Regel kennen muss: next-sitemap.config.js.
// Die Datei ist CommonJS und kann dieses Modul nicht importieren; sie liest
// die Frontmatter direkt (gleiches Muster wie dort schon fuer die
// Stufe-1-Lektionen). Wer die Regel hier aendert, aendert sie dort mit.
//
// Zeitzone: Vergleich auf Tagesbasis in lokaler Zeit. `publishedAt` kommt aus
// Contentlayer als ISO-String in UTC (2026-10-02T00:00:00.000Z). Ein naiver
// `new Date(publishedAt) <= new Date()` haette in Deutschland dazu gefuehrt,
// dass ein Artikel am Erscheinungstag zwischen 00:00 und 02:00 MESZ schon
// sichtbar ist bzw. — je nach Richtung — einen Tag zu frueh. Deshalb wird auf
// beiden Seiten auf das reine Kalenderdatum reduziert.
// ─────────────────────────────────────────────────────────────────────────────
import { allFleischwissens } from 'contentlayer/generated';
import { nurVeroeffentlicht } from '@/lib/redaktion';

export type FleischwissenDoc = (typeof allFleischwissens)[number];

/** Kalendertag als YYYY-MM-DD, aus einem ISO-String in UTC gelesen. */
function tag(iso: string): string {
  return iso.slice(0, 10);
}

/** Heutiger Kalendertag als YYYY-MM-DD in lokaler Zeit. */
function heute(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Ist dieser Teil heute oder frueher erschienen? */
export function istErschienen(doc: Pick<FleischwissenDoc, 'publishedAt'>): boolean {
  return tag(doc.publishedAt) <= heute();
}

/**
 * Alle Teile in Serienreihenfolge — auch die noch nicht erschienenen.
 *
 * Fuer die Uebersichtsseite, die den kompletten Fahrplan zeigen soll. Ob ein
 * Eintrag verlinkt wird, entscheidet der Aufrufer ueber istErschienen().
 */
export function serie(): FleischwissenDoc[] {
  return nurVeroeffentlicht(allFleischwissens).sort((a, b) => a.serieTeil - b.serieTeil);
}

/** Nur die heute bereits erschienenen Teile — fuer Verlinkung und Indexierung. */
export function erschieneneSerie(): FleischwissenDoc[] {
  return serie().filter(istErschienen);
}

/** Ein Teil ueber seinen Slug, unabhaengig vom Erscheinungsdatum. */
export function teilBySlug(slug: string): FleischwissenDoc | undefined {
  return serie().find((d) => d.slug === slug);
}

/**
 * Nachbarn in der Serie fuer die Vor/Zurueck-Navigation.
 *
 * Gibt auch noch nicht erschienene Nachbarn zurueck — die Detailseite zeigt sie
 * als deaktivierten Ausblick statt als Link. Das ist Absicht: „Teil 3 erscheint
 * am 16. Oktober" ist eine Information, ein toter Link waere ein Defekt.
 */
export function nachbarn(doc: FleischwissenDoc): {
  vorheriger?: FleischwissenDoc;
  naechster?: FleischwissenDoc;
} {
  const alle = serie();
  const i = alle.findIndex((d) => d.slug === doc.slug);
  return {
    vorheriger: i > 0 ? alle[i - 1] : undefined,
    naechster: i >= 0 && i < alle.length - 1 ? alle[i + 1] : undefined,
  };
}

/** „2. Oktober 2026" — fuer die „erscheint am …"-Zeile. */
export function erscheinungsdatum(doc: Pick<FleischwissenDoc, 'publishedAt'>): string {
  const [jahr, monat, tagZahl] = tag(doc.publishedAt).split('-').map(Number);
  const MONATE = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ];
  return `${tagZahl}. ${MONATE[monat - 1]} ${jahr}`;
}
