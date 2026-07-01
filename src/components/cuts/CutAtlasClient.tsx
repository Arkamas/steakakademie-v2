'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, X, Flame, Thermometer, BookOpen, ShoppingCart, MousePointerClick } from 'lucide-react';
import AnimalDiagram from './AnimalDiagram';
import BullPrimalMap from './BullPrimalMap';
import CutDnaRadar from './CutDnaRadar';
import CutImage from './CutImage';
import { METHOD_LABEL, type CookMethod, type Cut, type Primal, type Species } from '@/lib/cuts-catalog';
import { getMeatOffer } from '@/lib/cut-affiliate';
import type { CutRecipeRef } from '@/lib/cut-recipes';

interface CutAtlasClientProps {
  bySpecies: Record<Species, { cuts: Cut[]; primals: Primal[] }>;
  recipeMap: Record<string, CutRecipeRef[]>;
}

const SPECIES_TABS: { id: Species; label: string }[] = [
  { id: 'rind', label: '🐄 Rind' },
  { id: 'schwein', label: '🐖 Schwein' },
];

// Kompakte Badge-Kürzel der Garmethoden fürs Info-Panel
const METHOD_BADGE: Record<CookMethod, string> = {
  'grill-direkt': 'Direkt',
  'grill-indirekt': 'Indirekt',
  pfanne: 'Pfanne',
  smoker: 'Smoker',
  'sous-vide': 'Sous-vide',
  schmoren: 'Schmoren',
  ofen: 'Ofen',
};

function PriceLevel({ level }: { level: number }) {
  return (
    <span className="font-mono tracking-tight text-base">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= level ? '#C8882A' : '#3a2818' }}>€</span>
      ))}
    </span>
  );
}

function LevelDots({ level }: { level: number }) {
  return (
    <span className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: i <= level ? '#E85018' : '#3a2818' }}
        />
      ))}
    </span>
  );
}

