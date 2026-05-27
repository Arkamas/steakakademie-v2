import type { Metadata } from 'next';
import RettungClient from './RettungClient';

export const metadata: Metadata = {
  title: 'Steak-Rettungs-Bibliothek — Was tun wenn\'s schiefläuft?',
  description: '6 häufigste Grillkatastrophen und wie man sie rettet: zu durch, zu roh, trocken, verbrennt außen, kein Kruste, Fleisch klebt. Mit Schritt-für-Schritt-Anleitungen.',
  alternates: { canonical: 'https://steakakademie.de/rettung' },
  openGraph: {
    title: 'Steak-Rettungs-Bibliothek — 6 Grillkatastrophen und ihre Lösung',
    description: 'Steak zu durch, zu roh oder trocken? Unsere Rettungs-Bibliothek hilft sofort.',
    url: 'https://steakakademie.de/rettung',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@steakakademie' },
};

export default function RettungPage() {
  return <RettungClient />;
}
