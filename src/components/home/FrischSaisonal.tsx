'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Leaf, ArrowUpRight, ChefHat } from 'lucide-react';
import type { FrischSaisonalData, FrischSaisonalSlide } from '@/lib/frisch-saisonal';

const ROTATE_MS = 5200;

const BADGE_STYLE: Record<FrischSaisonalSlide['badge'], { color: string; bg: string; icon: typeof Flame }> = {
  Frisch: { color: '#E85018', bg: 'rgba(232,80,24,0.16)', icon: Flame },
  Saisonal: { color: '#7CB342', bg: 'rgba(124,179,66,0.16)', icon: Leaf },
};

const KIND_LABEL: Record<FrischSaisonalSlide['kind'], string> = {
  Rezept: 'Rezept',
  Technik: 'Grilltechnik',
  Bericht: 'Bericht',
};

export default function FrischSaisonal({ data }: { data: FrischSaisonalData }) {
  const slides = data.slides;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  const go = useCallback((n: number) => setIdx(((n % total) + total) % total), [total]);
  const next = useCallback(() => setIdx((i) => (i + 1) % total), [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const t = setTimeout(next, ROTATE_MS);
    return () => clearTimeout(t);
  }, [idx, paused, next, total]);

  if (total === 0) return null;
  const slide = slides[idx];
  const badge = BADGE_STYLE[slide.badge];
  const BadgeIcon = badge.icon;

  return (
    <section
      className="border-y border-brand-gold/15"
      style={{ background: 'linear-gradient(180deg, #140D08 0%, #0F0A06 100%)' }}
    >
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ── Linke Seite: Einordnung ─────────────────────────────── */}
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-[0.22em] uppercase text-brand-fire mb-3">
              <Flame size={12} /> Im Feuer — diese Woche
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-text-light leading-[1.1] mb-4">
              Frisch aus dem Feuer.<br className="hidden sm:block" />{' '}
              <span style={{ color: '#C8882A' }}>Was jetzt Saison hat.</span>
            </h2>
            <p className="font-body text-text-light/60 leading-relaxed max-w-xl mb-6">
              Die Steakakademie steht nie still. Hier rotiert, was gerade dazugekommen ist —
              neue Techniken, Berichte und die Rezepte, die genau jetzt im{' '}
              <span className="text-text-light/85 font-medium">{data.seasonLabel}</span> auf den Rost gehören.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/rezepte"
                className="inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-brand-gold hover:text-brand-fire transition-colors"
              >
                Alle Rezepte <ArrowUpRight size={15} />
              </Link>
              <span className="text-text-light/20">·</span>
              <Link
                href="/methoden"
                className="inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-brand-gold hover:text-brand-fire transition-colors"
              >
                Alle Grilltechniken <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          {/* ── Rechte Seite: rotierendes Spotlight (~1/3) ──────────── */}
          <div
            className="lg:col-span-5"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div
              className="relative rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(200,136,42,0.18)', background: '#17100B' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.url}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <Link href={slide.url} className="group block">
                    {/* Bild */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slide.image}
                        alt={slide.imageAlt}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(180deg, rgba(15,10,6,0) 35%, rgba(15,10,6,0.92) 100%)' }}
                      />
                      {/* Badge oben links */}
                      <span
                        className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded-full px-2.5 py-1"
                        style={{ color: badge.color, background: badge.bg, backdropFilter: 'blur(4px)' }}
                      >
                        <BadgeIcon size={11} /> {slide.badge}
                      </span>
                    </div>

                    {/* Text */}
                    <div className="p-5">
                      <span className="text-[9px] font-sans font-bold uppercase tracking-[0.16em] text-text-light/40">
                        {KIND_LABEL[slide.kind]}
                      </span>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-text-light leading-snug mt-1 mb-2 group-hover:text-brand-gold transition-colors">
                        {slide.title}
                      </h3>
                      <p className="text-[13px] font-body text-text-light/55 leading-relaxed line-clamp-2">
                        {slide.excerpt}
                      </p>
                    </div>
                  </Link>

                  {/* Gepaartes Rezept */}
                  {slide.pairing && (
                    <Link
                      href={slide.pairing.url}
                      className="group/p mx-5 mb-5 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
                      style={{ background: 'rgba(232,80,24,0.08)', border: '1px solid rgba(232,80,24,0.18)' }}
                    >
                      <ChefHat size={14} className="text-brand-fire shrink-0" />
                      <span className="text-[11px] font-sans text-text-light/50 shrink-0">{slide.pairing.label}:</span>
                      <span className="text-[12px] font-sans font-semibold text-text-light/85 truncate group-hover/p:text-brand-fire transition-colors">
                        {slide.pairing.title}
                      </span>
                      <ArrowUpRight size={12} className="text-brand-fire/50 ml-auto shrink-0" />
                    </Link>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Fortschrittsbalken */}
              {total > 1 && (
                <div className="h-0.5 w-full bg-white/5">
                  <motion.div
                    key={`${slide.url}-bar`}
                    className="h-full"
                    style={{ background: '#C8882A' }}
                    initial={{ width: '0%' }}
                    animate={{ width: paused ? '0%' : '100%' }}
                    transition={{ duration: paused ? 0 : ROTATE_MS / 1000, ease: 'linear' }}
                  />
                </div>
              )}
            </div>

            {/* Navigation (Dots) */}
            {total > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {slides.map((s, i) => (
                  <button
                    key={s.url}
                    onClick={() => go(i)}
                    aria-label={`Zu Folie ${i + 1}: ${s.title}`}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === idx ? 22 : 6,
                      background: i === idx ? '#C8882A' : 'rgba(240,232,216,0.25)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
