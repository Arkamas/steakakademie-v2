import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

function BrandInitials({ brand }: { brand: string }) {
  const initials = brand.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="h-24 w-24 sm:h-28 sm:w-28 flex items-center justify-center bg-surface-base border border-border-subtle" aria-hidden="true">
      <span className="font-serif font-bold text-2xl text-brand-gold">{initials}</span>
    </div>
  );
}

interface BuyingGuideBlockProps {
  product: Product;
  title: string;
  summary: string;
  className?: string;
}

export default function BuyingGuideBlock({
  product,
  title,
  summary,
  className,
}: BuyingGuideBlockProps) {
  const affiliateHref = `/go/${product.id}`;

  return (
    <div
      className={cn(
        'border-l-4 border-l-brand-gold bg-surface-base p-5 sm:p-6',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        <div className="shrink-0 flex justify-center sm:justify-start">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={120}
              height={100}
              className="object-contain h-24 w-24 sm:h-28 sm:w-28"
            />
          ) : (
            <BrandInitials brand={product.brand} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* "Selbst getestet" trust badge */}
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck size={13} className="text-brand-gold shrink-0" />
            <span className="text-[10px] font-sans font-bold tracking-[0.12em] uppercase text-brand-fire">
              Selbst getestet
            </span>
          </div>

          <h3 className="font-serif font-bold text-base sm:text-lg text-text-primary leading-snug mb-2">
            {title}
          </h3>

          <p className="font-sans text-sm text-text-secondary leading-relaxed mb-4">
            {summary}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="font-sans font-bold text-xl text-text-primary">
              {product.priceMin && product.priceMax
                ? `${product.priceMin}–${product.priceMax} €`
                : `${product.price} €`}
            </span>

            <Link
              href={affiliateHref}
              className={`inline-flex items-center gap-1.5 bg-brand-gold text-white font-sans text-sm font-bold tracking-wide px-5 py-2.5 hover:bg-[#d4891a] transition-colors self-start sm:self-auto plausible-event-name=Affiliate-Klick plausible-event-provider=${product.provider} plausible-event-produkt=${product.id}`}
              rel="nofollow noopener"
              target="_blank"
            >
              <ExternalLink size={14} />
              Zum Shop →
            </Link>
          </div>
        </div>
      </div>

      <p className="text-[10px] font-sans text-text-muted mt-4 italic border-t border-border-subtle pt-3">
        * Affiliate-Link — Preis unverändert für dich
      </p>
    </div>
  );
}
