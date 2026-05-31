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

export default function Medal({ tier, size = 60, locked = false, level, baseImage, className }: MedalProps) {
  const t = TIERS[tier];
  const uid = `medal-${tier}`;

  // Foto-Upgrade-Pfad: wenn echtes Render existiert, dieses nehmen.
  if (baseImage) {
    return (
      <div className={className} style={{ width: size, height: size, position: 'relative', filter: locked ? 'grayscale(1) brightness(0.55)' : undefined }}>
        <Image src={baseImage} alt={`${t.label}-Medaille`} fill sizes={`${size}px`} className="object-contain" />
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

      {/* Longhorn-Emblem (geprägt) */}
      <g stroke={t.emboss} fill={t.emboss} opacity="0.92" strokeLinecap="round" strokeLinejoin="round">
        {/* Hörner — weite Schwung-Kurve */}
        <path
          d="M18 48 C 16 30, 30 24, 40 34 C 45 39, 55 39, 60 34 C 70 24, 84 30, 82 48"
          fill="none" strokeWidth="5"
        />
        {/* Kopf */}
        <path d="M50 40 C 41 40, 35 47, 35 56 C 35 66, 42 72, 50 72 C 58 72, 65 66, 65 56 C 65 47, 59 40, 50 40 Z" />
        {/* Augen (ausgespart, heller) */}
        <circle cx="44" cy="54" r="2.4" fill={t.hi} stroke="none" />
        <circle cx="56" cy="54" r="2.4" fill={t.hi} stroke="none" />
        {/* Nüstern */}
        <ellipse cx="46.5" cy="63" rx="1.6" ry="2.2" fill={t.hi} stroke="none" />
        <ellipse cx="53.5" cy="63" rx="1.6" ry="2.2" fill={t.hi} stroke="none" />
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