export default function CutAtlasClient({ bySpecies, recipeMap }: CutAtlasClientProps) {
  const [species, setSpecies] = useState<Species>('rind');
  const [selectedPrimal, setSelectedPrimal] = useState<string | null>(null);
  const [selectedCutId, setSelectedCutId] = useState<string | null>(null);

  const { cuts, primals } = bySpecies[species];
  const primalById = useMemo(() => Object.fromEntries(primals.map((p) => [p.id, p])), [primals]);
  const filteredCuts = useMemo(
    () => (selectedPrimal ? cuts.filter((c) => c.primal === selectedPrimal) : []),
    [cuts, selectedPrimal]
  );

  const switchSpecies = (s: Species) => {
    setSpecies(s);
    setSelectedPrimal(null);
    setSelectedCutId(null);
  };
  const handlePrimal = (id: string) => {
    setSelectedPrimal((prev) => (prev === id ? null : id));
    setSelectedCutId(null);
  };

  const selectedCut = selectedCutId ? cuts.find((c) => c.id === selectedCutId) ?? null : null;
  const activePrimal = selectedPrimal ? primalById[selectedPrimal] ?? null : null;

  return (
    <div>
      {/* ── Spezies-Umschalter ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6">
        {SPECIES_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => switchSpecies(t.id)}
            className={`px-4 py-2 text-sm font-sans font-bold border transition-colors ${
              species === t.id
                ? 'bg-brand-gold/15 border-brand-gold/50 text-brand-gold'
                : 'border-border-subtle text-text-light/45 hover:border-brand-gold/30'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Master-Detail-Dashboard ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Links (2/3): interaktives Tier */}
        <div className="lg:col-span-2">
          {species === 'rind' ? (
            <BullPrimalMap primals={primals} selectedPrimal={selectedPrimal} onSelect={handlePrimal} />
          ) : (
            <div className="overflow-hidden rounded-lg border border-brand-gold/15 bg-[#0D0A06]">
              <AnimalDiagram
                species={species}
                primals={primals}
                selectedPrimal={selectedPrimal}
                onSelectPrimal={handlePrimal}
              />
            </div>
          )}

          <p className="mt-3 flex items-center gap-2 text-xs font-sans uppercase tracking-[0.14em] text-brand-gold/60">
            <MousePointerClick size={14} />
            {species === 'rind'
              ? 'Klicke eine Muskelgruppe auf dem Stier'
              : 'Klicke ein Teilstück auf dem Tier'}
          </p>

          {/* Mobile-Fallback: kompakte Teilstück-Chips (Desktop nutzt das Tier) */}
          <div className="mt-3 flex flex-wrap gap-1.5 lg:hidden">
            {primals.map((p) => {
              const active = selectedPrimal === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePrimal(p.id)}
                  className={`px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-[0.06em] border transition-colors ${
                    active
                      ? 'bg-brand-gold/15 border-brand-gold/50 text-brand-gold'
                      : 'border-border-subtle text-text-light/55 hover:border-brand-gold/30'
                  }`}
                >
                  {p.nameDE}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rechts (1/3): dynamisches Info-Panel */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 min-h-[420px] rounded-lg border border-brand-gold/15 bg-surface-dark p-5">
            <AnimatePresence mode="wait">
              {activePrimal ? (
                <motion.div
                  key={activePrimal.id}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {/* Kopf */}
                  <div className="flex items-start justify-between gap-2 border-b border-brand-gold/10 pb-3">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-text-light leading-tight">
                        {activePrimal.nameDE}
                      </h3>
                      <p className="mt-0.5 text-brand-gold/60 text-xs font-sans uppercase tracking-[0.12em]">
                        {activePrimal.nameEN} · {filteredCuts.length}{' '}
                        {filteredCuts.length === 1 ? 'Cut' : 'Cuts'}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPrimal(null)}
                      aria-label="Auswahl zurücksetzen"
                      className="p-1.5 text-text-light/50 hover:text-brand-gold transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Cut-Liste */}
                  <div className="mt-4 space-y-2.5 max-h-[52vh] overflow-y-auto pr-1">
                    {filteredCuts.map((cut) => (
                      <button
                        key={cut.id}
                        onClick={() => setSelectedCutId(cut.id)}
                        className="group flex w-full items-center gap-3 rounded-md border border-border-subtle bg-surface-base p-2 text-left transition-colors hover:border-brand-gold/40"
                      >
                        <CutImage
                          src={cut.image}
                          alt={`${cut.nameDE} (${cut.nameEN})`}
                          label={cut.nameDE}
                          accent={activePrimal.color}
                          className="h-14 w-14 shrink-0 rounded"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif font-bold text-sm text-text-light leading-tight transition-colors group-hover:text-brand-gold">
                            {cut.nameDE}
                          </span>
                          <span className="block truncate text-[11px] italic text-text-light/40">
                            {cut.nameEN}
                          </span>
                          <span className="mt-1 flex flex-wrap gap-1">
                            {cut.methods.slice(0, 3).map((m) => (
                              <span
                                key={m}
                                className="rounded-sm border border-brand-gold/15 bg-surface-elevated px-1.5 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wide text-brand-gold/80"
                              >
                                {METHOD_BADGE[m]}
                              </span>
                            ))}
                          </span>
                        </span>
                        <ChevronRight
                          size={16}
                          className="shrink-0 text-text-light/30 transition-colors group-hover:text-brand-gold"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Kulinarische Beschreibung der Muskelgruppe */}
                  <p className="mt-4 border-t border-brand-gold/10 pt-3 font-body text-sm leading-relaxed text-text-light/65">
                    {activePrimal.blurb}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full min-h-[380px] flex-col items-center justify-center px-4 text-center"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-brand-gold/25 text-brand-gold">
                    <MousePointerClick size={24} />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-text-light">Wähle eine Muskelgruppe</h3>
                  <p className="mt-2 max-w-xs font-body text-sm text-text-light/50">
                    Klicke {species === 'rind' ? 'auf dem Stier' : 'auf dem Tier'} auf ein Teilstück —
                    hier erscheinen alle passenden Cuts mit Garmethode, Kerntemperatur und Rezepten.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Detail-Overlay ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCut && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCutId(null)}
          >
            <motion.div
              className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-surface-dark border border-brand-gold/25"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedCutId(null)}
                aria-label="Schließen"
                className="absolute top-3 right-3 z-10 p-2 bg-surface-dark/80 border border-brand-gold/20 text-text-light/70 hover:text-brand-gold transition-colors"
              >
                <X size={18} />
              </button>

              <CutDetail
                cut={selectedCut}
                primal={primalById[selectedCut.primal]}
                recipes={recipeMap[selectedCut.id] ?? []}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CutDetail({ cut, primal, recipes }: { cut: Cut; primal?: Primal; recipes: CutRecipeRef[] }) {
  const offer = getMeatOffer(cut);
  const accent = primal?.color ?? '#C8882A';

  return (
    <div>
      {/* Foto-Header */}
      <CutImage
        src={cut.image}
        alt={`${cut.nameDE} (${cut.nameEN})`}
        label={cut.nameDE}
        accent={accent}
        className="w-full aspect-[16/9]"
      />

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-light">{cut.nameDE}</h2>
          <span className="text-text-light/40 text-sm italic">{cut.nameEN}</span>
        </div>
        {primal && (
          <p className="text-brand-gold/70 text-xs font-sans uppercase tracking-[0.12em] mt-1">
            {primal.nameDE} · {cut.origin}
          </p>
        )}

        <p className="font-body text-text-light/75 text-base leading-relaxed mt-4">{cut.blurb}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-7">
          {/* DNA-Radar */}
          <div className="border border-brand-gold/15 bg-surface-base p-4">
            <h3 className="text-[10px] font-sans font-bold text-brand-fire uppercase tracking-[0.18em] mb-2 text-center">
              Cut-DNA
            </h3>
            <CutDnaRadar dna={cut.dna} color={accent} />
          </div>

          {/* Fakten */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Flame size={16} className="text-brand-fire mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-sans font-bold text-text-light/40 uppercase tracking-[0.12em]">Garstufe</p>
                <p className="text-text-light text-sm font-body">{cut.doneness}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Thermometer size={16} className="text-brand-fire mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-sans font-bold text-text-light/40 uppercase tracking-[0.12em]">Kerntemperatur</p>
                <p className="text-text-light text-sm font-body">{cut.coreTemp}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-sans font-bold text-text-light/40 uppercase tracking-[0.12em] mb-1.5">Preis · Schwierigkeit</p>
              <div className="flex items-center gap-4">
                <PriceLevel level={cut.price} />
                <LevelDots level={cut.level} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-sans font-bold text-text-light/40 uppercase tracking-[0.12em] mb-2">Methoden</p>
              <div className="flex flex-wrap gap-1.5">
                {cut.methods.map((m) => (
                  <span key={m} className="px-2 py-0.5 text-xs font-sans bg-surface-elevated border border-brand-gold/15 text-text-light/70">
                    {METHOD_LABEL[m]}
                  </span>
                ))}
              </div>
            </div>
            {cut.facts && (
              <p className="text-text-light/50 text-xs font-body leading-relaxed pt-1">{cut.facts}</p>
            )}
          </div>
        </div>

        {/* Rezepte */}
        {recipes.length > 0 && (
          <div className="mt-8">
            <h3 className="text-[10px] font-sans font-bold text-brand-fire uppercase tracking-[0.18em] mb-3">
              Rezepte mit {cut.nameDE}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recipes.map((r) => (
                <Link
                  key={r.slug}
                  href={r.url}
                  className="flex items-center gap-3 border border-border-subtle bg-surface-base hover:border-brand-gold/40 transition-colors group"
                >
                  <CutImage src={r.image} alt={r.title} label={r.title} className="w-16 h-16 shrink-0" />
                  <span className="font-serif text-sm text-text-light leading-tight py-2 pr-2 group-hover:text-brand-gold transition-colors">
                    {r.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a
            href={offer.href}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-fire text-white font-sans font-bold text-sm tracking-[0.04em] uppercase hover:brightness-110 transition"
          >
            <ShoppingCart size={16} />
            {cut.nameDE} kaufen
          </a>
          {cut.hasGuide && (
            <Link
              href={`/cuts/${cut.slug}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 border border-brand-gold/50 text-brand-gold font-sans font-bold text-sm tracking-[0.04em] uppercase hover:bg-brand-gold/10 transition"
            >
              <BookOpen size={16} />
              Großer Guide
            </Link>
          )}
        </div>
        <p className="text-text-light/30 text-[11px] font-sans mt-2 leading-relaxed">{offer.disclosure}</p>
      </div>
    </div>
  );
}
