import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Clock, Flame, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { allRecipes } from 'contentlayer/generated';
import { breadcrumbSchema } from '@/lib/schema';
import RecipeSubmitModal from '@/components/recipe/RecipeSubmitModal';

export const metadata: Metadata = {
  title: 'BBQ-Rezepte — Geprüfte Rezepte vom Grill',
  description:
    'Präzise BBQ-Rezepte mit interaktivem Portionsrechner und Schritt-für-Schritt Koch-Coach. Sous-Vide, Reverse Sear, Low & Slow — jedes Rezept mehrfach getestet.',
  alternates: { canonical: 'https://steakakademie.de/rezepte' },
  openGraph: {
    title: 'BBQ-Rezepte | Steakakademie',
    description: 'Geprüfte Grill-Rezepte mit interaktivem Koch-Coach und automatischer Portionsskalierung.',
    url: 'https://steakakademie.de/rezepte',
    type: 'website',
  },
};

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  const h = parseInt(m[1] || '0'), min = parseInt(m[2] || '0');
  if (h && min) return `${h} Std. ${min} Min.`;
  if (h) return `${h} Std.`;
  return `${min} Min.`;
}

const DIFFICULTY_STYLE: Record<string, string> = {
  Einfach:        'text-emerald-400',
  Mittel:         'text-brand-gold',
  Fortgeschritten:'text-brand-fire',
  Profi:          'text-red-400',
};

export default function RezepteIndexPage() {
  const recipes = allRecipes.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const breadcrumbSch = breadcrumbSchema([{ name: 'Rezepte', url: '/rezepte' }]);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BBQ-Rezepte der Steakakademie',
    itemListElement: recipes.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://steakakademie.de${r.url}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSch) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <Header />

      <main>
        {/* Hero */}
        <section className="border-b border-border-subtle">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-14">
            <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted mb-8" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <span className="text-text-secondary">Rezepte</span>
            </nav>

            <span className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire block mb-3">
              Steakakademie · Rezepte
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-text-light leading-tight mb-4">
              Geprüfte Rezepte<br className="hidden sm:block" /> vom Grill
            </h1>
            <p className="font-body text-lg text-text-secondary leading-relaxed max-w-2xl">
              Kein Rezept ohne Feldtest — jede Angabe basiert auf mehrfach reproduzierten Versuchen.
              Mit interaktivem Portionsrechner und Schritt-für-Schritt Koch-Coach direkt am Grill.
            </p>
            <Link
              href="/menue"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-sans font-bold tracking-widest uppercase text-brand-gold hover:text-brand-fire transition-colors"
            >
              Menü-Planer: Ganzes Grill-Menü mit Einkaufsliste zusammenstellen <ChevronRight size={14} />
            </Link>
          </div>
        </section>

        {/* Community-Band — Austausch + eigenes Rezept einreichen */}
        <section className="border-b border-border-subtle bg-surface-dark">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-3">
                  <Users size={12} /> Aus der Community
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-light mb-2">
                  Rezepte von Mitgliedern — KI-geprüft, freigegeben
                </h2>
                <p className="font-body text-text-light/60 leading-relaxed max-w-xl mb-4">
                  Echte Kreationen zum Nachgrillen, eingereicht von der Akademie-Community.
                  Jede Einreichung wird von einer KI auf Sicherheit und Qualität geprüft —
                  gute Rezepte gehen sofort live.
                </p>
                <Link
                  href="/rezepte/community"
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-bold tracking-widest uppercase text-brand-gold hover:text-brand-fire transition-colors"
                >
                  Alle Community-Rezepte <ChevronRight size={14} />
                </Link>
              </div>
              <RecipeSubmitModal />
            </div>
          </div>
        </section>

        {/* Recipe grid */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {recipes.length === 0 ? (
            <p className="font-body text-text-muted text-center py-20">
              Die ersten Rezepte werden gerade finalisiert.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Link
                  key={recipe.slug}
                  href={recipe.url}
                  className="group bg-surface-card border border-border-subtle hover:border-brand-gold/40 transition-all duration-200 flex flex-col overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-surface-base">
                    <Image
                      src={recipe.image}
                      alt={recipe.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Difficulty badge */}
                    <span className={`absolute top-3 right-3 text-[10px] font-sans font-bold tracking-[0.12em] uppercase px-2 py-1 bg-surface-dark/90 backdrop-blur-sm border border-border-subtle ${DIFFICULTY_STYLE[recipe.difficulty] ?? 'text-brand-gold'}`}>
                      {recipe.difficulty}
                    </span>
                  </div>

                  {/* Gold top accent */}
                  <div className="border-t-2 border-brand-gold" />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-[10px] font-sans text-text-muted mb-3">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {parseDuration(recipe.totalTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={10} />
                        {recipe.servings} Portionen
                      </span>
                      {recipe.calories && (
                        <span className="flex items-center gap-1">
                          <Flame size={10} className="text-brand-fire" />
                          {recipe.calories} kcal
                        </span>
                      )}
                    </div>

                    {/* Category */}
                    <span className="text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-brand-fire mb-1 block">
                      {recipe.meatType} · {recipe.cookingMethod}
                    </span>

                    {/* Title */}
                    <h2 className="font-serif text-xl font-bold text-text-primary mb-2 leading-snug group-hover:text-brand-gold transition-colors">
                      {recipe.title}
                    </h2>

                    {/* Description */}
                    <p className="font-body text-sm text-text-secondary leading-relaxed flex-1 mb-4 line-clamp-3">
                      {recipe.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-1 text-xs font-sans font-bold tracking-[0.12em] uppercase text-brand-gold group-hover:text-brand-fire transition-colors mt-auto">
                      Zum Rezept
                      <ChevronRight size={13} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* E-E-A-T note */}
        <section className="border-t border-border-subtle">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
            <p className="font-body text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
              Alle Rezepte der Steakakademie werden vor Veröffentlichung mehrfach am Grill getestet und auf Reproduzierbarkeit geprüft.
              Affiliate-Links sind klar gekennzeichnet —{' '}
              <Link href="/affiliate-disclosure" className="text-brand-gold hover:text-brand-fire transition-colors underline underline-offset-2">
                Offenlegung
              </Link>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
