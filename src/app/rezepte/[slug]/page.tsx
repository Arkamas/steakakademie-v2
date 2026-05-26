import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Clock, Flame, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { allRecipes } from 'contentlayer/generated';
import { breadcrumbSchema } from '@/lib/schema';

const KATEGORIEN: Record<string, {
  label: string; subtitle: string; description: string;
  heroImage: string; heroAlt: string;
}> = {
  fleisch: {
    label:       'Fleisch-Rezepte',
    subtitle:    'Master-Cuts',
    description: 'Präzise Rezepte für Premium-Cuts — Ribeye, Brisket, Tomahawk und mehr. Jedes Rezept mehrfach am Grill getestet, mit exakten Gramm- und Temperaturangaben.',
    heroImage:   '/images/articles/ribeye-premium-cut.webp',
    heroAlt:     'Premium Ribeye-Cut auf Holzbrett',
  },
  beilagen: {
    label:       'Beilagen & Salate',
    subtitle:    'Das BBQ-Büfett',
    description: 'Das Büfett macht das Grillen vollständig. Von der knusprigen Grillkartoffel bis zum rauchigen Coleslaw — Beilagen, die eigenständig brillieren.',
    heroImage:   '/images/Beilagen_zu_Steak_1800x1000_6c5b974a-f29a-492b-95fb-424e0c4624d3.webp',
    heroAlt:     'BBQ-Beilagen und Salate auf dem Grilltisch',
  },
  'saucen-rubs': {
    label:       'Saucen, Rubs & Injektionen',
    subtitle:    'Die geheimen Waffen',
    description: 'Kansas City BBQ Sauce, Texas Dry Rub, Buttermilch-Injektionen — die Elemente, die ein gutes Gericht zur Legende machen. Laborprotokolle statt Schätzwerte.',
    heroImage:   '/images/articles/brisket-texas-smoked.webp',
    heroAlt:     'Texas Brisket mit Rub-Kruste frisch vom Smoker',
  },
  desserts: {
    label:       'Fire-Desserts',
    subtitle:    'Das süße Finale',
    description: 'Vom karamellisierten Pfirsich bis zur Flammen-Ananas — Desserts, die das offene Feuer als Instrument nutzen und die Glut bis zur letzten Kohle ausreizen.',
    heroImage:   '/images/tomahawk-hero.png',
    heroAlt:     'Offenes Feuer am Grill — Glut für Fire-Desserts',
  },
  'wine-spirits': {
    label:       'Wine & Spirits',
    subtitle:    'Das perfekte Pairing',
    description: 'Bordeaux zum Brisket, Single Malt zum Ribeye, Mezcal zum Asado — präzise Pairing-Protokolle, die erklären warum manche Kombinationen auf molekularer Ebene funktionieren.',
    heroImage:   '/images/articles/dry-aged-beef-reifeschrank.webp',
    heroAlt:     'Dry-Aged Beef im Reifeschrank — Komplexität die nach dem richtigen Glas verlangt',
  },
};

