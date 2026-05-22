import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { allCuts } from 'contentlayer/generated';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/affiliate/ProductCard';
import { getProductsByCategory, getProductById } from '@/lib/products';
import { cn } from '@/lib/utils';
import { Clock, Calendar, ChevronRight, RotateCcw } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return allCuts.map((cut) => ({ slug: cut.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cut = allCuts.find((c) => c.slug === params.slug);
  if (!cut) return {};

  const title = cut.seoTitle ?? cut.title;
  const description = cut.seoDescription ?? cut.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `https://steakakademie.de${cut.url}` },
    openGraph: {
      title,
      description,
      url: `https://steakakademie.de${cut.url}`,
      images: [{ url: cut.image, alt: cut.imageAlt }],
      type: 'article',
    },
  };
}

// ── MDX-Komponenten Override ──────────────────────────────────────────────────

const mdxComponents = {
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="font-serif text-2xl sm:text-3xl font-bold text-text-primary mt-10 mb-4 leading-tight border-b border-border-subtle pb-3"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="font-serif text-xl font-bold text-text-primary mt-8 mb-3"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="font-body text-[1.0625rem] leading-[1.8] text-text-primary mb-5" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-outside ml-5 space-y-2 mb-5 font-body text-[1.0625rem]" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-outside ml-5 space-y-2 mb-5 font-body text-[1.0625rem]" {...props}>
      {children}
    </ol>
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-6 -mx-4 sm:mx-0">
      <table
        className="min-w-full border-collapse font-sans text-sm"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-text-primary text-white" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.1em] uppercase"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-4 py-3 border-b border-border-subtle text-text-secondary"
      {...props}
    >
      {children}
    </td>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-brand-gold pl-5 my-6 font-body text-lg italic text-text-secondary"
      {...props}
    >
      {children}
    </blockquote>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-text-primary" {...props}>
      {children}
    </strong>
  ),
  hr: () => <hr className="border-border-subtle my-10" />,
};

