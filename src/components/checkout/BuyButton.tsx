import type { CSSProperties, ReactNode } from 'react';
import { getDs24Id, ds24AddUrl } from '@/lib/digistore';

/**
 * Kauf-Button mit zentraler Produkt-ID-Steuerung.
 *
 * - Ist in der Registry (DS24_PRODUCTS) eine ID für `slug` hinterlegt, verlinkt der
 *   Button als Add-to-Cart (/add/<ID>) — der Klick legt das Produkt in den
 *   Digistore24-Warenkorb (gleicher Tab, vom Cart-Script abgefangen).
 * - Ohne ID wird der unveränderte Fallback (`fallbackHref`, Standard "#kaufen")
 *   verwendet — so bleibt das bisherige Verhalten bestehen, bis eine ID eingetragen ist.
 *
 * Hinweis: Auf Seiten mit gesetzter ID zusätzlich <DigistoreCart /> einbinden,
 * damit das Warenkorb-Script geladen wird.
 */
export default function BuyButton({
  slug,
  children,
  className,
  style,
  id,
  fallbackHref = '#kaufen',
}: {
  slug: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  fallbackHref?: string;
}) {
  const pid = getDs24Id(slug);
  return (
    <a href={pid ? ds24AddUrl(pid) : fallbackHref} id={id} className={className} style={style}>
      {children}
    </a>
  );
}
