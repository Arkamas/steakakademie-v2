'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Knopf, der Marco (den Chat unten rechts) mit einer vorbereiteten Frage
 * öffnet — das Auffangnetz unter den Suchergebnissen.
 *
 * WARUM ÜBER EIN EVENT: Marco hängt im Wurzel-Layout in `LayoutExtras` und
 * wird von `DeferredMount` erst nach dem ersten Paint (Idle, spätestens nach
 * 2,5 s) und von `next/dynamic` in einem eigenen Chunk geladen. Ein direkter
 * Aufruf gäbe es also gar nicht — die Komponente existiert im Moment des
 * Klicks möglicherweise noch nicht.
 *
 * DESHALB DER WIEDERHOLVERSUCH: Der erste `pointerdown` weckt DeferredMount,
 * der Chunk lädt aber asynchron nach. Wer schnell klickt, feuert das Event ins
 * Leere. Wir wiederholen es deshalb, bis Marcos Eingabefeld im Dokument steht
 * — höchstens 3 Sekunden lang, danach still aufgeben (kein Spinner, kein
 * Fehlertext für etwas, das ein Zusatzangebot ist).
 */
export default function MarcoStarter({
  frage,
  className = 'sk-btn sk-btn--primary',
  children,
}: {
  frage: string;
  className?: string;
  children: React.ReactNode;
}) {
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  const oeffnen = useCallback(() => {
    const feuern = () =>
      window.dispatchEvent(new CustomEvent('sk:marco', { detail: { frage } }));
    feuern();
    if (document.getElementById('marco-input')) return;
    let versuche = 0;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      versuche += 1;
      feuern();
      if (document.getElementById('marco-input') || versuche >= 20) {
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
      }
    }, 150);
  }, [frage]);

  return (
    <button type="button" className={className} onClick={oeffnen}>
      {children}
    </button>
  );
}
