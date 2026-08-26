import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grillmeister-Urkunde — digital kostenlos, gedruckt per Post',
  description: 'Deine Grillmeister-Urkunde: digital kostenlos zum Teilen, auf Wunsch gedruckt und per Post (9,99 € + 4,99 € Porto). Mit Name und erreichter Stufe.',
  alternates: { canonical: 'https://steakakademie.de/diplome/urkunde' },
  openGraph: {
    title: 'Grillmeister-Urkunde — digital kostenlos, gedruckt per Post',
    description: 'Urkunde mit deinem Namen und deiner Stufe — digital gratis, gedruckt per Post.',
    url: 'https://steakakademie.de/diplome/urkunde',
    type: 'website',
  },
};

export default function UrkundeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
