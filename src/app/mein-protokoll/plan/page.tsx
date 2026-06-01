import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/server';
import { requireCourseAccess } from '@/lib/auth/require-course-access';
import { PlanSchema, type Plan } from '@/lib/mein-protokoll/schema';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dein Plan — Mein Protokoll | Steakakademie',
  description: 'Dein persönlicher 8-Wochen-Grillplan.',
  robots: { index: false, follow: false },
};

export default async function PlanPage() {
  const { user } = await requireCourseAccess('mein-protokoll', '/mein-protokoll/plan');

  const supabase = createClient();
  const { data: row } = await supabase
    .from('protokolle')
    .select('id, plan, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Noch kein Plan generiert → zurück zum Fragebogen
  if (!row?.plan) {
    return (
      <>
        <Header />
        <main className="bg-surface-base">
          <section className="border-b border-border-subtle">
            <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
              <h1 className="font-serif text-3xl font-bold text-text-primary mb-4">
                Noch kein Plan vorhanden
              </h1>
              <p className="font-body text-text-secondary mb-8">
                Fülle den Fragebogen aus — dein 8-Wochen-Plan wird in Minuten generiert.
              </p>
              <Link
                href="/mein-protokoll/fragebogen"
                className="inline-flex items-center gap-2 px-7 py-3.5 font-sans font-bold text-base"
                style={{ background: '#C8882A', color: '#0D0A06' }}
              >
                Zum Fragebogen <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const parsed = PlanSchema.safeParse(row.plan);
  if (!parsed.success) {
    return (
      <>
        <Header />
        <main className="bg-surface-base">
          <section className="border-b border-border-subtle">
            <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
              <h1 className="font-serif text-3xl font-bold text-text-primary mb-4">
                Plan konnte nicht geladen werden
              </h1>
              <p className="font-body text-text-secondary mb-8">
                Bitte generiere deinen Plan erneut. Falls das Problem bleibt:
                pitmaster@steakakademie.de
              </p>
              <Link
                href="/mein-protokoll/fragebogen"
                className="inline-flex items-center gap-2 px-7 py-3.5 font-sans font-bold text-base"
                style={{ background: '#C8882A', color: '#0D0A06' }}
              >
                Erneut generieren <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const plan: Plan = parsed.data;

  return (
    <>
      <Header />

      <main className="bg-surface-base print:bg-white">
        <section className="border-b border-border-subtle print:border-0">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <nav
              className="print:hidden flex items-center gap-1.5 text-xs font-sans text-text-muted mb-8"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <Link href="/mein-protokoll" className="hover:text-brand-gold transition-colors">Mein Protokoll</Link>
              <ChevronRight size={12} />
              <span className="text-text-secondary">Dein Plan</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-3">
                  Dein persönlicher 8-Wochen-Plan
                </span>
                <h1 className="font-serif text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                  Mein Protokoll
                </h1>
                <p className="font-body text-base text-text-secondary leading-relaxed">
                  {plan.intro}
                </p>
              </div>
              <PrintButton />
            </div>

            {/* Schwerpunkte */}
            <div className="mb-12 border border-brand-gold/20 p-6" style={{ background: 'rgba(200,136,42,0.04)' }}>
              <p className="font-sans text-[10px] font-bold tracking-[0.14em] uppercase text-brand-gold mb-4">
                Deine Schwerpunkte über 8 Wochen
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plan.focusAreas.map((area, i) => (
                  <li key={i} className="flex items-start gap-2 font-body text-sm text-text-secondary">
                    <ChevronRight size={14} className="text-brand-gold shrink-0 mt-0.5" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            {/* Wochen */}
            <div className="space-y-8">
              {plan.weeks.map((w) => (
                <div
                  key={w.week}
                  className="border border-border-subtle p-6 break-inside-avoid"
                >
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-sans text-xs font-bold" style={{ color: 'rgba(200,136,42,0.6)' }}>
                      Woche {w.week}
                    </span>
                  </div>
                  <h2 className="font-serif text-xl font-bold text-text-primary mb-2">{w.theme}</h2>
                  {w.description && (
                    <p className="font-body text-sm text-text-secondary leading-relaxed mb-4">
                      {w.description}
                    </p>
                  )}

                  <div className="space-y-4">
                    {w.sessions.map((s, si) => (
                      <div
                        key={si}
                        className="border-l-2 pl-4 py-1"
                        style={{ borderColor: 'rgba(200,136,42,0.3)' }}
                      >
                        <p className="font-sans text-[10px] font-bold tracking-[0.12em] uppercase text-text-muted mb-2">
                          Session {si + 1}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
                          {[
                            { label: 'Cut', value: s.cut },
                            { label: 'Methode', value: s.method },
                            { label: 'Grill-/Deckeltemp.', value: s.grillTemp },
                            { label: 'Kerntemp.', value: s.targetTemp },
                            { label: 'Zeitplanung', value: s.timePlanning },
                          ].filter((x) => x.value).map(({ label, value }) => (
                            <div key={label}>
                              <p className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-text-muted mb-0.5">
                                {label}
                              </p>
                              <p className="font-serif text-sm font-bold text-text-primary">{value}</p>
                            </div>
                          ))}
                        </div>
                        {s.process && (
                          <p className="font-body text-sm text-text-secondary leading-relaxed mb-2">
                            <span className="font-bold text-text-primary">Ablauf: </span>
                            {s.process}
                          </p>
                        )}
                        <p className="font-body text-sm text-text-secondary leading-relaxed">
                          <span className="font-bold text-text-primary">Erfolgskriterium: </span>
                          {s.successCriterion}
                        </p>
                      </div>
                    ))}
                  </div>

                  {w.note && (
                    <p className="font-body text-sm text-text-secondary italic mt-4 pt-4 border-t border-border-subtle">
                      {w.note}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Abschluss */}
            <div className="mt-12 border-t border-brand-gold/20 pt-8">
              <p className="font-serif text-lg text-text-primary leading-relaxed max-w-2xl">
                {plan.closingNote}
              </p>
            </div>

            <div className="print:hidden mt-10 flex flex-wrap gap-4">
              <PrintButton />
              <Link
                href="/mein-protokoll/fragebogen"
                className="inline-flex items-center gap-2 px-5 py-2.5 font-sans text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: '#C8882A', color: '#0D0A06' }}
              >
                Neuen Plan generieren
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
