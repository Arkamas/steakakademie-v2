'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

// Echte Münz-Renders (Bullenkopf-Design) — füllen den Badge-Slot im Pedestal.
function RenderBadge({ tier, alt }: { tier: string; alt: string }) {
  return (
    <Image
      src={`/images/diplome/medal-${tier}.png`}
      alt={alt}
      fill
      sizes="(max-width: 640px) 112px, 144px"
      className="object-contain"
      style={{ filter: 'drop-shadow(0 12px 26px rgba(0,0,0,0.75))' }}
    />
  );
}

// ─── Badge SVGs ───────────────────────────────────────────────────────────────

function BronzeBadge() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="bronze-face" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e8a96a" />
          <stop offset="40%" stopColor="#c47c3a" />
          <stop offset="80%" stopColor="#8b4e1a" />
          <stop offset="100%" stopColor="#5c2f0a" />
        </radialGradient>
        <radialGradient id="bronze-rim" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="85%" stopColor="#d4883a" />
          <stop offset="92%" stopColor="#f0a84a" />
          <stop offset="100%" stopColor="#8b5520" />
        </radialGradient>
        <filter id="bronze-shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#5c2f0a" floodOpacity="0.7" />
        </filter>
      </defs>
      {/* Outer rim */}
      <circle cx="60" cy="58" r="46" fill="url(#bronze-rim)" filter="url(#bronze-shadow)" />
      <circle cx="60" cy="58" r="44" fill="none" stroke="#d4883a" strokeWidth="2" opacity="0.6" />
      {/* Face */}
      <circle cx="60" cy="58" r="40" fill="url(#bronze-face)" />
      {/* Inner ring detail */}
      <circle cx="60" cy="58" r="36" fill="none" stroke="#c47c3a" strokeWidth="0.8" opacity="0.5" />
      <circle cx="60" cy="58" r="33" fill="none" stroke="#8b4e1a" strokeWidth="0.5" opacity="0.4" />
      {/* Flame crest */}
      <path d="M60 38 C60 38 55 44 53 50 C51 56 54 60 57 58 C55 62 56 68 60 70 C64 68 65 62 63 58 C66 60 69 56 67 50 C65 44 60 38 60 38Z" fill="#f0a84a" opacity="0.9" />
      <path d="M60 42 C60 42 57 47 56 52 C55 57 57 60 59 59 C58 62 59 66 61 67 C62 65 62 61 61 59 C63 60 64 57 63 52 C62 47 60 42 60 42Z" fill="#ffe08a" opacity="0.7" />
      {/* Engraved text */}
      <text x="60" y="82" textAnchor="middle" fontFamily="serif" fontSize="5" fill="#f0c880" opacity="0.8" letterSpacing="1">STUFE I</text>
      {/* Highlight */}
      <ellipse cx="48" cy="44" rx="8" ry="5" fill="white" opacity="0.08" transform="rotate(-20 48 44)" />
    </svg>
  );
}

function SilverBadge() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="silver-face" cx="38%" cy="33%" r="68%">
          <stop offset="0%" stopColor="#f0f4f8" />
          <stop offset="35%" stopColor="#c8d4e0" />
          <stop offset="70%" stopColor="#8a9eb0" />
          <stop offset="100%" stopColor="#4a5e70" />
        </radialGradient>
        <radialGradient id="silver-rim" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="85%" stopColor="#b0c0d0" />
          <stop offset="92%" stopColor="#e0eaf4" />
          <stop offset="100%" stopColor="#6a7e90" />
        </radialGradient>
        <filter id="silver-shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2a3a4a" floodOpacity="0.6" />
        </filter>
      </defs>
      <circle cx="60" cy="58" r="46" fill="url(#silver-rim)" filter="url(#silver-shadow)" />
      <circle cx="60" cy="58" r="44" fill="none" stroke="#c8d4e0" strokeWidth="2" opacity="0.5" />
      <circle cx="60" cy="58" r="40" fill="url(#silver-face)" />
      <circle cx="60" cy="58" r="36" fill="none" stroke="#a0b4c8" strokeWidth="0.8" opacity="0.5" />
      <circle cx="60" cy="58" r="33" fill="none" stroke="#7090a8" strokeWidth="0.5" opacity="0.4" />
      {/* Fork & knife crossed */}
      <path d="M54 36 L54 56 M51 40 C51 40 51 48 54 50 M57 40 C57 40 57 48 54 50 M54 56 L54 66" stroke="#d0e4f4" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M66 36 L66 66 M66 36 C66 36 70 40 70 46 C70 50 68 52 66 52" stroke="#d0e4f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <text x="60" y="82" textAnchor="middle" fontFamily="serif" fontSize="5" fill="#c8d8e8" opacity="0.8" letterSpacing="1">STUFE II</text>
      <ellipse cx="48" cy="44" rx="9" ry="5" fill="white" opacity="0.1" transform="rotate(-20 48 44)" />
    </svg>
  );
}

