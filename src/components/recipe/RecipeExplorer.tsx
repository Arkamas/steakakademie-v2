'use client';

/**
 * RecipeExplorer — Rezept-Übersicht nach Texas-Monthly-Muster.
 *
 * Aufbau (Referenz: texasmonthly.com/recipes):
 *  1. Horizontale Kategorie-Leiste (echte Links auf /rezepte/[kategorie] → SEO)
 *  2. Zweite, kleinere Länder-Reihe (Client-Filter über das Frontmatter-Feld `land`)
 *  3. Suchfeld
 *  4. 3-Spalten-Grid im hellen Editorial-Look (keine Karten-Boxen, wie TM)
 *  5. Newsletter-Lead-Magnet MITTEN im Feed (nach 6 Karten, Seite 1)
 *  6. Nummerierte Pagination
 *
 * Läuft auf hellem Pergament-Grund (.reading-light) — alle Farben hier sind
 * bewusst als Hex gesetzt und auf AA-Kontrast gegen #DCC59C/#D1B785 geprüft.
 */

import { Fragment, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Clock, Flame, Search, Users, X } from 'lucide-react';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

// ── Daten-Shape (vom Server vorbereitet, bewusst schlank) ───────────────────

export interface RecipeCardData {
  slug: string;
  url: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  difficulty: string;
  /** bereits formatiert, z. B. "2 Std. 30 Min." */
  totalTime: string;
  servings: number;
  calories?: number;
  kategorie: string;
  meatType: string;
  cookingMethod: string;
  land?: string;
}

interface Props {
  recipes: RecipeCardData[];
  /** aktiver Kategorie-Slug (auf /rezepte/[slug]); undefined = "Alle Rezepte" */
  activeKategorie?: string;
  /** Kategorie-Leiste ausblenden (z. B. Community-Seite) */
  hideKategorieRow?: boolean;
}

// ── Kategorie-Leiste (Navigation, wie das TM-Menü) ──────────────────────────

const KATEGORIE_TABS: { slug: string | null; label: string }[] = [
  { slug: null,           label: 'Alle Rezepte' },
  { slug: 'fleisch',      label: 'Fleisch' },
  { slug: 'fisch',        label: 'Fisch & Meer' },
  { slug: 'beilagen',     label: 'Beilagen' },
  { slug: 'saucen-rubs',  label: 'Saucen & Rubs' },
  { slug: 'desserts',     label: 'Desserts' },
  { slug: 'wine-spirits', label: 'Wine & Spirits' },
];

const PAGE_SIZE = 12;

/** "USA · Texas" → "USA" — Primärland fürs Filter-Pill. */
function primaryLand(land?: string): string | null {
  if (!land) return null;
  return land.split('·')[0].trim() || null;
}

// Schwierigkeit auf dunklem Foto-Chip (unverändert zur Marken-DNA)
const DIFFICULTY_STYLE: Record<string, string> = {
  Einfach:         'text-emerald-400',
  Mittel:          'text-brand-gold',
  Fortgeschritten: 'text-brand-fire',
  Profi:           'text-red-400',
};

// ── Farb-Töne der hellen Zone ───────────────────────────────────────────────
const INK      = '#241A12'; // Titel
const RUST     = '#9C3A0E'; // Kicker/Akzent (TM-Rot, markenwarm)
const BODY     = '#4A3C2E'; // Fließtext
const MUTED    = '#5A4936'; // Meta
const LINE     = '#C3AB80'; // Linien/Borders

