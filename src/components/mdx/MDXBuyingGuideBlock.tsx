import BuyingGuideBlock from '@/components/affiliate/BuyingGuideBlock';
import { getProductById } from '@/lib/products';

interface MDXBuyingGuideBlockProps {
  id: string;
  title: string;
  summary: string;
}

/**
 * MDX-friendly wrapper around BuyingGuideBlock.
 * Usage in MDX:
 *   <MDXBuyingGuideBlock
 *     id="meater-plus"
 *     title="Unser Testsieger"
 *     summary="Das MEATER Plus ist die beste Wahl für die meisten Griller."
 *   />
 */
export default function MDXBuyingGuideBlock({ id, title, summary }: MDXBuyingGuideBlockProps) {
  const product = getProductById(id);
  if (!product) return null;
  return <BuyingGuideBlock product={product} title={title} summary={summary} />;
}
