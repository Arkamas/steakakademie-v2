/**
 * Digistore24-Warenkorb — zentrale URLs & Helfer
 *
 * Der Warenkorb („Mehrere Produkte – ein Checkout") wird über das Cart-Script
 * (<DigistoreCart />) aktiviert. Kauf-Buttons müssen dann als klassische
 * <a href>-Links auf die /add/<ID>-Adresse zeigen — NICHT in einem neuen Tab
 * (kein target="_blank"), damit das Script den Klick abfangen und das Produkt
 * in den Warenkorb legen kann, während der Kunde auf der Seite bleibt.
 *
 * Quelle: help.digistore24.com — „Digistore24-Warenkorb: Mehrere Produkte – ein Checkout".
 */

/** Standard-Konfiguration des Warenkorbs: v2-Theme, Deutsch, Brutto-Endpreise (§19 UStG). */
export const DS24_CART_CONFIG = 'theme=v2 language=de brutto';

/** Warenkorb als Fenster öffnen / anzeigen. */
export const DS24_CART_URL = 'https://www.digistore24.com/cart';

/** Direkt zur Kasse (Checkout) springen. */
export const DS24_CHECKOUT_URL = 'https://www.digistore24.com/checkout';

/**
 * Add-to-Cart-URL für ein Produkt. Beim Klick (gleicher Tab) legt das
 * Cart-Script das Produkt in den Warenkorb statt direkt zum Checkout zu springen.
 */
export function ds24AddUrl(productId: string | number): string {
  return `https://www.digistore24.com/add/${productId}`;
}
