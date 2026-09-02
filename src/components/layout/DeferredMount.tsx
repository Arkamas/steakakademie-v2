'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * Rendert seine Kinder erst, wenn der Browser Luft hat (requestIdleCallback)
 * oder der Besucher zum ersten Mal interagiert — je nachdem, was zuerst kommt.
 *
 * Zweck (Perf-Audit 02.09.2026): Marco-Chat und Exit-Intent liegen in JEDEM
 * Layout, brauchen aber erst nach einer Nutzeraktion echten Code (ai/react,
 * Chat-Panel, Newsletter-Formular). Zusammen mit next/dynamic in den Aufrufern
 * wandert dieser Code aus dem kritischen Pfad in eigene Chunks, die nach dem
 * ersten Paint nachgeladen werden. Die Seite ist damit früher interaktiv;
 * sichtbar ändert sich nichts — der Marco-Button erscheint eine Idle-Phase
 * später (typisch < 200 ms nach Hydration).
 */
const INTERACTION_EVENTS: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'scroll', 'touchstart'];

export default function DeferredMount({
  children,
  timeout = 2500,
}: {
  children: ReactNode;
  /** Obergrenze in ms, falls weder Idle noch Interaktion eintritt. */
  timeout?: number;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      setReady(true);
      INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, fire));
    };
    INTERACTION_EVENTS.forEach((e) => window.addEventListener(e, fire, { passive: true, once: true }));
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const cleanupListeners = () => INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, fire));
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(fire, { timeout });
      return () => {
        w.cancelIdleCallback?.(id);
        cleanupListeners();
      };
    }
    // Safari kennt requestIdleCallback nicht: kurzer Timer als Ersatz.
    const id = window.setTimeout(fire, Math.min(timeout, 1500));
    return () => {
      window.clearTimeout(id);
      cleanupListeners();
    };
  }, [ready, timeout]);

  return ready ? <>{children}</> : null;
}
