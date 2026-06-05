'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Fortschrittsleiste, die sich beim Sichtbarwerden von 0 → percent füllt.
// Reduced-motion-sicher (dann sofort voll, keine Animation).
export default function AnimatedBar({
  percent,
  color,
  label,
}: {
  percent: number;
  color: string;
  label?: string;
}) {
  const reduce = useReducedMotion();
  const p = Math.max(0, Math.min(100, percent));

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.14em]" style={{ color }}>
            {label}
          </span>
          <span className="text-[10px] font-sans text-text-muted">{Math.round(p)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
          initial={reduce ? { width: `${p}%` } : { width: 0 }}
          whileInView={{ width: `${p}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
