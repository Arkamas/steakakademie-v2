import type { Metadata } from 'next';

// Privater Nutzerbereich: nicht indexieren.
export const metadata: Metadata = {
  title: 'Mein Bereich',
  robots: { index: false, follow: false },
};

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
