import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CutAtlasClient from '@/components/cuts/CutAtlasClient';
import { getCutsBySpecies, getPrimalsBySpecies, ALL_CUTS } from '@/lib/cuts-catalog';
import { buildCutRecipeMap } from '@/lib/cut-recipes';

export const metadata: Metadata = {
  title: 'Cut-Atlas — Alle Rinder- & Schweine-Cuts interaktiv erklärt',
  description:
    'Der interaktive Cut-Atlas: Klicke dich durch alle Rinder- und Schweine-Teilstücke — von Ribeye, Tomahawk und Brisket bis Secreto, Schäufele und Spareribs. Mit Cut-DNA, Garstufe, Kerntemperatur, passenden Rezepten und Bezugsquelle.',
  alternates: { canonical: 'https://steakakademie.de/cuts' },
  openGraph: {
    title: 'Cut-Atlas — Alle Rinder- & Schweine-Cuts interaktiv',
    description:
      'Wo sitzt welcher Cut? Interaktiver Atlas für alle Rinder- und Schweine-Teilstücke — mit Cut-DNA, Garstufe, Rezepten und Bezugsquelle.',
    url: 'https://steakakademie.de/cuts',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@steakakademie' },
};

export default function CutsPage() {
  const bySpecies = {
    rind: { cuts: getCutsBySpecies('rind'), primals: getPrimalsBySpecies('rind') },
    schwein: { cuts: getCutsBySpecies('schwein'), primals: getPrimalsBySpecies('schwein') },
  };
  const recipeMap = buildCutRecipeMap(ALL_CUTS);

  // ItemList-Schema für die Cut-Sammlung (GEO/Rich Results)
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Rinder- & Schweine-Cuts — Steakakademie Cut-Atlas',
    numberOfItems: ALL_CUTS.length,
    itemListElement: ALL_CUTS.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.nameDE,
    })),
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <main className="min-h-screen bg-surface-base">
        {/* Hero */}
        <section className="bg-surface-dark border-b border-brand-gold/15">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <nav className="flex items-center gap-1.5 text-xs font-sans text-text-light/40 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <span className="text-text-light/65">Cut-Atlas</span>
            </nav>
            <div className="max-w-2xl">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
                Steakakademie · Cut-Atlas
              </span>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-text-light leading-tight mb-4">
                Rind &amp; Schwein, Cut für Cut
              </h1>
              <p className="font-body text-lg text-text-light/70 leading-relaxed">
                Wechsle zwischen Rind und Schwein, wähle ein Teilstück oder klicke direkt auf einen
                Cut. Du erfährst die Lage am Tier, die Cut-DNA, die ideale Garstufe und Kerntemperatur
                — plus passende Rezepte und wo du ihn bekommst.
              </p>
            </div>

            {/* Generator-Teaser */}
            <Link
              href="/cut-generator"
              className="mt-8 inline-flex items-center gap-3 px-6 py-4 border border-brand-gold/40 bg-brand-gold/5 hover:bg-brand-gold/10 transition-colors group"
            >
              <Sparkles size={18} className="text-brand-gold" />
              <span className="text-left">
                <span className="block font-serif font-bold text-text-light">Welcher Cut passt zu dir?</span>
                <span className="block text-text-light/50 text-xs font-sans">In 4 Fragen zum perfekten Cut — Cut-Generator starten</span>
              </span>
              <ChevronRight size={18} className="text-brand-gold ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Atlas */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <CutAtlasClient bySpecies={bySpecies} recipeMap={recipeMap} />
        </section>

        {/* CTA */}
        <section className="border-t border-border-subtle py-14 px-4 text-center bg-surface-dark">
          <p className="text-text-light/40 text-sm font-sans mb-2">Wissen allein reicht nicht.</p>
          <h3 className="font-serif text-2xl font-bold text-text-light mb-6">Werde zum Master of Steak.</h3>
          <Link
            href="/diplome"
            className="inline-flex items-center gap-2 px-8 py-4 border border-brand-gold/60 text-brand-gold font-sans font-bold tracking-[0.1em] uppercase text-sm hover:bg-brand-gold/10 transition-colors"
          >
            Zum Diplom-System
            <ChevronRight size={14} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
