import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ArticleMeta, ArticleCardVariant } from '@/types';

interface ArticleCardProps {
  article: ArticleMeta;
  variant?: ArticleCardVariant;
  className?: string;
}

export default function ArticleCard({
  article,
  variant = 'medium',
  className,
}: ArticleCardProps) {
  const { slug, url, title, excerpt, image, imageAlt, category, author, formattedDate, readingTime } = article;

  // ── HERO (volle Breite linke Hauptspalte) ────────────────────────────────
  if (variant === 'hero') {
    return (
      <article className={cn('group', className)}>
        <Link href={url}>
          <div className="overflow-hidden mb-4">
            <Image
              src={image}
              alt={imageAlt}
              width={800}
              height={500}
              className="w-full aspect-[16/10] object-cover group-hover:scale-[1.02] transition-transform duration-500"
              priority
            />
          </div>
          <span className="category-label">{category}</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mt-2 mb-3 leading-tight article-title-link group-hover:text-brand-fire">
            {title}
          </h1>
          <p className="font-body text-base text-text-secondary leading-relaxed mb-3 line-clamp-3">
            {excerpt}
          </p>
          <div className="flex items-center gap-2 text-xs font-sans text-text-muted">
            <span>{author}</span>
            <span>—</span>
            <span>{formattedDate}</span>
            {readingTime && (
              <>
                <span>—</span>
                <span>{readingTime} Min. Lesezeit</span>
              </>
            )}
          </div>
        </Link>
      </article>
    );
  }

  // ── SMALL (mittlere Spalte, gestapelt) ───────────────────────────────────
  if (variant === 'small') {
    return (
      <article className={cn('group flex gap-4', className)}>
        <Link href={url} className="shrink-0">
          <Image
            src={image}
            alt={imageAlt}
            width={100}
            height={70}
            className="w-24 h-16 object-cover group-hover:opacity-90 transition-opacity"
          />
        </Link>
        <div className="min-w-0">
          <span className="category-label">{category}</span>
          <Link href={url}>
            <h3 className="font-serif text-base font-bold text-text-primary mt-1 leading-snug article-title-link group-hover:text-brand-fire line-clamp-3">
              {title}
            </h3>
          </Link>
          <p className="text-[11px] font-sans text-text-muted mt-1.5">{formattedDate}</p>
        </div>
      </article>
    );
  }

  // ── HORIZONTAL (Artikel-Listen-Zeile) ────────────────────────────────────
  if (variant === 'horizontal') {
    return (
      <article className={cn('group flex gap-5 py-5 border-b border-border-subtle', className)}>
        <Link href={url} className="shrink-0">
          <Image
            src={image}
            alt={imageAlt}
            width={140}
            height={90}
            className="w-32 sm:w-36 h-24 object-cover group-hover:opacity-90 transition-opacity"
          />
        </Link>
        <div className="flex flex-col justify-center min-w-0">
          <span className="category-label">{category}</span>
          <Link href={url}>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary mt-1 mb-2 leading-snug article-title-link group-hover:text-brand-fire line-clamp-2">
              {title}
            </h3>
          </Link>
          <p className="font-body text-sm text-text-secondary leading-relaxed line-clamp-2 hidden sm:block mb-2">
            {excerpt}
          </p>
          <div className="flex items-center gap-2 text-xs font-sans text-text-muted">
            <span>{author}</span>
            <span>—</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </article>
    );
  }

  // ── MEDIUM (Standard Grid-Karte) ─────────────────────────────────────────
  return (
    <article className={cn('group', className)}>
      <Link href={url}>
        <div className="overflow-hidden mb-3">
          <Image
            src={image}
            alt={imageAlt}
            width={600}
            height={380}
            className="w-full aspect-[3/2] object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        <span className="category-label">{category}</span>
        <h2 className="font-serif text-xl font-bold text-text-primary mt-1.5 mb-2 leading-snug article-title-link group-hover:text-brand-fire line-clamp-3">
          {title}
        </h2>
        <div className="flex items-center gap-2 text-xs font-sans text-text-muted mb-2">
          <span>{author}</span>
          <span>—</span>
          <span>{formattedDate}</span>
        </div>
        <p className="font-body text-sm text-text-secondary leading-relaxed line-clamp-3">
          {excerpt}
        </p>
        <span className="inline-block mt-3 text-xs font-sans font-bold text-brand-fire hover:underline">
          Weiterlesen →
        </span>
      </Link>
    </article>
  );
}
