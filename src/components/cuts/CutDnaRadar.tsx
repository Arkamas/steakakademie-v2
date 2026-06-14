'use client';

import type { CutDna } from '@/lib/cuts-catalog';
import { DNA_AXES } from '@/lib/cuts-catalog';

interface CutDnaRadarProps {
  dna: CutDna;
  size?: number;
  color?: string;
}

/**
 * Cut-DNA — fünfachsiges Radar (Marmorierung · Zartheit · Fett · Aroma ·
 * Preis-Leistung). Reines SVG, keine Abhängigkeit. Werte 1–5.
 */
export default function CutDnaRadar({ dna, size = 240, color = '#C8882A' }: CutDnaRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.34;
  const axes = DNA_AXES;
  const n = axes.length;

  // Punkt für Achse i bei Wert v (0–5)
  const point = (i: number, v: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (v / 5) * radius;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  };

  const ringPoints = (v: number) =>
    axes.map((_, i) => point(i, v).join(',')).join(' ');

  const dataPoints = axes.map((a, i) => point(i, dna[a.key]).join(',')).join(' ');

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[280px] mx-auto select-none"
      role="img"
      aria-label="Cut-DNA Radar-Diagramm"
    >
      {/* Ringe */}
      {[1, 2, 3, 4, 5].map((v) => (
        <polygon
          key={v}
          points={ringPoints(v)}
          fill="none"
          stroke="#3a2818"
          strokeWidth={0.75}
        />
      ))}

      {/* Achsen-Speichen */}
      {axes.map((_, i) => {
        const [x, y] = point(i, 5);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#3a2818" strokeWidth={0.75} />;
      })}

      {/* Datenfläche */}
      <polygon points={dataPoints} fill={`${color}33`} stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {axes.map((a, i) => {
        const [x, y] = point(i, dna[a.key]);
        return <circle key={a.key} cx={x} cy={y} r={3} fill={color} />;
      })}

      {/* Achsen-Beschriftung */}
      {axes.map((a, i) => {
        const [x, y] = point(i, 5.9);
        return (
          <text
            key={`l-${a.key}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#a8895f"
            fontSize={9}
            fontFamily="DM Sans, sans-serif"
            fontWeight={600}
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
