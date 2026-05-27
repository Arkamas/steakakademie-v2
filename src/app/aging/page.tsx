import type { Metadata } from 'next';
import AgingClient from './AgingClient';

export const metadata: Metadata = {
  title: 'Precision Aging Matrix — Dry Aging von 14 bis 90 Tagen erklärt',
  description: 'Wie sich Zartheit, Umami-Tiefe und Aroma bei 14, 21, 28, 45 und 90 Tagen Dry Aging verändern — mit konkreten Temperatur-, Feuchtigkeits- und Gewichtsverlustwerten.',
  alternates: { canonical: 'https://steakakademie.de/aging' },
  openGraph: {
    title: 'Precision Aging Matrix — Dry Aging erklärt',
    description: 'Dry Aging von 14 bis 90 Tagen: Zartheit, Umami, Aroma, Temperatur und Feuchtigkeit — alles in einer Matrix.',
    url: 'https://steakakademie.de/aging',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@steakakademie' },
};

export default function AgingPage() {
  return <AgingClient />;
}
