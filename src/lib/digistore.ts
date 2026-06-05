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

/**
 * Zentrale Produkt-ID-Registry (Single Source of Truth).
 *
 * → Sobald hier für einen Slug eine echte Digistore24-Produkt-ID eingetragen ist,
 *   wird der zugehörige <BuyButton> automatisch zum Warenkorb-Button (/add/<ID>)
 *   und das Cart-Script auf der Seite aktiviert. `null` = noch nicht anlegen.
 *
 * Produkt-ID findest du in Digistore24 unter „Meine Produkte → Produktliste".
 */
export const DS24_PRODUCTS: Record<string, number | null> = {
  // ── live verdrahtet ──
  'steuer-matrix':         695797, // Säule II — live
  'mein-protokoll':        696396, // live
  'steak-beichte':         696394, // live (1 Diagnose; 5er-Pack nutzt aktuell dieselbe ID — prüfen)
  // ── ID bekannt, Seite zeigt aber aktuell „In Vorbereitung" (Launch-Entscheidung offen) ──
  'gruender-schmiede':     695894, // Säule I
  'agentur-killer-sprint': 695900, // Säule III
  // ── Produkt-ID noch eintragen → Button wird dann automatisch live ──
  'bbq-grundkurs':         null,
  'fleischpass-premium':   null,
  'erste-kunden-sprint':   null,
  'seo-sprint':            null,
};

/** Liefert die Digistore24-Produkt-ID für einen Slug — oder null, wenn noch nicht angelegt. */
export function getDs24Id(slug: string): number | null {
  return DS24_PRODUCTS[slug] ?? null;
}

