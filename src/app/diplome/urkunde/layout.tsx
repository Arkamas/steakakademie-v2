import type { Metadata } from 'next';

export const metadata: Metadata = {
  // Preisangabe entfernt (08.09.2026): Die gedruckte Urkunde existiert noch nicht,
  // die Seite nimmt nur unverbindliche Vormerkungen an — ein Preis fuer etwas
  // Nichtexistentes ist irrefuehrend (§ 5 UWG).
  title: 'Grillmeister-Urkunde — digital kostenlos, gedruckt in Vorbereitung',
  description: 'Deine Grillmeister-Urkunde mit Name, Grad und Stufe: digital kostenlos zum Teilen. Die gedruckte Fassung ist in Vorbereitung — hier unverbindlich vormerken.',
  alternates: { canonical: 'https://steakakademie.de/diplome/urkunde' },
  openGraph: {
    title: 'Grillmeister-Urkunde — digital kostenlos, gedruckt in Vorbereitung',
    description: 'Urkunde mit deinem Namen, Grad und Stufe — digital gratis, gedruckte Fassung zum Vormerken.',
    url: 'https://steakakademie.de/diplome/urkunde',
    type: 'website',
  },
};

export default function UrkundeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
