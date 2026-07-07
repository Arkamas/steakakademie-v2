import type { Metadata } from 'next';
import DiplomeClient from './DiplomeClient';
import { getPlattformPuls } from '@/lib/plattform-puls';

export const metadata: Metadata = {
  title: 'Grillmeister-Diplom — 10 Level BBQ-Ausbildung',
  description: 'Das einzige strukturierte BBQ-Diplom-System auf Deutsch: 10 Level von Bronze bis Grillmeister. Lerne systematisch, schalte Level frei, erhalte echte Urkunden per Post.',
  alternates: { canonical: 'https://steakakademie.de/diplome' },
  openGraph: {
    title: 'Grillmeister-Diplom — 10 Level BBQ-Ausbildung',
    description: 'Systematisch zum Grillmeister: 10 Level, echte Urkunden, klare Progression.',
    url: 'https://steakakademie.de/diplome',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@steakakademie' },
};

export default function DiplomePage() {
  return <DiplomeClient puls={getPlattformPuls()} />;
}