function GoldBadge() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="gold-face" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#fff4c0" />
          <stop offset="25%" stopColor="#f5c842" />
          <stop offset="60%" stopColor="#c89820" />
          <stop offset="100%" stopColor="#7a5c08" />
        </radialGradient>
        <radialGradient id="gold-rim" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="83%" stopColor="#c89820" />
          <stop offset="91%" stopColor="#f5d060" />
          <stop offset="100%" stopColor="#8a6810" />
        </radialGradient>
        <filter id="gold-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f5c842" floodOpacity="0.35" />
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#7a5c08" floodOpacity="0.5" />
        </filter>
      </defs>
      <circle cx="60" cy="58" r="46" fill="url(#gold-rim)" filter="url(#gold-glow)" />
      <circle cx="60" cy="58" r="44" fill="none" stroke="#f0c840" strokeWidth="2" opacity="0.5" />
      <circle cx="60" cy="58" r="40" fill="url(#gold-face)" />
      <circle cx="60" cy="58" r="36" fill="none" stroke="#d4a828" strokeWidth="0.8" opacity="0.6" />
      {/* Laurel wreath */}
      <path d="M44 58 C40 52 40 46 44 42 M76 58 C80 52 80 46 76 42" stroke="#f0d060" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <path d="M44 42 C46 38 48 36 50 35 M76 42 C74 38 72 36 70 35" stroke="#f0d060" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      {/* Academic crest: shield */}
      <path d="M54 42 L54 60 C54 64 57 66 60 67 C63 66 66 64 66 60 L66 42 Z" fill="none" stroke="#fff4c0" strokeWidth="1.2" opacity="0.85" />
      <path d="M54 52 L66 52" stroke="#fff4c0" strokeWidth="0.8" opacity="0.6" />
      {/* Crown on shield */}
      <path d="M56 44 L57 40 L60 43 L63 40 L64 44" stroke="#fff4c0" strokeWidth="1" strokeLinejoin="round" opacity="0.8" />
      <text x="60" y="82" textAnchor="middle" fontFamily="serif" fontSize="5" fill="#f5d060" opacity="0.9" letterSpacing="1">STUFE III</text>
      <ellipse cx="47" cy="43" rx="9" ry="5" fill="white" opacity="0.12" transform="rotate(-20 47 43)" />
    </svg>
  );
}

function PlatinumBadge() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="plat-face" cx="36%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#e8f0f8" />
          <stop offset="50%" stopColor="#a8c0d8" />
          <stop offset="80%" stopColor="#6888a8" />
          <stop offset="100%" stopColor="#3a5068" />
        </radialGradient>
        <radialGradient id="plat-rim" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="83%" stopColor="#90b0d0" />
          <stop offset="91%" stopColor="#d8eaf8" />
          <stop offset="100%" stopColor="#5878a0" />
        </radialGradient>
        <filter id="plat-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#a8d0f0" floodOpacity="0.4" />
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2a3a50" floodOpacity="0.5" />
        </filter>
      </defs>
      <circle cx="60" cy="58" r="46" fill="url(#plat-rim)" filter="url(#plat-glow)" />
      <circle cx="60" cy="58" r="44" fill="none" stroke="#c0d8f0" strokeWidth="2" opacity="0.5" />
      <circle cx="60" cy="58" r="40" fill="url(#plat-face)" />
      <circle cx="60" cy="58" r="36" fill="none" stroke="#a0c0e0" strokeWidth="0.8" opacity="0.5" />
      {/* Crystal/diamond shape */}
      <path d="M60 36 L68 50 L60 70 L52 50 Z" fill="none" stroke="#e0f0ff" strokeWidth="1.2" opacity="0.9" />
      <path d="M52 50 L68 50" stroke="#e0f0ff" strokeWidth="0.8" opacity="0.7" />
      <path d="M60 36 L52 50 M60 36 L68 50" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
      {/* Sparkle */}
      <line x1="60" y1="30" x2="60" y2="34" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
      <line x1="57" y1="31" x2="63" y2="31" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
      <text x="60" y="82" textAnchor="middle" fontFamily="serif" fontSize="4.5" fill="#c0d8f0" opacity="0.9" letterSpacing="1">STUFE IV</text>
      <ellipse cx="47" cy="42" rx="10" ry="6" fill="white" opacity="0.14" transform="rotate(-20 47 42)" />
    </svg>
  );
}

