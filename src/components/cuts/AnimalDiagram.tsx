'use client';

import type { Primal, Species } from '@/lib/cuts-catalog';

interface AnimalDiagramProps {
  species: Species;
  primals: Primal[];
  selectedPrimal: string | null;
  onSelectPrimal: (id: string) => void;
}

/**
 * Interaktive Tier-Silhouette im „Metzger-Poster"-Stil (Carneo-Anmutung).
 * Klickbare Teilstück-Regionen über einer dunklen Körper-Kontur.
 */
export default function AnimalDiagram({
  species,
  primals,
  selectedPrimal,
  onSelectPrimal,
}: AnimalDiagramProps) {
  return (
    <svg
      viewBox="0 0 900 440"
      className="w-full select-none"
      style={{ maxHeight: 460 }}
      aria-label="Interaktives Diagramm — wähle ein Teilstück"
    >
      <rect width="900" height="440" fill="#0D0A06" />

      {/* dezentes Raster */}
      {[180, 320, 460, 600, 740].map((x) => (
        <line key={x} x1={x} y1="110" x2={x} y2="380" stroke="#160f08" strokeWidth="1" />
      ))}

      {species === 'rind' ? <CowDecor /> : <PigDecor />}

      {/* Körper-Backdrop (Summe der Regionen) */}
      <path
        d="M118,205 L120,150 L792,142 L800,330 L662,286 L308,360 L200,366 L150,260 Z"
        fill="#150d07"
        stroke="#2a1c10"
        strokeWidth="1"
      />

      {/* Teilstück-Regionen */}
      {primals.map((p) => {
        const isSel = selectedPrimal === p.id;
        return (
          <g
            key={p.id}
            role="button"
            tabIndex={0}
            aria-label={p.nameDE}
            className="cursor-pointer"
            onClick={() => onSelectPrimal(p.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectPrimal(p.id)}
          >
            <polygon
              points={p.points}
              fill={isSel ? `${p.color}` : '#20140b'}
              fillOpacity={isSel ? 0.92 : 1}
              stroke={isSel ? '#E8C070' : '#46301a'}
              strokeWidth={isSel ? 2.5 : 1.25}
              strokeLinejoin="round"
              style={{ transition: 'fill 0.2s, stroke 0.2s, fill-opacity 0.2s' }}
            />
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              fill={isSel ? '#F0E8D8' : '#9a7548'}
              fontSize="13"
              fontFamily="Playfair Display, Georgia, serif"
              fontWeight="bold"
              style={{ transition: 'fill 0.2s', pointerEvents: 'none' }}
            >
              {p.nameDE}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CowDecor() {
  return (
    <g fill="#150d07" stroke="#2a1c10" strokeWidth="1.25" strokeLinejoin="round">
      {/* Kopf & Hals */}
      <path d="M118,205 Q70,200 62,168 Q56,140 80,124 Q104,108 120,150 L118,205 Z" />
      {/* Ohr */}
      <path d="M84,126 Q72,104 90,100 Q104,100 104,118 Z" />
      {/* Horn */}
      <path d="M108,112 Q112,92 126,90 Q120,104 118,122 Z" />
      {/* Schnauze */}
      <ellipse cx="60" cy="172" rx="9" ry="7" fill="#1e120a" />
      {/* Auge */}
      <circle cx="96" cy="138" r="3.5" fill="#0a0603" />
      {/* Vorderbeine */}
      <rect x="190" y="360" width="26" height="72" rx="4" />
      <rect x="232" y="360" width="26" height="72" rx="4" />
      {/* Hinterbeine */}
      <rect x="700" y="352" width="27" height="80" rx="4" />
      <rect x="748" y="352" width="27" height="80" rx="4" />
      {/* Schwanz */}
      <path d="M798,150 Q842,168 854,210 Q860,238 844,258" fill="none" stroke="#2a1c10" strokeWidth="3" strokeLinecap="round" />
      <circle cx="842" cy="262" r="8" fill="#1e120a" />
    </g>
  );
}

function PigDecor() {
  // Platzhalter-Dekor für die spätere Schwein-Silhouette
  return (
    <g fill="#150d07" stroke="#2a1c10" strokeWidth="1.25" strokeLinejoin="round">
      <ellipse cx="78" cy="190" rx="26" ry="22" />
      <ellipse cx="58" cy="196" rx="10" ry="9" fill="#1e120a" />
      <circle cx="86" cy="176" r="3" fill="#0a0603" />
      <rect x="200" y="360" width="24" height="70" rx="4" />
      <rect x="240" y="360" width="24" height="70" rx="4" />
      <rect x="700" y="352" width="24" height="78" rx="4" />
      <rect x="742" y="352" width="24" height="78" rx="4" />
      <path d="M796,180 Q826,176 822,206 Q818,226 800,222" fill="none" stroke="#2a1c10" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}
