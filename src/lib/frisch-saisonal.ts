import { allRecipes, allArtikels, allMethodes } from 'contentlayer/generated';
import { nurVeroeffentlicht } from '@/lib/redaktion';

// ════════════════════════════════════════════════════════════════════════════
// „Frisch & Saisonal" — Server-Daten fürs bewegte Spotlight-Modul.
//
// Liefert eine rotierende Auswahl aus (a) den NEUESTEN Inhalten (Rezepte,
// Berichte, Techniken) und (b) den SAISONAL passenden Rezepten zum aktuellen
// Monat. Jede „Bericht/Technik"-Folie wird, wo möglich, mit einem passenden
// Rezept gepaart — das ist die von Uwe gewünschte „Berichte gepaart mit Rezepten".
//
// Ehrliches System: Es wird NICHTS erfunden. Saison = echte Inhalte, die zur
// Jahreszeit passen; ist nichts Passendes da, füllt „Frisch" auf.
// ════════════════════════════════════════════════════════════════════════════

export type SlideBadge = 'Frisch' | 'Saisonal';

export type FrischSaisonalSlide = {
  badge: SlideBadge;
  kind: 'Rezept' | 'Technik' | 'Bericht';
  title: string;
  excerpt: string;
  url: string;
  image: string;
  imageAlt: string;
  pairing?: { label: string; title: string; url: string };
};

export type FrischSaisonalData = {
  season: string;
  seasonLabel: string;
  slides: FrischSaisonalSlide[];
};

type Season = 'fruehling' | 'sommer' | 'herbst' | 'winter';

// Saison aus dem Monat ableiten (Nordhalbkugel / Deutschland)
function seasonForMonth(month0: number): Season {
  // month0: 0 = Januar … 11 = Dezember
  if (month0 >= 2 && month0 <= 4) return 'fruehling'; // Mär–Mai
  if (month0 >= 5 && month0 <= 7) return 'sommer'; // Jun–Aug
  if (month0 >= 8 && month0 <= 10) return 'herbst'; // Sep–Nov
  return 'winter'; // Dez–Feb
}

const SEASON_LABEL: Record<Season, string> = {
  fruehling: 'Frühling',
  sommer: 'Sommer',
  herbst: 'Herbst',
  winter: 'Winter',
};

// Saisonale Such-Begriffe (klein geschrieben). Match gegen Titel, kategorie,
// meatType und keywords der Rezepte.
const SEASON_TERMS: Record<Season, string[]> = {
  fruehling: ['spargel', 'bärlauch', 'baerlauch', 'lamm', 'radies', 'rhabarber', 'frühling', 'fruehling', 'kräuter'],
  sommer: ['fisch', 'lachs', 'dorade', 'makrele', 'thunfisch', 'garnele', 'gemüse', 'gemuese', 'spieß', 'spiess', 'mais', 'zucchini', 'paprika', 'aubergine', 'salat', 'halloumi', 'grüner spargel', 'gruener spargel', 'sommer', 'wassermelone'],
  herbst: ['kürbis', 'kuerbis', 'wild', 'reh', 'hirsch', 'pilz', 'maroni', 'maronen', 'pflaume', 'herbst', 'kohl'],
  winter: ['braten', 'gans', 'ente', 'brisket', 'pulled', 'low & slow', 'low and slow', 'rosenkohl', 'wurzel', 'glühwein', 'gluehwein', 'winter', 'raclette'],
};

const norm = (s: string) => (s || '').toLowerCase();

function recipeMatchesSeason(r: any, terms: string[]): boolean {
  const hay = [
    norm(r.title),
    norm(r.kategorie),
    norm(r.meatType),
    norm(r.cookingMethod),
    ...((r.keywords as string[] | undefined)?.map(norm) ?? []),
  ].join(' | ');
  return terms.some((t) => hay.includes(t));
}

