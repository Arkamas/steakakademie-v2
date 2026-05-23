'use client';

import Link from 'next/link';
import { Flame, ArrowRight } from 'lucide-react';

interface KnowledgeBreakProps {
  headline: string;
  text: string;
  cta: string;
  href: string;
  level?: 'Bronze' | 'Silber' | 'Gold' | 'Platin' | 'Meister';
}

const LEVEL_COLORS = {
  Bronze: { bg: 'bg-[#CD7F32]/10', border: 'border-[#CD7F32]/40', text: 'text-[#CD7F32]', label: 'bg-[#CD7F32]' },
  Silber: { bg: 'bg-gray-400/10', border: 'border-gray-400/40', text: 'text-gray-300', label: 'bg-gray-400' },
  Gold: { bg: 'bg-brand-gold/10', border: 'border-brand-gold/40', text: 'text-brand-gold', label: 'bg-brand-gold' },
  Platin: { bg: 'bg-sky-400/10', border: 'border-sky-400/30', text: 'text-sky-300', label: 'bg-sky-400' },
  Meister: { bg: 'bg-brand-fire/10', border: 'border-brand-fire/40', text: 'text-brand-fire', label: 'bg-brand-fire' },
};

export default function KnowledgeBreak({ headline, text, cta, href, level = 'Bronze' }: KnowledgeBreakProps) {
  const c = LEVEL_COLORS[level];
  return (
    <aside
      className={`my-10 ${c.bg} border-l-4 ${c.border} p-6 not-prose`}
      aria-label="Steakakademie Diplom-Hinweis"
    >
      {/* Series label */}
      <div className="flex items-center gap-2 mb-3">
        <Flame size={12} className={c.text} />
        <span className={`text-[10px] font-sans font-bold tracking-[0.18em] uppercase ${c.text}`}>
          Steakakademie · Diplom-Stufe {level}
        </span>
      </div>

      {/* Headline */}
      <p className="font-serif text-lg font-bold text-text-primary mb-2 leading-snug">
        {headline}
      </p>

      {/* Text */}
      <p className="font-body text-sm text-text-secondary leading-relaxed mb-4">
        {text}
      </p>

      {/* CTA */}
      <Link
        href={href}
        className={`inline-flex items-center gap-2 text-xs font-sans font-bold tracking-[0.12em] uppercase ${c.text} hover:opacity-80 transition-opacity`}
      >
        {cta}
        <ArrowRight size={12} />
      </Link>
    </aside>
  );
}
