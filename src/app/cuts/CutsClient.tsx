'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BeefDiagram from '@/components/cuts/BeefDiagram';
import { CUTS } from '@/lib/cuts-data';

const MARBLING_LABEL: Record<number, string> = {
  1: 'Minimal',
  2: 'Gering',
  3: 'Mittel',
  4: 'Hoch',
  5: 'Außergewöhnlich',
};

function MarblingBar({ level }: { level: number }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className="flex-1 h-2 transition-colors duration-300"
          style={{ background: i <= level ? '#C8882A' : '#2a1a0a' }}
        />
      ))}
    </div>
  );
}

function PriceLevel({ level }: { level: number }) {
  return (
    <span className="font-mono tracking-tight">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= level ? '#C8882A' : '#2a1a0a' }}>€</span>
      ))}
    </span>
  );
}

export default function CutsClient() {
  const [selectedId, setSelectedId] = useState<string>('rib');
  const selectedCut = CUTS.find(c => c.id === selectedId) ?? CUTS[1];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-base">

        {/* Header */}
        <section className="bg-surface-dark border-b border-brand-gold/15">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <nav className="flex items-center gap-1.5 text-xs font-sans text-text-light/40 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <span className="text-text-light/65">Cut-Explorer</span>
            </nav>
            <div className="max-w-2xl">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
                Steakakademie · Cut-Explorer
              </span>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-text-light leading-tight mb-4">
                Das Rind von innen
              </h1>
              <p className="font-body text-lg text-text-light/70 leading-relaxed">
                Klicke auf eine Region und erfahre alles über den Cut — von der Anatomie
                bis zur perfekten Zubereitung.
              </p>
            </div>
          </div>
        </section>

        {/* Diagram + Detail */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* SVG Diagram */}
          <div className="mb-10 border border-brand-gold/15 overflow-hidden bg-[#0D0D0D]">
            <BeefDiagram cuts={CUTS} selectedId={selectedId} onSelect={setSelectedId} />
          </div>

          {/* Detail Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCut.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="border border-brand-gold/20 bg-surface-dark overflow-hidden"
            >
              {/* Panel header */}
              <div className="px-6 sm:px-8 py-6 border-b border-brand-gold/15 flex items-center gap-4">
                <span className="text-5xl" role="img" aria-label={selectedCut.nameDE}>
                  {selectedCut.emoji}
                </span>
                <div>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-light">
                      {selectedCut.nameDE}
                    </h2>
                    <span className="text-text-light/40 text-sm italic">{selectedCut.nameEN}</span>
                  </div>
                  <p className="text-brand-gold/70 text-sm font-sans mt-0.5">{selectedCut.region}</p>
                </div>
              </div>

              {/* Panel body */}
              <div className="grid grid-cols-1 lg:grid-cols-3">

                {/* Left — description + cuts + methods */}
                <div className="lg:col-span-2 px-6 sm:px-8 py-6 space-y-6 border-r border-brand-gold/10">

                  <p className="font-body text-text-light/75 text-base leading-relaxed">
                    {selectedCut.description}
                  </p>

                  <div>
                    <h3 className="text-[10px] font-sans font-bold text-brand-fire uppercase tracking-[0.18em] mb-3">
                      Cuts aus dieser Region
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCut.cuts.map(cut => (
                        <span
                          key={cut}
                          className="px-3 py-1 bg-surface-elevated border border-brand-gold/20 text-text-light/70 text-sm font-sans"
                        >
                          {cut}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-sans font-bold text-brand-fire uppercase tracking-[0.18em] mb-3">
                      Zubereitungsmethoden
                    </h3>
                    <ul className="space-y-2">
                      {selectedCut.methods.map(method => (
                        <li key={method} className="flex items-start gap-2.5 text-text-light/60 text-sm font-body">
                          <span className="text-brand-gold mt-0.5 shrink-0">›</span>
                          <span>{method}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right — stats */}
                <div className="px-6 sm:px-8 py-6 space-y-6">

                  <div>
                    <h3 className="text-[10px] font-sans font-bold text-brand-fire uppercase tracking-[0.18em] mb-2">
                      Marmorierung
                    </h3>
                    <MarblingBar level={selectedCut.marbling} />
                    <p className="text-text-light/40 text-xs mt-1.5 font-sans">
                      {MARBLING_LABEL[selectedCut.marbling]}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-sans font-bold text-brand-fire uppercase tracking-[0.18em] mb-2">
                      Garstufe
                    </h3>
                    <p className="text-text-light text-sm font-body leading-relaxed">
                      {selectedCut.donenessRecommended}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-sans font-bold text-brand-fire uppercase tracking-[0.18em] mb-2">
                      Preis-Niveau
                    </h3>
                    <PriceLevel level={selectedCut.price} />
                  </div>

                  <div className="border border-brand-gold/20 bg-surface-elevated p-4">
                    <h3 className="text-[10px] font-sans font-bold text-brand-fire uppercase tracking-[0.18em] mb-3">
                      Im Steak-Diplom
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-serif text-2xl font-bold text-brand-gold">
                        Level {selectedCut.diplomLevel}
                      </span>
                      <span className="text-text-light/40 text-sm font-sans">{selectedCut.diplomLevelName}</span>
                    </div>
                    <Link
                      href="/diplome"
                      className="block text-center text-[11px] font-sans font-bold tracking-[0.1em] uppercase py-2 px-4 border border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10 transition-colors"
                    >
                      Zum Diplom →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* All cuts grid */}
        <section className="border-t border-border-subtle py-14 px-4">
          <div className="max-w-editorial mx-auto">
            <h2 className="font-serif text-2xl font-bold text-text-primary mb-2 text-center">
              Alle Regionen
            </h2>
            <p className="text-text-muted text-sm font-sans text-center mb-10">
              Klicke auf eine Karte um zum Diagramm zu springen
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {CUTS.map(cut => (
                <button
                  key={cut.id}
                  onClick={() => {
                    setSelectedId(cut.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`text-left p-4 border transition-all duration-200 ${
                    selectedId === cut.id
                      ? 'bg-surface-elevated border-brand-gold/50 shadow-lg'
                      : 'bg-surface-card border-border-subtle hover:border-brand-gold/30 hover:bg-surface-elevated'
                  }`}
                >
                  <span className="text-3xl block mb-2">{cut.emoji}</span>
                  <h3 className="font-serif font-bold text-text-primary text-sm leading-tight">{cut.nameDE}</h3>
                  <p className="text-text-muted text-xs mt-0.5 font-sans">{cut.nameEN}</p>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className="h-1 flex-1"
                        style={{ background: i <= cut.marbling ? '#C8882A' : '#DDD0BC' }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border-subtle py-14 px-4 text-center bg-surface-dark">
          <p className="text-text-light/40 text-sm font-sans mb-2">
            Wissen allein reicht nicht.
          </p>
          <h3 className="font-serif text-2xl font-bold text-text-light mb-6">
            Werde zum Master of Steak.
          </h3>
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
