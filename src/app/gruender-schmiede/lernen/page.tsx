import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { allSprintModuls } from 'contentlayer/generated';
import { collectionPageSchema, breadcrumbSchema } from '@/lib/schema';
import BuerokratieHinweis from '@/components/gruendung/BuerokratieHinweis';
import WerkzeugHinweis from '@/components/gruendung/WerkzeugHinweis';

export const metadata: Metadata = {
  title: 'Die Methode: KI-gesteuert ein Business bauen | Gründer-Schmiede',
  description:
    'Sechs Module: vom Chef-Prinzip über KI-Projektsteuerung mit Jira + Confluence bis zum täglichen Arbeits-Loop — wie du KI-gesteuert ein digitales Business aufbaust.',
  alternates: { canonical: 'https://steakakademie.de/gruender-schmiede/lernen' },
};

export default function SprintLernenIndex() {
  const sprintModule = allSprintModuls.slice().sort((a, b) => a.order - b.order);

  const collection = collectionPageSchema(
    'Die Methode: KI-gesteuert ein Business bauen',
    '/gruender-schmiede/lernen',
    'Sechs Module — vom Chef-Prinzip bis zum täglichen Arbeits-Loop.',
  );
  const breadcrumb = breadcrumbSchema([
    { name: 'Gründer-Schmiede', url: '/gruender-schmiede' },
    { name: 'Die Methode', url: '/gruender-schmiede/lernen' },
  ]);

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <main className="bg-surface-base min-h-screen">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-fire transition-colors">Start</Link>
            <ChevronRight size={12} />
            <Link href="/gruender-schmiede" className="hover:text-brand-fire transition-colors">Gründer-Schmiede</Link>
            <ChevronRight size={12} />
            <span className="text-text-primary">Die Methode</span>
          </nav>

          {/* Header */}
          <div className="mb-12 pb-10 border-b-2 border-text-primary">
            <p className="text-xs font-sans font-bold tracking-widest uppercase text-brand-fire mb-3">
              Modulreihe · Gründer-Schmiede
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-text-primary mb-4 leading-tight">
              KI-gesteuert ein Business bauen
            </h1>
            <p className="font-body text-lg text-text-secondary max-w-content leading-relaxed">
              Sechs Module — meine echte Methode. Vom Chef-Prinzip über das KI-gesteuerte Projekt-Backbone
              (Jira fürs Tun, Confluence fürs Wissen, eine einzige Wahrheitsquelle) bis zum täglichen
              Arbeits-Loop, der aus begrenzter Zeit echten Fortschritt macht.
            </p>
          </div>

          {/* Werkzeug-Kosten ehrlich offenlegen */}
          <div className="mb-8">
            <WerkzeugHinweis />
          </div>

          {/* Module cards */}
          <ol className="grid gap-5">
            {sprintModule.map((m) => (
              <li key={m.slug}>
                <Link
                  href={m.url}
                  className="group flex gap-5 p-6 bg-surface-elevated border border-border-subtle hover:border-brand-fire transition-colors"
                >
                  <span className="font-serif text-3xl font-bold text-brand-gold shrink-0 w-10">{m.order}</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-serif text-xl font-bold text-text-primary group-hover:text-brand-fire transition-colors mb-2">
                      {m.title}
                    </h2>
                    <p className="font-body text-sm text-text-secondary leading-relaxed mb-3">{m.excerpt}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-sans text-text-muted">
                      <Clock size={12} />
                      {m.dauer}
                    </span>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-text-muted group-hover:text-brand-fire transition-colors shrink-0 self-center"
                  />
                </Link>
              </li>
            ))}
          </ol>

          {/* Bürokratie-Hinweis — Gründungs-Neulinge abholen */}
          <div className="mt-10">
            <BuerokratieHinweis />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
