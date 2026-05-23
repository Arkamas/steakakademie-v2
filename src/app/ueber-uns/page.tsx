import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Flame, BookOpen, Award } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Über uns — Steakakademie',
  description: 'Steakakademie ist kein Rezept-Blog. Es ist eine Plattform für ernsthaftes BBQ-Wissen — methodisch, ehrlich, praxiserprobt.',
  alternates: { canonical: 'https://steakakademie.de/ueber-uns' },
};

export default function UeberUnsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-base">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">

          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
            <ChevronRight size={12} />
            <span>Über uns</span>
          </nav>

          {/* Hero */}
          <div className="mb-16">
            <p className="text-xs font-sans font-bold tracking-widest uppercase text-brand-fire mb-3">
              Über die Steakakademie
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-text-primary mb-6 leading-tight">
              Wissen, das du am Grill<br className="hidden sm:block" /> tatsächlich brauchst.
            </h1>
            <p className="font-body text-lg text-text-secondary leading-relaxed max-w-content">
              Steakakademie.de ist kein Rezept-Blog. Es ist eine Plattform für ernsthaftes
              BBQ-Wissen — methodisch erarbeitet, ehrlich formuliert, immer praxiserprobt.
              Hinter jedem Artikel steckt echter Aufwand am Grill, am Smoker, manchmal auch
              nachts um 2 beim Brisket.
            </p>
          </div>

          {/* Mission */}
          <div className="border-t-2 border-text-primary pt-12 mb-16">
            <div className="grid sm:grid-cols-3 gap-8">
              <div>
                <div className="w-10 h-10 flex items-center justify-center border-2 border-brand-fire text-brand-fire mb-4">
                  <Flame size={18} />
                </div>
                <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3">
                  Methodisch
                </h2>
                <p className="font-body text-sm text-text-secondary leading-relaxed">
                  Kerntemperaturen, Ruhezonen, Marmorierung-Scores — wir erklären das Warum,
                  nicht nur das Was. BBQ funktioniert besser, wenn man versteht, was passiert.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 flex items-center justify-center border-2 border-brand-fire text-brand-fire mb-4">
                  <BookOpen size={18} />
                </div>
                <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3">
                  Ehrlich
                </h2>
                <p className="font-body text-sm text-text-secondary leading-relaxed">
                  Keine gesponserten Testberichte. Kein Content-Marketing in Artikel-Form.
                  Was wir empfehlen, haben wir getestet. Was wir nicht empfehlen würden,
                  schreiben wir nicht auf.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 flex items-center justify-center border-2 border-brand-fire text-brand-fire mb-4">
                  <Award size={18} />
                </div>
                <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3">
                  Praxiserprobt
                </h2>
                <p className="font-body text-sm text-text-secondary leading-relaxed">
                  Kein Artikel verlässt die Redaktion, ohne dass die Theorie auch am Grill
                  bestätigt wurde. Fehler passieren — und wenn, benennen wir sie.
                </p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="border-t-2 border-text-primary pt-12 mb-16">
            <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-8">
              Wer schreibt hier
            </h2>

            <div className="space-y-10">
              {/* Marco */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-gold/30 to-brand-fire/20 flex items-center justify-center shrink-0">
                  <span className="font-serif text-3xl text-text-primary">M</span>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-primary mb-1">Marco, der Pitmaster</h3>
                  <p className="text-xs font-sans font-bold tracking-widest uppercase text-brand-fire mb-3">
                    Gründer & Chefredakteur
                  </p>
                  <p className="font-body text-sm text-text-secondary leading-relaxed mb-3">
                    Marco ist der Pitmaster hinter der Steakakademie. Mit über 15 Jahren Grillpraxis,
                    Dutzenden getesteten Cuts und einer Leidenschaft für texanisches BBQ bringt er
                    echte Praxiserfahrung in jeden Artikel. Er testet alle Produkte selbst, bevor
                    er sie empfiehlt — und hat für ein gutes Brisket auch schon mal eine Nachtschicht
                    am Smoker durchgezogen.
                  </p>
                  <Link href="/autoren/marco" className="text-xs font-sans font-bold tracking-wide uppercase text-brand-fire hover:underline">
                    Alle Artikel von Marco →
                  </Link>
                </div>
              </div>

              {/* Jonas */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-gold/30 to-brand-fire/20 flex items-center justify-center shrink-0">
                  <span className="font-serif text-3xl text-text-primary">J</span>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-primary mb-1">Jonas</h3>
                  <p className="text-xs font-sans font-bold tracking-widest uppercase text-brand-fire mb-3">
                    BBQ-Enthusiast & Equipment-Redakteur
                  </p>
                  <p className="font-body text-sm text-text-secondary leading-relaxed mb-3">
                    Jonas ist der Enthusiast im Team — immer dabei wenn neue Techniken ausprobiert
                    werden, immer hungrig auf das nächste Experiment. Er schreibt über
                    Einsteigerthemen, Equipment-Reviews und die kleinen Tricks, die den
                    Unterschied machen.
                  </p>
                  <Link href="/autoren/jonas" className="text-xs font-sans font-bold tracking-wide uppercase text-brand-fire hover:underline">
                    Alle Artikel von Jonas →
                  </Link>
                </div>
              </div>

              {/* Elena */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-gold/30 to-brand-fire/20 flex items-center justify-center shrink-0">
                  <span className="font-serif text-3xl text-text-primary">E</span>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-primary mb-1">Elena</h3>
                  <p className="text-xs font-sans font-bold tracking-widest uppercase text-brand-fire mb-3">
                    Food Science & Redaktion
                  </p>
                  <p className="font-body text-sm text-text-secondary leading-relaxed mb-3">
                    Elena bringt die wissenschaftliche Perspektive ein. Als Food-Enthusiastin mit
                    Hintergrund in Ernährungswissenschaften schreibt sie über die Chemie hinter
                    dem Grillen — warum die Maillard-Reaktion so faszinierend ist, was beim
                    Dry Aging passiert und warum Salzen vor dem Grillen kein Mythos ist.
                  </p>
                  <Link href="/autoren/elena" className="text-xs font-sans font-bold tracking-wide uppercase text-brand-fire hover:underline">
                    Alle Artikel von Elena →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Diploma / CTA */}
          <div className="border-t-2 border-text-primary pt-12">
            <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-4">
              Grillmeister-Diplom
            </h2>
            <p className="font-body text-text-secondary leading-relaxed mb-6 max-w-content">
              Wissen ist gut — nachgewiesenes Wissen ist besser. Auf Steakakademie.de kannst
              du dein BBQ-Wissen in einem strukturierten Lehrgang aufbauen und mit einem
              echten Grillmeister-Diplom (Bronze bis Meister) abschließen.
            </p>
            <Link
              href="/diplome"
              className="inline-block font-sans text-sm font-bold tracking-wide uppercase px-6 py-3 bg-brand-fire text-white hover:bg-brand-fire/90 transition-colors"
            >
              Zu den Diplomen →
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
