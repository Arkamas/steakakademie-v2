'use client';

import Image from 'next/image';

// ── Crests ────────────────────────────────────────────────────────────────────
// Each crest uses the medal's own color family (engraved, not painted).

function FlameStamp({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40">
      <path
        d="M24 6 C21 13 13 16 13 25 C13 34 18 41 24 43 C30 41 35 34 35 25 C35 16 27 13 24 6Z"
        fill={c} opacity="0.9"
      />
      <path
        d="M24 14 C22 19 17 22 17 28 C17 34 20 38 24 39 C28 38 31 34 31 28 C31 22 26 19 24 14Z"
        fill="rgba(0,0,0,0.3)"
      />
      <path
        d="M24 22 C23 25 20 27 20 30 C20 33 22 35 24 36 C26 35 28 33 28 30 C28 27 25 25 24 22Z"
        fill="rgba(255,255,200,0.35)"
      />
    </svg>
  );
}

function ForkKnifeStamp({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40">
      <g transform="rotate(-18,24,24)">
        <rect x="17" y="8" width="3.5" height="22" rx="1.5" fill={c} opacity="0.9" />
        <rect x="15" y="8" width="1.8" height="9" rx="0.9" fill={c} opacity="0.8" />
        <rect x="20.5" y="8" width="1.8" height="9" rx="0.9" fill={c} opacity="0.8" />
        <path d="M16.5 15.5 Q19 17 21.5 15.5" stroke={c} strokeWidth="1" fill="none" opacity="0.6" />
        <rect x="16" y="32" width="5.5" height="10" rx="2.75" fill={c} opacity="0.85" />
      </g>
      <g transform="rotate(18,24,24)">
        <rect x="28" y="8" width="3.5" height="22" rx="1.5" fill={c} opacity="0.9" />
        <path d="M28 8 C28 8 33 14 33 19 L31 19 L28 15Z" fill={c} opacity="0.75" />
        <rect x="27" y="32" width="5" height="10" rx="2.5" fill={c} opacity="0.85" />
      </g>
      <rect x="14" y="24" width="20" height="2" rx="1" fill={c} opacity="0.5" />
    </svg>
  );
}

function TorchShieldStamp({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 48 48" width="42" height="42">
      <path d="M24 6 L38 11 L38 26 C38 35 32 41 24 45 C16 41 10 35 10 26 L10 11 Z"
        fill="none" stroke={c} strokeWidth="1.8" opacity="0.7" />
      <rect x="22" y="16" width="4" height="16" rx="2" fill={c} opacity="0.85" />
      <ellipse cx="24" cy="16" rx="5" ry="4" fill={c} opacity="0.6" />
      <ellipse cx="24" cy="14" rx="3" ry="2" fill={c} opacity="0.4" />
      <path d="M15 31 C15 28 18 27 19 29 C18 32 15 32 15 31Z" fill={c} opacity="0.75" />
      <path d="M13 35 C13 32 16 32 17 34 C16 37 13 37 13 35Z" fill={c} opacity="0.75" />
      <path d="M33 31 C33 28 30 27 29 29 C30 32 33 32 33 31Z" fill={c} opacity="0.75" />
      <path d="M35 35 C35 32 32 32 31 34 C32 37 35 37 35 35Z" fill={c} opacity="0.75" />
    </svg>
  );
}

function DiamondStamp({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40">
      <polygon points="24,6 40,22 24,44 8,22"
        fill="none" stroke={c} strokeWidth="1.8" opacity="0.85" />
      <polygon points="24,6 40,22 24,22" fill={c} opacity="0.3" />
      <polygon points="24,6 8,22 24,22" fill={c} opacity="0.2" />
      <polygon points="24,22 40,22 24,44" fill={c} opacity="0.15" />
      <polygon points="24,22 8,22 24,44" fill={c} opacity="0.22" />
      <line x1="24" y1="6" x2="24" y2="44" stroke={c} strokeWidth="0.7" opacity="0.4" />
      <line x1="8" y1="22" x2="40" y2="22" stroke={c} strokeWidth="0.7" opacity="0.4" />
      <circle cx="33" cy="14" r="1.8" fill={c} opacity="0.95" />
      <line x1="33" y1="10" x2="33" y2="18" stroke={c} strokeWidth="0.9" opacity="0.6" />
      <line x1="29" y1="14" x2="37" y2="14" stroke={c} strokeWidth="0.9" opacity="0.6" />
    </svg>
  );
}

