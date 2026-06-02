/**
 * Steakakademie Schema.org Library
 * Typsichere Generatoren für alle verwendeten Schema-Typen.
 * Verknüpft mit Silo-Architektur: /vergleich/, /wissen/, /cuts/, /methoden/
 */

const BASE_URL = 'https://steakakademie.de';

// ── Organisation & Website ───────────────────────────────────────────────────

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Steakakademie',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/images/logo-barrel.jpg`,
      width: 512,
      height: 512,
    },
    sameAs: [
      'https://www.instagram.com/steakakademie',
      'https://www.youtube.com/@steakakademie',
      'https://www.tiktok.com/@steakakademie',
      'https://www.facebook.com/steakakademie.de',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'pitmaster@steakakademie.de',
      contactType: 'customer service',
      availableLanguage: 'German',
    },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Steakakademie',
    description:
      'Deutschlands methodisch tiefste BBQ-Wissensplattform — Fleischkunde, Grilltechniken, Thermometer-Tests und Grillmeister-Diplome.',
    publisher: { '@id': `${BASE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/suche?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'de-DE',
  };
}

// ── Breadcrumb ───────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: BASE_URL },
      ...items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: item.name,
        item: `${BASE_URL}${item.url}`,
      })),
    ],
  };
}

// ── Artikel / Fachbeitrag ────────────────────────────────────────────────────

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorSlug: string;
  url: string;
  keywords?: string[];
}

export function articleSchema(input: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${BASE_URL}${input.url}#article`,
    headline: input.headline,
    description: input.description,
    image: { '@type': 'ImageObject', url: input.image.startsWith('http') ? input.image : `${BASE_URL}${input.image}` },
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    keywords: input.keywords?.join(', '),
    author: {
      '@type': 'Person',
      name: input.authorName,
      url: `${BASE_URL}/autoren/${input.authorSlug}`,
    },
    publisher: { '@id': `${BASE_URL}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}${input.url}` },
    inLanguage: 'de-DE',
  };
}

// ── Produkt + AggregateRating ────────────────────────────────────────────────

export interface ProductSchemaInput {
  name: string;
  description: string;
  brand: string;
  sku?: string;
  image?: string;
  price: number;
  affiliateUrl: string;
  rating?: number;
  ratingCount?: number;
  badge?: string;
  pros?: string[];
  cons?: string[];
}

export function productSchema(product: ProductSchemaInput) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: product.affiliateUrl,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
  };

  if (product.image) {
    schema.image = product.image.startsWith('http')
      ? product.image
      : `${BASE_URL}${product.image}`;
  }
  if (product.sku) schema.sku = product.sku;

  if (product.rating && product.ratingCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.ratingCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  if (product.pros || product.cons) {
    schema.review = {
      '@type': 'Review',
      author: { '@id': `${BASE_URL}/#organization` },
      reviewBody: [
        product.pros?.length ? `Vorteile: ${product.pros.join('; ')}.` : '',
        product.cons?.length ? `Nachteile: ${product.cons.join('; ')}.` : '',
      ]
        .filter(Boolean)
        .join(' '),
      reviewRating: product.rating
        ? {
            '@type': 'Rating',
            ratingValue: product.rating.toFixed(1),
            bestRating: '5',
            worstRating: '1',
          }
        : undefined,
    };
  }

  return schema;
}

// ── Vergleichsseite: ItemList + ProductGroup ─────────────────────────────────

export interface ComparisonSchemaInput {
  pageTitle: string;
  pageUrl: string;
  products: ProductSchemaInput[];
}

export function comparisonPageSchema(input: ComparisonSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.pageTitle,
    url: `${BASE_URL}${input.pageUrl}`,
    numberOfItems: input.products.length,
    itemListElement: input.products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      item: productSchema(p),
    })),
  };
}

// ── FAQ ──────────────────────────────────────────────────────────────────────

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

// ── HowTo ────────────────────────────────────────────────────────────────────

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export interface HowToSchemaInput {
  name: string;
  description: string;
  image?: string;
  totalTime?: string; // ISO 8601 duration, e.g. "PT45M"
  steps: HowToStep[];
  url: string;
}

export function howToSchema(input: HowToSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    ...(input.image && { image: `${BASE_URL}${input.image}` }),
    ...(input.totalTime && { totalTime: input.totalTime }),
    url: `${BASE_URL}${input.url}`,
    step: input.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.image && { image: `${BASE_URL}${s.image}` }),
    })),
  };
}

// ── CollectionPage (Silo-Index) ──────────────────────────────────────────────

export function collectionPageSchema(name: string, url: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${BASE_URL}${url}`,
    publisher: { '@id': `${BASE_URL}/#organization` },
    inLanguage: 'de-DE',
  };
}
