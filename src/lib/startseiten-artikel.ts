// ─────────────────────────────────────────────────────────────────────────────
// Startseiten-Artikel — echter, wachsender Inhalt statt festverdrahteter Liste
//
// ANLASS (27.08.2026): Der Magazin-Aufmacher der Startseite kam aus einer
// hartkodierten Platzhalter-Liste. Deren erster Eintrag stand seit dem
// 20. Mai 2026 unveraendert oben — die Startseite sah drei Monate lang gleich
// aus, obwohl staendig neue Inhalte erschienen. Diese Datei zieht die
// Aufmacher-Artikel stattdessen aus Contentlayer: sortiert nach
// Veroeffentlichungsdatum, nur freigegebene Dokumente (Redaktionsvorbehalt),
// nur solche mit Bild. Sobald ein neuer Artikel/Cut/Methode/Vergleich
// veroeffentlicht wird, rotiert der Aufmacher OHNE manuellen Eingriff.
//
// Rezepte bleiben bewusst draussen — sie haben eigene Sektionen und wuerden
// den redaktionellen Aufmacher nach jedem Rezept-Lauf dominieren.
// ─────────────────────────────────────────────────────────────────────────────
import {
  allArtikels, allCuts, allMethodes, allVergleiches, allStreitfalls, allUsaBbqStyles,
} from 'contentlayer/generated';
import { nurVeroeffentlicht } from '@/lib/redaktion';
import type { ArticleMeta } from '@/types';

type Doc = {
  type: string;
  title: string;
  excerpt?: string;
  image?: string;
  imageAlt?: string;
  author?: string;
  publishedAt: string;
  readingTime?: number;
  category?: string;
  url: string;
  slug?: string;
  status?: string | null;
  reviewed?: boolean | null;
};

const KATEGORIE: Record<string, { label: string; slug: string }> = {
  Cut:         { label: 'Cuts & Fleischkunde',   slug: 'cuts' },
  Methode:     { label: 'Grilltechniken',        slug: 'grilltechniken' },
  Vergleich:   { label: 'Ausrüstung',            slug: 'ausruestung' },
  Streitfall:  { label: 'Wissen & Wissenschaft', slug: 'wissen' },
  UsaBbqStyle: { label: 'USA-Expedition',        slug: 'usa-expedition' },
  Artikel:     { label: 'Wissen & Wissenschaft', slug: 'wissen' },
};

// Artikel-Frontmatter darf eine eigene Kategorie tragen — auf die drei
// Startseiten-Rubriken abbilden, alles andere faellt auf "wissen" zurueck.
const ARTIKEL_KATEGORIE: Record<string, { label: string; slug: string }> = {
  grilltechniken: { label: 'Grilltechniken',      slug: 'grilltechniken' },
  cuts:           { label: 'Cuts & Fleischkunde', slug: 'cuts' },
};

function autorSlug(autor: string): string {
  const a = autor.toLowerCase();
  if (a.includes('jonas')) return 'jonas';
  if (a.includes('elena')) return 'elena';
  if (a.includes('uwe'))   return 'uwe-yendell';
  return 'marco';
}

const MONATE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
function datumDeutsch(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : `${d.getDate()}. ${MONATE[d.getMonth()]} ${d.getFullYear()}`;
}

function zuArticleMeta(doc: Doc): ArticleMeta | null {
  if (!doc.image || !doc.excerpt) return null;
  let kat = KATEGORIE[doc.type] ?? KATEGORIE.Artikel;
  if (doc.type === 'Artikel' && doc.category) {
    kat = ARTIKEL_KATEGORIE[doc.category.toLowerCase()] ?? kat;
  }
  const autor = doc.author || 'Marco, der Pitmaster';
  return {
    slug: doc.slug ?? doc.url.split('/').filter(Boolean).pop() ?? doc.url,
    url: doc.url,
    title: doc.title,
    excerpt: doc.excerpt,
    image: doc.image,
    imageAlt: doc.imageAlt || doc.title,
    category: kat.label,
    categorySlug: kat.slug,
    author: autor,
    authorSlug: autorSlug(autor),
    formattedDate: datumDeutsch(doc.publishedAt),
    ...(typeof doc.readingTime === 'number' ? { readingTime: doc.readingTime } : {}),
  };
}

/**
 * Aufmacher-Liste der Startseite: neueste veroeffentlichte Inhalte zuerst.
 * `fallback` (die fruehere Platzhalter-Liste) fuellt nur auf, falls der echte
 * Bestand einmal zu duenn ist — Eintraege mit bereits vorhandener URL werden
 * dabei uebersprungen, damit nichts doppelt erscheint.
 */
export function getStartseitenArtikel(fallback: ArticleMeta[], mindestens = 8): ArticleMeta[] {
  const docs = [
    ...allArtikels, ...allCuts, ...allMethodes,
    ...allVergleiches, ...allStreitfalls, ...allUsaBbqStyles,
  ] as unknown as Doc[];

  const echt = nurVeroeffentlicht(docs)
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
    .map(zuArticleMeta)
    .filter((a): a is ArticleMeta => a !== null);

  const urls = new Set(echt.map((a) => a.url));
  const out = [...echt];
  for (const f of fallback) {
    if (out.length >= Math.max(mindestens, echt.length)) break;
    if (!urls.has(f.url)) { out.push(f); urls.add(f.url); }
  }
  return out;
}
