import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { allVergleiches } from 'contentlayer/generated';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/affiliate/ProductCard';
import MDXProductCard from '@/components/mdx/MDXProductCard';
import MDXComparisonTable from '@/components/mdx/MDXComparisonTable';
import MDXBuyingGuideBlock from '@/components/mdx/MDXBuyingGuideBlock';
import { getProductsByCategory } from '@/lib/products';
import { Calendar, ChevronRight, RotateCcw, FlaskConical } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return allVergleiches.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vergleich = allVergleiches.find((v) => v.slug === params.slug);
  if (!vergleich) return {};
  const title = vergleich.seoTitle ?? vergleich.title;
  const description = vergleich.seoDescription ?? vergleich.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `https://steakakademie.de${vergleich.url}` },
    openGraph: {
      title, description,
      url: `https://steakakademie.de${vergleich.url}`,
      images: [{ url: vergleich.image, alt: vergleich.imageAlt }],
      type: 'article',
    },
  };
}

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
  MDXProductCard,
  MDXComparisonTable,
  MDXBuyingGuideBlock,
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isAffiliate = href?.startsWith('/go/');
    return (
      <a
        href={href}
        rel={isAffiliate ? 'sponsored noopener' : undefined}
        className="text-brand-fire hover:underline"
        {...props}
      >
        {children}
      </a>
    );
  },
};

export default function VergleichPage({ params }: Props) {
  const vergleich = allVergleiches.find((v) => v.slug === params.slug);
  if (!vergleich) notFound();

  const MDXContent = useMDXComponent(vergleich.body.code);
  const thermometer = getProductsByCategory('thermometer');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: vergleich.title,
    description: vergleich.excerpt,
    image: vergleich.image,
    datePublished: vergleich.publishedAt,
    dateModified: vergleich.updatedAt ?? vergleich.publishedAt,
    author: {
      '@type': 'Person',
      name: vergleich.author,
      url: `https://steakakademie.de/autoren/${vergleich.authorSlug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Steakakademie',
      url: 'https://steakakademie.de',
    },
  };

  const faqSchema = vergleich.faq ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (vergleich.faq as Array<{ question: string; answer: string }>).map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null;

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: vergleich.title,
    itemListElement: thermometer.slice(0, 5).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://steakakademie.de/go/${p.id}`,
      item: {
        '@type': 'Product',
        name: p.name,
        brand: { '@type': 'Brand', name: p.brand },
        offers: { '@type': 'Offer', price: p.price, priceCurrency: 'EUR', url: p.affiliateUrl },
        aggregateRating: p.rating ? {
          '@type': 'AggregateRating',
          ratingValue: p.rating,
          reviewCount: p.ratingCount ?? 1,
        } : undefined,
      },
    })),
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <main>
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-fire transition-colors">Start</Link>
            <ChevronRight size={12} />
            <Link href="/kategorie/vergleich" className="hover:text-brand-fire transition-colors">Vergleiche</Link>
            <ChevronRight size={12} />
            <span className="text-text-primary">{vergleich.title.split(':')[0]}</span>
          </nav>
        </div>

        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
            <article>
              <header className="mb-8">
                <span className="category-label">Vergleich &amp; Test</span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mt-2 mb-4 leading-tight">
                  {vergleich.title}
                </h1>
                <p className="font-body text-lg text-text-secondary leading-relaxed mb-5">{vergleich.excerpt}</p>

                {(vergleich.testedCount || vergleich.testDuration) && (
                  <div className="flex flex-wrap gap-4 mb-5 p-4 bg-surface-base border border-border-subtle">
                    {vergleich.testedCount && (
                      <div className="flex items-center gap-2 text-sm font-sans">
                        <FlaskConical size={16} className="text-brand-fire" />
                        <span className="text-text-muted">Getestet:</span>
                        <span className="font-bold text-text-primary">{vergleich.testedCount} Modelle</span>
                      </div>
                    )}
                    {vergleich.testDuration && (
                      <div className="flex items-center gap-2 text-sm font-sans">
                        <Calendar size={16} className="text-brand-fire" />
                        <span className="text-text-muted">Testdauer:</span>
                        <span className="font-bold text-text-primary">{vergleich.testDuration}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-text-muted pb-5 border-b border-border-subtle">
                  <Link href={`/autoren/${vergleich.authorSlug}`} className="flex items-center gap-1.5 hover:text-brand-fire transition-colors">
                    <div className="w-6 h-6 bg-border-subtle rounded-full" />
                    {vergleich.author}
                  </Link>
                  <span className="flex items-center gap-1"><Calendar size={12} />{vergleich.formattedDate}</span>
                  {vergleich.updatedAt && (
                    <span className="flex items-center gap-1 text-brand-fire font-medium">
                      <RotateCcw size={12} />
                      Aktualisiert: {new Date(vergleich.updatedAt).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </header>

              <div className="mb-8 overflow-hidden">
                <Image src={vergleich.image} alt={vergleich.imageAlt} width={800} height={500} className="w-full aspect-[16/9] object-cover" priority />
                <p className="text-xs font-sans text-text-muted mt-2 italic">{vergleich.imageAlt}</p>
              </div>

              <div className="max-w-content">
                <MDXContent components={mdxComponents} />
              </div>

              <div className="mt-10 p-5 bg-surface-base border border-border-subtle flex gap-4">
                <div className="w-14 h-14 bg-border-subtle rounded-full shrink-0" />
                <div>
                  <Link href={`/autoren/${vergleich.authorSlug}`} className="font-sans font-bold text-sm text-text-primary hover:text-brand-fire transition-colors">
                    {vergleich.author}
                  </Link>
                  <p className="text-xs font-sans text-text-muted mt-1 leading-relaxed">
                    Alle getesteten Produkte wurden selbst gekauft und über mehrere Wochen im Praxiseinsatz getestet.
                  </p>
                </div>
              </div>
            </article>

            <aside className="space-y-6">
              {thermometer.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} variant="sidebar" />
              ))}

              <div className="bg-white border border-border-subtle p-5">
                <div className="border-t-2 border-brand-gold -mt-5 mb-4 pt-4">
                  <h3 className="font-sans font-bold text-sm text-text-primary">Verwandte Guides</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    { label: 'Kerntemperaturen Guide', href: '/wissen/kerntemperaturen' },
                    { label: 'Reverse Sear Methode', href: '/methoden/reverse-sear' },
                    { label: 'Ribeye Guide', href: '/cuts/ribeye' },
                    { label: 'Brisket Guide', href: '/cuts/brisket' },
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
