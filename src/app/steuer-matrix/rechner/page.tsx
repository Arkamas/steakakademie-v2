import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TaxCalculator from '@/components/steuer-matrix/TaxCalculator';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Steuer-Matrix Rechner',
  robots: { index: false, follow: false }, // Tool nicht indexieren
};

export default async function SteuerMatrixRechnerPage() {
  const supabase = createClient();

  // Auth prüfen
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login?redirectTo=/steuer-matrix/rechner');
  }

  // Zugang prüfen: aktives Booking für steuer-matrix?
  const { data: booking } = await supabase
    .from('bookings')
    .select('status, courses!inner(slug)')
    .eq('user_id', user.id)
    .eq('courses.slug', 'steuer-matrix')
    .eq('status', 'active')
    .maybeSingle();

  if (!booking) {
    redirect('/steuer-matrix?locked=1');
  }

  return (
    <>
      <Header />
      <main className="bg-surface-base min-h-screen">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Header */}
          <div className="mb-10">
            <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-3">
              Säule II — Steuer-Matrix
            </span>
            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-text-primary mb-3">
              EU-Steuervergleich für Solo-Selbstständige
            </h1>
            <p className="font-body text-text-secondary max-w-2xl">
              Gib deinen monatlichen Bruttoumsatz ein und vergleiche sofort, wie viel Netto
              in Deutschland, den Niederlanden, Frankreich, Spanien, Italien und Portugal
              tatsächlich übrig bleibt — inklusive Krankenversicherung, Einkommensteuer und
              aller Pflichtabgaben.
            </p>
          </div>

          <TaxCalculator />

        </div>
      </main>
      <Footer />
    </>
  );
}
