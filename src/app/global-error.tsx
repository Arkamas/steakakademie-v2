'use client';

/**
 * Faengt Render-Fehler ab, die das Root-Layout zerlegen. Ohne diese Datei
 * sieht der Besucher die nackte Next-Fehlerseite und Sentry erfaehrt nichts.
 */
import { meldeJsFehler } from '@/lib/fehler-melden';
import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    meldeJsFehler({ kind: 'render', message: error.message, stack: error.stack, digest: error.digest });
  }, [error]);

  return (
    <html lang="de">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