function MasterCrestStamp({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 48 48" width="46" height="46">
      <path d="M24 4 L40 9 L40 26 C40 37 33 44 24 48 C15 44 8 37 8 26 L8 9 Z"
        fill="none" stroke={c} strokeWidth="2" opacity="0.8" />
      <path d="M24 10 L35 14 L35 27 C35 34 30 39 24 42 C18 39 13 34 13 27 L13 14 Z"
        fill="none" stroke={c} strokeWidth="1" opacity="0.5" />
      <path d="M16 13 L16 8 L20 11 L24 7 L28 11 L32 8 L32 13Z"
        fill={c} stroke={c} strokeWidth="0.5" opacity="0.85" />
      <circle cx="24" cy="10.5" r="1.4" fill={c} opacity="0.95" />
      <circle cx="18.5" cy="11.5" r="1" fill={c} opacity="0.8" />
      <circle cx="29.5" cy="11.5" r="1" fill={c} opacity="0.8" />
      <rect x="22" y="18" width="4" height="14" rx="2" fill={c} opacity="0.8" />
      <ellipse cx="24" cy="18" rx="5" ry="3.5" fill={c} opacity="0.55" />
      <path d="M14 33 C14 30 17 29 18 31" stroke={c} strokeWidth="1.5" fill="none" opacity="0.75" strokeLinecap="round" />
      <path d="M12 37 C12 34 15 33 16 35" stroke={c} strokeWidth="1.5" fill="none" opacity="0.75" strokeLinecap="round" />
      <path d="M34 33 C34 30 31 29 30 31" stroke={c} strokeWidth="1.5" fill="none" opacity="0.75" strokeLinecap="round" />
      <path d="M36 37 C36 34 33 33 32 35" stroke={c} strokeWidth="1.5" fill="none" opacity="0.75" strokeLinecap="round" />
      <path d="M18 43 Q24 46 30 43" stroke={c} strokeWidth="1" fill="none" opacity="0.6" />
    </svg>
  );
}

// ── Parchment scroll (Stufe 5 only) ──────────────────────────────────────────
function ParchmentScroll() {
  return (
    <div className="flex flex-col items-center justify-end mb-1" style={{ height: '160px' }}>
      <div className="relative" style={{ width: '52px' }}>
        {/* Warm ambient glow — localized, not an orb */}
        <div style={{
          position: 'absolute', inset: '-8px',
          background: 'radial-gradient(ellipse 80% 60% at 50% 60%, rgba(200,140,30,0.18) 0%, transparent 75%)',
          pointerEvents: 'none',
        }} />
        {/* Top roll end */}
        <div style={{
          width: '52px', height: '14px',
          background: 'linear-gradient(180deg, #F5E8C0 0%, #C8A850 40%, #A88030 60%, #C8A850 100%)',
          borderRadius: '50%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
        }} />
        {/* Scroll body */}
        <div style={{
          width: '52px', height: '90px',
          background: [
            'linear-gradient(90deg, rgba(0,0,0,0.25) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.25) 100%)',
            'linear-gradient(180deg, #EDD99A 0%, #D4B86A 30%, #C8A850 60%, #D4B86A 85%, #EDD99A 100%)',
          ].join(', '),
          boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.2), inset -2px 0 4px rgba(0,0,0,0.2)',
          position: 'relative',
        }}>
          {/* Script lines suggestion */}
          {[18, 30, 42, 54, 66].map(y => (
            <div key={y} style={{
              position: 'absolute', left: '10px', right: '10px', top: `${y}px`,
              height: '1px',
              background: 'rgba(100,60,10,0.2)',
            }} />
          ))}
        </div>
        {/* Bottom roll end */}
        <div style={{
          width: '52px', height: '14px',
          background: 'linear-gradient(180deg, #C8A850 0%, #A88030 40%, #C8A850 80%, #F5E8C0 100%)',
          borderRadius: '50%',
          boxShadow: '0 3px 6px rgba(0,0,0,0.5)',
        }} />
        {/* Wax seal */}
        <div style={{
          position: 'absolute', left: '50%', top: '52%',
          transform: 'translate(-50%, -50%)',
          width: '20px', height: '20px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 35%, #C84040 0%, #8B1010 55%, #600808 100%)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,160,160,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '12px', height: '12px',
            border: '1px solid rgba(255,200,180,0.3)',
            borderRadius: '50%',
          }} />
        </div>
      </div>
    </div>
  );
}

