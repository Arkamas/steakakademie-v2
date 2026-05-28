// ── NAVIGATION ───────────────────────────────────────────────────────────────

export interface NavCategory {
  name: string;
  slug: string;
  subcategories?: { name: string; slug: string }[];
}

// ── PRODUCTS / AFFILIATE ─────────────────────────────────────────────────────

export type AffiliateProvider =
  | 'amazon'
  | 'otto-gourmet'
  | 'santosgrills'
  | 'grillfuerst'
  | 'ankerkraut'
  | 'albers'
  | 'meater-direct'
  | 'other';

export type ProductCategory =
  | 'thermometer'
  | 'grill'
  | 'smoker'
  | 'messer'
  | 'zubehoer'
  | 'fleisch'
  | 'gewuerze'
  | 'sous-vide'
  | 'buecher'
  | 'oberhitzegrill'
  | 'dry-ager'
  | 'kuechenmaschine';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number; // EUR
  priceMin?: number;
  priceMax?: number;
  affiliateUrl: string;
  provider: AffiliateProvider;
  amazonAsin?: string;
  rating?: number;
  ratingCount?: number;
  image?: string;
  /** Von PA-API oder Hersteller geladene Bild-URL (via products/images.json) */
  imageUrl?: string;
  /**
   * "official"   = Lizenziertes Bild (Hersteller/PA-API/eigenes Foto) — keine Kennzeichnung
   * "symbolic"   = KI-generiertes oder generisches Symbolbild — "Symbolbild"-Badge wird angezeigt
   * Default wenn ungesetzt: "official"
   */
  imageType?: 'official' | 'symbolic';
  imageAlt?: string;
  description?: string;
  pros?: string[];
  cons?: string[];
  badge?: string; // z.B. "Testsieger", "Preis-Leistung"
  /** Für Messer-Kategorie: premium | damast | mittelklasse | bbq-spezial */
  segment?: string;
  lastChecked: string; // ISO date
  recommended?: boolean;
}

// ── AUTHORS ──────────────────────────────────────────────────────────────────

export interface Author {
  name: string;
  slug: string;
  avatar: string;
  bio: string;
  shortBio: string;
  expertise: string[];
  statsLabel?: string; // "15+ Jahre Grillpraxis"
  linkedIn?: string;
}

// ── ARTICLE CARD ─────────────────────────────────────────────────────────────

export type ArticleCardVariant = 'hero' | 'medium' | 'small' | 'horizontal';

export interface ArticleMeta {
  slug: string;
  url: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  category: string;
  categorySlug: string;
  author: string;
  authorSlug: string;
  formattedDate: string;
  readingTime?: number;
  featured?: boolean;
}
