import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Beef } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { allCuts } from 'contentlayer/generated';
import { collectionPageSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Cuts & Fleischkunde — Ribeye, Brisket, Tomahawk im Detail',
  description:
    'Fleischkunde für Grillmeister: Ribeye, Brisket, Pulled Pork, Tomahawk. Marmorierung, Faserverlauf, optimale Garstufen und Kerntemperaturen je Cut — wissenschaftlich fundiert.',
  alternates: { canonical: 'https://steakakademie.de/cuts' },
  openGraph: {
    title: 'Cuts & Fleischkunde | Steakakademie',
    description: 'Ribeye, Brisket, Tomahawk & Co. — Marmorierung, Faserverlauf und Kerntemperaturen aller Cuts.',
    url: 'https://steakakademie.de/cuts',
    type: 'website',
  },
};

const CUTS_FEATURED = [
  {
    slug: 'ribeye',
    name: 'Ribeye / Entrecôte',
    kicker: 'König der Steaks',
    excerpt:
      'Hohe Marmorierung (BMS 4–9+), Longissimus-dorsi-Muskel, intramuskuläres Fett ab 5 % — der Ribeye-Kappe verdankt dieser Cut sein charakteristisches Aroma und die butterweiche Textur.',
    tags: ['Marmorierung', 'BMS', 'Intramuskuläres Fett', 'Kerntemperatur 54 °C'],
    kerntemp: '54 °C (medium rare)',
  },
  {
    slug: 'brisket',
    name: 'Brisket (Rinderbrust)',
    kicker: 'Texas BBQ Klassiker',
    excerpt:
      'Kollagenreich (Bindegewebe 8–12 %), plateauphase bei 68–76 °C durch Kollagen-Gelatinisierung. 12–18 Stunden Low & Slow bei 107–121 °C — Texas Crutch als Plateauüberbrückung.',
    tags: ['Plateauphase', 'Kollagen', 'Low & Slow', 'Texas Crutch'],
    kerntemp: '88–96 °C',
  },
];

export default function CutsIndexPage() {
  const collectionSch = collectionPageSchema(
    'Cuts & Fleischkunde — Ribeye, Brisket & Co.',
    '/cuts',
    'Fleischkunde für Grillmeister: Marmorierung, Faserverlauf, Kerntemperaturen und optimale Garstufen aller wichtigen Cuts.',
  );
  const breadcrumbSch = breadcrumbSchema([{ name: 'Cuts & Fleischkunde', url: '/cuts' }]);

  const publishedCuts = allCuts ?? [];

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
              <span className="text-text-light/65">Cuts & Fleischkunde</span>
            </nav>
            <div className="max-w-2xl">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
                Warenkunde & Anatomie
              </span>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-text-light leading-tight mb-5">
                Cuts & Fleischkunde
              </h1>
              <p className="font-body text-lg text-text-light/70 leading-relaxed">
                Jeder Cut ist anders — Faserverlauf, Kollagengehalt, intramuskuläres Fett und
                Muskelarbeit bestimmen, wie du das Fleisch zubereitest, bei welcher Kerntemperatur
                du es vom Grill nimmst und warum manche Cuts 18 Stunden brauchen, andere 90 Sekunden.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Cuts */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="font-serif text-2xl font-bold text-text-primary mb-2">Die wichtigsten Cuts</h2>
          <p className="text-sm font-sans text-text-muted mb-10">
            Von der Anatomie bis zur optimalen Kerntemperatur — fundierte Fleischkunde für jeden Cut.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {CUTS_FEATURED.map((cut) => {
              const content = publishedCuts.find((c) => c.slug === cut.slug);
              return (
                <Link
                  key={cut.slug}
                  href={`/cuts/${cut.slug}`}
                  className="group block bg-surface-card border border-border-subtle hover:border-brand-gold/40 transition-all duration-200 p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-sans font-bold tracking-[0.14em] uppercase text-brand-fire">
                      {cut.kicker}
                    </span>
                    <span className="text-[10px] font-sans font-semibold text-brand-gold/80 bg-surface-base px-2 py-0.5 border border-brand-gold/20">
                      {cut.kerntemp}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-text-primary group-hover:text-brand-gold transition-colors mb-3">
                    {cut.name}
                  </h3>
                  <p className="text-sm font-body text-text-secondary leading-relaxed mb-4">
                    {cut.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cut.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-sans text-text-muted bg-surface-base px-2 py-0.5 border border-border-subtle">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {content && (
                    <div className="flex items-center gap-1.5 text-xs font-sans text-brand-fire font-semibold">
                      <Beef size={13} />
                      Zum Cut-Guide
                      <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Semantische Tiefe — Warenkunde-Glossar */}
          <div className="bg-surface-card border border-border-subtle p-8 mb-12">
            <h2 className="font-serif text-2xl font-bold text-text-primary mb-5">
              Fleischkunde-Grundlagen: Was jeden Cut definiert
            </h2>
            <div className="font-body text-text-secondary leading-relaxed space-y-5 text-[1.0625rem]">
              <p>
                <strong className="text-text-primary">Intramuskuläres Fett (IMF)</strong> — auch Marmorierung genannt —
                ist das Fett innerhalb der Muskelfasern. Es bestimmt Saftigkeit, Aromatransport und Schmelzpunkt.
                Beim Ribeye mit BMS 7–9 liegt der IMF-Anteil bei 8–12 %; bei einem Wagyu-A5 bis 30 %.
                Je mehr IMF, desto niedriger die optimale Kerntemperatur — Wagyu schmilzt bereits bei 42 °C
                intramuskulär, ein Standardribeye braucht 54 °C für dasselbe Mundgefühl.
              </p>
              <p>
                <strong className="text-text-primary">Kollagen und Bindegewebe</strong> entscheiden über
                die Zubereitungsmethode. Cuts aus stark beanspruchten Muskeln (Brust, Schulter, Haxe)
                enthalten 8–15 % Kollagen. Kollagen denaturiert erst ab 70 °C und wandelt sich zwischen
                80–90 °C zu Gelatine um — das ist der Grund, warum Brisket 88–96 °C Kerntemperatur braucht
                und 12–18 Stunden bei niedrigen Temperaturen gegart wird.
              </p>
              <p>
                <strong className="text-text-primary">Faserverlauf und Schnittrichtung</strong> sind beim
                Servieren entscheidend. Gegen den Faserverlauf geschnittenes Fleisch verkürzt die
                Faserlänge auf 2–3 mm — Kauaufwand sinkt um 40–60 %. Beim Flank Steak, Skirt und
                Brisket Point ist das Schneiden quer zum Faserverlauf absolut kritisch.
              </p>
            </div>
          </div>

          {/* Cross-Silo-Links */}
          <div className="pt-8 border-t border-border-subtle">
            <div className="flex items-center gap-3 mb-6">
              <Beef size={16} className="text-brand-gold" />
              <h3 className="font-sans text-xs font-bold tracking-[0.14em] uppercase text-text-muted">
                Verwandtes Wissen
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'Kerntemperaturen Guide', href: '/wissen/kerntemperaturen' },
                { label: 'Marmorierung & BMS-Skala', href: '/wissen' },
                { label: 'Dry-Aging: Enzyme & Reifung', href: '/wissen' },
                { label: 'Reverse Sear Methode', href: '/methoden/reverse-sear' },
                { label: 'Fleischthermometer im Test', href: '/vergleich/premium-fleischthermometer' },
                { label: 'Oberhitzegrill für Kruste', href: '/vergleich/oberhitzegrill-vergleich' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
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