// ── Forged iron stand with velvet cushion ────────────────────────────────────
function ForgedStand({ medalSize }: { medalSize: number }) {
  const cushionW = Math.round(medalSize * 0.62);
  return (
    <div className="flex flex-col items-center" style={{ marginTop: '-2px' }}>
      {/* Velvet cushion */}
      <div style={{
        width: `${cushionW}px`,
        height: '18px',
        background: 'linear-gradient(180deg, #2E1840 0%, #1C0F28 60%, #150B20 100%)',
        borderRadius: '5px 5px 0 0',
        boxShadow: 'inset 0 3px 5px rgba(0,0,0,0.45), 0 -1px 0 rgba(120,70,160,0.18)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Velvet sheen highlight */}
        <div style={{
          position: 'absolute', top: '2px', left: '18%', right: '18%', height: '2px',
          background: 'rgba(180,130,220,0.1)',
          borderRadius: '50%',
        }} />
        {/* Depression where medal sits */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 65% 50% at 50% 30%, rgba(0,0,0,0.35) 0%, transparent 80%)',
        }} />
      </div>
      {/* Iron post — tapered, forged */}
      <div style={{
        width: '13px',
        height: '38px',
        background: [
          'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
          'linear-gradient(90deg, #222222 0%, #484848 30%, #3C3C3C 55%, #262626 80%, #1E1E1E 100%)',
        ].join(', '),
        boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.05), inset -1px 0 2px rgba(0,0,0,0.5)',
        position: 'relative',
      }}>
        {/* Forge marks — horizontal faint grooves */}
        {[10, 20, 30].map(y => (
          <div key={y} style={{
            position: 'absolute', left: 0, right: 0, top: `${y}px`, height: '1px',
            background: 'rgba(0,0,0,0.25)',
          }} />
        ))}
      </div>
      {/* Base plate */}
      <div style={{
        width: `${Math.round(cushionW * 0.85)}px`,
        height: '10px',
        background: 'linear-gradient(180deg, #484848 0%, #2A2A2A 55%, #1A1A1A 100%)',
        borderRadius: '2px',
        boxShadow: '0 5px 14px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)',
      }} />
    </div>
  );
}

// ── Badge definitions ─────────────────────────────────────────────────────────
interface BadgeDef {
  id: number; stufe: string; name: string; cert: string;
  size: number; ringW: number; ringBg: string; medalBg: string;
  highlightBg: string; castShadow: string; bevelInset: string;
  ringInset: string; crestColor: string; labelColor: string; certColor: string;
  isMaster?: boolean;
}

