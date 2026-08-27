import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Sparkles, Flower2, UtensilsCrossed, Wine, Heart } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import { getApprovedDrafts } from '@/lib/content-feed';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Grillstil — Grillen und Genuss für Frauen',
  description:
    'Grillen ist kein Männerthema. Grillstil verbindet Feuer und Eleganz: kuratierte Rezepte, schön gedeckte Tische und entspannter Genuss — stilvoll.',
  alternates: { canonical: 'https://steakakademie.de/grillstil' },
  openGraph: {
    title: 'Grillstil — Grillen und Genuss für Frauen',
    description:
      'Feuer trifft Eleganz: Rezepte, schöner Tisch, Dekoration und Genuss — stilvoll kuratiert.',
    url: 'https://steakakademie.de/grillstil',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@steakakademie' },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Startseite', item: 'https://steakakademie.de' },
    { '@type': 'ListItem', position: 2, name: 'Grillstil', item: 'https://steakakademie.de/grillstil' },
  ],
};

/* Feminine Akzentfarben — Rosé/Blush, harmonisch zum Gold der Marke */
const ROSE = '#C77D7D';
const ROSE_SOFT = '#E3B7B0';
const CREAM = '#F7EFE6';

interface Tile {
  icon: typeof Sparkles;
  kicker: string;
  title: string;
  text: string;
  href?: string;
}

const PILLARS: Tile[] = [
  {
    icon: UtensilsCrossed,
    kicker: 'Am Feuer',
    title: 'Grillen & Rezepte',
    text:
      'Vom zarten Lachs auf der Zedernholzplanke bis zum gegrillten Pfirsich mit Burrata — Rezepte, die Aroma und Leichtigkeit verbinden. Präzise erklärt, entspannt nachzukochen.',
    href: '/rezepte',
  },
  {
    icon: Flower2,
    kicker: 'Atmosphäre',
    title: 'Tischdekoration',
    text:
      'Eukalyptus, warme Kerzen, Leinen in gedeckten Tönen. Wie aus einer Grillrunde im Garten ein stimmungsvoller Abend wird — mit wenigen, klug gewählten Details.',
  },
  {
    icon: Sparkles,
    kicker: 'Stil',
    title: 'Der schön gedeckte Tisch',
    text:
      'Geschirr, Gläser, Servietten, Lichtführung: die Kunst, einen Tisch zu inszenieren, der Gäste empfängt, bevor das erste Wort fällt. Vom Casual-Brunch bis zum Sommerdinner.',
  },
  {
    icon: Wine,
    kicker: 'Genuss',
    title: 'Lifestyle & Pairing',
    text:
      'Welcher Wein zum gegrillten Gemüse, welcher Aperitif zum lauen Abend. Genuss als Haltung — unaufgeregt, selbstbewusst, mit Sinn für das Schöne.',
    href: '/rezepte/wine-spirits',
  },
];

interface RecipeTeaser {
  title: string;
  meta: string;
  text: string;
}

const RECIPES: RecipeTeaser[] = [
  {
    title: 'Gegrillter Pfirsich mit Burrata & Basilikum',
    meta: 'Vorspeise · 15 Min',
    text: 'Warme Süße trifft cremige Frische — ein Sommerklassiker, der elegant aussieht und mühelos gelingt.',
  },
  {
    title: 'Zitronen-Lachs auf der Zedernholzplanke',
    meta: 'Hauptgang · 30 Min',
    text: 'Rauchig, zart, aromatisch. Die Planke schützt den Fisch und gibt ihm eine feine Holznote.',
  },
  {
    title: 'Gegrillte Feigen mit Honig & Ziegenkäse',
    meta: 'Dessert · 12 Min',
    text: 'Karamellisierte Feigen, ein Hauch Thymian, flüssiger Honig — der süße Abschluss vom Grill.',
  },
];

const TABLE_IDEAS: { label: string; note: string }[] = [
  { label: 'Naturleinen & Eukalyptus', note: 'Gedeckte Erdtöne, ein Hauch Grün — zeitlos und warm.' },
  { label: 'Kerzenlicht in Etagen', note: 'Verschiedene Höhen schaffen Tiefe und Geborgenheit.' },
  { label: 'Geschirr in Creme & Terrakotta', note: 'Ton-in-Ton zum Sommerabend, nichts schreit, alles harmoniert.' },
  { label: 'Frische Kräuter als Deko', note: 'Rosmarin & Thymian am Gedeck — schön und essbar zugleich.' },
];

