'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const NAME_KEY = 'sa_griller_name';

export type CeremonyData = {
  tier: 'bronze' | 'silber' | 'gold' | 'platin' | 'master';
  badge: string;   // z.B. "Glut-Lehrling Zertifikat"
  name: string;    // Stufen-/Level-Name
  color: string;   // Akzentfarbe der Stufe
  stufe?: number;  // 1–5 (für teilbare Badge-Card)
};

const CONFETTI_COLORS = ['#C8882A', '#E85018', '#F5D060', '#E8E0D0', '#9aa0a5'];

// Marco gratuliert persönlich — kuratiert je Stufe (kein API-Call → kein Kosten-/Fehlerrisiko).
const MARCO_LINES: Record<number, string> = {
  1: 'Stark angefeuert! Du beherrschst jetzt das Feuer — die Basis von allem. Weiter geht’s ans Fleisch.',
  2: 'Sauber. Du erkennst deine Cuts und weißt, warum sie sich unterscheiden — das trennt Griller von Köchen.',
  3: 'Präzision sitzt. Deine Kerntemperaturen sind ab jetzt eine Ansage, kein Ratespiel.',
  4: 'Low & Slow gemeistert. Geduld und Rauch sind deine neuen Werkzeuge — Respekt.',
  5: 'Pitmaster. Mehr muss ich nicht sagen. Du kennst das Steak von der Weide bis zum Teller. Willkommen in der Elite. 🥩',
};

function shareBadge(data: CeremonyData, name?: string) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams({ tier: data.tier, badge: data.badge });
  if (data.stufe) params.set('stufe', String(data.stufe));
  if (name && name.trim()) params.set('name', name.trim());
  const imgUrl = `${window.location.origin}/api/og/badge?${params.toString()}`;
  const text = `Ich habe mein ${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}-Zertifikat der Grillmeister-Ausbildung bestanden! 🔥`;
  const nav = window.navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  if (nav.share) {
    nav.share({ title: 'Steakakademie · Grillmeister-Diplom', text, url: imgUrl }).catch(() => {});
  } else {
    window.open(imgUrl, '_blank', 'noopener');
  }
}

export default function MedalCeremony({
  data,
  onClose,
}: {
  data: CeremonyData | null;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const [name, setName] = useState('');

  // Gespeicherten Namen laden (für persönliche Badge-Card)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { setName(window.localStorage.getItem(NAME_KEY) ?? ''); } catch { /* ignore */ }
  }, [data]);

  function persistName(v: string) {
    setName(v);
    try { window.localStorage.setItem(NAME_KEY, v); } catch { /* ignore */ }
  }

  // Konfetti-Stücke einmal pro Öffnung erzeugen
  const pieces = useMemo(() => {
    if (!data || reduce) return [];
    return Array.from({ length: 44 }, (_, i) => ({
      id: i,
      x: (Math.random() * 2 - 1) * 320,         // horizontale Streuung
      delay: Math.random() * 0.25,
      dur: 1.6 + Math.random() * 1.2,
      rot: (Math.random() * 2 - 1) * 540,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.round(Math.random() * 6),
    }));
  }, [data, reduce]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ background: 'radial-gradient(ellipse at center, rgba(10,6,4,0.85), rgba(5,3,2,0.96))' }}
          role="dialog"
          aria-label="Prüfung bestanden"
        >
          {/* Konfetti */}
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              className="absolute top-[18%] left-1/2"
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: p.x, y: 460, opacity: 0, rotate: p.rot }}
              transition={{ duration: p.dur, delay: p.delay, ease: 'easeOut' }}
              style={{ width: p.size, height: p.size * 1.6, background: p.color, borderRadius: 1 }}
            />
          ))}

          {/* Karte */}
          <motion.div
            className="relative text-center px-8 py-10 max-w-sm w-full"
            initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0, y: 20 }}
            animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, rgba(20,14,8,0.9), rgba(10,7,4,0.95))',
              border: `1px solid ${data.color}55`,
              borderRadius: 16,
              boxShadow: `0 0 60px ${data.color}40`,
            }}
          >
            {/* Medaille mit Glow-Puls */}
            <div className="relative mx-auto mb-6" style={{ width: 168, height: 168 }}>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, ${data.color}66, transparent 70%)` }}
                animate={reduce ? {} : { scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="relative w-full h-full"
                initial={reduce ? {} : { rotate: -14 }}
                animate={reduce ? {} : { rotate: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 10, delay: 0.1 }}
              >
                <Image
                  src={`/images/diplome/medal-${data.tier}.png`}
                  alt={`${data.badge}`}
                  fill
                  sizes="168px"
                  className="object-contain"
                  style={{ filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.7))' }}
                />
              </motion.div>
            </div>

            <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase mb-2" style={{ color: data.color }}>
              Prüfung bestanden
            </p>
            <h2 className="font-serif text-2xl font-bold text-text-light mb-1">
              {data.name}
            </h2>
            <p className="font-sans text-sm text-text-light/60 mb-5">
              🏅 {data.badge} freigeschaltet
            </p>

            {/* Marco gratuliert */}
            {data.stufe && MARCO_LINES[data.stufe] && (
              <div
                className="text-left mb-7 px-4 py-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="font-body text-[13px] leading-relaxed text-text-light/80 italic">
                  „{MARCO_LINES[data.stufe]}"
                </p>
                <p className="font-sans text-[10px] uppercase tracking-[0.14em] mt-2" style={{ color: data.color }}>
                  — Marco, dein BBQ-Guide
                </p>
              </div>
            )}

            <input
              value={name}
              onChange={(e) => persistName(e.target.value)}
              placeholder="Dein Name für die Urkunde (optional)"
              maxLength={40}
              className="w-full mb-4 px-4 py-2.5 rounded-lg font-sans text-sm text-text-light text-center outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
            />

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => shareBadge(data, name)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 font-sans font-bold text-sm tracking-[0.08em] uppercase rounded-full transition-transform hover:scale-[1.03]"
                style={{ background: `linear-gradient(135deg, ${data.color}, ${data.color}cc)`, color: '#100A06' }}
              >
                Teilen
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center px-5 py-3 font-sans font-bold text-sm tracking-[0.08em] uppercase rounded-full border transition-colors hover:bg-white/5"
                style={{ borderColor: `${data.color}55`, color: data.color }}
              >
                Weiter
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
