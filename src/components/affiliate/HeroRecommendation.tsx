import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Flame, Star } from 'lucide-react';
import { getProductById } from '@/lib/products';

const PROVIDER_LABELS: Record<string, string> = {
  amazon: 'Amazon',
  'otto-gourmet': 'Otto Gourmet',
  santosgrills: 'Santosgrills',
  grillfuerst: 'Grillfürst',
  ankerkraut: 'Ankerkraut',
  albers: 'Albers Food',
  'meater-direct': 'MEATER Shop',
  'dreisechzig-bbq': '360° BBQ',
  'grill-experte': 'Grill-Experte',
  banggood: 'Banggood',
  other: 'Händler',
};

// 🟠 HERO-Zone — „Marcos Empfehlung für diese Methode": genau EIN Big-Ticket
// (Grill/Smoker/Beefer) mit Pitch in Marcos Stimme. Wird vom Methoden-Template
// automatisch in der Sidebar gerendert (config: src/lib/affiliate-zones.ts).
export default function HeroRecommendation({ productId, pitch }: { productId: string; pitch: string }) {
  const product = getProductById(productId);
  if (!product) return null;

  const providerLabel = PROVIDER_LABELS[product.provider] ?? 'Händler';
  const imageSrc = product.imageUrl ?? product.image;
  const price =
    product.priceMin && product.priceMax ? `${product.priceMin} – ${product.priceMax} €` : `${product.price} €`;

  return (
    <div className="bg-surface-elevated border border-border-subtle p-5 sticky top-24">
      <div className="border-t-2 border-brand-fire -mt-5 mb-4 pt-4 flex items-center justify-between">
        <h3 className="font-sans font-bold text-sm text-text-primary flex items-center gap-2">
          <Flame size={14} className="text-brand-fire" /> Marcos Empfehlung
        </h3>
        <span className="text-[9px] font-sans font-bold tracking-[0.15em] uppercase text-text-muted">Anzeige</span>
      </div>

      <p className="font-body text-[0.9rem] leading-relaxed text-text-secondary mb-4">{pitch}</p>

      <div className="relative mb-3 flex justify-center bg-surface-base p-3">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.imageAlt ?? product.name}
            width={180}
            height={130}
            className="object-contain h-32"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center bg-surface-base border border-border-subtle">
            <span className="font-serif font-bold text-brand-gold text-xl">
              {product.brand.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        {product.imageType === 'symbolic' && (
          <span className="absolute top-1 right-1 z-10 font-sans font-bold tracking-wider uppercase text-[9px] px-1.5 py-0.5 bg-black/65 text-zinc-200 border border-white/15 backdrop-blur-sm">
            Symbolbild
          </span>
        )}
      </div>

      <h4 className="font-sans font-bold text-sm text-text-primary mb-1 leading-snug">{product.name}</h4>

      {product.badge && (
        <span className="inline-block text-[10px] font-sans font-bold tracking-wide uppercase bg-brand-gold/15 text-brand-gold px-2 py-0.5 mb-2">
          {product.badge}
        </span>
      )}

      {product.rating && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.round(product.rating!) ? 'fill-brand-gold text-brand-gold' : 'text-border-subtle fill-border-subtle'}
              />
            ))}
          </div>
          <span className="text-xs font-sans text-text-muted">{product.rating.toFixed(1)}</span>
        </div>
      )}

      <p className="text-lg font-sans font-bold text-text-primary mb-3">{price}</p>

      <Link
        href={`/go/${product.id}`}
        className={`btn-affiliate w-full justify-center text-sm mb-2 plausible-event-name=Affiliate-Klick plausible-event-zone=hero plausible-event-provider=${product.provider} plausible-event-produkt=${product.id}`}
        rel="sponsored nofollow noopener"
        target="_blank"
      >
        <ExternalLink size={14} />
        Bei {providerLabel} ansehen
      </Link>

      <p className="text-[10px] font-sans text-text-muted text-center leading-relaxed">
        * Affiliate-Link — Preis unverändert für dich.{' '}
        <Link href="/affiliate-disclosure" className="underline hover:text-brand-gold">
          Mehr
        </Link>
      </p>
    </div>
  );
}
