import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { allSprintModuls } from 'contentlayer/generated';
import { collectionPageSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'KI-Projektsteuerung — Modulreihe | Gründung-Sprint',
  description:
    'Vier Module: dein Projekt mit KI in Jira + Confluence sauber aufsetzen und steuern — statt im Tool-Chaos zu ertrinken.',
  alternates: { canonical: 'https://steakakademie.de/gruendung-sprint/lernen' },
};

export default function SprintLernenIndex() {
  const module = allSprintModuls.slice().sort((a, b) => a.order - b.order);

  const collection = collectionPageSchema(
    'KI-Projektsteuerung — Modulreihe',
    '/gruendung-sprint/lernen',
    'Vier Module: dein Projekt mit KI in Jira + Confluence sauber aufsetzen und steuern.',
  );
  const breadcrumb = breadcrumbSchema([
    { name: 'Gründung-Sprint', url: '/gruendung-sprint' },
    { name: 'KI-Projektsteuerung', url: '/gruendung-sprint/lernen' },
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
            <Link href="/gruendung-sprint" className="hover:text-brand-fire transition-colors">Gründung-Sprint</Link>
            <ChevronRight size={12} />
            <span className="text-text-primary">KI-Projektsteuerung</span>
          </nav>

          {/* Header */}
          <div className="mb-12 pb-10 border-b-2 border-text-primary">
            <p className="text-xs font-sans font-bold tracking-widest uppercase text-brand-fire mb-3">
              Modulreihe · Gründung-Sprint
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-text-primary mb-4 leading-tight">
              KI-Projektsteuerung mit Atlassian
            </h1>
            <p className="font-body text-lg text-text-secondary max-w-content leading-relaxed">
              Vier Module. In rund 30 Minuten baust du mit KI ein Projekt-Backbone, das mitwächst statt zu
              zerfasern — Jira fürs Tun, Confluence fürs Wissen, eine einzige Wahrheitsquelle.
            </p>
          </div>

          {/* Module cards */}
          <ol className="grid gap-5">
            {module.map((m) => (
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
        </div>
      </main>

      <Footer />
    </>
  );
}
