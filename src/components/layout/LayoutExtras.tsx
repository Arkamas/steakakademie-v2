'use client';

import dynamic from 'next/dynamic';
import DeferredMount from './DeferredMount';

// Beide Widgets sind rein clientseitig und erst nach einer Nutzeraktion sichtbar.
// next/dynamic legt sie in eigene Chunks; DeferredMount lädt diese Chunks erst
// nach dem ersten Paint (Idle) oder bei der ersten Interaktion. Vorher hingen
// ai/react, das Chat-Panel und das Newsletter-Formular am kritischen Pfad
// jeder einzelnen Seite (Perf-Audit 02.09.2026).
const MarcoWidget = dynamic(() => import('@/components/ai/MarcoWidget'), { ssr: false });
const ExitIntent = dynamic(() => import('@/components/ui/ExitIntent'), { ssr: false });

export default function LayoutExtras() {
  return (
    <DeferredMount>
      <MarcoWidget />
      <ExitIntent />
    </DeferredMount>
  );
}
