'use client';

import { useEffect } from 'react';
import { meldeJsFehler } from '@/lib/fehler-melden';

/**
 * Faengt Browser-Fehler echter Besucher — der schlanke Ersatz fuer den
 * Sentry-Browser-Client (Entscheidung Uwe, 08.09.2026; Begruendung und
 * Abwaegung in src/lib/fehler-melden.ts).
 *
 * Zwei Quellen decken praktisch alles ab, was im Browser schiefgehen kann:
 *   - `error` auf window: geworfene Ausnahmen, die niemand faengt
 *   - `unhandledrejection`: abgelehnte Promises ohne catch (der haeufigere
 *     Fall in React-Code)
 *
 * Render-Fehler, die das Root-Layout zerlegen, meldet zusaetzlich
 * src/app/global-error.tsx ueber dieselbe Funktion.
 *
 * Gegenstueck auf dem Server: src/app/api/js-errors/route.ts.
 */
export default function JsErrors() {
  useEffect(() => {
    function beiFehler(e: ErrorEvent) {
      meldeJsFehler({
        kind: 'error',
        message: e.message,
        stack: e.error instanceof Error ? e.error.stack : undefined,
        source: e.filename,
        lineno: e.lineno,
        colno: e.colno,
      });
    }

    function beiRejection(e: PromiseRejectionEvent) {
      const grund: unknown = e.reason;
      meldeJsFehler({
        kind: 'unhandledrejection',
        message: grund instanceof Error ? grund.message : String(grund),
        stack: grund instanceof Error ? grund.stack : undefined,
      });
    }

    window.addEventListener('error', beiFehler);
    window.addEventListener('unhandledrejection', beiRejection);
    return () => {
      window.removeEventListener('error', beiFehler);
      window.removeEventListener('unhandledrejection', beiRejection);
    };
  }, []);

  return null;
}
