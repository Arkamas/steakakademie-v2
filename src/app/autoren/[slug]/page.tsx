import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getAuthorBySlug, getAllAuthors } from '@/lib/authors';
import { allCuts, allArtikels } from 'contentlayer/generated';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllAuthors().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = getAuthorBySlug(params.slug);
  if (!author) return {};
  return {
    title: `${author.name} — Autor bei Steakakademie`,
    description: author.shortBio,
    alternates: { canonical: `https://steakakademie.de/autoren/${author.slug}` },
  };
}

export default function AutorPage({ params }: Props) {
  const author = getAuthorBySlug(params.slug);
  if (!author) notFound();

  // Alle Artikel dieses Autors
  const authorCuts = allCuts.filter((c) => c.authorSlug === author.slug);
  const authorArtikel = allArtikels.filter((a) => a.authorSlug === author.slug);
  const totalArticles = authorCuts.length + authorArtikel.length;

  // Schema.org Person
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `https://steakakademie.de/autoren/${author.slug}`,
    image: `https://steakakademie.de${author.avatar}`,
    description: author.bio,
    jobTitle: 'Autor',
    worksFor: {
      '@type': 'Organization',
      name: 'Steakakademie',
      url: 'https://steakakademie.de',
    },
    knowsAbout: author.expertise,
  };

  return (
    <>
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main>
        {/* Breadcrumb */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-fire transition-colors">Start</Link>
            <ChevronRight size={12} />
            <span className="text-text-primary">Autoren</span>
            <ChevronRight size={12} />
            <span className="text-text-primary">{author.name}</span>
          </nav>
        </div>

        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Author header */}
          <div className="flex flex-col sm:flex-row gap-8 mb-12 pb-12 border-b-2 border-text-primary">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-border-subtle rounded-full shrink-0 overflow-hidden">
              {/* Avatar placeholder — replace with real image */}
              <div className="w-full h-full bg-gradient-to-br from-brand-gold/30 to-brand-fire/20 flex items-center justify-center">
                <span className="font-serif text-4xl text-text-primary">{author.name[0]}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs font-sans font-bold tracking-widest uppercase text-brand-fire mb-2">Autor</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-3">{author.name}</h1>
              {author.statsLabel && (
                <p className="text-sm font-sans font-bold text-text-secondary mb-4">{author.statsLabel}</p>
              )}
              <p className="font-body text-base text-text-secondary leading-relaxed mb-5">{author.bio}</p>

              {/* Expertise tags */}
              <div className="flex flex-wrap gap-2">
                {author.expertise.map((e) => (
                  <span key={e} className="text-xs font-sans font-bold tracking-wide uppercase px-3 py-1 bg-surface-base border border-border-subtle text-text-secondary">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Articles by author */}
          {totalArticles > 0 ? (
            <div>
              <div className="border-t-2 border-text-primary mb-8 pt-4">
                <h2 className="font-sans font-bold text-lg text-text-primary">
                  Artikel von {author.name} ({totalArticles})
                </h2>
              </div>
              <div className="grid gap-6">
                {authorCuts.map((cut) => (
                  <Link key={cut.slug} href={cut.url} className="group flex gap-4 py-4 border-b border-border-subtle hover:border-brand-fire transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-sans font-bold tracking-widest uppercase text-brand-fire mb-1">Cuts & Fleischkunde</p>
                      <h3 className="font-serif text-lg font-bold text-text-primary group-hover:text-brand-fire transition-colors mb-2 leading-snug">
                        {cut.title}
                      </h3>
                      <p className="text-sm font-body text-text-secondary line-clamp-2">{cut.excerpt}</p>
                      <p className="text-xs font-sans text-text-muted mt-2">{cut.formattedDate}</p>
                    </div>
                    <ChevronRight size={18} className="text-text-muted group-hover:text-brand-fire transition-colors shrink-0 self-center" />
                  </Link>
                ))}
                {authorArtikel.map((art) => (
                  <Link key={art.slug} href={art.url} className="group flex gap-4 py-4 border-b border-border-subtle hover:border-brand-fire transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-sans font-bold tracking-widest uppercase text-brand-fire mb-1">{art.category}</p>
                      <h3 className="font-serif text-lg font-bold text-text-primary group-hover:text-brand-fire transition-colors mb-2 leading-snug">
                        {art.title}
                      </h3>
                      <p className="text-sm font-body text-text-secondary line-clamp-2">{art.excerpt}</p>
                      <p className="text-xs font-sans text-text-muted mt-2">{art.formattedDate}</p>
                    </div>
                    <ChevronRight size={18} className="text-text-muted group-hover:text-brand-fire transition-colors shrink-0 self-center" />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="font-body text-text-secondary">Noch keine veröffentlichten Artikel.</p>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
