import ProductCard from '@/components/affiliate/ProductCard';
import { getProductById } from '@/lib/products';

interface MDXProductCardProps {
  id: string;
  rank?: number;
  variant?: 'default' | 'compact';
}

/**
 * MDX-friendly wrapper around ProductCard.
 * Usage in MDX: <MDXProductCard id="meater-plus" rank={1} />
 */
export default function MDXProductCard({ id, rank, variant = 'default' }: MDXProductCardProps) {
  const product = getProductById(id);
  if (!product) return null;
  return <ProductCard product={product} rank={rank} variant={variant} />;
}