export default function CutPage({ params }: Props) {
  const cut = allCuts.find((c) => c.slug === params.slug);
  if (!cut) notFound();

  const MDXContent = useMDXComponent(cut.body.code);
  const relatedProducts = getProductsByCategory('thermometer').slice(0, 3);

  // Schema.org JSON-LD
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: cut.title,
    description: cut.excerpt,
    image: cut.image,
    datePublished: cut.publishedAt,
    dateModified: cut.updatedAt ?? cut.publishedAt,
    author: {
      '@type': 'Person',
      name: cut.author,
      url: `https://steakakademie.de/autoren/${cut.authorSlug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Steakakademie',
      url: 'https://steakakademie.de',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://steakakademie.de${cut.url}`,
    },
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
          <nav
            className="flex items-center gap-1.5 text-xs font-sans text-text-muted"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-brand-fire transition-colors">Start</Link>
            <ChevronRight size={12} />
            <Link href="/kategorie/cuts" className="hover:text-brand-fire transition-colors">
              Cuts &amp; Fleischkunde
            </Link>
            <ChevronRight size={12} />
            <span className="text-text-primary">{cut.title.split(':')[0]}</span>
          </nav>
        </div>

        {/* Article layout: content + sidebar */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

            {/* Main content */}
            <article>
              {/* Header */}
              <header className="mb-8">
                <span className="category-label">Cuts &amp; Fleischkunde</span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mt-2 mb-4 leading-tight">
                  {cut.title}
                </h1>
                <p className="font-body text-lg text-text-secondary leading-relaxed mb-5">
                  {cut.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-text-muted pb-5 border-b border-border-subtle">
                  <Link
                    href={`/autoren/${cut.authorSlug}`}
                    className="flex items-center gap-1.5 hover:text-brand-fire transition-colors"
                  >
                    <div className="w-6 h-6 bg-border-subtle rounded-full" />
                    {cut.author}
                  </Link>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {cut.formattedDate}
                  </span>
                  {cut.updatedAt && (
                    <span className="flex items-center gap-1 text-brand-fire font-medium">
                      <RotateCcw size={12} />
                      Aktualisiert: {new Date(cut.updatedAt).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </header>

              {/* Hero image */}
              <div className="mb-8 overflow-hidden">
                <Image
                  src={cut.image}
                  alt={cut.imageAlt}
                  width={800}
                  height={500}
                  className="w-full aspect-[16/9] object-cover"
                  priority
                />
                <p className="text-xs font-sans text-text-muted mt-2 italic">{cut.imageAlt}</p>
              </div>

              {/* MDX Content */}
              <div className="max-w-content">
                <MDXContent components={mdxComponents} />
              </div>

              {/* Author box */}
              <div className="mt-10 p-5 bg-surface-base border border-border-subtle flex gap-4">
                <div className="w-14 h-14 bg-border-subtle rounded-full shrink-0" />
                <div>
                  <Link
                    href={`/autoren/${cut.authorSlug}`}
                    className="font-sans font-bold text-sm text-text-primary hover:text-brand-fire transition-colors"
                  >
                    {cut.author}
                  </Link>
                  <p className="text-xs font-sans text-text-muted mt-1 leading-relaxed">
                    Steakakademie-Autor. Jeder Artikel basiert auf eigener Praxiserfahrung und methodisch belegten Angaben.
                  </p>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Inhaltsverzeichnis */}
              <div className="bg-white border border-border-subtle p-5 sticky top-24">
                <div className="border-t-2 border-text-primary -mt-5 mb-4 pt-4">
                  <h3 className="font-sans font-bold text-sm text-text-primary">
                    Inhalt
                  </h3>
                </div>
                <ul className="space-y-2 text-sm font-sans text-text-secondary">
                  <li>
                    <a href="#was-ist-ein-ribeye-überhaupt" className="hover:text-brand-fire transition-colors">
                      Was ist ein Ribeye?
                    </a>
                  </li>
                  <li>
                    <a href="#marmorierung-was-die-zahlen-bedeuten" className="hover:text-brand-fire transition-colors">
                      Marmorierung verstehen
                    </a>
                  </li>
                  <li>
                    <a href="#kerntemperaturen-für-ribeye" className="hover:text-brand-fire transition-colors">
                      Kerntemperaturen
                    </a>
                  </li>
                  <li>
                    <a href="#drei-zubereitungsmethoden" className="hover:text-brand-fire transition-colors">
                      Zubereitungsmethoden
                    </a>
                  </li>
                  <li>
                    <a href="#einkauf-worauf-achten" className="hover:text-brand-fire transition-colors">
                      Einkaufstipps
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-brand-fire transition-colors">FAQ</a>
                  </li>
                </ul>
              </div>

              {/* Produkt-Empfehlung */}
              {relatedProducts[0] && (
                <ProductCard product={relatedProducts[0]} variant="sidebar" />
              )}

              {/* Verwandte Guides */}
              <div className="bg-white border border-border-subtle p-5">
                <div className="border-t-2 border-brand-gold -mt-5 mb-4 pt-4">
                  <h3 className="font-sans font-bold text-sm text-text-primary">
                    Weiterlernen
                  </h3>
                </div>
                <ul className="space-y-2">
                  {[
                    { label: 'Reverse Sear Methode', href: '/methoden/reverse-sear' },
                    { label: 'Kerntemperaturen Guide', href: '/wissen/kerntemperaturen' },
                    { label: 'Thermometer Vergleich', href: '/vergleich/fleischthermometer' },
                    { label: 'Brisket Guide', href: '/cuts/brisket' },
                  ].map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="flex items-center justify-between text-sm font-sans text-text-secondary hover:text-brand-fire transition-colors group py-1.5 border-b border-border-subtle/50"
                      >
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