function MasterBadge() {
  return (
    <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="master-face" cx="36%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#fffbe0" />
          <stop offset="20%" stopColor="#f5d060" />
          <stop offset="45%" stopColor="#d4a020" />
          <stop offset="70%" stopColor="#9a6c08" />
          <stop offset="100%" stopColor="#5a3a02" />
        </radialGradient>
        <radialGradient id="master-rim" cx="50%" cy="50%" r="50%">
          <stop offset="65%" stopColor="transparent" />
          <stop offset="78%" stopColor="#c89820" />
          <stop offset="87%" stopColor="#f8e070" />
          <stop offset="93%" stopColor="#e0c040" />
          <stop offset="100%" stopColor="#806010" />
        </radialGradient>
        <radialGradient id="master-glow-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5c84280" />
          <stop offset="60%" stopColor="#f5c84220" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="master-glow">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="master-drop">
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#f5c842" floodOpacity="0.6" />
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#5a3a02" floodOpacity="0.6" />
        </filter>
      </defs>
      {/* Outer golden aura */}
      <circle cx="70" cy="68" r="58" fill="url(#master-glow-bg)" />
      {/* Outer star points (filigree) */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 70 + Math.cos(rad) * 48;
        const y1 = 68 + Math.sin(rad) * 48;
        const x2 = 70 + Math.cos(rad) * 54;
        const y2 = 68 + Math.sin(rad) * 54;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f5d060" strokeWidth="2" opacity="0.7" />;
      })}
      {/* Rim */}
      <circle cx="70" cy="68" r="50" fill="url(#master-rim)" filter="url(#master-drop)" />
      <circle cx="70" cy="68" r="48" fill="none" stroke="#f8e070" strokeWidth="1.5" opacity="0.6" />
      <circle cx="70" cy="68" r="45" fill="none" stroke="#c89820" strokeWidth="0.8" opacity="0.4" />
      {/* Face */}
      <circle cx="70" cy="68" r="43" fill="url(#master-face)" />
      {/* Decorative rings */}
      <circle cx="70" cy="68" r="39" fill="none" stroke="#f0d060" strokeWidth="0.8" opacity="0.5" />
      <circle cx="70" cy="68" r="36" fill="none" stroke="#d4a828" strokeWidth="0.5" opacity="0.4" />
      {/* Double laurel wreath */}
      {[-1,1].map((side, si) => (
        <g key={si}>
          {[0,1,2,3].map((i) => {
            const y = 50 + i * 6;
            const x = side === -1 ? 38 - i * 1.5 : 102 + i * 1.5;
            return (
              <ellipse key={i} cx={x} cy={y} rx="4" ry="2.5"
                fill="#f0d060" opacity="0.6"
                transform={`rotate(${side * (30 + i * 10)} ${x} ${y})`} />
            );
          })}
        </g>
      ))}
      {/* Academic crest — ornate shield */}
      <path d="M58 46 L58 70 C58 76 64 80 70 81 C76 80 82 76 82 70 L82 46 Z"
        fill="none" stroke="#fffbe0" strokeWidth="1.5" opacity="0.9" />
      <path d="M58 58 L82 58" stroke="#fffbe0" strokeWidth="1" opacity="0.6" />
      <path d="M70 46 L70 58" stroke="#fffbe0" strokeWidth="1" opacity="0.4" />
      {/* Crown */}
      <path d="M60 48 L62 42 L66 46 L70 40 L74 46 L78 42 L80 48"
        stroke="#fffbe0" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
      {/* Stars on shield */}
      <text x="65" y="68" fontFamily="serif" fontSize="8" fill="#fffbe0" opacity="0.8">★</text>
      <text x="60" y="78" textAnchor="middle" fontFamily="serif" fontSize="6" fill="#fffbe0" opacity="0.6">V</text>
      {/* Diploma scroll on side */}
      <rect x="112" y="52" width="16" height="24" rx="2" fill="#f5e8c0" opacity="0.85" />
      <rect x="110" y="56" width="20" height="4" rx="1" fill="#d4a828" opacity="0.7" />
      <rect x="110" y="68" width="20" height="4" rx="1" fill="#d4a828" opacity="0.7" />
      <line x1="114" y1="61" x2="124" y2="61" stroke="#8b6010" strokeWidth="0.7" opacity="0.5" />
      <line x1="114" y1="64" x2="124" y2="64" stroke="#8b6010" strokeWidth="0.7" opacity="0.5" />
      {/* Wax seal on diploma */}
      <circle cx="120" cy="76" r="4" fill="#c82020" opacity="0.8" />
      <text x="120" y="78" textAnchor="middle" fontFamily="serif" fontSize="4" fill="#f0d060" opacity="0.9">S</text>
      <text x="70" y="100" textAnchor="middle" fontFamily="serif" fontSize="5" fill="#f5d060" opacity="0.9" letterSpacing="1">STUFE V</text>
      <ellipse cx="55" cy="50" rx="12" ry="7" fill="white" opacity="0.1" transform="rotate(-20 55 50)" />
    </svg>
  );
}

