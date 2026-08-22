'use client';

/**
 * Faengt Render-Fehler ab, die das Root-Layout zerlegen. Ohne diese Datei
 * sieht der Besucher die nackte Next-Fehlerseite und Sentry erfaehrt nichts.
 */
import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="de">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
