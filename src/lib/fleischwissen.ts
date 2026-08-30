// ─────────────────────────────────────────────────────────────────────────────
// Fleischwissen — Serienlogik
//
// ALLE DREI TEILE SIND LIVE. Es gibt hier bewusst KEINEN Datumsfilter.
//
// Diese Datei enthielt bis zum 30.08.2026 eine gestaffelte Erscheinungssperre
// (Teil 1 ab 02.10., Teil 2 ab 09.10., Teil 3 ab 16.10.) mit noindex,
// Sitemap-Ausschluss und „erscheint am"-Karten. Uwe hat die Staffelung
// abgeschafft: alle drei gehen sofort live. Der Vermerk steht hier, damit
// niemand die Sperre als „vergessen" wieder einbaut — sie war da und ist
// absichtlich weg.
//
// `newsletterAt` im Frontmatter (02.10. / 09.10. / 16.10.2026) ist der Termin,
// an dem der jeweilige Teil als Newsletter-Aufmacher verschickt wird. Das ist
// DOKUMENTATION. Es darf die Sichtbarkeit auf der Website nicht beeinflussen,
// und diese Datei liest es deshalb gar nicht erst.
//
// Was bleibt: die Reihenfolge. `serieTeil` bestimmt Sortierung und Vor/Zurueck-
// Navigation — das ist eine Leseordnung, keine Freigabe.
//
// Der Redaktionsvorbehalt (src/lib/redaktion.ts) gilt unveraendert weiter: ein
// Dokument mit status draft/review oder reviewed: false erscheint nicht. Das ist
// die AI-Act-Pflicht aus compliance/ai-act-einstufung.md und hat mit der
// abgeschafften Terminsteuerung nichts zu tun.
// ─────────────────────────────────────────────────────────────────────────────
import { allFleischwissens } from 'contentlayer/generated';
import { sichtbareArtikel } from '@/lib/redaktion';

export type FleischwissenDoc = (typeof allFleischwissens)[number];

/**
 * Alle Teile in Serienreihenfolge (Teil 1 → 2 → 3).
 *
 * `sichtbareArtikel` statt `nurVeroeffentlicht`: In der Entwicklung sind auch
 * Entwuerfe sichtbar, in Produktion nicht. Anlass (30.08.2026) ist ein
 * praktisches Problem — die drei Teile stehen auf status: review, und ohne
 * diesen Schalter waeren sie auch lokal unsichtbar. Uwe koennte sie dann nicht
 * auf der Seite lesen, um sie freizugeben, sondern nur im MDX.
 *
 * Die Richtung ist bewusst so herum: `sichtbareArtikel` faellt in Produktion auf
 * `nurVeroeffentlicht` zurueck. Wenn die Umgebungserkennung je fehlschlaegt,
 * zeigt die Seite zu wenig statt ungeprueften Text — der teurere Fehler ist der
 * zweite (compliance/ai-act-einstufung.md Punkt 3).
 */
export function serie(): FleischwissenDoc[] {
  return sichtbareArtikel(allFleischwissens).sort((a, b) => a.serieTeil - b.serieTeil);
}

/** Ein Teil ueber seinen Slug. */
export function teilBySlug(slug: string): FleischwissenDoc | undefined {
  return serie().find((d) => d.slug === slug);
}

/** Nachbarn in der Serie fuer die Vor/Zurueck-Navigation. */
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
