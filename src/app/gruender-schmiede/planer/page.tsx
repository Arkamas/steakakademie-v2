import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ArbeitszeitPlaner from '@/components/gruendung/ArbeitszeitPlaner';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  // Uwe, 02.09.2026: noindex — Gruender-Bereich ist aus der Steakakademie ausgebaut
  // (Nav/Footer seit 641b346, Sitemap seit heute). CLAUDE.md Abschnitt 10.
  robots: { index: false, follow: false },
  title: 'Arbeitszeit-Planer für deinen Timetable',
  description:
    'Trag deine verfügbare Zeit pro Tag ein — der Planer verteilt alle Gründungs- und Aufbau-Aufgaben auf einen realistischen Timetable und hält ihn aktuell.',
  alternates: { canonical: 'https://steakakademie.de/gruender-schmiede/planer' },
};

export default function PlanerPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'Gründer-Schmiede', url: '/gruender-schmiede' },
    { name: 'Arbeitszeit-Planer', url: '/gruender-schmiede/planer' },
  ]);

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <main className="min-h-screen bg-surface-base">
        <div className="mx-auto max-w-editorial px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-1.5 font-sans text-xs text-text-muted" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-brand-fire">Start</Link>
            <ChevronRight size={12} />
            <Link href="/gruender-schmiede" className="transition-colors hover:text-brand-fire">Gründer-Schmiede</Link>
            <ChevronRight size={12} />
            <span className="text-text-secondary">Arbeitszeit-Planer</span>
          </nav>

          {/* Intro */}
          <header className="mb-10 max-w-3xl">
            <div className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-brand-fire">
              Zeit ÷ Aufgaben
            </div>
            <h1 className="font-serif text-3xl leading-tight text-text-primary sm:text-4xl">
              Dein realistischer Timetable
            </h1>
            <p className="mt-4 font-body text-[1.05rem] leading-relaxed text-text-secondary">
              Kein Wunschdenken, sondern Mathematik: Sag, wie viel Zeit du pro Tag hast — der Planer
              verteilt alle anstehenden Aufgaben darauf und zeigt dir, wann du fertig bist. Hakst du
              etwas ab oder kommt Neues dazu, rechnet er automatisch neu. So wächst der Plan mit deinem
              Projekt.
            </p>
          </header>

          <ArbeitszeitPlaner />

          {/* Zurück zur Methode */}
          <div className="mt-16 border-t border-border-subtle pt-8">
            <Link
              href="/gruender-schmiede/lernen/06-der-arbeits-loop"
              className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-fire transition-colors hover:opacity-80"
            >
              Zur Methode: Der Arbeits-Loop
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
