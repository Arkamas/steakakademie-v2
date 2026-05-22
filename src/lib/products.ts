import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { Product } from '@/types';

let _products: Product[] | null = null;

export function getAllProducts(): Product[] {
  if (_products) return _products;

  const filePath = path.join(process.cwd(), 'products', 'registry.yaml');
  const raw = fs.readFileSync(filePath, 'utf-8');
  _products = yaml.load(raw) as Product[];
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
