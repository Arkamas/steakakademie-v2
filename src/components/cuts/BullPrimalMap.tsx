'use client';

import { useState } from 'react';
import type { Primal } from '@/lib/cuts-catalog';

export interface BullZone {
  id: string;
  color: string;
  /** Polygon-Punkte in Prozent, viewBox 0 0 100 100 (deckt das Stier-Foto 1:1 ab) */
  points: string;
}

/**
 * Silhouette des Stiers (per Bild-Segmentierung extrahiert, GrabCut).
 * Dient als clipPath, damit KEINE Zone über die Körperkontur hinausragt.
 */
const BULL_SILHOUETTE =
  '19.15,12.35 20.41,15.68 19.22,19.24 21.6,22.68 25.95,23.99 26.82,35.99 28.24,37.17 30.46,44.06 32.99,45.37 34.1,57.96 33.07,59.74 33.15,62.83 36.16,71.62 37.74,81.24 36.39,90.02 54.59,90.38 56.72,88.6 64.4,90.14 65.74,88.6 74.45,90.38 79.35,88.95 79.91,86.7 78.88,82.07 78.64,72.68 79.27,69.24 78.64,60.33 79.67,52.26 79.27,39.9 77.93,32.78 73.66,24.11 51.58,23.99 44.38,19.95 42.33,15.68 42.8,12.83 41.93,11.05 40.9,13.3 36.95,13.3 32.52,10.69 29.98,10.81 26.11,13.66 21.99,13.9';

/**
 * Anatomisch kalibrierte Muskelgruppen, den Konturen des Stiers auf
 * public/images/cut-atlas-stier.jpg nachgezeichnet und per clipPath exakt an
 * der Körperkante beschnitten. Vorlage: American Angus Beef Chart.
 * IDs = Primal-IDs im Cut-Katalog (Bug→Chuck, Hochrippe→Rib, Roastbeef→Short
 * Loin, Hüfte→Sirloin, Keule→Round, Brust→Brisket, Dünnung→Plate & Flank,
 * Beinscheibe→Shank). color = Hover-Glow-Farbe der Zone.
 */
// color = Hover-Füllung/Glow der Zone. Marken-Gold #C8882A durchgängig; die
// Auswahl (Selected) rendert die Komponente in Glut #E85018 (Brief §4/§7).
export const BULL_ZONES: BullZone[] = [
  { id: 'hals', color: '#C8882A', points: '37,24 47,20 49,34 45,42 40,42 36,33 37,26' },
  { id: 'bug', color: '#C8882A', points: '47,22 56,20 57,42 55,55 48,60 44,54 44,40 45,30' },
  { id: 'hochrippe', color: '#C8882A', points: '55,17 63,16 64,46 56,48 55,32' },
  { id: 'roastbeef', color: '#C8882A', points: '63,16 71,16 71,46 64,46' },
  { id: 'huefte', color: '#C8882A', points: '71,16 77,19 79,47 71,46' },
  { id: 'keule', color: '#C8882A', points: '77,18 84,24 84,45 83,56 79,63 72,60 69,47 77,45' },
  { id: 'brust', color: '#C8882A', points: '38,44 49,44 50,60 46,66 41,64 37,52' },
  { id: 'duennung', color: '#C8882A', points: '49,52 66,50 72,54 71,66 53,69 49,64' },
  { id: 'beinscheibe', color: '#C8882A', points: '44,63 52,63 52,90 45,91 43,80 43,69' },
];

interface Props {
  primals: Primal[];
  selectedPrimal: string | null;
  onSelect: (id: string) => void;
}

/**
 * Interaktives Stier-Foto mit SVG-Overlay: klickbare Muskelgruppen, exakt an
 * die Silhouette geclippt. Grundzustand = goldene Schnitt-Linien (wie eine
 * Metzger-Karte); Hover/Auswahl = Neon-Glow und Füllung. Zweisprachiges Label
 * (DE · EN). Rein präsentational — der State lebt im Dashboard.
 */
export default function BullPrimalMap({ primals, selectedPrimal, onSelect }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const deById: Record<string, string> = Object.fromEntries(primals.map((p) => [p.id, p.nameDE]));
  const enById: Record<string, string> = Object.fromEntries(primals.map((p) => [p.id, p.nameEN]));
  const activeId = hover ?? selectedPrimal;

  return (
    <div className="relative overflow-hidden rounded-lg border border-brand-gold/15 bg-[#0D0A06]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/cut-atlas-stier.jpg"
        alt="Interaktive Teilstück-Karte — kräftiger schwarzer Stier in Glut-Atmosphäre"
        className="block w-full select-none"
        draggable={false}
      />

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        role="group"
        aria-label="Klickbare Muskelgruppen des Rinds"
      >
        <defs>
          <clipPath id="saBullClip" clipPathUnits="userSpaceOnUse">
            <polygon points={BULL_SILHOUETTE} />
          </clipPath>
        </defs>

        <g clipPath="url(#saBullClip)">
          {BULL_ZONES.map((z) => {
            const isSel = selectedPrimal === z.id;
            const isHover = hover === z.id;
            const on = isSel || isHover;
            return (
              <polygon
                key={z.id}
                points={z.points}
                role="button"
                tabIndex={0}
                aria-label={`${deById[z.id] ?? z.id} (${enById[z.id] ?? ''})`}
                aria-pressed={isSel}
                onClick={() => onSelect(z.id)}
                onKeyDown={(e) =>
                  (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(z.id))
                }
                onMouseEnter={() => setHover(z.id)}
                onMouseLeave={() => setHover((h) => (h === z.id ? null : h))}
                className="cursor-pointer outline-none transition-all duration-200"
                vectorEffect="non-scaling-stroke"
                style={{
                  fill: isSel ? '#E85018' : z.color,
                  fillOpacity: isSel ? 0.5 : isHover ? 0.38 : 0,
                  stroke: isSel ? '#F4E4C6' : isHover ? '#F0C67A' : '#C8882A',
                  strokeOpacity: on ? 1 : 0.6,
                  strokeWidth: isSel ? 2.5 : isHover ? 1.5 : 1,
                  strokeDasharray: on ? undefined : '2 1.6',
                  strokeLinejoin: 'round',
                  filter: on ? `drop-shadow(0 0 6px ${isSel ? '#E85018' : z.color})` : 'none',
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Zweisprachiges Label der aktiven / gehoverten Zone */}
      {activeId && deById[activeId] && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <span className="rounded-full border border-brand-gold/40 bg-[#0D0A06]/85 px-4 py-1 text-xs font-sans font-bold uppercase tracking-[0.14em] text-brand-gold">
            {deById[activeId]}
            <span className="text-brand-gold/50"> · {enById[activeId]}</span>
          </span>
        </div>
      )}
    </div>
  );
}
