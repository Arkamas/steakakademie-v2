import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import { allPersoenlichkeits } from 'contentlayer/generated';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return allPersoenlichkeits.map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const person = allPersoenlichkeits.find(p => p.slug === params.slug);
  if (!person) return {};
  return {
    title: person.seoTitle ?? person.title,
    description: person.seoDescription ?? person.excerpt,
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  Pitmaster: '🔥 Pitmaster',
  'TV-Persönlichkeit': '📺 TV & Media',
  YouTube: '▶️ YouTube',
  DACH: '🇩🇪 DACH',
  Wagyu: '🏅 Wagyu',
  Competition: '🏆 Competition',
  Restaurateur: '🍽️ Restaurateur',
  International: '🌍 International',
};

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-serif text-2xl font-bold text-text-primary mt-10 mb-4 leading-tight" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-serif text-xl font-bold text-text-primary mt-8 mb-3" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="font-body text-text-secondary leading-relaxed mb-5 text-base" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside space-y-2 mb-5 font-body text-text-secondary" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside space-y-2 mb-5 font-body text-text-secondary" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-text-primary" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-text-secondary" {...props} />
  ),
  hr: () => <hr className="border-border-subtle my-10" />,
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className="border-l-2 border-brand-gold pl-6 my-6 italic text-text-secondary font-body" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-brand-gold hover:text-brand-fire underline underline-offset-2 transition-colors" {...props} />
  ),
};

