import type { Metadata } from 'next';
import TerroirClient from './TerroirClient';

export const metadata: Metadata = {
  title: 'Meat Terroir — Herkunft prägt Geschmack | Steakakademie',
  description: 'Wie Herkunft, Rasse, Fütterung und Klima den Geschmack von Fleisch prägen. Japan Wagyu, Argentinien Pampas, USA Prime, Schottland Highland — 6 Herkunftsregionen im Vergleich.',
  alternates: { canonical: 'https://steakakademie.de/terroir' },
  openGraph: {
    title: 'Meat Terroir — Wie Herkunft den Geschmack prägt',
    description: 'Wagyu, Pampas, Highland und mehr: 6 Herkunftsregionen und ihr Einfluss auf Zartheit, Marmorierung und Aroma.',
    url: 'https://steakakademie.de/terroir',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@steakakademie' },
};

export default function TerroirPage() {
  return <TerroirClient />;
}