const BADGES: BadgeDef[] = [
  {
    id: 1,
    stufe: 'Stufe 1',
    name: 'Der Funke',
    cert: 'Basis-Zertifikat',
    size: 122,
    ringW: 9,
    // Handforged dark bronze — raw, directional forge-light from upper-left
    ringBg: 'linear-gradient(145deg, #7A4A1E 0%, #4A2A0A 45%, #6A3A14 75%, #3A1E06 100%)',
    medalBg: [
      'radial-gradient(ellipse 28% 22% at 22% 18%, rgba(255,170,60,0.28) 0%, transparent 100%)',
      'radial-gradient(ellipse 10% 7% at 60% 62%, rgba(60,20,5,0.5) 0%, transparent 100%)',
      'radial-gradient(ellipse 12% 8% at 40% 45%, rgba(130,70,20,0.22) 0%, transparent 100%)',
      'radial-gradient(ellipse 95% 90% at 50% 50%, transparent 62%, rgba(0,0,0,0.55) 100%)',
      'linear-gradient(145deg, #6A3E1C 0%, #4A2808 35%, #321608 60%, #5A3214 82%, #3A1C06 100%)',
    ].join(', '),
    highlightBg: 'linear-gradient(145deg, rgba(255,190,80,0.28) 0%, rgba(255,150,40,0.08) 30%, transparent 55%)',
    castShadow: '0 14px 30px rgba(0,0,0,0.9), 0 5px 10px rgba(0,0,0,0.7)',
    bevelInset: 'inset 0 2px 3px rgba(255,180,70,0.22), inset 0 -3px 5px rgba(0,0,0,0.75), inset 2px 0 3px rgba(0,0,0,0.35)',
    ringInset: 'inset 0 1px 2px rgba(255,160,50,0.25), inset 0 -1px 3px rgba(0,0,0,0.7)',
    crestColor: 'rgba(170,90,25,0.95)',
    labelColor: '#B87030',
    certColor: 'rgba(150,80,25,0.55)',
  },
  {
    id: 2,
    stufe: 'Stufe 2',
    name: 'Die Flamme Bezähmen',
    cert: 'Silber-Zertifikat',
    size: 132,
    ringW: 10,
    // Polished sterling silver — sharp elongated highlight, cool reflections
    ringBg: 'linear-gradient(145deg, #E8E8E8 0%, #909090 40%, #C8C8C8 65%, #686868 100%)',
    medalBg: [
      // Specular: narrow bright highlight strip (polished silver characteristic)
      'linear-gradient(148deg, rgba(255,255,255,0.6) 0%, rgba(240,240,255,0.3) 12%, transparent 28%)',
      // Fire-light warm reflection (bottom-left, subtle)
      'radial-gradient(ellipse 30% 20% at 20% 82%, rgba(255,130,30,0.12) 0%, transparent 100%)',
      // Edge vignette
      'radial-gradient(ellipse 95% 90% at 50% 50%, transparent 58%, rgba(0,0,0,0.52) 100%)',
      // Directional base
      'linear-gradient(145deg, #D8D8D8 0%, #A0A0A0 30%, #787878 58%, #B0B0B0 80%, #686868 100%)',
    ].join(', '),
    highlightBg: 'linear-gradient(148deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 18%, transparent 35%)',
    castShadow: '0 14px 30px rgba(0,0,0,0.88), 0 5px 10px rgba(0,0,0,0.65)',
    bevelInset: 'inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -3px 5px rgba(0,0,0,0.65), inset 2px 0 3px rgba(0,0,0,0.25)',
    ringInset: 'inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(0,0,0,0.6)',
    crestColor: 'rgba(200,200,215,0.9)',
    labelColor: '#BCBCC8',
    certColor: 'rgba(150,150,165,0.55)',
  },
  {
    id: 3,
    stufe: 'Stufe 3',
    name: 'Hitzekontrolle',
    cert: 'Gold-Zertifikat',
    size: 142,
    ringW: 11,
    // Burnished 18k gold — warm, heavy, burnished cross-lines
    ringBg: 'linear-gradient(145deg, #FFE566 0%, #C8A200 35%, #8B6914 60%, #D4B000 82%, #7A5A08 100%)',
    medalBg: [
      'radial-gradient(ellipse 30% 24% at 22% 16%, rgba(255,255,180,0.38) 0%, transparent 100%)',
      // Burnished cross-texture
      'repeating-linear-gradient(165deg, transparent 0px, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)',
      'radial-gradient(ellipse 25% 18% at 72% 72%, rgba(100,60,0,0.45) 0%, transparent 100%)',
      'radial-gradient(ellipse 95% 90% at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%)',
      'linear-gradient(145deg, #D4A800 0%, #A07800 28%, #705000 55%, #B08800 80%, #604000 100%)',
    ].join(', '),
    highlightBg: 'linear-gradient(145deg, rgba(255,255,200,0.42) 0%, rgba(255,230,80,0.12) 25%, transparent 48%)',
    castShadow: '0 16px 34px rgba(0,0,0,0.9), 0 6px 12px rgba(0,0,0,0.7)',
    bevelInset: 'inset 0 2px 4px rgba(255,240,100,0.3), inset 0 -3px 6px rgba(0,0,0,0.75), inset 2px 0 3px rgba(0,0,0,0.4)',
    ringInset: 'inset 0 1px 2px rgba(255,240,100,0.4), inset 0 -1px 3px rgba(0,0,0,0.65)',
    crestColor: 'rgba(220,170,30,0.9)',
    labelColor: '#D4A800',
    certColor: 'rgba(180,130,20,0.55)',
  },
  {
    id: 4,
    stufe: 'Stufe 4',
    name: 'Präzision & Geschmack',
    cert: 'Platin-Zertifikat',
    size: 152,
    ringW: 12,
    // Brushed platinum — cool, technical, brushed linear texture
    ringBg: 'linear-gradient(145deg, #F0F4FF 0%, #9098B0 40%, #D0D8EE 65%, #707890 100%)',
    medalBg: [
      'radial-gradient(ellipse 28% 22% at 24% 16%, rgba(255,255,255,0.55) 0%, transparent 100%)',
      // Brushed metal texture — fine parallel lines
      'repeating-linear-gradient(178deg, transparent 0px, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px)',
      'radial-gradient(ellipse 28% 20% at 22% 80%, rgba(255,140,30,0.1) 0%, transparent 100%)',
      'radial-gradient(ellipse 95% 90% at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%)',
      'linear-gradient(145deg, #D8DCF0 0%, #A8B0C8 28%, #808898 55%, #B8C0D8 80%, #686878 100%)',
    ].join(', '),
    highlightBg: 'linear-gradient(145deg, rgba(255,255,255,0.55) 0%, rgba(220,230,255,0.18) 22%, transparent 40%)',
    castShadow: '0 16px 34px rgba(0,0,0,0.9), 0 6px 12px rgba(0,0,0,0.7)',
    bevelInset: 'inset 0 2px 3px rgba(255,255,255,0.45), inset 0 -3px 5px rgba(0,0,0,0.65), inset 2px 0 3px rgba(0,0,0,0.25)',
    ringInset: 'inset 0 1px 2px rgba(255,255,255,0.55), inset 0 -1px 3px rgba(0,0,0,0.6)',
    crestColor: 'rgba(210,220,245,0.88)',
    labelColor: '#B8C0D8',
    certColor: 'rgba(150,158,185,0.55)',
  },
  {
    id: 5,
    stufe: 'Stufe 5',
    name: 'Der Vollendete Pitmaster',
    cert: 'Meister-Diplom',
    size: 172,
    ringW: 14,
    isMaster: true,
    // Master: forged gold+platinum — warm forge-fire, heavy & physical
    ringBg: 'linear-gradient(145deg, #FFE566 0%, #C8882A 25%, #8B6914 45%, #E8B800 65%, #7A5808 82%, #FFD060 100%)',
    medalBg: [
      'radial-gradient(ellipse 32% 26% at 22% 16%, rgba(255,255,200,0.42) 0%, transparent 100%)',
      // Forge fire reflection — warm amber from lower-front
      'radial-gradient(ellipse 40% 28% at 35% 82%, rgba(255,140,30,0.2) 0%, transparent 75%)',
      // Hammer texture
      'radial-gradient(ellipse 8% 6% at 42% 38%, rgba(0,0,0,0.3) 0%, transparent 100%)',
      'radial-gradient(ellipse 7% 5% at 66% 55%, rgba(0,0,0,0.25) 0%, transparent 100%)',
      'radial-gradient(ellipse 6% 5% at 55% 25%, rgba(255,200,80,0.18) 0%, transparent 100%)',
      'radial-gradient(ellipse 95% 90% at 50% 50%, transparent 58%, rgba(0,0,0,0.6) 100%)',
      'linear-gradient(145deg, #B88800 0%, #8A6000 25%, #5A3C00 50%, #9A7010 72%, #6A4800 88%, #4A3000 100%)',
    ].join(', '),
    highlightBg: 'linear-gradient(145deg, rgba(255,250,200,0.45) 0%, rgba(255,220,80,0.14) 24%, transparent 46%)',
    castShadow: '0 18px 40px rgba(0,0,0,0.95), 0 7px 14px rgba(0,0,0,0.75)',
    bevelInset: 'inset 0 3px 5px rgba(255,240,100,0.3), inset 0 -4px 7px rgba(0,0,0,0.8), inset 2px 0 4px rgba(0,0,0,0.45)',
    ringInset: 'inset 0 2px 3px rgba(255,240,100,0.38), inset 0 -2px 4px rgba(0,0,0,0.7)',
    crestColor: 'rgba(230,180,40,0.92)',
    labelColor: '#E8B820',
    certColor: 'rgba(200,140,20,0.6)',
  },
] as const;

