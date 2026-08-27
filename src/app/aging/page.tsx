import type { Metadata } from 'next';
import AgingClient from './AgingClient';

export const metadata: Metadata = {
  title: 'Dry Aging von 14 bis 90 Tagen erklärt',
  description: 'Wie sich Zartheit, Umami-Tiefe und Aroma bei 14, 21, 28, 45 und 90 Tagen Dry Aging verändern — mit Temperatur-, Feuchtigkeits- und Gewichtsverlustwerten.',
  alternates: { canonical: 'https://steakakademie.de/aging' },
  openGraph: {
    title: 'Precision Aging Matrix — Dry Aging erklärt',
    description: 'Dry Aging von 14 bis 90 Tagen: Zartheit, Umami, Aroma, Temperatur und Feuchtigkeit — alles in einer Matrix.',
    url: 'https://steakakademie.de/aging',
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
    { '@type': 'ListItem', position: 3, name: 'Precision Aging Matrix', item: 'https://steakakademie.de/aging' },
  ],
};

export default function AgingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AgingClient />
    </>
  );
}
