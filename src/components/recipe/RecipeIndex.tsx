/**
 * RecipeIndex — vollständiges Linkverzeichnis aller Rezepte.
 *
 * Warum es das gibt: Der RecipeExplorer ist eine Client-Komponente und rendert
 * immer nur die aktuelle Seite (12 Karten). Die übrigen Rezept-Links entstehen
 * erst beim Blättern im Browser. Ein Crawler — und `scripts/check-links.mjs` —
 * sieht davon nichts: nach dem Texas-Monthly-Umbau am 17.08.2026 galten dadurch
 * 94 Rezept-Detailseiten als nicht verlinkt.
 *
 * Diese Komponente läuft auf dem Server und gibt jedes Rezept als echtes <a>
 * ins HTML. Damit ist die Sammlung wieder vollständig erreichbar, ohne 113
 * Karten samt Bildern auszuliefern.
 *
 * Bewusst eine Server-Komponente mit eigenem Contentlayer-Zugriff statt einer
 * Props-Durchreichung: Die Liste soll nicht davon abhängen, was der Explorer
 * gerade anzeigt.
 */

import Link from 'next/link';
import { allRecipes } from 'contentlayer/generated';

/** Spiegelt KATEGORIE_TABS in RecipeExplorer.tsx — dort als Navigation, hier als Überschrift. */
const KATEGORIE_LABEL: Record<string, string> = {
  'fleisch':       'Fleisch',
  'fisch':         'Fisch & Meer',
  'beilagen':      'Beilagen',
  'saucen-rubs':   'Saucen & Rubs',
  'desserts':      'Desserts',
  'wine-spirits':  'Wine & Spirits',
};

interface Props {
  /** Auf einer Kategorieseite: nur diese Kategorie auflisten. */
  kategorie?: string;
}

export default function RecipeIndex({ kategorie }: Props) {
  const recipes = allRecipes
    .filter((r) => !kategorie || r.kategorie === kategorie)
    .sort((a, b) => a.title.localeCompare(b.title, 'de'));

  if (recipes.length === 0) return null;

  // Auf /rezepte nach Kategorie gruppieren, auf einer Kategorieseite eine Liste.
  const gruppen = kategorie
    ? [{ slug: kategorie, label: KATEGORIE_LABEL[kategorie] ?? 'Rezepte', items: recipes }]
    : Object.keys(KATEGORIE_LABEL)
        .map((slug) => ({
          slug,
          label: KATEGORIE_LABEL[slug],
          items: recipes.filter((r) => r.kategorie === slug),
        }))
        .filter((g) => g.items.length > 0);

  return (
    <section className="border-t border-border-subtle">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-serif text-2xl font-bold text-text-light mb-2">
          {kategorie && KATEGORIE_LABEL[kategorie]
            ? `Alle ${KATEGORIE_LABEL[kategorie]}-Rezepte im Überblick`
            : 'Alle Rezepte im Überblick'}
        </h2>
        <p className="font-body text-sm text-text-muted mb-8 max-w-2xl">
          Das vollständige Verzeichnis — {recipes.length} Rezepte, ohne Filter und ohne Blättern.
        </p>

        {gruppen.map((g) => (
          <div key={g.slug} className="mb-9 last:mb-0">
            {!kategorie && (
              <h3 className="font-sans text-[11px] font-bold tracking-[0.16em] uppercase text-brand-fire mb-3">
                <Link href={`/rezepte/${g.slug}`} className="hover:text-brand-gold transition-colors">
                  {g.label}
                </Link>
              </h3>
            )}
            <ul className="columns-1 sm:columns-2 lg:columns-3 gap-x-8">
              {g.items.map((r) => (
                <li key={r.url} className="break-inside-avoid mb-1.5">
                  <Link
                    href={r.url}
                    className="font-body text-sm text-text-secondary hover:text-brand-gold transition-colors underline-offset-2 hover:underline"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
