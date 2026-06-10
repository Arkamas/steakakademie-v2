import type { Metadata } from 'next';
import { Flame, Thermometer, BookOpen, Soup } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NewsletterCapture from '@/components/persoenlichkeiten/NewsletterCapture';

export const metadata: Metadata = {
  title: 'Der Wissens-Brief — kostenlose BBQ-Tipps per Mail | Steakakademie',
  description:
    'Jeden Freitag ein Stück BBQ-Wissen, das bleibt: Kerntemperaturen, Cuts, Technik — präzise und ehrlich. Kostenlos, jederzeit abmeldbar. Die Steakakademie direkt ins Postfach.',
  alternates: { canonical: 'https://steakakademie.de/newsletter' },
  openGraph: {
    title: 'Der Steakakademie Wissens-Brief',
    description: 'Jeden Freitag: ein Meister, eine Technik, ein Rezept. Kostenlos per Mail.',
    url: 'https://steakakademie.de/newsletter',
    type: 'website',
  },
};

const VORTEILE = [
  { Icon: Thermometer, title: 'Präzises Garwissen', desc: 'Kerntemperaturen und Garzeiten, die wirklich stimmen — keine Faustregeln aus dem Internet.' },
  { Icon: BookOpen, title: 'Technik, die bleibt', desc: 'Reverse Sear, Maillard, Räuchern — verständlich erklärt, sofort am Grill anwendbar.' },
  { Icon: Soup, title: 'Cuts & Rezepte', desc: 'Vom richtigen Zuschnitt bis zum nachkochbaren Rezept mit Gramm-, Millimeter- und Grad-Angaben.' },
];

export default function NewsletterPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-base">
        {/* Hero */}
        <section className="bg-surface-dark border-b border-brand-gold/15">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 border border-brand-fire/30 rounded-full">
              <Flame size={13} className="text-brand-fire" />
              <span className="text-[10px] font-sans font-bold tracking-[0.16em] uppercase text-brand-fire">
                Der Wissens-Brief
              </span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-text-light leading-tight mb-5 max-w-3xl mx-auto">
              Jeden Freitag ein Stück BBQ-Wissen, das bleibt.
            </h1>
            <p className="font-body text-lg text-text-light/65 leading-relaxed max-w-2xl mx-auto">
              Kein Spam, keine Clickbait-Listen. Das Destillat aus Pitmaster-Wissen,
              echten Kerntemperaturen und Meister-Techniken — direkt ins Postfach. Kostenlos.
            </p>
          </div>
        </section>

        {/* Capture + Vorteile */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-content mx-auto">
            <NewsletterCapture context="BBQ" />

            {/* Sofort-Wert: der Spickzettel */}
            <p className="mt-4 text-center font-body text-sm text-text-secondary">
              Als Willkommensgeschenk bekommst du den{' '}
              <a href="/kerntemperatur-spickzettel" className="font-semibold text-brand-fire hover:underline">
                Kerntemperatur-Spickzettel
              </a>{' '}
              — alle Garstufen auf einer Seite, druckfertig für die Grillstation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              {VORTEILE.map(({ Icon, title, desc }) => (
                <div key={title} className="text-center sm:text-left">
                  <div className="w-9 h-9 flex items-center justify-center mb-3 mx-auto sm:mx-0 bg-brand-gold/12 border border-brand-gold/25">
                    <Icon size={16} className="text-brand-gold" />
                  </div>
                  <h2 className="font-serif text-base font-bold text-text-primary mb-1">{title}</h2>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <p className="text-center font-body text-xs text-text-muted mt-12">
              Mit der Anmeldung bestätigst du den Erhalt des Newsletters (Double-Opt-in).
              Abmeldung jederzeit mit einem Klick. Keine Weitergabe deiner Daten —
              Details in der <a href="/datenschutz" className="text-brand-fire hover:underline">Datenschutzerklärung</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
