'use client';

import { useState } from 'react';

interface CutImageProps {
  src: string;
  alt: string;
  /** Fallback-Initiale/Label, falls das Foto (noch) fehlt */
  label: string;
  className?: string;
  /** Akzentfarbe für den Platzhalter-Verlauf */
  accent?: string;
  /** Skalierung: 'contain' zeigt den Cut komplett (Default), 'cover' füllt/beschneidet */
  fit?: 'cover' | 'contain';
}

/**
 * Cut-Foto mit elegantem Platzhalter. Solange die KI-Cut-Fotos (fal.ai) noch
 * nicht generiert sind, zeigt die Komponente einen markenkonformen Verlauf mit
 * Cut-Namen statt eines kaputten Bild-Icons. Sobald das Foto existiert,
 * überlagert es den Platzhalter automatisch.
 */
export default function CutImage({ src, alt, label, className = '', accent = '#C8882A', fit = 'contain' }: CutImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 35%, ${accent}22, #0D0A06 70%)`,
      }}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full ${fit === 'cover' ? 'object-cover' : 'object-contain'}`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
          <span
            className="font-serif font-bold leading-none"
            style={{ color: accent, fontSize: 'clamp(1.5rem, 6vw, 2.5rem)' }}
          >
            {label.charAt(0)}
          </span>
          <span className="mt-1 text-[9px] font-sans uppercase tracking-[0.12em] text-text-light/40">
            Foto folgt
          </span>
        </div>
      )}
    </div>
  );
}
