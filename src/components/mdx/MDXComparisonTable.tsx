import ComparisonTable from '@/components/affiliate/ComparisonTable';
import { getProductById, getProductsByCategory } from '@/lib/products';
import type { Product } from '@/types';

interface MDXComparisonTableProps {
  /** Comma-separated product IDs: ids="meater-plus,thermapen-one,inkbird-ibbq-4t" */
  ids?: string;
  /** Or load all products from a category: category="thermometer" */
  category?: string;
}

/**
 * MDX-friendly wrapper around ComparisonTable.
 * Usage in MDX:
 *   <MDXComparisonTable ids="meater-plus,meater-2-plus,thermapen-one" />
 *   <MDXComparisonTable category="thermometer" />
 */
export default function MDXComparisonTable({ ids, category }: MDXComparisonTableProps) {
  let products: Product[] = [];

  if (ids) {
    products = ids
      .split(',')
      .map((id) => getProductById(id.trim()))
      .filter((p): p is Product => p !== undefined);
  } else if (category) {
    products = getProductsByCategory(category);
  }

  if (products.length === 0) return null;
  return <ComparisonTable products={products} />;
}
