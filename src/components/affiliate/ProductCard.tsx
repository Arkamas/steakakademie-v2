import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Star, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

function ProductImagePlaceholder({
  brand,
  size = 'md',
}: {
  brand: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const initials = brand
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: 'h-14 w-14 text-sm',
    md: 'h-28 w-28 text-xl',
    lg: 'h-36 w-36 text-2xl',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-surface-base border border-border-subtle',
        sizeClasses[size]
      )}
      aria-hidden="true"
    >
      <span className="font-serif font-bold text-brand-gold">{initials}</span>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'sidebar';
  rank?: number;
  className?: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  amazon:        'Amazon',
  'otto-gourmet':'Otto Gourmet',
  santosgrills:  'Santosgrills',
  grillfuerst:   'Grillfürst',
  ankerkraut:    'Ankerkraut',
  albers:        'Albers Food',
  'meater-direct':'MEATER Shop',
  other:         'Händler',
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < Math.round(rating) ? 'fill-brand-gold text-brand-gold' : 'text-border-subtle fill-border-subtle'}
        />
      ))}
    </div>
  );
}

export default function ProductCard({
  product,
  variant = 'default',
  rank,
  className,
}: ProductCardProps) {
  const providerLabel = PROVIDER_LABELS[product.provider] ?? 'Händler';
  const affiliateHref = `/go/${product.id}`;

  // ── SIDEBAR VARIANT ────────────────────────────────────────────────────
  if (variant === 'sidebar') {
    return (
      <div className={cn('bg-surface-card border border-border-subtle p-4', className)}>
        <div className="border-t-2 border-brand-gold -mt-4 mb-4 pt-3">
          <span className="text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-brand-fire">
            Empfehlung
          </span>
        </div>

        <div className="mb-3 flex justify-center bg-surface-base p-3">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={160}
              height={120}
              className="object-contain h-28"
            />
          ) : (
            <ProductImagePlaceholder brand={product.brand} size="md" />
          )}
        </div>

        <h3 className="font-sans font-bold text-sm text-text-primary mb-1 line-clamp-2">
          {product.name}
        </h3>

        {product.badge && (
          <span className="inline-block text-[10px] font-sans font-bold tracking-wide uppercase bg-brand-gold/15 text-brand-gold px-2 py-0.5 mb-2">
            {product.badge}
          </span>
        )}

        {product.rating && (
          <div className="flex items-center gap-2 mb-2">
            <StarRow rating={product.rating} />
            <span className="text-xs font-sans text-text-muted">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}

        <p className="text-lg font-sans font-bold text-text-primary mb-3">
          {product.priceMin && product.priceMax
            ? `${product.priceMin} – ${product.priceMax} €`
            : `${product.price} €`}
        </p>

        <Link
          href={affiliateHref}
          className="btn-affiliate w-full justify-center text-sm mb-2"
          rel="nofollow noopener"
          target="_blank"
        >
          <ExternalLink size={14} />
          Bei {providerLabel} ansehen
        </Link>

        <p className="text-[10px] font-sans text-text-muted text-center leading-relaxed">
          * Affiliate-Link — Preis unverändert für dich
        </p>
      </div>
    );
  }

  // ── COMPACT VARIANT ────────────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-4 py-3 border-b border-border-subtle', className)}>
        {rank && (
          <span className="font-serif text-2xl font-bold text-brand-gold/30 w-6 shrink-0">
            {rank}
          </span>
        )}
        {product.image ? (
          <div className="bg-surface-card p-1 shrink-0">
            <Image
              src={product.image}
              alt={product.name}
              width={60}
              height={60}
              className="object-contain h-14 w-14"
            />
          </div>
        ) : (
          <ProductImagePlaceholder brand={product.brand} size="sm" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-sans font-bold text-sm text-text-primary line-clamp-1">
            {product.name}
          </h3>
          {product.badge && (
            <span className="text-[10px] font-sans font-bold uppercase text-brand-fire">
              {product.badge}
            </span>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-sans font-bold text-sm text-text-primary mb-1.5">
            {product.price} €
          </p>
          <Link
            href={affiliateHref}
            className="inline-flex items-center gap-1 bg-brand-fire text-white font-sans text-[11px] font-bold tracking-wide px-3 py-1.5 hover:bg-[#cc4412] transition-colors"
            rel="nofollow noopener"
            target="_blank"
          >
            Ansehen
          </Link>
        </div>
      </div>
    );
  }

  // ── DEFAULT VARIANT ─────────────────────────────────────────────────────
  return (
    <div className={cn('bg-surface-card border border-border-subtle overflow-hidden', className)}>
      {product.badge && (
        <div className="bg-brand-gold text-ink text-[10px] font-sans font-bold tracking-[0.15em] uppercase px-4 py-1.5 text-center">
          {product.badge}
        </div>
      )}

      <div className="p-6 flex justify-center bg-surface-base">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={220}
            height={160}
            className="object-contain h-36"
          />
        ) : (
          <ProductImagePlaceholder brand={product.brand} size="lg" />
        )}
      </div>

      <div className="p-5">
        <span className="text-[10px] font-sans font-bold tracking-[0.12em] uppercase text-brand-fire mb-1 block">
          {product.brand}
        </span>
        <h3 className="font-sans font-bold text-lg text-text-primary mb-2 leading-snug">
          {product.name}
        </h3>

        {product.rating && (
          <div className="flex items-center gap-2 mb-3">
            <StarRow rating={product.rating} />
            <span className="text-sm font-sans text-text-secondary">
              {product.rating.toFixed(1)}
              {product.ratingCount && (
                <span className="text-text-muted"> ({product.ratingCount.toLocaleString('de-DE')})</span>
              )}
            </span>
          </div>
        )}

        {product.pros && product.pros.length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {product.pros.slice(0, 3).map((pro) => (
              <li key={pro} className="flex items-start gap-2 text-sm font-sans text-text-secondary">
                <ShieldCheck size={14} className="text-brand-gold mt-0.5 shrink-0" />
                {pro}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-end justify-between mb-4">
          <p className="text-2xl font-sans font-bold text-text-primary">
            {product.priceMin && product.priceMax
              ? `${product.priceMin}–${product.priceMax} €`
              : `${product.price} €`}
          </p>
          {product.recommended && (
            <span className="text-[10px] font-sans font-bold tracking-wide uppercase text-brand-gold border border-brand-gold/30 px-2 py-1">
              Unsere Wahl
            </span>
          )}
        </div>

        <Link
          href={affiliateHref}
          className="btn-affiliate w-full justify-center"
          rel="nofollow noopener"
          target="_blank"
        >
          <ExternalLink size={15} />
          Bei {providerLabel} ansehen
        </Link>

        <p className="text-[10px] font-sans text-text-muted text-center mt-2 leading-relaxed">
          * Wir erhalten eine Provision — Preis für dich unverändert
        </p>
      </div>
    </div>
  );
}
