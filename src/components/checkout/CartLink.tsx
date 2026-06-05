import { ShoppingCart } from 'lucide-react';
import { DS24_CART_URL } from '@/lib/digistore';

/**
 * Dezenter „Warenkorb ansehen"-Link. Öffnet den Digistore24-Warenkorb, in dem
 * der Kunde alle gesammelten Produkte sieht und zur Kasse gehen kann.
 * Klassischer <a href> (gleicher Tab) — wird vom Cart-Script erkannt.
 */
export default function CartLink({ className = '' }: { className?: string }) {
  return (
    <a
      href={DS24_CART_URL}
      className={`inline-flex items-center gap-1.5 font-sans text-xs text-text-muted hover:text-brand-gold transition-colors ${className}`}
    >
      <ShoppingCart size={13} /> Warenkorb ansehen
    </a>
  );
}
