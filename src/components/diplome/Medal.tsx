import Image from 'next/image';

// 5 Metall-Tiers — eskalierend über die 10 Diplom-Level (je 2 Level pro Metall).
export type MedalTier = 'bronze' | 'silber' | 'gold' | 'platin' | 'master';

export function tierForLevel(id: number): MedalTier {
  if (id <= 2) return 'bronze';
  if (id <= 4) return 'silber';
  if (id <= 6) return 'gold';
  if (id <= 8) return 'platin';
  return 'master';
}

interface TierStyle {
  hi: string;   // Highlight (Mitte)
  mid: string;  // Mittelton
  lo: string;   // Schatten (Rand)
  ring: string; // Rand-Ring
  emboss: string; // geprägtes Emblem
  label: string;
}

const TIERS: Record<MedalTier, TierStyle> = {
  bronze: { hi: '#e6a866', mid: '#b06a30', lo: '#6f4220', ring: '#8c5a2b', emboss: '#4a2c14', label: 'Bronze' },
  silber: { hi: '#f6f8fa', mid: '#c2c8cd', lo: '#878d92', ring: '#9aa0a5', emboss: '#5c6266', label: 'Silber' },
  gold:   { hi: '#ffe9a8', mid: '#e6b94e', lo: '#9c7320', ring: '#c9991f', emboss: '#5e4408', label: 'Gold' },
  platin: { hi: '#eef3f6', mid: '#9fb0b8', lo: '#586870', ring: '#7c8c94', emboss: '#36444b', label: 'Platin' },
  master: { hi: '#52525a', mid: '#24242a', lo: '#0e0e12', ring: '#C8882A', emboss: '#C8882A', label: 'Meister' },
};

interface MedalProps {
  tier: MedalTier;
  size?: number;
  locked?: boolean;
  level?: number;
  /** Späteres Foto-Upgrade: photorealistische Basis aus MimicPC, z.B. /images/diplome/medal-bronze.png */
  baseImage?: string;
  className?: string;
}

// Echte Münz-Renders (freigestellt, kreisrund) — ersetzen das SVG-Fallback.
const TIER_IMAGE: Record<MedalTier, string> = {
  bronze: '/images/diplome/medal-bronze.png',
  silber: '/images/diplome/medal-silber.png',
  gold:   '/images/diplome/medal-gold.png',
  platin: '/images/diplome/medal-platin.png',
  master: '/images/diplome/medal-master.png',
};

export default function Medal({ tier, size = 60, locked = false, level, baseImage, className }: MedalProps) {
  const t = TIERS[tier];
  const uid = `medal-${tier}`;
  const img = baseImage ?? TIER_IMAGE[tier];

  // Foto-Upgrade-Pfad: echtes Render bevorzugen, SVG nur als Fallback.
  if (img) {
    return (
      <div className={className} style={{ width: size, height: size, position: 'relative', filter: locked ? 'grayscale(1) brightness(0.55)' : undefined }}>
        <Image src={img} alt={`${t.label}-Medaille`} fill sizes={`${size}px`} className="object-contain" />
      </div>
    );
  }

  return (
    <svg
      width={size} height={size} viewBox="0 0 100 100"
      className={className}
      style={{ filter: locked ? 'grayscale(0.9) brightness(0.55)' : `drop-shadow(0 2px 4px rgba(0,0,0,0.5))` }}
      role="img" aria-label={`${t.label}-Medaille${level ? ` (Level ${level})` : ''}`}
    >
      <defs>
        <radialGradient id={`${uid}-disc`} cx="42%" cy="36%" r="68%">
          <stop offset="0%"  stopColor={t.hi} />
          <stop offset="55%" stopColor={t.mid} />
          <stop offset="100%" stopColor={t.lo} />
        </radialGradient>
        <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.hi} />
          <stop offset="100%" stopColor={t.lo} />
        </linearGradient>
      </defs>

      {/* Münzkörper */}
      <circle cx="50" cy="50" r="47" fill={`url(#${uid}-disc)`} stroke={t.ring} strokeWidth="2" />
      {/* geprägter Doppel-Rand */}
      <circle cx="50" cy="50" r="42" fill="none" stroke={t.lo} strokeWidth="1.5" opacity="0.55" />
      <circle cx="50" cy="50" r="40" fill="none" stroke={t.hi} strokeWidth="1" opacity="0.5" />

      {/* Flammen-Emblem (Marken-Motiv, geprägt) */}
      <g opacity="0.94">
        <path
          d="M50 24 C 56 37, 67 44, 67 57 C 67 68, 59 76, 50 76 C 41 76, 33 68, 33 57 C 33 49, 37 45, 41 50 C 40 41, 44 32, 50 24 Z"
          fill={t.emboss}
        />
        <path
          d="M50 45 C 53 52, 59 56, 59 63 C 59 69, 55 73, 50 73 C 45 73, 41 69, 41 63 C 41 58, 44 56, 46 59 C 46 53, 48 49, 50 45 Z"
          fill={t.hi} opacity="0.55"
        />
      </g>

      {/* Glanz-Highlight */}
      <ellipse cx="38" cy="30" rx="20" ry="11" fill="#ffffff" opacity="0.14" />

      {level != null && (
        <text x="50" y="90" textAnchor="middle" fontSize="11" fontWeight="700"
          fill={t.hi} stroke={t.lo} strokeWidth="0.4" fontFamily="Georgia, serif">{level}</text>
      )}
    </svg>
  );
}
