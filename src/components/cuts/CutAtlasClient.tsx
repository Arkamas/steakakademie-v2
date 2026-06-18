'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, X, Flame, Thermometer, BookOpen, ShoppingCart } from 'lucide-react';
import AnimalDiagram from './AnimalDiagram';
import CutDnaRadar from './CutDnaRadar';
import CutImage from './CutImage';
import { METHOD_LABEL, type Cut, type Primal, type Species } from '@/lib/cuts-catalog';
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

  const visibleCuts = useMemo(
    () => (selectedPrimal ? cuts.filter((c) => c.primal === selectedPrimal) : cuts),
    [cuts, selectedPrimal]
  );

  const switchSpecies = (s: Species) => {
    setSpecies(s);
    setSelectedPrimal(null);
    setSelectedCutId(null);
  };

  const selectedCut = selectedCutId ? cuts.find((c) => c.id === selectedCutId) ?? null : null;
  const primalById = useMemo(() => Object.fromEntries(primals.map((p) => [p.id, p])), [primals]);

  const handlePrimal = (id: string) => {
    setSelectedPrimal((prev) => (prev === id ? null : id));
    setSelectedCutId(null);
  };

  return (
    <div>
      {/* ── Spezies-Umschalter ──────────────────────────────────────────────── */}
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

      {/* ── Interaktive Silhouette ──────────────────────────────────────────── */}
      <div className="border border-brand-gold/15 bg-[#0D0A06] overflow-hidden">
        <AnimalDiagram
          species={species}
          primals={primals}
          selectedPrimal={selectedPrimal}
          onSelectPrimal={handlePrimal}
        />
      </div>

      {/* Teilstück-Filter (Chips) */}
      <div className="flex flex-wrap gap-2 mt-5">
        <button
          onClick={() => { setSelectedPrimal(null); setSelectedCutId(null); }}
          className={`px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-[0.08em] border transition-colors ${
            selectedPrimal === null
              ? 'bg-brand-gold/15 border-brand-gold/50 text-brand-gold'
              : 'border-border-subtle text-text-light/55 hover:border-brand-gold/30'
          }`}
        >
          Alle ({cuts.length})
        </button>
        {primals.map((p) => {
          const count = cuts.filter((c) => c.primal === p.id).length;
          if (!count) return null;
          const active = selectedPrimal === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handlePrimal(p.id)}
              className={`px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-[0.08em] border transition-colors ${
                active
                  ? 'bg-brand-gold/15 border-brand-gold/50 text-brand-gold'
                  : 'border-border-subtle text-text-light/55 hover:border-brand-gold/30'
              }`}
            >
              {p.nameDE} ({count})
            </button>
          );
        })}
      </div>

      {selectedPrimal && primalById[selectedPrimal] && (
        <p className="mt-4 font-body text-text-light/65 text-sm leading-relaxed max-w-2xl">
          {primalById[selectedPrimal].blurb}
        </p>
      )}

      {/* ── Foto-Galerie ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-8">
        {visibleCuts.map((cut) => (
          <button
            key={cut.id}
            onClick={() => setSelectedCutId(cut.id)}
            className="group text-left border border-border-subtle bg-surface-card hover:border-brand-gold/40 transition-colors overflow-hidden"
          >
            <CutImage
              src={cut.image}
              alt={`${cut.nameDE} (${cut.nameEN})`}
              label={cut.nameDE}
              accent={primalById[cut.primal]?.color ?? '#C8882A'}
              className="aspect-[4/3]"
            />
            <div className="p-3">
              <h3 className="font-serif font-bold text-text-light text-sm leading-tight">{cut.nameDE}</h3>
              <p className="text-text-light/40 text-xs font-sans italic mt-0.5">{cut.nameEN}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="h-1 w-3" style={{ background: i <= cut.dna.marbling ? '#C8882A' : '#3a2818' }} />
                  ))}
                </span>
                <PriceLevel level={cut.price} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Detail-Overlay ───────────────────────────────────────────────────── */}
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

              <CutDetail cut={selectedCut} primal={primalById[selectedCut.primal]} recipes={recipeMap[selectedCut.id] ?? []} />
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
