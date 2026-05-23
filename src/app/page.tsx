import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Flame, BookOpen, Thermometer, Award } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ArticleCard from '@/components/article/ArticleCard';
import ProductCard from '@/components/affiliate/ProductCard';
import { getRecommendedProducts } from '@/lib/products';
import type { ArticleMeta } from '@/types';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Steakakademie — Deutschlands BBQ-Wissensplattform',
  description:
    'Die methodisch tiefste BBQ-Wissensplattform auf Deutsch. Cuts, Grilltechniken, Thermometer-Tests und Grillmeister-Diplome für ernsthafte Hobbygriller.',
};

const PLACEHOLDER_ARTICLES: ArticleMeta[] = [
  {
    slug: 'ribeye-guide-der-perfekte-cut',
    url: '/cuts/ribeye',
    title: 'Ribeye: Alles über Deutschlands beliebtesten Premium-Cut',
    excerpt:
      'Vom Longissimus dorsi bis zum Spinalis — wir erklären, was ein Ribeye ausmacht, wie Marmorierung bewertet wird und wie du ihn perfekt auf den Punkt bringst.',
    image: 'https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=800&q=80',
    imageAlt: 'Perfekt gebratenes Ribeye Steak auf einem Holzbrett',
    category: 'Cuts & Fleischkunde',
    categorySlug: 'cuts',
    author: 'Marco, der Pitmaster',
    authorSlug: 'marco',
    formattedDate: '20. Mai 2026',
    readingTime: 12,
    featured: true,
  },
  {
    slug: 'fleischthermometer-test-2026',
    url: '/vergleich/fleischthermometer',
    title: 'Fleischthermometer Test 2026: Wir haben 8 Modelle verglichen',
    excerpt:
      'Mit kalibriertem Referenzgerät bei 5 Temperaturen gemessen. Meater Plus, Thermapen ONE und Inkbird im direkten Vergleich — klare Empfehlung für jeden Bedarf.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    imageAlt: 'Fleischthermometer im Einsatz beim Grillen',
    category: 'Ausrüstung',
    categorySlug: 'ausruestung',
    author: 'Jonas — Der Enthusiast',
    authorSlug: 'jonas',
    formattedDate: '18. Mai 2026',
    readingTime: 15,
    featured: true,
  },
  {
    slug: 'reverse-sear-methode',
    url: '/methoden/reverse-sear',
    title: 'Reverse Sear: Warum diese Methode alles andere schlägt',
    excerpt:
      'Erst niedrig garen, dann kurz scharf anbraten — Reverse Sear erzeugt die perfekte Kruste bei exakter Kerntemperatur. Schritt für Schritt erklärt.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    imageAlt: 'Steak wird mit Reverse Sear Methode gegart',
    category: 'Grilltechniken',
    categorySlug: 'grilltechniken',
    author: 'Marco, der Pitmaster',
    authorSlug: 'marco',
    formattedDate: '15. Mai 2026',
    readingTime: 10,
    featured: false,
  },
  {
    slug: 'brisket-anleitung-komplett',
    url: '/cuts/brisket',
    title: 'Brisket: Die komplette Anleitung für Low & Slow BBQ',
    excerpt:
      'Brisket ist die Königsdisziplin des BBQ. Wir erklären Flat vs. Point, Bark-Aufbau, den Stall und warum Texas-Style kein Zufall ist.',
    image: 'https://images.unsplash.com/photo-1615361200141-f45040f367be?w=800&q=80',
    imageAlt: 'Texas Brisket frisch vom Smoker',
    category: 'Cuts & Fleischkunde',
    categorySlug: 'cuts',
    author: 'Jonas — Der Enthusiast',
    authorSlug: 'jonas',
    formattedDate: '12. Mai 2026',
    readingTime: 18,
    featured: false,
  },
  {
    slug: 'dry-aged-beef-zu-hause',
    url: '/artikel/dry-aged-beef-zu-hause',
    title: 'Dry Aged Beef zu Hause: Was wirklich funktioniert',
    excerpt:
      'Trockengereiftes Fleisch ist kein Mythos — aber es braucht Kontrolle. Wir zeigen, was mit einem Dry-Ager für Zuhause realistisch möglich ist.',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80',
    imageAlt: 'Dry Aged Beef im Reifeschrank',
    category: 'Wissen',
    categorySlug: 'wissen',
    author: 'Elena — Die Stimme',
    authorSlug: 'elena',
    formattedDate: '10. Mai 2026',
    readingTime: 9,
    featured: false,
  },
  {
    slug: 'kerntemperaturen-guide',
    url: '/wissen/kerntemperaturen',
    title: 'Kerntemperaturen: Die vollständige Tabelle für jedes Fleisch',
    excerpt:
      'Von Rare bis Well Done, von Rind bis Geflügel — alle Kerntemperaturen auf einen Blick, mit Erklärung der Prozesse dahinter.',
    image: 'https://images.unsplash.com/photo-1594043555099-aa706e44ad3f?w=800&q=80',
    imageAlt: 'Thermometer misst Kerntemperatur eines Steaks',
    category: 'Wissen',
    categorySlug: 'wissen',
    author: 'Marco, der Pitmaster',
    authorSlug: 'marco',
    formattedDate: '8. Mai 2026',
    readingTime: 7,
    featured: false,
  },
];

