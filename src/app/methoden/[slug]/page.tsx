import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { allMethodes } from 'contentlayer/generated';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import { Clock, Calendar, ChevronRight, RotateCcw, Flame } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return allMethodes.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const methode = allMethodes.find((m) => m.slug === params.slug);
  if (!methode) return {};
  const title = methode.seoTitle ?? methode.title;
  const description = methode.seoDescription ?? methode.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `https://steakakademie.de${methode.url}` },
    openGraph: {
      title,
      description,
      url: `https://steakakademie.de${methode.url}`,
      images: [{ url: methode.image, alt: methode.imageAlt }],
      type: 'article',
    },
  };
}

const difficultyColor: Record<string, string> = {
  Einfach: 'text-green-700 bg-green-50 border-green-200',
  Mittel: 'text-brand-fire bg-orange-50 border-orange-200',
  Fortgeschritten: 'text-red-700 bg-red-50 border-red-200',
};

const mdxComponents = {
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary mt-10 mb-4 leading-tight border-b border-border-subtle pb-3" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-serif text-xl font-bold text-text-primary mt-8 mb-3" {...props}>{children}</h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="font-body text-[1.0625rem] leading-[1.8] text-text-primary mb-5" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-outside ml-5 space-y-2 mb-5 font-body text-[1.0625rem]" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-outside ml-5 space-y-2 mb-5 font-body text-[1.0625rem]" {...props}>{children}</ol>
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-6 -mx-4 sm:mx-0">
      <table className="min-w-full border-collapse font-sans text-sm" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-text-primary text-white" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.1em] uppercase" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3 border-b border-border-subtle text-text-secondary" {...props}>{children}</td>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-brand-gold pl-5 my-6 font-body text-lg italic text-text-secondary" {...props}>{children}</blockquote>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-text-primary" {...props}>{children}</strong>
  ),
  hr: () => <hr className="border-border-subtle my-10" />,
};

export default function MethodePage({ params }: Props) {
  const methode = allMethodes.find((m) => m.slug === params.slug);
  if (!methode) notFound();

  const MDXContent = useMDXComponent(methode.body.code);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: methode.title,
    description: methode.excerpt,
    image: methode.image,
    datePublished: methode.publishedAt,
    dateModified: methode.updatedAt ?? methode.publishedAt,
    author: {
      '@type': 'Person',
      name: methode.author,
      url: `https://steakakademie.de/autoren/${methode.authorSlug}`,
    },
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <main>
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-fire transition-colors">Start</Link>
            <ChevronRight size={12} />
            <Link href="/kategorie/methoden" className="hover:text-brand-fire transition-colors">Grilltechniken</Link>
            <ChevronRight size={12} />
            <span className="text-text-primary">{methode.title.split(':')[0]}</span>
          </nav>
        </div>

        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
            <article>
              <header className="mb-8">
                <span className="category-label">Grilltechniken</span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mt-2 mb-4 leading-tight">
                  {methode.title}
                </h1>
                <p className="font-body text-lg text-text-secondary leading-relaxed mb-5">{methode.excerpt}</p>

                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  {methode.difficulty && (
                    <span className={cn('text-xs font-sans font-bold px-3 py-1 border rounded-full', difficultyColor[methode.difficulty] ?? 'text-text-secondary border-border-subtle')}>
                      {methode.difficulty}
                    </span>
                  )}
                  {methode.timeMinutes && (
                    <span className="flex items-center gap-1 text-xs font-sans text-text-muted">
                      <Clock size={12} />
                      {methode.timeMinutes} Min.
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-text-muted pb-5 border-b border-border-subtle">
                  <Link href={`/autoren/${methode.authorSlug}`} className="flex items-center gap-1.5 hover:text-brand-fire transition-colors">
                    <div className="w-6 h-6 bg-border-subtle rounded-full" />
                    {methode.author}
                  </Link>
                  <span className="flex items-center gap-1"><Calendar size={12} />{methode.formattedDate}</span>
                  {methode.updatedAt && (
                    <span className="flex items-center gap-1 text-brand-fire font-medium">
                      <RotateCcw size={12} />
                      Aktualisiert: {new Date(methode.updatedAt).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </header>

              <div className="mb-8 overflow-hidden">
                <Image src={methode.image} alt={methode.imageAlt} width={800} height={500} className="w-full aspect-[16/9] object-cover" priority />
                <p className="text-xs font-sans text-text-muted mt-2 italic">{methode.imageAlt}</p>
              </div>

              <div className="max-w-content">
                <MDXContent components={mdxComponents} />
              </div>

              <div className="mt-10 p-5 bg-surface-base border border-border-subtle flex gap-4">
                <div className="w-14 h-14 bg-border-subtle rounded-full shrink-0" />
                <div>
                  <Link href={`/autoren/${methode.authorSlug}`} className="font-sans font-bold text-sm text-text-primary hover:text-brand-fire transition-colors">
                    {methode.author}
                  </Link>
                  <p className="text-xs font-sans text-text-muted mt-1 leading-relaxed">
                    Steakakademie-Autor. Jeder Artikel basiert auf eigener Praxiserfahrung und methodisch belegten Angaben.
                  </p>
                </div>
              </div>
            </article>

            <aside className="space-y-6">
              <div className="bg-white border border-border-subtle p-5 sticky top-24">
                <div className="border-t-2 border-brand-fire -mt-5 mb-4 pt-4">
                  <h3 className="font-sans font-bold text-sm text-text-primary flex items-center gap-2">
                    <Flame size={14} className="text-brand-fire" /> Methoden-Info
                  </h3>
                </div>
                <dl className="space-y-3 text-sm font-sans">
                  {methode.difficulty && (
                    <div>
                      <dt className="text-text-muted text-xs uppercase tracking-wide mb-0.5">Schwierigkeit</dt>
                      <dd className="font-bold text-text-primary">{methode.difficulty}</dd>
                    </div>
                  )}
                  {methode.timeMinutes && (
                    <div>
                      <dt className="text-text-muted text-xs uppercase tracking-wide mb-0.5">Zeitaufwand</dt>
                      <dd className="font-bold text-text-primary">{methode.timeMinutes} Minuten</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="bg-white border border-border-subtle p-5">
                <div className="border-t-2 border-brand-gold -mt-5 mb-4 pt-4">
                  <h3 className="font-sans font-bold text-sm text-text-primary">Weiterlernen</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    { label: 'Ribeye Guide', href: '/cuts/ribeye' },
                    { label: 'Kerntemperaturen Guide', href: '/wissen/kerntemperaturen' },
                    { label: 'Brisket Guide', href: '/cuts/brisket' },
                    { label: 'Thermometer Vergleich', href: '/vergleich/fleischthermometer' },
                  ].map(({ label, href }) => (
                    <li key={href}>
                      <Link href={href} className="flex items-center justify-between text-sm font-sans text-text-secondary hover:text-brand-fire transition-colors group py-1.5 border-b border-border-subtle/50">
                        {label}
                        <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-fire" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
