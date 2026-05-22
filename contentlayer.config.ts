import { defineDocumentType, makeSource } from 'contentlayer2/source-files';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

// ── ARTIKEL ──────────────────────────────────────────────────────────────────

export const Artikel = defineDocumentType(() => ({
  name: 'Artikel',
  filePathPattern: 'artikel/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    excerpt: { type: 'string', required: true },
    publishedAt: { type: 'date', required: true },
    updatedAt: { type: 'date' },
    author: { type: 'string', required: true },
    authorSlug: { type: 'string', required: true },
    category: { type: 'string', required: true },
    categorySlug: { type: 'string', required: true },
    image: { type: 'string', required: true },
    imageAlt: { type: 'string', required: true },
    tags: { type: 'list', of: { type: 'string' } },
    featured: { type: 'boolean', default: false },
    readingTime: { type: 'number' }, // in minutes
    seoTitle: { type: 'string' },
    seoDescription: { type: 'string' },
    noindex: { type: 'boolean', default: false },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('artikel/', ''),
    },
    url: {
      type: 'string',
      resolve: (doc) => `/artikel/${doc._raw.flattenedPath.replace('artikel/', '')}`,
    },
    formattedDate: {
      type: 'string',
      resolve: (doc) =>
        format(parseISO(doc.publishedAt), 'd. MMMM yyyy', { locale: de }),
    },
  },
}));

// ── CUTS ─────────────────────────────────────────────────────────────────────

export const Cut = defineDocumentType(() => ({
  name: 'Cut',
  filePathPattern: 'cuts/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    excerpt: { type: 'string', required: true },
    publishedAt: { type: 'date', required: true },
    updatedAt: { type: 'date' },
    author: { type: 'string', required: true },
    authorSlug: { type: 'string', required: true },
    image: { type: 'string', required: true },
    imageAlt: { type: 'string', required: true },
    seoTitle: { type: 'string' },
    seoDescription: { type: 'string' },
    schemaType: { type: 'string', default: 'Article' },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('cuts/', ''),
    },
    url: {
      type: 'string',
      resolve: (doc) => `/cuts/${doc._raw.flattenedPath.replace('cuts/', '')}`,
    },
    formattedDate: {
      type: 'string',
      resolve: (doc) =>
        format(parseISO(doc.publishedAt), 'd. MMMM yyyy', { locale: de }),
    },
  },
}));

// ── METHODEN ─────────────────────────────────────────────────────────────────

export const Methode = defineDocumentType(() => ({
  name: 'Methode',
  filePathPattern: 'methoden/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    excerpt: { type: 'string', required: true },
    publishedAt: { type: 'date', required: true },
    updatedAt: { type: 'date' },
    author: { type: 'string', required: true },
    authorSlug: { type: 'string', required: true },
    image: { type: 'string', required: true },
    imageAlt: { type: 'string', required: true },
    difficulty: { type: 'enum', options: ['Einfach', 'Mittel', 'Fortgeschritten'], required: true },
    timeMinutes: { type: 'number' },
    seoTitle: { type: 'string' },
    seoDescription: { type: 'string' },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('methoden/', ''),
    },
    url: {
      type: 'string',
      resolve: (doc) => `/methoden/${doc._raw.flattenedPath.replace('methoden/', '')}`,
    },
    formattedDate: {
      type: 'string',
      resolve: (doc) =>
        format(parseISO(doc.publishedAt), 'd. MMMM yyyy', { locale: de }),
    },
  },
}));

// ── VERGLEICHE ────────────────────────────────────────────────────────────────

export const Vergleich = defineDocumentType(() => ({
  name: 'Vergleich',
  filePathPattern: 'vergleich/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    excerpt: { type: 'string', required: true },
    publishedAt: { type: 'date', required: true },
    updatedAt: { type: 'date' },
    author: { type: 'string', required: true },
    authorSlug: { type: 'string', required: true },
    image: { type: 'string', required: true },
    imageAlt: { type: 'string', required: true },
    testedCount: { type: 'number' },
    testDuration: { type: 'string' },
    seoTitle: { type: 'string' },
    seoDescription: { type: 'string' },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('vergleich/', ''),
    },
    url: {
      type: 'string',
      resolve: (doc) => `/vergleich/${doc._raw.flattenedPath.replace('vergleich/', '')}`,
    },
    formattedDate: {
      type: 'string',
      resolve: (doc) =>
        format(parseISO(doc.publishedAt), 'd. MMMM yyyy', { locale: de }),
    },
  },
}));

// ── SOURCE ────────────────────────────────────────────────────────────────────

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Artikel, Cut, Methode, Vergleich],
  mdx: {
    // rehype / remark plugins can be added here later
  },
});
