'use client';

import { type CutData } from '@/lib/cuts-data';

interface BeefDiagramProps {
  cuts: CutData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const LABEL_WIDTH = 72;
const LABEL_HEIGHT = 20;

export default function BeefDiagram({ cuts, selectedId, onSelect }: BeefDiagramProps) {
  return (
    <svg
      viewBox="0 0 900 440"
      className="w-full select-none"
      style={{ maxHeight: '500px' }}
      aria-label="Interaktives Rind-Diagramm — klicke auf eine Region"
    >
      {/* Background */}
      <rect width="900" height="440" fill="#0D0D0D" />

      {/* Subtle grid */}
      {[150, 300, 450, 600, 750].map(x => (
        <line key={x} x1={x} y1="100" x2={x} y2="380" stroke="#1a1000" strokeWidth="1" />
      ))}

      {/* Decorative outer body */}
      <line x1="155" y1="106" x2="794" y2="108" stroke="#2a1200" strokeWidth="2.5" />

      {/* Head & neck */}
      <path
        d="M 62,185 Q 58,152 74,130 Q 90,108 120,106 Q 142,104 158,112
           L 158,148 Q 136,150 118,162 Q 98,178 92,208
           Q 84,238 100,260 Q 118,280 144,286 L 155,288 L 155,258"
        fill="#140800" stroke="#3a1800" strokeWidth="1.5" strokeLinejoin="round"
      />
      <ellipse cx="60" cy="188" rx="9" ry="6" fill="#1e0a00" stroke="#4a2000" strokeWidth="1" />
      <circle cx="102" cy="138" r="5" fill="#0a0400" stroke="#5a2800" strokeWidth="1.5" />
      <circle cx="103" cy="137" r="2" fill="#3a1a00" />
      <path
        d="M 112,107 Q 104,86 118,78 Q 132,72 135,90 Q 130,104 120,106"
        fill="#140800" stroke="#3a1800" strokeWidth="1.5"
      />

      {/* Front legs */}
      <rect x="176" y="358" width="30" height="74" rx="5" fill="#140800" stroke="#3a1800" strokeWidth="1.5" />
      <rect x="220" y="358" width="30" height="74" rx="5" fill="#140800" stroke="#3a1800" strokeWidth="1.5" />
      <rect x="174" y="420" width="34" height="10" rx="3" fill="#0e0500" stroke="#4a2000" strokeWidth="1" />
      <rect x="218" y="420" width="34" height="10" rx="3" fill="#0e0500" stroke="#4a2000" strokeWidth="1" />

      {/* Rear legs */}
      <rect x="700" y="356" width="30" height="76" rx="5" fill="#140800" stroke="#3a1800" strokeWidth="1.5" />
      <rect x="746" y="356" width="30" height="76" rx="5" fill="#140800" stroke="#3a1800" strokeWidth="1.5" />
      <rect x="698" y="420" width="34" height="10" rx="3" fill="#0e0500" stroke="#4a2000" strokeWidth="1" />
      <rect x="744" y="420" width="34" height="10" rx="3" fill="#0e0500" stroke="#4a2000" strokeWidth="1" />

      {/* Tail */}
      <path
        d="M 800,145 Q 848,162 864,196 Q 874,224 860,248"
        fill="none" stroke="#3a1800" strokeWidth="3" strokeLinecap="round"
      />
      <circle cx="858" cy="252" r="9" fill="#1e0a00" stroke="#4a2000" strokeWidth="1.5" />

      {/* Belly line */}
      <path
        d="M 155,358 Q 230,372 380,374 Q 520,376 660,370 L 715,356"
        fill="none" stroke="#2a1200" strokeWidth="1.5"
      />

      {/* Cut region polygons */}
      {cuts.map(cut => {
        const isSelected = selectedId === cut.id;
        return (
          <g
            key={cut.id}
            onClick={() => onSelect(cut.id)}
            role="button"
            aria-label={cut.nameDE}
            className="cursor-pointer"
          >
            <polygon
              points={cut.points}
              fill={isSelected ? `${cut.color}bb` : '#1e0a00'}
              stroke={isSelected ? '#C8882A' : '#5a2800'}
              strokeWidth={isSelected ? 2 : 1.5}
              strokeLinejoin="round"
              style={{ transition: 'fill 0.2s, stroke 0.2s' }}
            />
            <polygon
              points={cut.points}
              fill="transparent"
              stroke="transparent"
              strokeWidth="8"
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* Labels with connector lines */}
      {cuts.map(cut => {
        const isSelected = selectedId === cut.id;
        const lx = cut.labelX - LABEL_WIDTH / 2;
        const ly = cut.labelY - LABEL_HEIGHT / 2;
        const lineY1 = cut.labelBelow ? cut.labelY - LABEL_HEIGHT / 2 : cut.labelY + LABEL_HEIGHT / 2;
        return (
          <g
            key={`label-${cut.id}`}
            onClick={() => onSelect(cut.id)}
            className="cursor-pointer"
          >
            <line
              x1={cut.labelX} y1={lineY1}
              x2={cut.dotX} y2={cut.dotY}
              stroke={isSelected ? '#C8882A' : '#4a2200'}
              strokeWidth="1" strokeDasharray="3 3"
            />
            <circle
              cx={cut.dotX} cy={cut.dotY}
              r={isSelected ? 5 : 3.5}
              fill={isSelected ? '#C8882A' : '#7c3a10'}
              style={{ transition: 'r 0.2s, fill 0.2s' }}
            />
            <rect
              x={lx} y={ly}
              width={LABEL_WIDTH} height={LABEL_HEIGHT}
              rx="4"
              fill={isSelected ? '#7c2d12' : '#1e0a00'}
              stroke={isSelected ? '#C8882A' : '#5a2800'}
              strokeWidth="1"
              style={{ transition: 'fill 0.2s, stroke 0.2s' }}
            />
            <text
              x={cut.labelX} y={cut.labelY + 5}
              textAnchor="middle"
              fill={isSelected ? '#E8C070' : '#a16030'}
              fontSize="9.5"
              fontFamily="Georgia, serif"
              fontWeight="bold"
              style={{ transition: 'fill 0.2s' }}
            >
              {cut.shortLabel}
            </text>
          </g>
        );
      })}

      {/* Scale indicator */}
      <text x="848" y="432" textAnchor="middle" fill="#2a1200" fontSize="8" fontFamily="monospace">
        VORN ←→ HINTEN
      </text>
    </svg>
  );
}
