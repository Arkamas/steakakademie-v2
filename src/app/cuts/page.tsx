import type { Metadata } from 'next';
import CutsClient from './CutsClient';

export const metadata: Metadata = {
  title: 'Beef Cuts — Alle Rinderschnitte erklärt | Steakakademie',
  description: 'Interaktiver Rindfleisch-Cut-Explorer: Ribeye, Filet, Entrecôte, Brisket, Flank Steak und mehr — Lage am Tier, Marmorierung, ideale Garmethode und Kerntemperatur für jeden Cut.',
  // Temporär noindex: Cut-Atlas wird neu gebaut (eigene KI-Cut-Fotos, Otto/Carneo-
  // Niveau). Solange nicht indexieren, um das Suchwort "Rindercuts" nicht mit der
  // aktuellen Fassung zu verbrennen. Nach dem Redesign wieder auf index.
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://steakakademie.de/cuts' },
  openGraph: {
    title: 'Beef Cuts — Alle Rinderschnitte von Ribeye bis Brisket',
    description: 'Wo sitzt welcher Cut? Interaktiver Explorer für alle wichtigen Rindfleisch-Schnitte.',
    url: 'https://steakakademie.de/cuts',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@steakakademie' },
};

export default function CutsPage() {
  return <CutsClient />;
}
