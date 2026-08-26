import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diplom-System kennenlernen — interaktive Demo',
  description: 'Probiere das Grillmeister-Diplom-System: So funktioniert die Ausbildung von Bronze bis Meister — Stufen, Prüfungen und Urkunden im Überblick.',
  alternates: { canonical: 'https://steakakademie.de/diplome/simulation' },
  openGraph: {
    title: 'Diplom-System kennenlernen — Demo',
    description: 'So funktioniert die Grillmeister-Ausbildung: Stufen, Prüfungen, Urkunden.',
    url: 'https://steakakademie.de/diplome/simulation',
    type: 'website',
  },
};

export default function SimulationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
