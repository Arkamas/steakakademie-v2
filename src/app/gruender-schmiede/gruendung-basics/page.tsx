import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GruendungsBuerokratie from '@/components/gruendung/GruendungsBuerokratie';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Das Komplettikon — komplettes Gründer-Nachschlagewerk | Gründer-Schmiede',
  description:
    'Die komplette Orientierung für deinen Start in die Selbständigkeit: Schritte zum Status, was beantragt werden muss und welche Kosten in den ersten 6 Monaten ab Gewerbeanmeldung auf dich zukommen. Keine Steuer-/Rechtsberatung.',
  alternates: { canonical: 'https://steakakademie.de/gruender-schmiede/gruendung-basics' },
};

export default function GruendungBasicsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'Gründer-Schmiede', url: '/gruender-schmiede' },
    { name: 'Das Komplettikon', url: '/gruender-schmiede/gruendung-basics' },
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
            <span className="text-text-secondary">Das Komplettikon</span>
          </nav>

          {/* Intro */}
          <header className="mb-12 max-w-3xl">
            <div className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-brand-fire">
              Gründer-Schmiede · Das Komplettikon
            </div>
            <h1 className="font-serif text-3xl leading-tight text-text-primary sm:text-4xl">
              Das Komplettikon — dein komplettes Gründer-Nachschlagewerk
            </h1>
            <p className="mt-4 font-body text-[1.05rem] leading-relaxed text-text-secondary">
              Alles, was du fürs Gründen brauchst, an einer Stelle. Die Methode in der Gründer-Schmiede
              dreht sich darum, wie du KI-gesteuert ein digitales Business aufbaust — aber bevor du
              loslegst, musst du formal „selbständig&quot; werden, und genau hier verlieren viele den
              Überblick. Das Komplettikon holt dich ab, auch wenn du noch nie mit Gewerbe oder
              Freiberuflichkeit zu tun hattest: Was du angehen musst, was du beantragst, und was dich
              die ersten 6 Monate kostet.
            </p>
          </header>

          <GruendungsBuerokratie />

          {/* Zurück zur Methode */}
          <div className="mt-16 border-t border-border-subtle pt-8">
            <Link
              href="/gruender-schmiede/lernen"
              className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-fire transition-colors hover:opacity-80"
            >
              Weiter zur Methode: KI-Projektsteuerung
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
