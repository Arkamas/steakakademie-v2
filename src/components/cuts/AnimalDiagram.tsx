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
      {/* Trennlinien */}
      <g stroke="#0D0A06" strokeWidth="2.5" fill="none" opacity="0.45">
        <line x1="322" y1="220" x2="345" y2="352" />
        <line x1="405" y1="197" x2="405" y2="356" />
        <line x1="498" y1="191" x2="498" y2="357" />
        <line x1="612" y1="189" x2="612" y2="357" />
        <line x1="700" y1="190" x2="700" y2="352" />
        <line x1="345" y1="289" x2="700" y2="289" />
      </g>
    </g>
  );
}

function PigSilhouette() {
  return (
    <g>
      {/* Körper + Kopf (verschmolzen) */}
      <path
        d="M 62,250 C 58,232 60,214 78,206 C 96,198 112,196 126,196 C 150,184 196,182 214,196 C 320,182 460,178 600,180 C 680,182 722,186 750,200 C 788,212 808,236 812,272 C 814,306 804,336 784,352 C 740,372 600,392 440,392 C 360,392 300,384 268,366 C 250,356 232,350 214,352 C 150,356 104,342 86,312 C 74,290 66,270 62,250 Z"
        fill={BODY_CREAM}
      />
      {/* Rüssel */}
      <ellipse cx="64" cy="262" rx="14" ry="26" fill={HORN_CREAM} />
      <circle cx="58" cy="252" r="3.5" fill="#0D0A06" />
      <circle cx="58" cy="272" r="3.5" fill="#0D0A06" />
      {/* Ohr */}
      <path d="M 150,184 C 138,158 150,138 174,138 C 182,160 178,182 168,196 Z" fill={HORN_CREAM} />
      {/* Auge */}
      <circle cx="128" cy="232" r="5.5" fill="#0D0A06" />
      {/* Ringelschwanz */}
      <path
        d="M 808,262 C 832,256 842,236 832,222 C 824,210 808,212 804,226 C 801,238 812,244 820,238"
        fill="none" stroke={BODY_CREAM} strokeWidth="9" strokeLinecap="round"
      />
      {/* Beine mit Klauen */}
      <path d="M 300,378 L 326,378 L 326,468 L 332,496 L 322,496 L 318,470 L 308,470 L 304,496 L 294,496 L 300,468 Z" fill={BODY_CREAM} />
      <path d="M 352,384 L 378,384 L 378,468 L 384,496 L 374,496 L 370,470 L 360,470 L 356,496 L 346,496 L 352,468 Z" fill={BODY_CREAM} />
      <path d="M 700,382 L 726,382 L 726,468 L 732,496 L 722,496 L 718,470 L 708,470 L 704,496 L 694,496 L 700,468 Z" fill={BODY_CREAM} />
      <path d="M 748,372 L 774,372 L 774,468 L 780,496 L 770,496 L 766,470 L 756,470 L 752,496 L 742,496 L 748,468 Z" fill={BODY_CREAM} />
      {/* Trennlinien */}
      <g stroke="#0D0A06" strokeWidth="2.5" fill="none" opacity="0.4">
        <line x1="205" y1="200" x2="210" y2="345" />
        <line x1="330" y1="186" x2="330" y2="388" />
        <line x1="560" y1="182" x2="560" y2="390" />
        <line x1="210" y1="288" x2="560" y2="288" />
      </g>
    </g>
  );
}