// ─── Badge Pedestal ───────────────────────────────────────────────────────────

function BadgePedestal({
  badge,
  stufe,
  name,
  zertifikat,
  glowColor,
  glowIntensity,
  large = false,
}: {
  badge: React.ReactNode;
  stufe: string;
  name: string;
  zertifikat: string;
  glowColor: string;
  glowIntensity: number;
  large?: boolean;
}) {
  const size = large ? 'w-28 h-28 sm:w-36 sm:h-36' : 'w-20 h-20 sm:w-28 sm:h-28';

  return (
    <div className="flex flex-col items-center gap-0 group">
      {/* Glow halo */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full blur-2xl transition-all duration-700 group-hover:scale-110"
          style={{
            background: glowColor,
            opacity: glowIntensity,
            transform: 'scale(1.3)',
          }}
        />
        {/* Badge */}
        <div className={`relative ${size} drop-shadow-2xl transition-transform duration-500 group-hover:-translate-y-2`}>
          {badge}
        </div>
      </div>

      {/* Velvet cushion */}
      <div
        className="w-16 sm:w-20 h-2 rounded-b-full mt-1"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #3a1a2e 0%, #1a0a18 100%)',
          boxShadow: `0 4px 12px rgba(0,0,0,0.5), inset 0 -1px 3px rgba(255,255,255,0.05)`,
        }}
      />
      {/* Iron stand */}
      <div
        className="w-3 sm:w-4 h-6 sm:h-8"
        style={{
          background: 'linear-gradient(to bottom, #3a3a3a 0%, #1a1a1a 50%, #2a2a2a 100%)',
          boxShadow: 'inset -1px 0 2px rgba(255,255,255,0.1), inset 1px 0 2px rgba(0,0,0,0.5)',
        }}
      />
      <div
        className="w-12 sm:w-16 h-2"
        style={{
          background: 'linear-gradient(to right, #1a1a1a 0%, #3a3a3a 50%, #1a1a1a 100%)',
          borderRadius: '0 0 4px 4px',
        }}
      />

      {/* Labels */}
      <div className="mt-4 text-center px-1">
        <p className="font-sans text-[9px] sm:text-[10px] font-bold tracking-[0.15em] uppercase text-amber-400/70 mb-0.5">
          {stufe}
        </p>
        <p className="font-serif text-xs sm:text-sm font-bold text-amber-100/90 leading-tight">
          {name}
        </p>
        <p className="font-sans text-[8px] sm:text-[9px] tracking-wider uppercase text-amber-400/50 mt-0.5">
          {zertifikat}
        </p>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

const STUFEN = [
  {
    badge: <RenderBadge tier="bronze" alt="Bronze-Medaille" />,
    stufe: 'Stufe 1',
    name: 'Der Funke',
    zertifikat: 'Basis-Zertifikat',
    glowColor: 'radial-gradient(circle, #c47c3a80, transparent)',
    glowIntensity: 0.6,
  },
  {
    badge: <RenderBadge tier="silber" alt="Silber-Medaille" />,
    stufe: 'Stufe 2',
    name: 'Die Flamme bezähmen',
    zertifikat: 'Fortgeschrittenes Zertifikat',
    glowColor: 'radial-gradient(circle, #c0d0e080, transparent)',
    glowIntensity: 0.6,
  },
  {
    badge: <RenderBadge tier="gold" alt="Gold-Medaille" />,
    stufe: 'Stufe 3',
    name: 'Hitzekontrolle',
    zertifikat: 'Profi-Zertifikat',
    glowColor: 'radial-gradient(circle, #f5c84280, transparent)',
    glowIntensity: 0.7,
  },
  {
    badge: <RenderBadge tier="platin" alt="Platin-Medaille" />,
    stufe: 'Stufe 4',
    name: 'Präzision & Geschmack',
    zertifikat: 'Experten-Zertifikat',
    glowColor: 'radial-gradient(circle, #a8d0f090, transparent)',
    glowIntensity: 0.7,
  },
  {
    badge: <RenderBadge tier="master" alt="Meister-Medaille" />,
    stufe: 'Stufe 5',
    name: 'Der vollendete Pitmaster',
    zertifikat: 'Offizielles Akademie-Diplom',
    glowColor: 'radial-gradient(circle, #f5c842cc, transparent)',
    glowIntensity: 1.0,
    large: true,
  },
];

export default function DiplomaProgressSection() {
  return (
    <section className="relative w-full overflow-hidden py-20 sm:py-28">
      {/* ── Leather background ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 0%, #2a1206 0%, #120804 40%, #0a0502 100%)
          `,
        }}
      />
      {/* Leather grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px',
        }}
      />
      {/* Fire-forge ember glow — left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 40% 60% at 0% 100%, rgba(180,60,0,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 100% 100%, rgba(180,60,0,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 80% 10%, rgba(245,168,40,0.06) 0%, transparent 60%)
          `,
        }}
      />
      {/* Subtle horizontal rule at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header text ── */}
        <div className="text-center mb-14 sm:mb-20">
          <p className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-amber-500/80 mb-4">
            Deine Reise zum Grillmeister
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-5"
            style={{ color: '#f0e0a0', textShadow: '0 2px 20px rgba(245,168,40,0.2)' }}
          >
            Vom Grillen zur Kunst —<br className="hidden sm:block" /> Erwerbe dein Meisterdiplom
          </h2>
          <p className="font-serif italic text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#c8a850' }}
          >
            Belege dein Fachwissen, bestehe exklusive Prüfungen und werde Teil unserer Elite.<br className="hidden sm:block" />
            Eine Ausbildung in 5 präzisen Stufen.
          </p>
        </div>

        {/* ── Badge progression ── */}
        <div className="flex items-end justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-16 overflow-x-auto pb-4">
          {STUFEN.map((stufe, i) => (
            <BadgePedestal key={i} {...stufe} />
          ))}
        </div>

        {/* ── Connector line between badges (decorative) ── */}
        <div className="hidden md:block relative -mt-12 mb-12 max-w-3xl mx-auto">
          <div
            className="h-px"
            style={{
              background: 'linear-gradient(to right, transparent, #c89820 20%, #f5d060 50%, #c89820 80%, transparent)',
              opacity: 0.25,
            }}
          />
        </div>

        {/* ── CTA ── */}
        <div className="flex justify-center">
          <Link
            href="/diplome"
            className="group flex items-center gap-3 font-sans font-bold tracking-[0.16em] uppercase text-xs sm:text-sm px-10 py-4 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #2a1a0a 0%, #1a0e06 100%)',
              border: '1px solid rgba(200,152,32,0.4)',
              color: '#f0d060',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(245,200,66,0.1)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(245,200,66,0.7)';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 32px rgba(245,168,40,0.2), inset 0 1px 0 rgba(245,200,66,0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(200,152,32,0.4)';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(245,200,66,0.1)';
            }}
          >
            Deinen Meisterpfad starten
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" style={{ color: '#c89820' }} />
          </Link>
        </div>
      </div>
    </section>
  );
}