const CATEGORY_SECTIONS = [
  { title: 'Grilltechniken',      slug: 'grilltechniken', articles: PLACEHOLDER_ARTICLES.filter((a) => a.categorySlug === 'grilltechniken') },
  { title: 'Cuts & Fleischkunde', slug: 'cuts',           articles: PLACEHOLDER_ARTICLES.filter((a) => a.categorySlug === 'cuts') },
  { title: 'Wissen & Wissenschaft', slug: 'wissen',       articles: PLACEHOLDER_ARTICLES.filter((a) => a.categorySlug === 'wissen') },
];

export default function HomePage() {
  const recommendedProducts = getRecommendedProducts(3);
  const heroArticle    = PLACEHOLDER_ARTICLES[0];
  const sideArticles   = PLACEHOLDER_ARTICLES.slice(1, 4);
  const featureArticle = PLACEHOLDER_ARTICLES[1];
  const latestArticles = PLACEHOLDER_ARTICLES.slice(2);

  return (
    <>
      <Header />

      <main>

        {/* ── HERO — Full-Bleed 70vh ────────────────────────────────────── */}
        <section className="hero-fullbleed" style={{ height: '70vh', minHeight: '520px' }}>
          <Image
            src="/images/hero-ribeye.png"
            alt="Premium Ribeye Steak auf glühenden Holzkohleglut — Steakakademie"
            fill
            priority
            sizes="100vw"
            className="object-cover hero-fullbleed-image"
          />
          <div className="hero-fullbleed-overlay" />
          <div className="hero-fullbleed-content">
            <div className="max-w-editorial mx-auto w-full px-4 sm:px-6 lg:px-8 pb-14 lg:pb-20">
              <Link href={heroArticle.url} className="group block max-w-3xl">
                <span className="category-label mb-4 block">{heroArticle.category}</span>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-text-light leading-[1.08] mb-5 group-hover:text-brand-gold transition-colors duration-300">
                  {heroArticle.title}
                </h1>
                <p className="font-body text-lg text-text-light/65 leading-relaxed mb-7 max-w-2xl">
                  {heroArticle.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-sans text-text-light/45">
                  <span>{heroArticle.author}</span>
                  <span className="text-brand-gold/40">·</span>
                  <span>{heroArticle.readingTime} min Lesezeit</span>
                  <span className="text-brand-gold/40">·</span>
                  <span>{heroArticle.formattedDate}</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── SECONDARY ARTICLES — unter dem Hero ──────────────────────── */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {sideArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} variant="medium" />
            ))}
          </div>
        </section>

        {/* ── MANIFESTO — Dunkle Ember-Karte ──────────────────────────────── */}
        <section className="py-8 sm:py-12">
          <div className="max-w-[820px] mx-auto px-4 sm:px-6">
            <div
              className="px-10 sm:px-16 py-12 sm:py-16 relative"
              style={{
                background: 'radial-gradient(ellipse 110% 140% at 50% 35%, #2D2218 0%, #17100B 100%)',
                borderRadius: '4px',
                border: '1px solid rgba(200,136,42,0.12)',
              }}
            >
              {/* Dekorative Gold-Linien */}
              <div className="flex items-center gap-5 mb-10">
                <div className="h-px flex-1 bg-brand-gold/20" />
                <span className="font-sans text-[10px] tracking-[0.35em] uppercase text-text-muted">Manifest</span>
                <div className="h-px flex-1 bg-brand-gold/20" />
              </div>

              {/* Großes dekoratives Anführungszeichen */}
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute -top-8 -left-4 font-serif select-none pointer-events-none"
                  style={{ fontSize: '8rem', lineHeight: 1, color: 'rgba(200,136,42,0.10)', fontStyle: 'italic' }}
                >
                  &ldquo;
                </span>
                <blockquote className="relative font-serif text-2xl sm:text-3xl lg:text-[2rem] font-bold italic text-text-light leading-[1.4]">
                  Feuer ist Geduld. Rauch ist Zeit.
                  <br />
                  Das perfekte Steak ist keine Technik —
                  <br />
                  es ist ein Standpunkt.
                </blockquote>
              </div>

              {/* Attributierung */}
              <div className="mt-10 flex items-center gap-5">
                <div className="h-px w-16 bg-brand-gold/25" />
                <cite className="font-sans text-xs tracking-[0.22em] uppercase text-text-muted not-italic">
                  Marco, der Pitmaster
                </cite>
              </div>
            </div>
          </div>
        </section>

        {/* ── DIPLOM-TEASER ─────────────────────────────────────────────────── */}
        <section className="relative py-12 my-6 overflow-hidden border-y border-brand-gold/20">
          <div className="absolute inset-0 bg-surface-elevated" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 80% at 25% 50%, rgba(232,80,24,0.07), transparent)' }}
          />
          <div className="relative max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                  <Flame size={16} className="text-brand-gold" />
                  <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-brand-gold">
                    Gamification
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-light mb-3 leading-tight">
                  Zertifizierter Grillmeister werden
                </h2>
                <p className="font-sans text-sm text-text-light/65 max-w-lg leading-relaxed">
                  Von Bronze bis Meister — sammle Wissen, bestehe Quizze, erhalte offizielle Diplome in 5 Stufen.
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {['🥉 Bronze', '🥈 Silber', '🥇 Gold', '💎 Platin', '🔥 Meister'].map((level) => (
                  <div
                    key={level}
                    className="hidden sm:flex flex-col items-center justify-center w-14 h-14 border border-brand-gold/20 hover:border-brand-gold/40 transition-colors text-center"
                    style={{ background: 'rgba(200,136,42,0.08)' }}
                  >
                    <span className="text-lg">{level.split(' ')[0]}</span>
                    <span className="text-[9px] font-sans text-text-light/45 tracking-wide">
                      {level.split(' ')[1]}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/diplome"
                className="shrink-0 btn-gold font-sans text-xs font-bold tracking-[0.14em] uppercase px-7 py-3.5"
              >
                Jetzt starten →
              </Link>
            </div>
          </div>
        </section>

        {/* ── KATEGORIE-SEKTIONEN ─────────────────────────────────────────────── */}
        {CATEGORY_SECTIONS.filter((s) => s.articles.length > 0).map((section) => (
          <section key={section.slug} className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-3">
              <Link href={`/kategorie/${section.slug}`}>
                <h2 className="font-serif text-2xl font-bold text-text-light hover:text-brand-gold transition-colors">
                  {section.title}
                </h2>
              </Link>
              <Link
                href={`/kategorie/${section.slug}`}
                className="flex items-center gap-1 text-xs font-sans font-bold tracking-widest uppercase text-brand-fire hover:text-brand-gold transition-colors"
              >
                Alle <ChevronRight size={14} />
              </Link>
            </div>
            <div className="section-divider" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {section.articles.slice(0, 3).map((article) => (
                <ArticleCard key={article.slug} article={article} variant="medium" />
              ))}
            </div>
          </section>
        ))}

        {/* ── TOP-PRODUKTE — Redaktionelle Weiß-Insel ─────────────────────── */}
        {recommendedProducts.length > 0 && (
          <section className="bg-surface-card py-14 my-4" style={{ borderTop: '1px solid rgba(200,136,42,0.15)', borderBottom: '1px solid rgba(200,136,42,0.15)' }}>
            <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Award size={20} className="text-brand-gold" />
                  <h2 className="font-serif text-2xl font-bold text-text-primary">
                    Unsere Testsieger
                  </h2>
                </div>
                <Link
                  href="/kategorie/ausruestung"
                  className="flex items-center gap-1 text-xs font-sans font-bold tracking-widest uppercase text-brand-fire hover:text-brand-gold transition-colors"
                >
                  Alle Tests <ChevronRight size={14} />
                </Link>
              </div>
              <div className="section-divider" />
              <p className="text-sm font-sans text-text-muted mb-8 -mt-3">
                Selbst getestet, methodisch bewertet. Affiliate-Links gekennzeichnet.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="default" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── NEUESTE ARTIKEL + SIDEBAR ────────────────────────────────────── */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="font-serif text-2xl font-bold text-text-light mb-3">
            Neueste Artikel
          </h2>
          <div className="section-divider" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
            <div>
              {latestArticles.slice(0, 5).map((article) => (
                <ArticleCard key={article.slug} article={article} variant="horizontal" />
              ))}
            </div>

            <aside className="space-y-6">

              {/* Newsletter-Box — redaktionelle Karte */}
              <div className="bg-surface-card border border-border-subtle p-5">
                <div className="border-t-2 border-brand-gold -mt-5 mb-4 pt-4">
                  <h3 className="font-serif text-lg font-bold text-text-primary">
                    BBQ-Insider Newsletter
                  </h3>
                </div>
                <p className="text-sm font-sans text-text-secondary mb-4 leading-relaxed">
                  Neue Tests, Guides und saisonale Tipps — 2× im Monat. Kein Spam.
                </p>
                <form className="space-y-2" action="/api/newsletter" method="POST">
                  <input
                    type="email"
                    name="email"
                    placeholder="deine@email.de"
                    required
                    className="w-full border border-border-subtle px-3 py-2.5 text-sm font-sans text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold transition-colors bg-surface-base"
                  />
                  <button
                    type="submit"
                    className="btn-gold w-full justify-center text-xs font-bold tracking-widest uppercase py-2.5"
                  >
                    Anmelden
                  </button>
                </form>
                <p className="text-[10px] font-sans text-text-muted mt-2 text-center">
                  Jederzeit abmeldbar. Datenschutz beachtet.
                </p>
              </div>

              {/* Beliebte Themen */}
              <div className="bg-surface-card border border-border-subtle p-5">
                <div className="border-t-2 border-brand-gold -mt-5 mb-4 pt-4">
                  <h3 className="font-serif text-lg font-bold text-text-primary">
                    Beliebte Themen
                  </h3>
                </div>
                <ul>
                  {[
                    { label: 'Kerntemperaturen', href: '/wissen/kerntemperaturen', icon: Thermometer },
                    { label: 'Reverse Sear Methode', href: '/methoden/reverse-sear', icon: Flame },
                    { label: 'Ribeye Guide', href: '/cuts/ribeye', icon: BookOpen },
                    { label: 'Thermometer Test', href: '/vergleich/fleischthermometer', icon: Thermometer },
                    { label: 'Brisket komplett', href: '/cuts/brisket', icon: BookOpen },
                  ].map(({ label, href, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="flex items-center justify-between py-3 border-b border-border-subtle text-sm font-sans text-text-secondary hover:text-brand-fire transition-colors group"
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={14} className="text-text-muted group-hover:text-brand-gold transition-colors" />
                          {label}
                        </span>
                        <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-fire" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {recommendedProducts[0] && (
                <ProductCard product={recommendedProducts[0]} variant="sidebar" />
              )}
            </aside>
          </div>
        </section>

        {/* ── TRUST-BAR — Redaktionelle Weiß-Insel ────────────────────────── */}
        <section className="bg-surface-base py-14" style={{ borderTop: '1px solid rgba(200,136,42,0.15)' }}>
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { stat: '200+', label: 'Cuts analysiert' },
                { stat: '8',    label: 'Thermometer selbst getestet' },
                { stat: '100%', label: 'Affiliate-transparent' },
                { stat: '2026', label: 'Inhalte aktuell' },
              ].map(({ stat, label }) => (
                <div key={label}>
                  <p className="stat-number">{stat}</p>
                  <p className="text-xs font-sans text-text-muted mt-2 tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
