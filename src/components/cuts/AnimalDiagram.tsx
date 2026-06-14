'use client';

import type { Primal, Species } from '@/lib/cuts-catalog';

interface AnimalDiagramProps {
  species: Species;
  primals: Primal[];
  selectedPrimal: string | null;
  onSelectPrimal: (id: string) => void;
}

const BODY_CREAM = '#E8DAC4';
const HORN_CREAM = '#D2BE9C';

/**
 * Interaktives Metzger-Chart im Carneo-Stil: erkennbare Tier-Silhouette mit
 * klickbaren Teilstück-Zonen, Trennlinien und Beschriftung über dem Körper.
 */
export default function AnimalDiagram({
  species,
  primals,
  selectedPrimal,
  onSelectPrimal,
}: AnimalDiagramProps) {
  return (
    <svg
      viewBox="0 0 1000 560"
      className="w-full select-none"
      style={{ maxHeight: 520 }}
      aria-label="Interaktives Metzger-Diagramm — wähle ein Teilstück"
    >
      <rect width="1000" height="560" fill="#0D0A06" />

      {species === 'rind' ? <CowSilhouette /> : <PigSilhouette />}

      {/* Trennlinien zwischen den Teilstücken */}
      <g stroke="#0D0A06" strokeWidth="2.5" fill="none" opacity="0.45">
        <line x1="322" y1="220" x2="345" y2="352" />
        <line x1="405" y1="197" x2="405" y2="356" />
        <line x1="498" y1="191" x2="498" y2="357" />
        <line x1="612" y1="189" x2="612" y2="357" />
        <line x1="700" y1="190" x2="700" y2="352" />
        <line x1="345" y1="289" x2="700" y2="289" />
      </g>

      {/* Klickbare Teilstück-Zonen + Beschriftung */}
      {primals.map((p) => {
        const isSel = selectedPrimal === p.id;
        return (
          <g
            key={p.id}
            role="button"
            tabIndex={0}
            aria-label={p.nameDE}
            aria-pressed={isSel}
            className="cursor-pointer outline-none group"
            onClick={() => onSelectPrimal(p.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelectPrimal(p.id))}
          >
            <polygon
              points={p.points}
              fill={p.color}
              fillOpacity={isSel ? 0.85 : 0}
              stroke={isSel ? '#F0E8D8' : 'transparent'}
              strokeWidth={isSel ? 2.5 : 0}
              strokeLinejoin="round"
              className="transition-all duration-200 group-hover:[fill-opacity:0.35]"
            />
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isSel ? '#FFFFFF' : p.labelColor ?? '#3a230f'}
              fontSize={p.fontSize ?? 15}
              fontFamily="Playfair Display, Georgia, serif"
              fontWeight="bold"
              letterSpacing="0.5"
              style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
              className="transition-colors duration-200"
            >
              {p.nameDE}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CowSilhouette() {
  return (
    <g>
      {/* Körper */}
      <path
        d="M 330,170 C 470,150 620,150 740,158 C 778,161 808,176 818,210 C 826,238 824,272 812,300 C 792,330 760,344 720,350 C 560,366 430,366 360,352 C 318,343 296,318 292,278 C 289,238 296,196 330,170 Z"
        fill={BODY_CREAM}
      />
      {/* Hals & Kopf */}
      <path
        d="M 322,210 C 290,196 256,190 226,194 C 206,196 192,200 182,208 C 168,206 150,206 138,214 C 116,222 100,242 94,262 C 90,272 92,282 100,288 C 112,294 128,294 140,292 C 150,306 160,318 176,322 C 196,326 220,322 244,314 C 286,302 312,272 322,238 Z"
        fill={BODY_CREAM}
      />
      {/* Hörner */}
      <path d="M 176,202 C 160,188 150,168 156,150 C 168,158 178,176 188,196 Z" fill={HORN_CREAM} />
      <path d="M 196,200 C 206,180 224,166 240,166 C 230,184 216,196 206,204 Z" fill={HORN_CREAM} />
      {/* Ohr */}
      <path d="M 206,216 C 224,206 246,208 256,220 C 242,234 220,234 208,224 Z" fill={BODY_CREAM} />
      {/* Auge & Nüstern */}
      <circle cx="148" cy="240" r="6" fill="#0D0A06" />
      <circle cx="108" cy="272" r="4" fill="#0D0A06" />
      {/* Schwanz */}
      <path
        d="M 814,206 C 838,212 850,250 846,300 C 844,340 836,380 838,420 C 839,438 846,448 852,456 C 842,458 832,452 826,440 C 818,400 822,360 820,320 C 818,280 808,240 800,214 Z"
        fill={BODY_CREAM}
      />
      {/* Beine */}
      <path d="M 352,344 L 372,344 L 374,470 L 380,508 L 356,508 L 350,470 Z" fill={BODY_CREAM} />
      <path d="M 392,348 L 412,348 L 412,470 L 418,508 L 394,508 L 388,470 Z" fill={BODY_CREAM} />
      <path d="M 740,346 L 762,344 L 760,470 L 766,508 L 742,508 L 738,470 Z" fill={BODY_CREAM} />
      <path d="M 700,350 L 722,350 L 720,470 L 726,508 L 702,508 L 696,470 Z" fill={BODY_CREAM} />
      {/* Euter */}
      <path d="M 640,352 C 660,352 672,366 668,384 C 664,398 648,400 636,392 C 628,382 628,360 640,352 Z" fill={BODY_CREAM} />
    </g>
  );
}

function PigSilhouette() {
  // Platzhalter — die echte Schwein-Silhouette folgt mit dem Schwein-Katalog.
  return (
    <g fill={BODY_CREAM}>
      <ellipse cx="500" cy="260" rx="220" ry="100" />
      <text x="500" y="430" textAnchor="middle" fill="#9a7548" fontSize="18" fontFamily="DM Sans, sans-serif">
        Schwein folgt
      </text>
    </g>
  );
}