// Echte Münz-Renders (Bullenkopf-Design) statt der gezeichneten Gradient-Münzen.
const TIER_FILE: Record<number, string> = {
  1: 'bronze', 2: 'silber', 3: 'gold', 4: 'platin', 5: 'master',
};

function Medal({ b }: { b: BadgeDef }) {
  const outer = b.size;
  const file = TIER_FILE[b.id] ?? 'bronze';

  return (
    <div style={{ position: 'relative', width: outer, height: outer, flexShrink: 0 }}>
      <Image
        src={`/images/diplome/medal-${file}.png`}
        alt={`${b.cert} — ${b.name}`}
        width={outer}
        height={outer}
        sizes={`${outer}px`}
        style={{
          width: outer, height: outer, objectFit: 'contain',
          filter: 'drop-shadow(0 14px 30px rgba(0,0,0,0.85))',
        }}
      />
    </div>
  );
}

export default function BadgeProgression() {
  return (
    <section
      className="py-16 px-4"
      style={{
        background: [
          'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(80,40,10,0.35) 0%, transparent 70%)',
          'linear-gradient(180deg, #0A0706 0%, #100C08 50%, #0A0706 100%)',
        ].join(', '),
      }}
    >
      <div className="max-w-editorial mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-[10px] font-sans font-bold tracking-[0.22em] uppercase text-brand-fire mb-3">
            Steakakademie · Zertifizierungsstufen
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-light">
            Fünf Stufen zur Meisterschaft
          </h2>
        </div>

        {/* Badge row — horizontal scroll on mobile */}
        <div className="overflow-x-auto pb-4">
          <div
            className="flex items-end justify-center gap-6 lg:gap-10"
            style={{ minWidth: 'max-content', margin: '0 auto', padding: '0 16px' }}
          >
            {BADGES.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center">
                {/* For master badge: medal + parchment side by side */}
                {badge.isMaster ? (
                  <div className="flex items-end gap-3">
                    <Medal b={badge} />
                    <ParchmentScroll />
                  </div>
                ) : (
                  <Medal b={badge} />
                )}

                <ForgedStand medalSize={badge.size} />

                {/* Labels */}
                <div className="text-center mt-5 space-y-1.5">
                  <p style={{
                    fontSize: '9px', fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 700, letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: badge.labelColor + '99',
                  }}>
                    {badge.stufe}
                  </p>
                  <p style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontWeight: 700,
                    fontSize: badge.isMaster ? '13px' : '11px',
                    color: badge.labelColor,
                    maxWidth: badge.isMaster ? '148px' : '118px',
                    lineHeight: 1.3,
                    textAlign: 'center',
                  }}>
                    {badge.name}
                  </p>
                  <p style={{
                    fontSize: '9px', fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 700, letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: badge.certColor as string,
                  }}>
                    {badge.cert}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <div className="h-px w-24"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(200,136,42,0.3))' }} />
          <div style={{ width: 5, height: 5, background: 'rgba(200,136,42,0.4)', transform: 'rotate(45deg)' }} />
          <div className="h-px w-24"
            style={{ background: 'linear-gradient(90deg, rgba(200,136,42,0.3), transparent)' }} />
        </div>
      </div>
    </section>
  );
}
