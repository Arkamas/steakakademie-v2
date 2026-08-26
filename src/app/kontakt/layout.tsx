import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Fragen, Feedback oder Kooperationsanfragen? So erreichst du die Steakakademie — direkt, ohne Ticketsystem.',
  alternates: { canonical: 'https://steakakademie.de/kontakt' },
  openGraph: {
    title: 'Kontakt',
    description: 'So erreichst du die Steakakademie.',
    url: 'https://steakakademie.de/kontakt',
    type: 'website',
  },
};

export default function KontaktLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
