import type { Metadata } from 'next';
import ManifestClient from './ManifestClient';

export const metadata: Metadata = {
  title: 'Das Steak-Manifest — 10 Thesen für ernsthafte Griller',
  description: 'Zehn unverhandelbare Prinzipien des ernsthaften Grillens. Qualität vor Quantität, Temperatur vor Bauchgefühl, Handwerk vor Hype. Das Manifest der Steakakademie.',
  alternates: { canonical: 'https://steakakademie.de/manifest' },
  openGraph: {
    title: 'Das Steak-Manifest — 10 Thesen für ernsthafte Griller',
    description: 'Zehn unverhandelbare Prinzipien des ernsthaften Grillens.',
    url: 'https://steakakademie.de/manifest',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@steakakademie' },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Startseite', item: 'https://steakakademie.de' },
    { '@type': 'ListItem', position: 2, name: 'Das Manifest', item: 'https://steakakademie.de/manifest' },
  ],
};

export default function ManifestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ManifestClient />
    </>
  );
}
