'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Cut, Primal, Species } from '@/lib/cuts-catalog';
import { PHOTO_DIAGRAMS } from '@/lib/cut-photo-zones';
import AnimalDiagram from './AnimalDiagram';

interface AnimalDiagramPhotoProps {
  species: Species;
  primals: Primal[];
  /** Alle Cuts der Spezies — für die Sub-Cut-Ebene */
  cuts: Cut[];
  selectedPrimal: string | null;
  onSelectPrimal: (id: string) => void;
  /** Klick auf einen Sub-Cut → öffnet das Cut-Detail-Overlay */
  onSelectCut?: (id: string) => void;
}

function parsePoints(points: string): [number, number][] {
  return points
    .trim()
    .split(/\s+/)
    .map((p) => p.split(',').map(Number) as [number, number]);
}

/**
 * Foto-basiertes interaktives Metzger-Diagramm mit zwei Ebenen:
 * Ebene 1 = Teilstück-Zonen auf dem Tier-Foto („High-Tech & Smoke"-Look).
 * Ebene 2 = Zoom in eine Zone: klassische Metzger-Konvention — Cuts mit
 * anatomischer Lage als gestrichelte Teilflächen (auch innenliegende
 * Stränge wie das Filet), Punkt-Cuts als Label-Chips. Klick → Cut-Detail.
 * Silhouette bleibt als Fallback, falls kein Foto-Mapping existiert.
 */
