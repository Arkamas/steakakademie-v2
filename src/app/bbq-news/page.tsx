import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Flame, Globe, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getNewsItems, type NewsItem, type NewsRegion } from '@/lib/bbq-news';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'BBQ-News — Aktuelles aus der Grillszene USA & Deutschland | Steakakademie',
  description:
    'Frische News aus der internationalen Grillwelt: Trends aus den USA, Entwicklungen in Deutschland, neue Techniken, Wettbewerbe und Produkte. Kuratiert von der Steakakademie.',
  alternates: { canonical: 'https://steakakademie.de/bbq-news' },
  openGraph: {
    title: 'BBQ-News — Grillszene USA & Deutschland',
    description:
      'Trends, Techniken und Produkte aus der internationalen BBQ-Welt — kuratiert und eingeordnet.',
    url: 'https://steakakademie.de/bbq-news',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@steakakademie' },
};

const REGION_STYLE: Record<NewsRegion, { dot: string; label: string }> = {
  USA: { dot: '#E85018', label: 'USA' },
  Deutschland: { dot: '#C8882A', label: 'Deutschland' },
  International: { dot: '#7A6558', label: 'International' },
};

function buildItemListSchema(items: NewsItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BBQ-News — Grillszene USA & Deutschland',
    itemListElement: items.map((n, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'NewsArticle',
        headline: n.title,
        datePublished: n.isoDate,
        description: n.summary,
        author: { '@type': 'Organization', name: 'Steakakademie' },
      },
    })),
  };
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Startseite', item: 'https://steakakademie.de' },
    { '@type': 'ListItem', position: 2, name: 'BBQ-News', item: 'https://steakakademie.de/bbq-news' },
  ],
};

export default async function BbqNewsPage() {
  const newsItems = await getNewsItems();
  const featured = newsItems.find((n) => n.featured) ?? newsItems[0];
  const rest = newsItems.filter((n) => n.id !== featured.id);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListSchema(newsItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Header />

      <main>
        {/* ── Page-Header ─────────────────────────────────────────────── */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <nav className="text-xs font-sans text-text-muted mb-5 flex items-center gap-1.5">
            <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
            <ChevronRight size={12} />
            <span className="text-text-secondary">BBQ-News</span>
          </nav>
          <span className="category-label mb-3 block">Aktuelles aus der Grillszene</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-text-light leading-[1.1] mb-4">
            BBQ-News
          </h1>
          <p className="font-body text-lg text-text-secondary max-w-2xl leading-relaxed">
            Was bewegt die Grillwelt? Trends aus den USA, Entwicklungen in Deutschland,
            neue Techniken und Produkte — kuratiert, eingeordnet, ohne Clickbait.
          </p>
          <p className="font-sans text-xs text-text-muted mt-3 max-w-2xl">
            Hinweis: Beiträge werden KI-gestützt erstellt und aufbereitet sowie redaktionell vor Veröffentlichung geprüft.
          </p>
          <div className="section-divider mt-6" />
        </section>

        {/* ── Aufmacher ──────────────────────────────────────────────── */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <article
            className="relative px-8 sm:px-12 py-10 sm:py-14"
            style={{
              background: 'radial-gradient(ellipse 120% 140% at 30% 20%, #2D2218 0%, #17100B 100%)',
              border: '1px solid rgba(200,136,42,0.18)',
              borderRadius: '4px',
            }}
          >
            <div className="flex items-center gap-2 mb-4 text-xs font-sans">
              <span className="inline-flex items-center gap-1.5 font-bold tracking-wider uppercase" style={{ color: REGION_STYLE[featured.region].dot }}>
                <span className="w-2 h-2 rounded-full" style={{ background: REGION_STYLE[featured.region].dot }} />
                {REGION_STYLE[featured.region].label}
              </span>
              <span className="text-brand-gold/40">·</span>
              <span className="text-text-muted uppercase tracking-wider">{featured.category}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-light leading-[1.15] mb-4 max-w-3xl">
              {featured.href ? (
                <Link href={featured.href} className="hover:text-brand-gold transition-colors">{featured.title}</Link>
              ) : featured.title}
            </h2>
            <p className="font-body text-lg text-text-secondary leading-relaxed max-w-2xl mb-6">
              {featured.summary}
            </p>
            <div className="flex items-center gap-x-4 text-xs font-sans text-text-muted">
              <span className="inline-flex items-center gap-1.5"><Clock size={13} className="text-brand-gold/60" />{featured.date}</span>
              {featured.source && (<><span className="text-brand-gold/30">·</span><span>{featured.source}</span></>)}
            </div>
          </article>
        </section>

        {/* ── News-Grid ──────────────────────────────────────────────── */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {rest.map((n) => {
              const Card = (
                <article
                  className="h-full flex flex-col bg-surface-card border border-border-subtle p-6 transition-all duration-200 hover:border-brand-gold/40 group"
                >
                  <div className="flex items-center gap-2 mb-3 text-[11px] font-sans">
                    <span className="inline-flex items-center gap-1.5 font-bold tracking-wider uppercase" style={{ color: REGION_STYLE[n.region].dot }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: REGION_STYLE[n.region].dot }} />
                      {REGION_STYLE[n.region].label}
                    </span>
                    <span className="text-brand-gold/30">·</span>
                    <span className="text-text-muted uppercase tracking-wider">{n.category}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-text-light leading-snug mb-3 group-hover:text-brand-gold transition-colors">
                    {n.title}
                  </h3>
                  <p className="font-body text-sm text-text-secondary leading-relaxed mb-4 flex-1">
                    {n.summary}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-sans text-text-muted pt-3 border-t border-border-subtle">
                    <span className="inline-flex items-center gap-1.5"><Clock size={12} className="text-brand-gold/50" />{n.date}</span>
                    {n.href && <ChevronRight size={14} className="text-brand-fire opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                </article>
              );
              return n.href ? (
                <Link key={n.id} href={n.href} className="block h-full">{Card}</Link>
              ) : (
                <div key={n.id} className="h-full">{Card}</div>
              );
            })}
          </div>
        </section>

        {/* ── Hinweis / GEO-Transparenz ──────────────────────────────── */}
        <section className="bg-surface-base py-12" style={{ borderTop: '1px solid rgba(200,136,42,0.15)' }}>
          <div className="max-w-content mx-auto px-4 sm:px-6 text-center">
            <Globe size={22} className="text-brand-gold mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-text-light mb-3">Kuratiert, nicht kopiert</h2>
            <p className="font-body text-text-secondary leading-relaxed mb-6">
              Wir fassen Entwicklungen aus der internationalen Grillszene in eigenen Worten zusammen
              und ordnen sie für den deutschen Markt ein. Quellen werden genannt — Volltexte
              verlinken wir, statt sie zu kopieren.
            </p>
            <Link href="/diplome" className="btn-gold text-xs font-bold tracking-widest uppercase">
              <Flame size={13} /> Zum Grillmeister-Diplom
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
