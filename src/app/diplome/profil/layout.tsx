import type { Metadata } from 'next';

// Eigene Profil-Verwaltung: privat, nicht indexieren (öffentliche Vita liegt unter /griller/<slug>).
export const metadata: Metadata = {
  title: 'Mein Profil',
  robots: { index: false, follow: false },
};

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
