import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Crown, Users, Sparkles, Gift, Mail, Check } from 'lucide-react';

// Premium-Bereich „Steakakademie Privé" — B2B Corporate-Event-Gifting + High-End.
// Anfrage-basiert (kein Live-Checkout), bewusst noindex bis Angebot + Event-AGB/
// Haftung/Gewerbe geklärt sind (Rechts-Gate, CLAUDE.md Regel 12). Pakete = Entwurf.
export const metadata: Metadata = {
  // `absolute`: die Marke steht schon im Titel selbst — das Root-Template
  // wuerde ein zweites " | Steakakademie" anhaengen und Platz in der
  // Suchergebnis-Zeile verbrennen (Google schneidet ab ~60 Zeichen ab).
  title: { absolute: 'Steakakademie Privé — Premium & Corporate' },
  description: 'Exklusive Grill-Erlebnisse und Premium-Coaching für Unternehmen und besondere Anlässe.',
  robots: { index: false, follow: false },
};

const INQUIRY = 'info@steakakademie.de';
const mailto = (paket: string) =>
  `mailto:${INQUIRY}?subject=${encodeURIComponent(`Privé-Anfrage: ${paket}`)}`;

const PACKAGES = [
  {
    icon: Sparkles,
    name: 'Privé Coaching',
    price: 'ab 990 €',
    tagline: '1:1 mit dem Pitmaster',
    points: ['Drei persönliche Live-Sessions', 'Individuelle Technik- & Cut-Analyse', 'Voll digital — ortsunabhängig'],
    cta: 'Anfragen',
  },
  {
    icon: Users,
    name: 'Team-Grillerlebnis',
    price: 'ab 2.490 €',
    tagline: 'Das Event fürs Team',
    points: ['Live-/Hybrid-Grillevent für eine Gruppe', 'Vom Feuer bis zum perfekten Steak', 'Ideal als Mitarbeiter-Incentive'],
    cta: 'Anfragen',
    featured: true,
  },
  {
    icon: Crown,
    name: 'Corporate Maßgeschneidert',
    price: 'auf Anfrage',
    tagline: 'Nach Maß für Unternehmen',
    points: ['Ort, Umfang & Catering individuell', 'Kundengeschenk oder Firmen-Event', 'Angebot & Rechnung auf Wunsch'],
    cta: 'Angebot anfordern',
  },
];

export default function PrivePage() {
  return (
    <>
      <Header />
      <main className="bg-surface-dark">
        {/* Hero */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] font-sans font-bold tracking-[0.25em] uppercase text-brand-gold mb-6">
            <Crown size={14} /> Steakakademie Privé
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-text-light leading-[1.08] mb-5">
            Grillkunst auf Einladung
          </h1>
          <p className="font-body text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Exklusive Erlebnisse und Premium-Begleitung für Unternehmen, Teams und besondere Anlässe —
            persönlich kuratiert vom Pitmaster.
          </p>
        </section>

        {/* Pakete */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.name}
                  className={`relative flex flex-col p-7 border ${
                    p.featured ? 'border-brand-gold bg-surface-card' : 'border-border-subtle bg-surface-base'
                  }`}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-7 bg-brand-gold text-ink text-[10px] font-sans font-bold tracking-widest uppercase px-3 py-1">
                      Beliebt
                    </span>
                  )}
                  <Icon size={26} className="text-brand-gold mb-4" />
                  <h2 className="font-serif text-2xl font-bold text-text-light mb-1">{p.name}</h2>
                  <p className="text-sm font-sans text-text-muted mb-4">{p.tagline}</p>
                  <p className="font-sans text-xl font-bold text-brand-gold mb-5">{p.price}</p>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 font-body text-sm text-text-secondary">
                        <Check size={15} className="text-brand-gold mt-0.5 shrink-0" /> {pt}
                      </li>
                    ))}
                  </ul>
                  <a href={mailto(p.name)} className="btn-affiliate justify-center">
                    <Mail size={15} /> {p.cta}
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* Warum Privé / Trust */}
        <section className="max-w-content mx-auto px-4 sm:px-6 py-14 text-center border-t border-border-subtle">
          <Gift size={32} className="text-brand-gold mx-auto mb-5" />
          <h2 className="font-serif text-3xl font-bold text-text-light mb-4">Ein Geschenk, das in Erinnerung bleibt</h2>
          <p className="font-body text-text-secondary leading-relaxed mb-4">
            Hinter jedem Privé-Erlebnis steht <strong className="text-text-primary">Uwe Yendell</strong> — Profi-Koch,
            Gastronom und Pitmaster. Kein anonymer Gutschein von der Stange, sondern persönlich begleitete Grillkunst.
          </p>
          <p className="font-body text-sm text-text-muted leading-relaxed">
            Für Mitarbeiter-Incentives, Kundengeschenke, Jubiläen und alle, die mehr verschenken wollen als ein Produkt.
            Gutscheine sind 3 Jahre gültig.
          </p>
        </section>

        {/* Anfrage */}
        <section className="max-w-content mx-auto px-4 sm:px-6 pb-20 text-center">
          <div className="bg-surface-card border border-brand-gold/40 p-8">
            <h2 className="font-serif text-2xl font-bold text-text-light mb-3">Sprich direkt mit uns</h2>
            <p className="font-body text-text-secondary mb-6">
              Erzähl uns von deinem Anlass, der Gruppengröße und deinem Wunschtermin — wir machen ein passendes Angebot.
            </p>
            <a href={mailto('Allgemeine Anfrage')} className="btn-affiliate inline-flex justify-center text-base px-8">
              <Mail size={16} /> Anfrage senden
            </a>
            <p className="text-xs font-sans text-text-muted mt-4">
              oder direkt:{' '}
              <a href={`mailto:${INQUIRY}`} className="underline hover:text-brand-gold">{INQUIRY}</a>
            </p>
          </div>
          <p className="text-[11px] font-sans text-text-muted mt-6">
            Es gelten unsere <Link href="/agb" className="underline hover:text-brand-gold">AGB</Link>.
            Live-Events nach individueller Vereinbarung.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
