// Verknüpfung Cut → Rezept.
// Matched Rezepte (contentlayer) über die `meatTypeMatch`-Substrings eines Cuts
// gegen `meatType`/Slug/Titel des Rezepts. Server-only (importiert contentlayer).

import { allRecipes } from 'contentlayer/generated';
import type { Cut } from './cuts-catalog';

export interface CutRecipeRef {
  title: string;
  url: string;
  image: string;
  slug: string;
}

export function getRecipesForCut(cut: Cut, limit = 4): CutRecipeRef[] {
  const needles = cut.meatTypeMatch.map((m) => m.toLowerCase());
  const matches = allRecipes
    .filter((r) => {
      const hay = `${r.meatType} ${r.slug} ${r.title}`.toLowerCase();
      return needles.some((n) => hay.includes(n));
    })
    // exakte meatType-Treffer zuerst
    .sort((a, b) => {
      const am = needles.includes(a.meatType.toLowerCase()) ? 0 : 1;
      const bm = needles.includes(b.meatType.toLowerCase()) ? 0 : 1;
      return am - bm;
    })
    .slice(0, limit)
    .map((r) => ({ title: r.title, url: r.url, image: r.image, slug: r.slug }));

  return matches;
}

/** Map cutId → Rezepte. Für die Übergabe an Client-Komponenten. */
export function buildCutRecipeMap(cuts: Cut[], limit = 4): Record<string, CutRecipeRef[]> {
  const map: Record<string, CutRecipeRef[]> = {};
  for (const cut of cuts) {
    const refs = getRecipesForCut(cut, limit);
    if (refs.length) map[cut.id] = refs;
  }
  return map;
}
