import type { Metadata } from 'next';
import TerroirClient from './TerroirClient';

export const metadata: Metadata = {
  title: 'Meat Terroir — Herkunft prägt Geschmack',
  description: 'Wie Herkunft, Rasse, Fütterung und Klima den Geschmack von Fleisch prägen. Japan Wagyu, Argentinien Pampas, USA Prime, Schottland Highland — 6 Herkunftsregionen im Vergleich.',
  alternates: { canonical: 'https://steakakademie.de/terroir' },
  openGraph: {
    title: 'Meat Terroir — Wie Herkunft den Geschmack prägt',
    description: 'Wagyu, Pampas, Highland und mehr: 6 Herkunftsregionen und ihr Einfluss auf Zartheit, Marmorierung und Aroma.',
    url: 'https://steakakademie.de/terroir',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@steakakademie' },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Startseite', item: 'https://steakakademie.de' },
    { '@type': 'ListItem', position: 2, name: 'Wissen', item: 'https://steakakademie.de/wissen' },
    { '@type': 'ListItem', position: 3, name: 'Meat Terroir', item: 'https://steakakademie.de/terroir' },
  ],
};

export default function TerroirPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <TerroirClient />
    </>
  );
}
