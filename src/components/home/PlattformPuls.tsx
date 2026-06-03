'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import type { PulsData } from '@/lib/plattform-puls';

// Zählt von 0 auf target, sobald sichtbar (IntersectionObserver).
function useCountUp(target: number, run: boolean, durationMs = 1100) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, durationMs]);
  return val;
}

const KIND_COLOR: Record<string, string> = {
  Rezept: '#E85018',
  Lektion: '#C8882A',
  Methode: '#7CB342',
  Begriff: '#9aa0a5',
};

export default function PlattformPuls({ data }: { data: PulsData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  return (
    <section
      ref={ref}
      className="border-y border-brand-gold/15"
      style={{ background: 'linear-gradient(180deg, #0F0A06 0%, #140D08 100%)' }}
    >
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-[0.22em] uppercase text-brand-fire mb-2">
            <Sparkles size={12} /> Eine wachsende Wissensbasis
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-light">
            Die Steakakademie wächst — jede Woche
          </h2>
        </div>

        {/* Zahlen */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {data.counts.map((c) => (
            <Stat key={c.label} label={c.label} value={c.value} run={seen} />
          ))}
        </div>

        {/* Frisch dazugekommen */}
        {data.latest.length > 0 && (
          <div>
            <p className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-text-light/40 mb-3 text-center">
              Frisch dazugekommen
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {data.latest.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className="group inline-flex items-center gap-2 rounded-full pl-2 pr-3 py-1.5 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span
                    className="text-[9px] font-sans font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
                    style={{ color: KIND_COLOR[item.kind] ?? '#C8882A', background: `${KIND_COLOR[item.kind] ?? '#C8882A'}1A` }}
                  >
                    {item.kind}
                  </span>
                  <span className="text-[12px] font-sans text-text-light/75 group-hover:text-text-light transition-colors max-w-[220px] truncate">
                    {item.title}
                  </span>
                  <ArrowUpRight size={12} className="text-text-light/30 group-hover:text-brand-gold transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, run }: { label: string; value: number; run: boolean }) {
  const n = useCountUp(value, run);
  return (
    <div className="text-center">
      <div className="font-serif text-4xl lg:text-5xl font-bold" style={{ color: '#C8882A' }}>
        {n}
      </div>
      <div className="text-[11px] font-sans uppercase tracking-[0.12em] text-text-light/50 mt-1">
        {label}
      </div>
    </div>
  );
}