export default function RecipeExplorer({ recipes, activeKategorie, hideKategorieRow }: Props) {
  const [land, setLand] = useState<string>('alle');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);
  const landRowRef = useRef<HTMLDivElement>(null);

  // Länder mit Häufigkeit, absteigend — nur zeigen, wenn es mind. 2 gibt.
  const laender = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of recipes) {
      const p = primaryLand(r.land);
      if (p) counts.set(p, (counts.get(p) ?? 0) + 1);
    }
    // Array.from statt Spread: das tsconfig-Target liegt unter ES2015, dort laesst
    // sich ein Map-Iterator nicht spreaden (TS2802).
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [recipes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      if (land !== 'alle' && primaryLand(r.land) !== land) return false;
      if (q) {
        const hay = `${r.title} ${r.description} ${r.meatType} ${r.cookingMethod} ${r.land ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [recipes, land, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetPage() { setPage(1); }

  function goToPage(p: number) {
    setPage(p);
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function scrollLandRow(dir: -1 | 1) {
    landRowRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' });
  }

  // Newsletter nach der 6. Karte — nur Seite 1 und nur wenn genug Inhalt da ist.
  const newsletterAfter = safePage === 1 && visible.length > 6 ? 6 : -1;

  return (
    <div>
      {/* ══ FILTER-LEISTE (Texas-Monthly-Muster) ══════════════════════════ */}
      <div className="border-b" style={{ borderColor: LINE }}>
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-5">

          {/* Reihe 1 — Kategorien als echte Links */}
          {!hideKategorieRow && (
            <nav aria-label="Rezept-Kategorien" className="flex flex-wrap gap-2 mb-4">
              {KATEGORIE_TABS.map((tab) => {
                const active = (tab.slug ?? undefined) === activeKategorie;
                return (
                  <Link
                    key={tab.label}
                    href={tab.slug ? `/rezepte/${tab.slug}` : '/rezepte'}
                    aria-current={active ? 'page' : undefined}
                    className="font-sans text-[11px] font-bold tracking-[0.14em] uppercase px-4 py-2 border transition-colors"
                    style={active
                      ? { background: INK, color: '#F0E8D8', borderColor: INK }
                      : { color: BODY, borderColor: LINE }}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Reihe 2 — Länder (Client-Filter) mit Scroll-Pfeilen wie bei TM */}
          {laender.length >= 2 && (
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => scrollLandRow(-1)}
                aria-label="Länder nach links scrollen"
                className="hidden sm:flex shrink-0 w-7 h-7 items-center justify-center border transition-colors hover:bg-black/5"
                style={{ borderColor: LINE, color: MUTED }}
              >
                <ChevronLeft size={14} />
              </button>

              <div
                ref={landRowRef}
                className="flex gap-2 overflow-x-auto scrollbar-none flex-1"
                style={{ scrollbarWidth: 'none' }}
              >
                <button
                  type="button"
                  onClick={() => { setLand('alle'); resetPage(); }}
                  className="shrink-0 font-sans text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 border transition-colors"
                  style={land === 'alle'
                    ? { background: RUST, color: '#F7EEDD', borderColor: RUST }
                    : { color: MUTED, borderColor: LINE }}
                >
                  Alle Länder
                </button>
                {laender.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => { setLand(l); resetPage(); }}
                    className="shrink-0 font-sans text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 border transition-colors"
                    style={land === l
                      ? { background: RUST, color: '#F7EEDD', borderColor: RUST }
                      : { color: MUTED, borderColor: LINE }}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollLandRow(1)}
                aria-label="Länder nach rechts scrollen"
                className="hidden sm:flex shrink-0 w-7 h-7 items-center justify-center border transition-colors hover:bg-black/5"
                style={{ borderColor: LINE, color: MUTED }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Reihe 3 — Suche */}
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); resetPage(); }}
              placeholder="Rezept, Cut oder Methode suchen …"
              aria-label="Rezepte durchsuchen"
              className="w-full font-body text-sm pl-9 pr-9 py-2.5 border bg-transparent focus:outline-none transition-colors"
              style={{ borderColor: LINE, color: INK }}
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); resetPage(); }}
                aria-label="Suche zurücksetzen"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                style={{ color: MUTED }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Ergebnis-Zeile */}
          <p className="font-sans text-xs mt-3" style={{ color: MUTED }} aria-live="polite">
            {filtered.length === recipes.length
              ? `${recipes.length} geprüfte Rezepte`
              : `${filtered.length} von ${recipes.length} Rezepten`}
            {land !== 'alle' && ` · ${land}`}
          </p>
        </div>
      </div>

      {/* ══ GRID ══════════════════════════════════════════════════════════ */}
      <div ref={gridTopRef} className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
        {visible.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-2xl mb-2" style={{ color: INK }}>Kein Treffer.</p>
            <p className="font-body text-sm mb-6" style={{ color: BODY }}>
              Kombination aus Land und Suchbegriff liefert nichts — Filter lockern?
            </p>
            <button
              type="button"
              onClick={() => { setLand('alle'); setQuery(''); resetPage(); }}
              className="font-sans text-xs font-bold tracking-[0.12em] uppercase px-5 py-2.5 border transition-colors"
              style={{ borderColor: RUST, color: RUST }}
            >
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
            {visible.map((recipe, i) => (
              <Fragment key={recipe.slug}>
                <article className="group flex flex-col">
                  <Link href={recipe.url} className="flex flex-col">
                    {/* Bild — TM-Look: randlos, dezenter Rahmen */}
                    <div className="relative aspect-[16/10] overflow-hidden mb-4" style={{ background: '#CFB98C' }}>
                      <Image
                        src={recipe.image}
                        alt={recipe.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <span className={`absolute top-3 right-3 text-[10px] font-sans font-bold tracking-[0.12em] uppercase px-2 py-1 bg-surface-dark/90 backdrop-blur-sm ${DIFFICULTY_STYLE[recipe.difficulty] ?? 'text-brand-gold'}`}>
                        {recipe.difficulty}
                      </span>
                    </div>

                    {/* Kicker — Land · Kategorie-Detail (TM: roter Tag) */}
                    <span className="font-sans text-[10px] font-bold tracking-[0.16em] uppercase mb-2" style={{ color: RUST }}>
                      {primaryLand(recipe.land) ?? recipe.meatType} · {recipe.cookingMethod}
                    </span>

                    {/* Titel — große Serif wie TM */}
                    <h2
                      className="font-serif text-[22px] font-bold leading-snug mb-2 transition-colors group-hover:underline underline-offset-4 decoration-2"
                      style={{ color: INK, textDecorationColor: RUST }}
                    >
                      {recipe.title}
                    </h2>

                    {/* Teaser — 1-2 Zeilen, kein Langtext */}
                    <p className="font-body text-[15px] leading-relaxed line-clamp-2 mb-3" style={{ color: BODY }}>
                      {recipe.description}
                    </p>
                  </Link>

                  {/* Meta-Zeile */}
                  <div className="flex items-center gap-4 font-sans text-[11px] mt-auto" style={{ color: MUTED }}>
                    <span className="flex items-center gap-1"><Clock size={11} />{recipe.totalTime}</span>
                    <span className="flex items-center gap-1"><Users size={11} />{recipe.servings} Port.</span>
                    {recipe.calories && (
                      <span className="flex items-center gap-1"><Flame size={11} style={{ color: RUST }} />{recipe.calories} kcal</span>
                    )}
                  </div>
                </article>

                {/* Newsletter-Lead-Magnet mitten im Feed (TM-Muster) */}
                {i === newsletterAfter - 1 && (
                  <div className="col-span-full my-2">
                    <NewsletterSignup source="rezepte-feed" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}

        {/* ══ PAGINATION (nummeriert, TM-Muster) ══════════════════════════ */}
        {pageCount > 1 && (
          <nav aria-label="Seiten" className="flex items-center justify-center gap-2 mt-14">
            <button
              type="button"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              aria-label="Vorherige Seite"
              className="w-9 h-9 flex items-center justify-center border transition-colors disabled:opacity-35"
              style={{ borderColor: LINE, color: BODY }}
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => goToPage(p)}
                aria-current={p === safePage ? 'page' : undefined}
                className="w-9 h-9 font-sans text-xs font-bold border transition-colors"
                style={p === safePage
                  ? { background: INK, color: '#F0E8D8', borderColor: INK }
                  : { color: BODY, borderColor: LINE }}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === pageCount}
              aria-label="Nächste Seite"
              className="w-9 h-9 flex items-center justify-center border transition-colors disabled:opacity-35"
              style={{ borderColor: LINE, color: BODY }}
            >
              <ChevronRight size={15} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
