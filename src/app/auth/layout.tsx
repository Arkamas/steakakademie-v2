import type { Metadata } from 'next';

// Login/Auth: keine Index-relevanten Seiten.
export const metadata: Metadata = {
  title: 'Anmelden',
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