export default async function GrillstilPage() {
  const feed = await getApprovedDrafts('/grillstil', 6);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Header />

      <main>
        {/* ── HERO — feminin, hell, elegant ──────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(160deg, ${CREAM} 0%, #F2E2DC 55%, #EAD3CC 100%)`,
          }}
        >
          {/* dezente Blütenkontur */}
          <div
            aria-hidden
            className="absolute -right-16 -top-10 select-none pointer-events-none"
            style={{ opacity: 0.12 }}
          >
            <Flower2 size={260} style={{ color: ROSE }} strokeWidth={0.8} />
          </div>
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
            <span
              className="inline-flex items-center gap-2 text-xs font-sans font-bold tracking-[0.25em] uppercase mb-5"
              style={{ color: ROSE }}
            >
              <Heart size={13} fill={ROSE} /> Grillstil
            </span>
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] mb-6 max-w-3xl"
              style={{ color: '#5A3340' }}
            >
              Feuer trifft Eleganz.
            </h1>
            <p className="font-body text-lg sm:text-xl leading-relaxed max-w-2xl" style={{ color: '#7A5560' }}>
              Grillen ist kein Männerthema. Hier verbinden sich gute Technik und schöne Momente:
              kuratierte Rezepte, stimmungsvoll gedeckte Tische und entspannter Genuss — stilvoll,
              selbstbewusst und mit Sinn für Atmosphäre.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#rezepte"
                className="inline-flex items-center gap-2 font-sans font-bold text-sm tracking-wide px-6 py-3 transition-all duration-200"
                style={{ background: ROSE, color: '#fff', borderRadius: '2px' }}
              >
                Rezepte entdecken <ChevronRight size={15} />
              </a>
              <a
                href="#tisch"
                className="inline-flex items-center gap-2 font-sans font-bold text-sm tracking-wide px-6 py-3 transition-all duration-200"
                style={{ border: `1.5px solid ${ROSE}`, color: '#5A3340', borderRadius: '2px' }}
              >
                Schöner Tisch
              </a>
            </div>
          </div>
        </section>

        {/* ── INTRO-STATEMENT ────────────────────────────────────────── */}
        <section className="py-14" style={{ background: '#1E1410' }}>
          <div className="max-w-content mx-auto px-4 sm:px-6 text-center">
            <p
              className="font-serif text-2xl sm:text-3xl italic font-bold leading-[1.4]"
              style={{ color: ROSE_SOFT }}
            >
              „Der Grill gehört allen, die Genuss lieben.
              <br className="hidden sm:block" /> Es geht nicht ums Beweisen — es geht ums Erleben.&ldquo;
            </p>
          </div>
        </section>

        {/* ── VIER SÄULEN ────────────────────────────────────────────── */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {PILLARS.map(({ icon: Icon, kicker, title, text, href }) => {
              const inner = (
                <div
                  className="h-full p-8 transition-all duration-200 group"
                  style={{ background: CREAM, borderRadius: '4px', border: '1px solid #E6D2CB' }}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center mb-5"
                    style={{ background: '#F2E2DC', borderRadius: '50%' }}
                  >
                    <Icon size={22} style={{ color: ROSE }} />
                  </div>
                  <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase" style={{ color: ROSE }}>
                    {kicker}
                  </span>
                  <h2 className="font-serif text-2xl font-bold mt-1 mb-3" style={{ color: '#5A3340' }}>
                    {title}
                  </h2>
                  <p className="font-body leading-relaxed" style={{ color: '#7A5560' }}>
                    {text}
                  </p>
                  {href && (
                    <span className="inline-flex items-center gap-1 mt-4 text-sm font-sans font-bold" style={{ color: ROSE }}>
                      Mehr <ChevronRight size={14} />
                    </span>
                  )}
                </div>
              );
              return href ? (
                <Link key={title} href={href} className="block h-full">{inner}</Link>
              ) : (
                <div key={title} className="h-full">{inner}</div>
              );
            })}
          </div>
        </section>

        {/* ── REZEPTE ────────────────────────────────────────────────── */}
        <section id="rezepte" className="py-16" style={{ background: `linear-gradient(180deg, #F7EFE6 0%, #F2E2DC 100%)` }}>
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-sans font-bold tracking-[0.25em] uppercase" style={{ color: ROSE }}>
                Vom Grill
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2" style={{ color: '#5A3340' }}>
                Rezepte mit Leichtigkeit
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {RECIPES.map((r) => (
                <article
                  key={r.title}
                  className="p-7 transition-all duration-200"
                  style={{ background: '#fff', borderRadius: '4px', border: '1px solid #EAD9D2' }}
                >
                  <span className="text-[11px] font-sans font-bold tracking-wider uppercase" style={{ color: ROSE }}>
                    {r.meta}
                  </span>
                  <h3 className="font-serif text-xl font-bold mt-2 mb-3" style={{ color: '#5A3340' }}>
                    {r.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed" style={{ color: '#7A5560' }}>
                    {r.text}
                  </p>
                </article>
              ))}
            </div>
            <div className="text-center mt-9">
              <Link
                href="/rezepte"
                className="inline-flex items-center gap-2 font-sans font-bold text-sm tracking-wide px-6 py-3"
                style={{ background: ROSE, color: '#fff', borderRadius: '2px' }}
              >
                Alle Rezepte <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── SCHÖNER TISCH ──────────────────────────────────────────── */}
        <section id="tisch" className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
            <div>
              <span className="text-xs font-sans font-bold tracking-[0.25em] uppercase" style={{ color: ROSE }}>
                Atmosphäre
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2 mb-4 text-text-light">
                Der schön gedeckte Tisch
              </h2>
              <p className="font-body text-lg text-text-secondary leading-relaxed mb-6">
                Ein gelungener Grillabend beginnt nicht am Rost, sondern am Tisch. Die richtige
                Lichtführung, harmonische Farben und ein paar natürliche Details verwandeln das
                Essen im Garten in einen Moment, an den man sich erinnert.
              </p>
              <ul className="space-y-3">
                {TABLE_IDEAS.map((t) => (
                  <li key={t.label} className="flex gap-3">
                    <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: ROSE }} />
                    <span>
                      <span className="font-sans font-bold text-text-light">{t.label}</span>
                      <span className="font-body text-text-secondary"> — {t.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="relative min-h-[320px] flex items-center justify-center p-10"
              style={{
                background: `linear-gradient(150deg, ${CREAM} 0%, #EAD3CC 100%)`,
                borderRadius: '4px',
              }}
            >
              <Flower2 size={120} style={{ color: ROSE, opacity: 0.5 }} strokeWidth={0.9} />
              <p
                className="absolute bottom-6 left-0 right-0 text-center font-serif italic text-lg px-6"
                style={{ color: '#7A5560' }}
              >
                „Stil ist, wenn das Schöne selbstverständlich wirkt.&ldquo;
              </p>
            </div>
          </div>
        </section>

        {/* ── LIVE-FEED — frisch aus der Redaktion (Queen of Fire) ───── */}
        {feed.length > 0 && (
          <section className="py-16" style={{ background: `linear-gradient(180deg, #F2E2DC 0%, ${CREAM} 100%)` }}>
            <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <span className="text-xs font-sans font-bold tracking-[0.25em] uppercase" style={{ color: ROSE }}>
                  Frisch kuratiert
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2" style={{ color: '#5A3340' }}>
                  Neu im Grillstil-Magazin
                </h2>
                <p className="text-xs font-sans mt-3" style={{ color: '#8A6A72' }}>
                  Hinweis: Diese Beiträge werden KI-gestützt erstellt und redaktionell vor Veröffentlichung geprüft.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {feed.map((a) => (
                  <article
                    key={a.id}
                    className="h-full flex flex-col p-7 transition-all duration-200"
                    style={{ background: '#fff', borderRadius: '4px', border: '1px solid #EAD9D2' }}
                  >
                    <time className="text-[11px] font-sans font-bold tracking-wider uppercase" style={{ color: ROSE }} dateTime={a.isoDate}>
                      {a.date}
                    </time>
                    <h3 className="font-serif text-xl font-bold mt-2 mb-3 leading-snug" style={{ color: '#5A3340' }}>
                      {a.title}
                    </h3>
                    <p className="font-body text-sm leading-relaxed flex-1" style={{ color: '#7A5560' }}>
                      {a.summary}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA / Community ────────────────────────────────────────── */}
        <section className="py-14" style={{ background: '#17100B', borderTop: `2px solid ${ROSE}` }}>
          <div className="max-w-content mx-auto px-4 sm:px-6 text-center">
            <Sparkles size={22} className="mx-auto mb-4" style={{ color: ROSE_SOFT }} />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-light mb-3">
              Werde Teil der Grillstil-Community
            </h2>
            <NewsletterSignup
              source="grillstil"
              accentColor={ROSE}
              accentTextColor="#fff"
              eyebrow="Grillstil · Community"
              headline="Neue Rezepte, Tisch- und Deko-Ideen."
              subline="Entspannte Inspiration rund ums Grillen — zweimal im Monat, ohne Spam."
              cta="Anmelden"
              className="max-w-md mx-auto text-left"
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
