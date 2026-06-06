import Link from 'next/link';
import { getProductById } from '@/lib/products';

// ⚪ INLINE-Zone — kontextueller Affiliate-Textlink mitten im Schritt-Text.
// Nutzung im MDX:
//   …ohne ein gutes <InlineAffiliate id="thermapen-one">Einstich-Thermometer</InlineAffiliate>
//   wird das zum Ratespiel.
// Fehlt das Produkt, wird der Text unverlinkt ausgegeben (kein toter Link).
export default function InlineAffiliate({ id, children }: { id: string; children: React.ReactNode }) {
  const product = getProductById(id);
  if (!product) return <>{children}</>;

  return (
    <Link
      href={`/go/${product.id}`}
      className={`text-brand-fire underline decoration-brand-fire/40 underline-offset-2 hover:decoration-brand-fire transition-colors plausible-event-name=Affiliate-Klick plausible-event-zone=inline plausible-event-provider=${product.provider} plausible-event-produkt=${product.id}`}
      rel="nofollow noopener"
      target="_blank"
    >
      {children}
      <span className="text-[9px] font-sans font-bold tracking-wide uppercase text-text-muted align-super ml-0.5">
        Anzeige
      </span>
    </Link>
  );
}
