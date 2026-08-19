import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Impressum — Steakakademie',
  robots: { index: false, follow: false },
};

export default function ImpressumPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-base">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">

          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
            <ChevronRight size={12} />
            <span>Impressum</span>
          </nav>

          <h1 className="font-serif text-3xl font-bold text-text-primary mb-10">Impressum</h1>

          <div className="max-w-content space-y-8 font-body text-text-secondary leading-relaxed">

            <section>
              <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3">
                Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)
              </h2>
              <p>
                Uwe Yendell<br />
                Stahlsberg 73<br />
                42279 Wuppertal, Nordrhein-Westfalen
              </p>
            </section>

            <section>
              <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3">
                Kontakt
              </h2>
              <p>
                Telefon: 01520 1778340<br />
                E-Mail:{' '}
                <a href="mailto:pitmaster@steakakademie.de" className="text-brand-fire hover:underline">
                  pitmaster@steakakademie.de
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3">
                Verantwortlich i.S.d. § 18 Abs. 2 MStV (V.i.S.d.P.)
              </h2>
              <p>
                Verantwortlich für journalistisch-redaktionelle Inhalte<br />
                gemäß § 18 Abs. 2 Medienstaatsvertrag (MStV):
              </p>
              <p className="mt-2">
                Uwe Yendell<br />
                Stahlsberg 73<br />
                42279 Wuppertal
              </p>
            </section>

            <section>
              <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3">
                Umsatzsteuer
              </h2>
              <p>
                Gemäß § 19 UStG (Kleinunternehmerregelung) wird keine Umsatzsteuer
                berechnet und ausgewiesen. Eine Umsatzsteuer-Identifikationsnummer
                nach § 27 a UStG ist daher nicht erforderlich.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3">
                Zentrale Kontaktstelle nach dem Digital Services Act (DSA)
              </h2>
              <p className="mb-3">
                Gemäß Artikel 11 und 12 der Verordnung (EU) 2022/2065 über einen Binnenmarkt
                für digitale Dienste (Digital Services Act, DSA) benennen wir folgende zentrale
                Kontaktstelle für Behörden und Nutzer:
              </p>
              <p className="mb-3">
                <strong className="text-text-primary">Kontaktstelle für Nutzer:</strong><br />
                E-Mail:{' '}
                <a href="mailto:pitmaster@steakakademie.de" className="text-brand-fire hover:underline">
                  pitmaster@steakakademie.de
                </a><br />
                Sprachen: Deutsch, Englisch
              </p>
              <p>
                <strong className="text-text-primary">Kontaktstelle für Behörden:</strong><br />
                E-Mail:{' '}
                <a href="mailto:pitmaster@steakakademie.de" className="text-brand-fire hover:underline">
                  pitmaster@steakakademie.de
                </a><br />
                Sprachen: Deutsch, Englisch
              </p>
            </section>

            <section>
              <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3">
                Verbraucherstreitbeilegung
              </h2>
              <p className="mb-3">
                Die frühere EU-Plattform zur Online-Streitbeilegung (OS-Plattform) wurde von der
                Europäischen Kommission zum 20. Juli 2025 eingestellt.
              </p>
              <p>
                Unsere E-Mail-Adresse lautet: pitmaster@steakakademie.de
              </p>
            </section>

            <section>
              <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3">
                Verbraucherstreitbeilegung / Universalschlichtungsstelle
              </h2>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3">
                Haftungsausschluss
              </h2>
              <p>
                Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt.
                Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen
                wir jedoch keine Gewähr.
              </p>
            </section>

            <p className="text-sm text-text-muted pt-4 border-t border-border-subtle">
              Quelle:{' '}
              <a href="https://www.e-recht24.de" target="_blank" rel="noopener noreferrer" className="text-brand-fire hover:underline">
                eRecht24
              </a>
            </p>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
