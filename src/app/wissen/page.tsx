import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, BookOpen, Flame } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { collectionPageSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'BBQ-Wissen — Fleischkunde, Techniken & Wissenschaft des Grillens',
  description:
    'BBQ-Wissen: Maillard-Reaktion, Dry-Aging-Enzyme, Kerntemperaturen und Marmorierung. Wissenschaftlich fundiert, praxisnah — echte Warenkunde für Grillmeister.',
  alternates: { canonical: 'https://steakakademie.de/wissen' },
  openGraph: {
    title: 'BBQ-Wissen: Fleischkunde & Grilltechnik | Steakakademie',
    description: 'Maillard-Reaktion, Dry-Aging, Kerntemperaturen — wissenschaftlich fundiert, praxisnah erklärt.',
    url: 'https://steakakademie.de/wissen',
    type: 'website',
  },
};

const WISSEN_CLUSTER = [
  {
    kicker: 'Thermik & Messtechnik',
    title: 'Kerntemperaturen — Der komplette Guide',
    href: '/wissen/kerntemperaturen',
    excerpt:
      'Warum 54 °C medium rare ist, aber 55 °C schon zu weit geht — Carry-over, Resting, Plateauphase und der Unterschied zwischen Oberflächen- und Kernmessung.',
    tags: ['Kerntemperatur', 'Carry-over', 'Resting', 'Thermometer'],
    badge: 'Pillar Page',
  },
  {
    kicker: 'Chemie des Grillens',
    title: 'Maillard-Reaktion: Die Wissenschaft der Kruste',
    href: '/wissen',
    excerpt:
      'Aminosäuren + reduzierende Zucker + Hitze = 1.000+ Aromastoffe. Warum Oberhitzegrills mit 800 °C eine andere Kruste erzeugen als Holzkohle bei 350 °C.',
    tags: ['Maillard', 'Röstaromen', 'Oberhitze', 'Kruste'],
    badge: 'Bald verfügbar',
  },
  {
    kicker: 'Fleischkunde & Reifung',
    title: 'Dry-Aging: Enzyme, Zeit und Geschmack',
    href: '/wissen',
    excerpt:
      'Cathepsine und Calpaine bauen Bindegewebe enzymatisch ab — bei 1–3 °C, kontrollierter Luftfeuchtigkeit und bis zu 90 Tagen Reifezeit entsteht Nussigkeit und Butterweichheit.',
    tags: ['Dry-Aging', 'Enzyme', 'Reifung', 'Autolyse'],
    badge: 'Bald verfügbar',
  },
  {
    kicker: 'Marmorierung & Qualität',
    title: 'Intramuskuläres Fett: Marmorierung verstehen',
    href: '/wissen',
    excerpt:
      'BMS-Skala 1–12 (Beef Marbling Score), Wagyu vs. Angus vs. Charolais — wie intramuskuläres Fett Saftigkeit, Aromatransport und Schmelzpunkt beeinflusst.',
    tags: ['Marmorierung', 'BMS', 'Wagyu', 'Intramuskuläres Fett'],
    badge: 'Bald verfügbar',
  },
];

export default function WissenIndexPage() {
  const collectionSch = collectionPageSchema(
    'BBQ-Wissen — Fleischkunde & Grilltechnik',
    '/wissen',
    'Fundiertes BBQ-Wissen: Maillard-Reaktion, Dry-Aging, Kerntemperaturen, Marmorierung und Grilltechniken. Wissenschaftlich korrekt, praxisnah erklärt.',
  );
  const breadcrumbSch = breadcrumbSchema([{ name: 'Wissen', url: '/wissen' }]);

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSch) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSch) }} />

      <main className="bg-surface-base">
        {/* Silo-Header */}
        <section className="bg-surface-dark border-b border-brand-gold/15">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <nav className="flex items-center gap-1.5 text-xs font-sans text-text-light/40 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <span className="text-text-light/65">Wissen</span>
            </nav>
            <div className="max-w-2xl">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
                Fachbeiträge & Warenkunde
              </span>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-text-light leading-tight mb-5">
                BBQ-Wissen für Grillmeister
              </h1>
              <p className="font-body text-lg text-text-light/70 leading-relaxed">
                Surface-Level genügt uns nicht. Hier geht es um Biochemie der Maillard-Reaktion,
                enzymatische Autolyse beim Dry-Aging, intramuskuläres Fett und die Thermodynamik
                von Carry-over und Resting — erklärt von Grillmeistern, nicht von Marketingteams.
              </p>
            </div>
          </div>
        </section>

        {/* Artikel-Grid */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WISSEN_CLUSTER.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group block bg-surface-card border border-border-subtle hover:border-brand-gold/40 transition-all duration-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[10px] font-sans font-bold tracking-[0.14em] uppercase text-brand-fire">
                    {item.kicker}
                  </span>
                  <span className="text-[10px] font-sans font-bold tracking-[0.12em] uppercase text-brand-gold/70 bg-surface-base px-2 py-0.5">
                    {item.badge}
                  </span>
                </div>
                <h2 className="font-serif text-lg font-bold text-text-primary group-hover:text-brand-gold transition-colors mb-3 leading-snug">
                  {item.title}
                </h2>
                <p className="text-sm font-body text-text-secondary leading-relaxed mb-5">
                  {item.excerpt}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-sans text-text-muted bg-surface-base px-2 py-0.5 border border-border-subtle">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-sans text-brand-fire font-semibold">
                  <BookOpen size={13} />
                  Lesen
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Cross-Silo-Links */}
          <div className="mt-14 pt-10 border-t border-border-subtle">
            <div className="flex items-center gap-3 mb-6">
              <Flame size={16} className="text-brand-gold" />
              <h3 className="font-sans text-xs font-bold tracking-[0.14em] uppercase text-text-muted">
                Verknüpfte Bereiche
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'Cuts & Fleischkunde', href: '/kategorie/cuts' },
                { label: 'Grilltechniken', href: '/kategorie/grilltechniken' },
                { label: 'Thermometer im Test', href: '/vergleich/premium-fleischthermometer' },
                { label: 'Oberhitzegrill-Vergleich', href: '/vergleich/oberhitzegrill-vergleich' },
                { label: 'Reverse Sear Methode', href: '/methoden/reverse-sear' },
                { label: 'Grillmeister-Diplome', href: '/diplome' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-sans text-text-secondary hover:text-brand-fire transition-colors flex items-center gap-1.5 py-2"
                >
                  <ChevronRight size={11} className="text-brand-gold/50 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
