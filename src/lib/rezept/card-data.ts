import type { Recipe } from 'contentlayer/generated';
import type { RecipeCardData } from '@/components/recipe/RecipeExplorer';

/** ISO-8601-Dauer → "2 Std. 30 Min." */
export function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  const h = parseInt(m[1] || '0'), min = parseInt(m[2] || '0');
  if (h && min) return `${h} Std. ${min} Min.`;
  if (h) return `${h} Std.`;
  return `${min} Min.`;
}

/** Contentlayer-Recipe → schlankes Karten-Objekt für den Client-Explorer. */
export function toCardData(r: Recipe): RecipeCardData {
  return {
    slug: r.slug,
    url: r.url,
    title: r.title,
    description: r.description,
    image: r.image,
    imageAlt: r.imageAlt,
    difficulty: r.difficulty,
    totalTime: parseDuration(r.totalTime),
    servings: r.servings,
    calories: r.calories,
    kategorie: r.kategorie,
    meatType: r.meatType,
    cookingMethod: r.cookingMethod,
    land: r.land,
  };
}
