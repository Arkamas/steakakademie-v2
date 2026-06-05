'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { DS24_CART_CONFIG } from '@/lib/digistore';

/**
 * Bindet den Digistore24-Warenkorb auf einer Verkaufsseite ein.
 *
 * - Lädt das offizielle Cart-Script (digistore.js) erst nach Interaktivität.
 * - Ruft `digistoreCart(config)` auf, sobald die globale Funktion bereit ist.
 *   Der Aufruf erfolgt bei jedem Seiten-Mount (auch bei Client-Navigation),
 *   damit neu gerenderte /add/-Buttons erneut erkannt werden.
 *
 * Bewusst NICHT global im Root-Layout eingebunden, sondern nur auf den
 * Verkaufsseiten, die den Warenkorb tatsächlich nutzen — datensparsam und
 * performanter (kein Drittanbieter-Script auf reinen Inhaltsseiten).
 */
export default function DigistoreCart({ config = DS24_CART_CONFIG }: { config?: string }) {
  useEffect(() => {
    let tries = 0;
    const id = setInterval(() => {
      const cart = (window as unknown as { digistoreCart?: (cfg: string) => void }).digistoreCart;
      if (typeof cart === 'function') {
        cart(config);
        clearInterval(id);
      } else if (++tries > 50) {
        clearInterval(id); // nach ~5 s aufgeben (Script nicht geladen)
      }
    }, 100);
    return () => clearInterval(id);
  }, [config]);

  return (
    <Script
      src="https://www.digistore24-scripts.com/service/digistore.js"
      strategy="afterInteractive"
    />
  );
}
