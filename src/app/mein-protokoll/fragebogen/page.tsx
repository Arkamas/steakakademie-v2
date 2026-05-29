import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { requireCourseAccess } from '@/lib/auth/require-course-access';
import FragebogenForm from './FragebogenForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Fragebogen — Mein Protokoll | Steakakademie',
  description: 'Beantworte 5 Fragen — das System generiert deinen persönlichen 8-Wochen-Grillplan.',
  robots: { index: false, follow: false },
};

export default async function FragebogenPage() {
  await requireCourseAccess('mein-protokoll', '/mein-protokoll/fragebogen');

  return (
    <>
      <Header />

      <main className="bg-surface-base">
        <section className="border-b border-border-subtle">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <nav
              className="flex items-center gap-1.5 text-xs font-sans text-text-muted mb-8"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <Link href="/mein-protokoll" className="hover:text-brand-gold transition-colors">Mein Protokoll</Link>
              <ChevronRight size={12} />
              <span className="text-text-secondary">Fragebogen</span>
            </nav>

            <div className="max-w-2xl mb-10">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-3">
                Der Fragebogen
              </span>
              <h1 className="font-serif text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                5 Fragen. Dann dein Plan.
              </h1>
              <p className="font-body text-base text-text-secondary leading-relaxed">
                Jede Antwort fließt direkt in deinen 8-Wochen-Plan. Je konkreter du bist,
                desto präziser passt der Plan zu deinem Setup. Die Generierung dauert
                bis zu 60 Sekunden.
              </p>
            </div>

            <FragebogenForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