export default function PersoenlichkeitPage({ params }: Props) {
  const person = allPersoenlichkeits.find(p => p.slug === params.slug);
  if (!person) notFound();

  const MDXContent = useMDXComponent(person.body.code);

  // Schema.org Person + Article
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: person.title,
    description: person.excerpt,
    author: {
      '@type': 'Organization',
      name: 'Steakakademie',
    },
    about: {
      '@type': 'Person',
      name: person.title.split('—')[0].trim(),
      description: person.claim,
      nationality: person.nationality,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Steakakademie',
      url: 'https://steakakademie.de',
    },
    datePublished: person.publishedAt,
    dateModified: person.updatedAt ?? person.publishedAt,
    url: `https://steakakademie.de${person.url}`,
    keywords: person.tags?.join(', '),
  };

  // Related (other personalities, exclude current)
  const related = allPersoenlichkeits
    .filter(p => p.slug !== person.slug)
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
    .slice(0, 3);

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <main className="min-h-screen bg-surface-base">

        {/* Hero */}
        <section className="bg-surface-dark border-b border-brand-gold/15">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <nav className="flex items-center gap-1.5 text-xs font-sans text-text-light/40 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <Link href="/persoenlichkeiten" className="hover:text-brand-gold transition-colors">Persönlichkeiten</Link>
              <ChevronRight size={12} />
              <span className="text-text-light/65">{person.title.split('—')[0].trim()}</span>
            </nav>

            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.18em] text-brand-fire bg-brand-fire/10 px-3 py-1">
                {CATEGORY_LABELS[person.category] ?? person.category}
              </span>
              <span className="text-text-light/40 text-xs font-sans">{person.nationality}</span>
              {person.born && <span className="text-text-light/40 text-xs font-sans">*{person.born}</span>}
            </div>

            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-text-light leading-tight mb-4 max-w-3xl">
              {person.title}
            </h1>
            <p className="font-body text-text-light/60 text-lg leading-relaxed max-w-2xl mb-6">
              {person.excerpt}
            </p>

            <div className="border border-brand-gold/20 bg-brand-gold/5 px-5 py-3 inline-block">
              <p className="text-xs font-sans text-brand-gold/70">
                <span className="font-bold text-brand-gold">Claim to fame:</span>{' '}
                {person.claim}
              </p>
            </div>
          </div>
        </section>

        {/* Image placeholder */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-64 bg-gradient-to-br from-surface-elevated to-surface-card border border-border-subtle flex items-center justify-center">
            <span className="text-9xl opacity-10">🥩</span>
          </div>
        </div>

        {/* Meta sidebar + article grid */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

            {/* Sidebar */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="border border-brand-gold/15 bg-surface-elevated p-5 space-y-4 lg:sticky lg:top-6">
                <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.18em] text-brand-fire">Steckbrief</h3>
                <dl className="space-y-3">
                  {person.nationality && (
                    <div>
                      <dt className="text-[10px] font-sans text-text-muted uppercase tracking-wider mb-0.5">Herkunft</dt>
                      <dd className="text-sm font-body text-text-secondary">{person.nationality}</dd>
                    </div>
                  )}
                  {person.born && (
                    <div>
                      <dt className="text-[10px] font-sans text-text-muted uppercase tracking-wider mb-0.5">Jahrgang</dt>
                      <dd className="text-sm font-body text-text-secondary">{person.born}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-[10px] font-sans text-text-muted uppercase tracking-wider mb-0.5">Kategorie</dt>
                    <dd className="text-sm font-body text-text-secondary">{CATEGORY_LABELS[person.category] ?? person.category}</dd>
                  </div>
                  {person.website && (
                    <div>
                      <dt className="text-[10px] font-sans text-text-muted uppercase tracking-wider mb-0.5">Website</dt>
                      <dd>
                        <a href={person.website} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-sans text-brand-gold hover:text-brand-fire transition-colors break-all">
                          {person.website.replace('https://', '')}
                        </a>
                      </dd>
                    </div>
                  )}
                  {person.instagram && (
                    <div>
                      <dt className="text-[10px] font-sans text-text-muted uppercase tracking-wider mb-0.5">Instagram</dt>
                      <dd className="text-sm font-sans text-brand-gold">{person.instagram}</dd>
                    </div>
                  )}
                </dl>

                {person.tags && person.tags.length > 0 && (
                  <div>
                    <p className="text-[10px] font-sans text-text-muted uppercase tracking-wider mb-2">Themen</p>
                    <div className="flex flex-wrap gap-1.5">
                      {person.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-sans border border-border-subtle text-text-muted px-2 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-border-subtle pt-4">
                  <p className="text-[10px] font-sans text-text-muted mb-2">Veröffentlicht</p>
                  <p className="text-xs font-sans text-text-secondary">{person.formattedDate}</p>
                </div>
              </div>
            </aside>

            {/* Article body */}
            <article className="lg:col-span-3 order-1 lg:order-2 prose-none">
              <MDXContent components={mdxComponents} />
            </article>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-border-subtle py-12 px-4 bg-surface-dark">
            <div className="max-w-editorial mx-auto">
              <h2 className="font-serif text-xl font-bold text-text-light mb-6">Weitere Porträts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map(p => (
                  <Link key={p.slug} href={p.url}
                    className="group border border-brand-gold/15 bg-surface-elevated p-5 hover:border-brand-gold/35 transition-all">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-brand-fire block mb-2">
                      {CATEGORY_LABELS[p.category] ?? p.category}
                    </span>
                    <h3 className="font-serif font-bold text-text-light text-sm leading-snug mb-1 group-hover:text-brand-gold transition-colors">
                      {p.title.split('—')[0].trim()}
                    </h3>
                    <p className="text-text-light/40 text-xs font-sans">{p.nationality}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Diplome CTA */}
        <section className="border-t border-brand-gold/10 py-14 px-4 text-center bg-surface-dark">
          <p className="text-text-light/40 text-sm font-sans mb-2">Wissen allein reicht nicht.</p>
          <h3 className="font-serif text-2xl font-bold text-text-light mb-6">Werde selbst zum Experten.</h3>
          <Link href="/diplome"
            className="inline-flex items-center gap-2 px-8 py-4 border border-brand-gold/60 text-brand-gold font-sans font-bold tracking-[0.1em] uppercase text-sm hover:bg-brand-gold/10 transition-colors">
            Zum Steak-Diplom
            <ChevronRight size={14} />
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
