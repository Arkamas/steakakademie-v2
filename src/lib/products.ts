import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { Product } from '@/types';

let _products: Product[] | null = null;
let _imageCache: Record<string, string> | null = null;

function loadImageCache(): Record<string, string> {
  if (_imageCache) return _imageCache;
  try {
    const filePath = path.join(process.cwd(), 'products', 'images.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    // Entferne Meta-Keys (beginnen mit _)
    _imageCache = Object.fromEntries(
      Object.entries(data).filter(([k]) => !k.startsWith('_'))
    ) as Record<string, string>;
  } catch {
    _imageCache = {};
  }
  return _imageCache;
}

function mergeImages(products: Product[]): Product[] {
  const images = loadImageCache();
  return products.map(p => {
    if (p.amazonAsin && images[p.amazonAsin]) {
      return { ...p, imageUrl: images[p.amazonAsin] };
    }
    return p;
  });
}

export function getAllProducts(): Product[] {
  if (_products) return _products;

  const filePath = path.join(process.cwd(), 'products', 'registry.yaml');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = yaml.load(raw) as Product[];
  _products = mergeImages(parsed);
  return _products;
}

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return getAllProducts().filter((p) => p.category === category);
}

export function getRecommendedProducts(limit = 5): Product[] {
  return getAllProducts()
    .filter((p) => p.recommended)
    .slice(0, limit);
}

/** Gibt true zurück wenn mindestens ein Produkt ein Amazon-Bild hat */
export function hasAmazonImages(): boolean {
  return getAllProducts().some(p => p.imageUrl);
}