const DIFFICULTY_STYLE: Record<string, string> = {
  Einfach:        'text-emerald-400',
  Mittel:         'text-brand-gold',
  Fortgeschritten:'text-brand-fire',
  Profi:          'text-red-400',
};

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  const h = parseInt(m[1] || '0'), min = parseInt(m[2] || '0');
  if (h && min) return `${h} Std. ${min} Min.`;
  if (h) return `${h} Std.`;
  return `${min} Min.`;
}

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return Object.keys(KATEGORIEN).map((k) => ({ slug: k }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const kat = KATEGORIEN[params.slug];
  if (!kat) return {};
  return {
    title: `${kat.label} — BBQ-Rezepte | Steakakademie`,
    description: kat.description,
    alternates: { canonical: `https://steakakademie.de/rezepte/${params.slug}` },
    openGraph: {
      title: `${kat.label} | Steakakademie`,
      description: kat.description,
      url: `https://steakakademie.de/rezepte/${params.slug}`,
      type: 'website',
      images: [
        {
          url: `https://steakakademie.de${kat.heroImage}`,
          width: 1200,
          height: 630,
          alt: kat.heroAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${kat.label} | Steakakademie`,
      description: kat.description,
      images: [`https://steakakademie.de${kat.heroImage}`],
    },
  };
}

export default function RezeptKategoriePage({ params }: Props) {
  const kat = KATEGORIEN[params.slug];
  if (!kat) notFound();

  const recipes = allRecipes
    .filter((r) => r.kategorie === params.slug)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const breadcrumbSch = breadcrumbSchema([
    { name: 'Rezepte', url: '/rezepte' },
    { name: kat.label, url: `/rezepte/${params.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSch) }} />
      <Header />

      <main>
        {/* Hero */}
        <section className="border-b border-border-subtle">
          {/* Hero-Bild */}
          <div className="relative w-full aspect-[3/1] overflow-hidden bg-surface-dark">
            <Image
              src={kat.heroImage}
              alt={kat.heroAlt}
              fill
              sizes="100vw"
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,10,6,0.25) 0%, rgba(13,10,6,0.65) 100%)' }} />
          </div>

          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-14">
            <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted mb-8" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <Link href="/rezepte" className="hover:text-brand-gold transition-colors">Rezepte</Link>
              <ChevronRight size={12} />
              <span className="text-text-secondary">{kat.label}</span>
            </nav>

            <span className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire block mb-3">
              {kat.subtitle}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-text-light leading-tight mb-4">
              {kat.label}
            </h1>
            <p className="font-body text-lg text-text-secondary leading-relaxed max-w-2xl">
              {kat.description}
            </p>
          </div>
        </section>

        {/* Recipe grid */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {recipes.length === 0 ? (
            <div className="text-center py-24 border border-border-subtle">
              <p className="font-serif text-2xl text-text-light mb-3">
                Rezepte in Arbeit
              </p>
              <p className="font-body text-sm text-text-muted max-w-md mx-auto">
                Diese Kategorie wird gerade mit Feldtest-Protokollen gefüllt. Alle Rezepte werden vor Veröffentlichung mehrfach getestet.
              </p>
              <Link
                href="/rezepte"
                className="inline-flex items-center gap-1 mt-6 text-xs font-sans font-bold tracking-[0.12em] uppercase text-brand-gold hover:text-brand-fire transition-colors"
              >
                Alle Rezepte ansehen <ChevronRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Link
                  key={recipe.slug}
                  href={recipe.url}
                  className="group bg-surface-card border border-border-subtle hover:border-brand-gold/40 transition-all duration-200 flex flex-col overflow-hidden"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-surface-base">
                    <Image
                      src={recipe.image}
                      alt={recipe.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className={`absolute top-3 right-3 text-[10px] font-sans font-bold tracking-[0.12em] uppercase px-2 py-1 bg-surface-dark/90 backdrop-blur-sm border border-border-subtle ${DIFFICULTY_STYLE[recipe.difficulty] ?? 'text-brand-gold'}`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                  <div className="border-t-2 border-brand-gold" />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-[10px] font-sans text-text-muted mb-3">
                      <span className="flex items-center gap-1"><Clock size={10} />{parseDuration(recipe.totalTime)}</span>
                      <span className="flex items-center gap-1"><Users size={10} />{recipe.servings} Portionen</span>
                      {recipe.calories && (
                        <span className="flex items-center gap-1"><Flame size={10} className="text-brand-fire" />{recipe.calories} kcal</span>
                      )}
                    </div>
                    <span className="text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-brand-fire mb-1 block">
                      {recipe.meatType} · {recipe.cookingMethod}
                    </span>
                    <h2 className="font-serif text-xl font-bold text-text-primary mb-2 leading-snug group-hover:text-brand-gold transition-colors">
                      {recipe.title}
                    </h2>
                    <p className="font-body text-sm text-text-secondary leading-relaxed flex-1 mb-4 line-clamp-3">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-sans font-bold tracking-[0.12em] uppercase text-brand-gold group-hover:text-brand-fire transition-colors mt-auto">
                      Zum Rezept <ChevronRight size={13} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