export default function AnimalDiagramPhoto({
  species,
  primals,
  cuts,
  selectedPrimal,
  onSelectPrimal,
  onSelectCut,
}: AnimalDiagramPhotoProps) {
  const diagram = PHOTO_DIAGRAMS[species];

  const cutById = useMemo(() => Object.fromEntries(cuts.map((c) => [c.id, c])), [cuts]);

  const W = diagram?.width ?? 0;
  const H = diagram?.height ?? 0;

  // Zoom-Ziel: Bounding-Box der gewählten Zone, mittig eingepasst
  const zoom = useMemo(() => {
    if (!diagram || !selectedPrimal) return null;
    const zone = diagram.zones[selectedPrimal];
    if (!zone) return null;
    const pts = parsePoints(zone.points);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const pad = 42;
    const minX = Math.min(...xs) - pad;
    const maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad;
    const maxY = Math.max(...ys) + pad;
    const s = Math.min(2.6, Math.max(1.15, Math.min(W / (maxX - minX), H / (maxY - minY)) * 0.92));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return { s, x: W / 2 - s * cx, y: H / 2 - s * cy, zone };
  }, [diagram, selectedPrimal, W, H]);

  if (!diagram) {
    return (
      <AnimalDiagram
        species={species}
        primals={primals}
        selectedPrimal={selectedPrimal}
        onSelectPrimal={onSelectPrimal}
      />
    );
  }

  const zoomed = zoom !== null;
  // Abdunkelung: ganzes Bild minus gewählte Zone (evenodd)
  const dimPath = zoomed
    ? `M0 0 H${W} V${H} H0 Z M${zoom.zone.points.trim().split(/\s+/).join(' L')} Z`
    : '';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full select-none"
      style={{ maxHeight: 560 }}
      role="group"
      aria-label="Interaktives Metzger-Diagramm — wähle ein Teilstück, dann einen Cut"
    >
      <defs>
        {/* Glut-Glühen für aktive/gehoverte Zone (CI: Ember-Orange) */}
        <filter id="saZoneGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#E85018" floodOpacity="0.55" />
        </filter>
      </defs>

      <motion.g
        initial={false}
        animate={{ x: zoom?.x ?? 0, y: zoom?.y ?? 0, scale: zoom?.s ?? 1 }}
        transition={{ type: 'spring', damping: 26, stiffness: 160 }}
        style={{ transformOrigin: '0px 0px' }}
      >
        <image
          href={diagram.src}
          width={W}
          height={H}
          preserveAspectRatio="xMidYMid slice"
        />

        {/* ── Ebene 1: Teilstück-Zonen ─────────────────────────────────── */}
        {!zoomed &&
          primals.map((p) => {
            const zone = diagram.zones[p.id];
            if (!zone) return null;
            return (
              <g
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={p.nameDE}
                className="cursor-pointer group"
                onClick={() => onSelectPrimal(p.id)}
                onKeyDown={(e) =>
                  (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelectPrimal(p.id))
                }
              >
                <polygon
                  points={zone.points}
                  fill={p.color}
                  fillOpacity={0.06}
                  stroke="#C8882A"
                  strokeOpacity={0.45}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  className="transition-[fill-opacity] duration-200 group-hover:[fill-opacity:0.30] group-hover:[stroke-opacity:0.9] group-hover:[filter:url(#saZoneGlow)]"
                />
                <text
                  x={zone.labelX}
                  y={zone.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ECDCBE"
                  fontSize={zone.fontSize ?? 24}
                  fontFamily="Playfair Display, Georgia, serif"
                  fontWeight="bold"
                  letterSpacing="0.5"
                  stroke="#160d06"
                  strokeWidth="0.9"
                  paintOrder="stroke"
                  style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
                >
                  {p.nameDE}
                </text>
              </g>
            );
          })}

        {/* ── Ebene 2: Zoom — Abdunkeln + Sub-Cut-Flächen/Chips ────────── */}
        {zoomed && (
          <>
            <path
              d={dimPath}
              fillRule="evenodd"
              fill="#0D0A06"
              fillOpacity={0.68}
              className="cursor-zoom-out"
              onClick={() => onSelectPrimal(selectedPrimal!)}
              aria-label="Zoom schließen"
            />
            <polygon
              points={zoom.zone.points}
              fill="none"
              stroke="#C8882A"
              strokeOpacity={0.85}
              strokeWidth={2 / zoom.s}
              strokeLinejoin="round"
              style={{ pointerEvents: 'none' }}
            />
            <AnimatePresence>
              {(zoom.zone.subCuts ?? []).map((pin, i) => {
                const cut = cutById[pin.id];
                if (!cut) return null;
                const s = zoom.s;

                // ── Teilfläche (Metzger-Chart-Stil, gestrichelt) ──────
                if (pin.points) {
                  const fs = (pin.fontSize ?? 20) / s;
                  return (
                    <motion.g
                      key={pin.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.12 + i * 0.05, duration: 0.25 }}
                    >
                      <g
                        role="button"
                        tabIndex={0}
                        aria-label={`${cut.nameDE} ansehen`}
                        className="cursor-pointer group/chip"
                        onClick={() => onSelectCut?.(pin.id)}
                        onKeyDown={(e) =>
                          (e.key === 'Enter' || e.key === ' ') &&
                          (e.preventDefault(), onSelectCut?.(pin.id))
                        }
                      >
                        {/* Dunkle Unterlegung — hält die Strichlinie auf hellem Fell lesbar */}
                        <polygon
                          points={pin.points}
                          fill="none"
                          stroke="#160d06"
                          strokeOpacity={0.45}
                          strokeWidth={3.4 / s}
                          strokeLinejoin="round"
                          style={{ pointerEvents: 'none' }}
                        />
                        <polygon
                          points={pin.points}
                          fill="#E85018"
                          fillOpacity={0}
                          stroke="#ECDCBE"
                          strokeOpacity={0.85}
                          strokeWidth={1.6 / s}
                          strokeDasharray={`${9 / s} ${7 / s}`}
                          strokeLinejoin="round"
                          className="transition-[fill-opacity] duration-150 group-hover/chip:[fill-opacity:0.22] group-hover/chip:[stroke-opacity:1]"
                        />
                        <text
                          x={pin.x}
                          y={pin.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#F4E4C6"
                          fontSize={fs * 1.15}
                          fontFamily="Inter, system-ui, sans-serif"
                          fontWeight={700}
                          letterSpacing="0.8"
                          stroke="#160d06"
                          strokeWidth={0.8 / s}
                          paintOrder="stroke"
                          style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
                        >
                          {cut.nameDE}
                        </text>
                      </g>
                    </motion.g>
                  );
                }

                // ── Label-Chip (Punkt-Cut ohne sinnvolle Fläche) ───────
                const fs = (pin.fontSize ?? 25) / s;
                const h = fs * 1.75;
                const w = cut.nameDE.length * fs * 0.6 + fs * 1.8;
                return (
                  <motion.g
                    key={pin.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.12 + i * 0.05, duration: 0.2 }}
                    style={{ transformOrigin: `${pin.x}px ${pin.y}px` }}
                  >
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label={`${cut.nameDE} ansehen`}
                      className="cursor-pointer group/chip"
                      onClick={() => onSelectCut?.(pin.id)}
                      onKeyDown={(e) =>
                        (e.key === 'Enter' || e.key === ' ') &&
                        (e.preventDefault(), onSelectCut?.(pin.id))
                      }
                    >
                      <rect
                        x={pin.x - w / 2}
                        y={pin.y - h / 2}
                        width={w}
                        height={h}
                        rx={h / 2}
                        fill="#160d06"
                        fillOpacity={0.88}
                        stroke="#C8882A"
                        strokeOpacity={0.8}
                        strokeWidth={1.4 / s}
                        className="transition-[fill-opacity] duration-150 group-hover/chip:[fill-opacity:1] group-hover/chip:[stroke-opacity:1] group-hover/chip:[filter:url(#saZoneGlow)]"
                      />
                      <text
                        x={pin.x}
                        y={pin.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#F4E4C6"
                        fontSize={fs}
                        fontFamily="Inter, system-ui, sans-serif"
                        fontWeight={600}
                        style={{ pointerEvents: 'none' }}
                      >
                        {cut.nameDE}
                      </text>
                    </g>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </>
        )}
      </motion.g>

      {/* Zurück-Button (fix, unskaliert) */}
      {zoomed && (
        <g
          role="button"
          tabIndex={0}
          aria-label="Zurück zur Gesamtansicht"
          className="cursor-pointer group/back"
          onClick={() => onSelectPrimal(selectedPrimal!)}
          onKeyDown={(e) =>
            (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelectPrimal(selectedPrimal!))
          }
        >
          <rect
            x={22}
            y={22}
            width={236}
            height={46}
            rx={23}
            fill="#160d06"
            fillOpacity={0.9}
            stroke="#C8882A"
            strokeOpacity={0.7}
            strokeWidth={1.5}
            className="transition-[stroke-opacity] duration-150 group-hover/back:[stroke-opacity:1]"
          />
          <text
            x={140}
            y={45}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ECDCBE"
            fontSize={21}
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight={600}
            style={{ pointerEvents: 'none' }}
          >
            ← Alle Teilstücke
          </text>
        </g>
      )}
    </svg>
  );
}
