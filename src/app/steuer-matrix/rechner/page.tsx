import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TaxCalculator from '@/components/steuer-matrix/TaxCalculator';
import { requireCourseAccess } from '@/lib/auth/require-course-access';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title:  'Steuer-Matrix Rechner',
  robots: { index: false, follow: false },
};

export default async function SteuerMatrixRechnerPage() {
  const { user, course } = await requireCourseAccess(
    'steuer-matrix',
    '/steuer-matrix/rechner',
  );

  return (
    <>
      <Header />
      <main className="bg-surface-base min-h-screen">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="mb-10 flex items-start justify-between gap-6">
            <div>
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-3">
                Säule II — {course.title}
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
            <span className="text-xs font-sans text-text-tertiary whitespace-nowrap mt-2">
              {user.email}
            </span>
          </div>

          <TaxCalculator />

        </div>
      </main>
      <Footer />
    </>
  );
}