// Findet ein Rezept, das thematisch zu einer Begriffsmenge passt (für Paarung).
function findPairingRecipe(terms: string[], excludeUrl?: string): any | undefined {
  const recipes = [...(allRecipes as any[])].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
  return recipes.find((r) => r.url !== excludeUrl && recipeMatchesSeason(r, terms));
}

function termsFor(item: any): string[] {
  return [
    norm(item.title),
    ...((item.keywords as string[] | undefined)?.map(norm) ?? []),
    ...((item.tags as string[] | undefined)?.map(norm) ?? []),
    norm(item.meatType),
    norm(item.cookingMethod),
  ].filter(Boolean);
}

export function getFrischSaisonal(now: Date = new Date()): FrischSaisonalData {
  const season = seasonForMonth(now.getMonth());
  const seasonTerms = SEASON_TERMS[season];

  const recipes = (allRecipes as any[]).filter((r) => r.publishedAt);
  const artikels = (nurVeroeffentlicht(allArtikels) as any[]).filter((a) => a.publishedAt && !a.noindex);
  const methoden = (allMethodes as any[]).filter((m) => m.publishedAt);

  const byDateDesc = (a: any, b: any) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

  // Interner Kandidat trägt Sortier-Datum + Begriffe (für Paarung) mit.
  type Candidate = FrischSaisonalSlide & { date: string; terms: string[] };

  // ── FRISCH: neueste Inhalte aus allen drei Typen ──────────────────────────
  const frischPool: Candidate[] = [
    ...methoden.map((m): Candidate => ({
      badge: 'Frisch', kind: 'Technik',
      title: m.title, excerpt: m.excerpt, url: m.url, image: m.image, imageAlt: m.imageAlt,
      date: m.publishedAt, terms: termsFor(m),
    })),
    ...artikels.map((a): Candidate => ({
      badge: 'Frisch', kind: 'Bericht',
      title: a.title, excerpt: a.excerpt, url: a.url, image: a.image, imageAlt: a.imageAlt,
      date: a.publishedAt, terms: termsFor(a),
    })),
    ...recipes.map((r): Candidate => ({
      badge: 'Frisch', kind: 'Rezept',
      title: r.title, excerpt: r.description, url: r.url, image: r.image, imageAlt: r.imageAlt,
      date: r.publishedAt, terms: termsFor(r),
    })),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  // ── SAISONAL: Rezepte, die zur aktuellen Jahreszeit passen ────────────────
  const saisonPool: Candidate[] = recipes
    .filter((r) => recipeMatchesSeason(r, seasonTerms))
    .sort(byDateDesc)
    .map((r): Candidate => ({
      badge: 'Saisonal', kind: 'Rezept',
      title: r.title, excerpt: r.description, url: r.url, image: r.image, imageAlt: r.imageAlt,
      date: r.publishedAt, terms: termsFor(r),
    }));

  // ── Mischen: abwechselnd Frisch / Saisonal, dedupe per URL ────────────────
  const seen = new Set<string>();
  const slides: FrischSaisonalSlide[] = [];
  const frisch = frischPool.slice(0, 6);
  const saison = saisonPool.slice(0, 6);
  const maxLen = Math.max(frisch.length, saison.length);

  for (let i = 0; i < maxLen && slides.length < 8; i++) {
    for (const cand of [frisch[i], saison[i]]) {
      if (!cand || seen.has(cand.url)) continue;
      seen.add(cand.url);

      const slide: FrischSaisonalSlide = {
        badge: cand.badge, kind: cand.kind,
        title: cand.title, excerpt: cand.excerpt, url: cand.url,
        image: cand.image, imageAlt: cand.imageAlt,
      };

      // Paarung: Technik/Bericht mit einem passenden Rezept verknüpfen
      if (cand.kind !== 'Rezept') {
        const match = findPairingRecipe([...cand.terms, ...seasonTerms], cand.url);
        if (match) slide.pairing = { label: 'Dazu das Rezept', title: match.title, url: match.url };
      }

      slides.push(slide);
    }
  }

  return { season, seasonLabel: SEASON_LABEL[season], slides };
}
