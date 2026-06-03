import {
  allRecipes, allGlossars, allDiplomLektions, allMethodes, allCuts,
} from 'contentlayer/generated';

// Server-berechneter „Plattform-Puls": echte, automatisch wachsende Content-Zahlen
// + die zuletzt dazugekommenen Inhalte. Kein Cold-Start-0-Problem (Content existiert),
// wächst automatisch mit der Glossar-/Rezept-Pipeline.

export type PulsItem = { title: string; url: string; kind: string; date: string };
export type PulsData = {
  counts: { label: string; value: number }[];
  latest: PulsItem[];
};

export function getPlattformPuls(): PulsData {
  const map = (arr: { title: string; url: string; publishedAt?: string }[], kind: string): PulsItem[] =>
    arr.map((d) => ({ title: d.title, url: d.url, kind, date: d.publishedAt ?? '' }));

  const pool: PulsItem[] = [
    ...map(allRecipes as never[], 'Rezept'),
    ...map(allDiplomLektions as never[], 'Lektion'),
    ...map(allMethodes as never[], 'Methode'),
    ...map(allGlossars as never[], 'Begriff'),
  ];

  const latest = pool
    .filter((x) => x.date)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 6);

  return {
    counts: [
      { label: 'Rezepte', value: allRecipes.length },
      { label: 'Glossar-Begriffe', value: allGlossars.length },
      { label: 'Diplom-Lektionen', value: allDiplomLektions.length },
      { label: 'Grilltechniken', value: allMethodes.length },
      { label: 'Cuts', value: allCuts.length },
    ],
    latest,
  };
}
