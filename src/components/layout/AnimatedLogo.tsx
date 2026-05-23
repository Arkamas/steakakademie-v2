'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedLogoProps {
  /** Diameter of the emblem circle in px */
  size?: number;
  /** Show "Steakakademie" wordmark to the right of the emblem */
  showWordmark?: boolean;
  className?: string;
}

/**
 * Animated Steakakademie emblem — flickering flame, rising smoke, ember glow.
 * Respects prefers-reduced-motion: disables animations for accessibility.
 */
export default function AnimatedLogo({
  size = 52,
  showWordmark = false,
  className = '',
}: AnimatedLogoProps) {
  const reducedMotion = useReducedMotion();
  // Prevent hydration mismatch: animations only activate after client mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const animate = mounted && !reducedMotion;

  // ── Flame animation keyframes ─────────────────────────────────────────────
  const outerFlameAnim = animate ? {
    animate: {
      scaleY: [1, 1.06, 0.97, 1.04, 1],
      scaleX: [1, 0.97, 1.03, 0.98, 1],
      y:      [0, -3,    1,    -2,   0],
    },
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
  } : {};

  const middleFlameAnim = animate ? {
    animate: {
      scaleY: [1, 1.09, 0.95, 1.06, 1],
      scaleX: [1, 0.95, 1.04, 0.96, 1],
      y:      [0, -5,    2,   -3,   0],
    },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
  } : {};

  const coreFlameAnim = animate ? {
    animate: {
      scaleY:  [1,   1.12, 0.93, 1.08, 1],
      scaleX:  [1,   0.93, 1.06, 0.94, 1],
      y:       [0,   -7,    3,   -4,   0],
      opacity: [0.9, 1,    0.85,  1,   0.9],
    },
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
  } : {};

  const ringPulse = animate ? {
    animate: { opacity: [0.5, 1, 0.5] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  } : {};

  const glowAnim = animate ? {
    animate: { opacity: [0.4, 0.85, 0.4], ry: [100, 125, 100] },
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
  } : {};

  // Three smoke wisps with staggered timing
  const wisps = [
    { cx: 250, delay: 0,   dur: 3.2, maxSX: 2.5 },
    { cx: 243, delay: 1.1, dur: 2.8, maxSX: 2.0 },
    { cx: 257, delay: 1.9, dur: 3.7, maxSX: 1.8 },
  ];

  return (
    <div className={`flex items-center gap-3 ${className}`} aria-label="Steakakademie">
      <svg
        viewBox="0 0 500 500"
        width={size}
        height={size}
        aria-hidden="true"
        style={{ overflow: 'visible', flexShrink: 0 }}
      >
        <defs>
          {/* ── Filters ─────────────────────────────────────── */}
          {/* Glow around gold core */}
          <filter id="sa-core-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft glow on outer flame */}
          <filter id="sa-flame-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Smoke turbulence/displacement */}
          <filter id="sa-smoke" x="-60%" y="-100%" width="220%" height="400%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.022"
              numOctaves="3"
              result="noise"
            >
              {animate && (
                <animate
                  attributeName="baseFrequency"
                  values="0.022;0.028;0.022"
                  dur="5s"
                  repeatCount="indefinite"
                />
              )}
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="20"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* ── Gradients ───────────────────────────────────── */}
          <radialGradient id="sa-amb-glow" cx="50%" cy="42%" r="38%">
            <stop offset="0%"   stopColor="#E8580A" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#E8580A" stopOpacity="0"    />
          </radialGradient>

          {/* ── Text arc paths ──────────────────────────────── */}
          {/* Top arc  r=215 → clockwise = STEAKAKADEMIE arches over the top */}
          <path id="sa-arc-top"    d="M 35,250 A 215,215 0 0,1 465,250" />
          {/* Bottom arc r=175 → CCW   = tagline curves along bottom, reads L→R */}
          <path id="sa-arc-bottom" d="M 75,250 A 175,175 0 0,0 425,250" />
        </defs>

        {/* ── Background ──────────────────────────────────────────────────── */}
        <rect width="500" height="500" fill="#120C07" rx="250" />

        {/* ── Ambient glow behind flame ────────────────────────────────────── */}
        <motion.ellipse
          cx="250" cy="192" rx="120" ry="100"
          fill="url(#sa-amb-glow)"
          {...glowAnim}
          style={{ transformOrigin: '250px 192px' }}
        />

        {/* ── Three decorative rings ───────────────────────────────────────── */}
        <circle cx="250" cy="250" r="228" fill="none" stroke="#F5A623" strokeWidth="2.5" />
        <circle cx="250" cy="250" r="220" fill="none" stroke="#F5A623" strokeWidth="0.75" />
        <motion.circle
          cx="250" cy="250" r="206"
          fill="none" stroke="#B43C00" strokeWidth="1.5"
          {...ringPulse}
        />

        {/* ── Curved top text: STEAKAKADEMIE ───────────────────────────────── */}
        <text
          fontFamily="Georgia, 'Palatino Linotype', serif"
          fontSize="24" fontWeight="700"
          fill="#F5A623" letterSpacing="6"
        >
          <textPath
            xlinkHref="#sa-arc-top"
            href="#sa-arc-top"
            startOffset="50%"
            textAnchor="middle"
          >
            &#9670;  STEAKAKADEMIE  &#9670;
          </textPath>
        </text>

        {/* ── Smoke wisps ──────────────────────────────────────────────────── */}
        {animate && wisps.map((w, i) => (
          <motion.ellipse
            key={i}
            cx={w.cx} cy={105}
            rx={7} ry={12}
            fill="#3A2A1E"
            filter="url(#sa-smoke)"
            initial={{ y: 0, opacity: 0, scaleX: 1 }}
            animate={{
              y:       [-4, -55, -80],
              opacity: [0,  0.22,  0],
              scaleX:  [1,  w.maxSX, w.maxSX * 1.3],
            }}
            transition={{
              duration:    w.dur,
              repeat:      Infinity,
              delay:       w.delay,
              ease:        'easeOut',
            }}
            style={{ transformOrigin: `${w.cx}px 105px` }}
          />
        ))}

        {/* ── Flame — three layers, each with independent flicker ───────────── */}

        {/* Layer 1 — outer body, deep fire red */}
        <motion.path
          d="M 250,105
             C 250,107 322,155 326,200
             C 330,245 296,274 250,278
             C 204,274 170,245 174,200
             C 178,155 250,107 250,105 Z"
          fill="#B43C00"
          filter="url(#sa-flame-glow)"
          {...outerFlameAnim}
          style={{ transformOrigin: '250px 278px' }}
        />

        {/* Layer 2 — mid body, amber orange */}
        <motion.path
          d="M 250,129
             C 250,131 306,169 310,205
             C 314,236 290,260 250,265
             C 210,260 186,236 190,205
             C 194,169 250,131 250,129 Z"
          fill="#E8580A"
          {...middleFlameAnim}
          style={{ transformOrigin: '250px 265px' }}
        />

        {/* Layer 3 — glowing gold core */}
        <motion.path
          d="M 250,155
             C 250,156 285,176 289,207
             C 293,230 274,248 250,251
             C 226,248 207,230 211,207
             C 215,176 250,156 250,155 Z"
          fill="#F5A623"
          filter="url(#sa-core-glow)"
          {...coreFlameAnim}
          style={{ transformOrigin: '250px 251px' }}
        />

        {/* ── Divider with arrow tips ───────────────────────────────────────── */}
        <line x1="96"  y1="297" x2="188" y2="297" stroke="#F5A623" strokeWidth="1" />
        <polygon points="194,293 205,297 194,301" fill="#F5A623" />
        <polygon points="306,293 295,297 306,301" fill="#F5A623" />
        <line x1="312" y1="297" x2="404" y2="297" stroke="#F5A623" strokeWidth="1" />

        {/* ── EST. MMXXVI ──────────────────────────────────────────────────── */}
        <text
          x="250" y="326" textAnchor="middle"
          fontFamily="Georgia, 'Palatino Linotype', serif"
          fontSize="13" fill="#C4A882" letterSpacing="5"
        >
          EST. MMXXVI
        </text>

        {/* ── Bottom curved tagline ────────────────────────────────────────── */}
        <text
          fontFamily="Georgia, 'Palatino Linotype', serif"
          fontSize="12" fill="#6B5744" letterSpacing="3.5"
        >
          <textPath
            xlinkHref="#sa-arc-bottom"
            href="#sa-arc-bottom"
            startOffset="50%"
            textAnchor="middle"
          >
            BBQ  &#183;  FLEISCH  &#183;  WISSEN
          </textPath>
        </text>
      </svg>

      {/* ── Optional wordmark ─────────────────────────────────────────────── */}
      {showWordmark && (
        <div className="flex flex-col leading-none select-none">
          <span
            className="font-serif font-black text-text-light"
            style={{ fontSize: size * 0.44, letterSpacing: '-0.01em', lineHeight: 1.1 }}
          >
            Steak
          </span>
          <span
            className="font-serif font-normal text-text-light/50 uppercase"
            style={{ fontSize: size * 0.19, letterSpacing: '0.16em', lineHeight: 1.3 }}
          >
            Akademie
          </span>
        </div>
      )}
    </div>
  );
}
