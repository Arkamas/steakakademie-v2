import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allRecipes } from 'contentlayer/generated';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RecipeTemplate from '@/components/RecipeTemplate';
import { getAllProducts } from '@/lib/products';
import type { ProductCategory } from '@/types';

interface Props {
  params: { slug: string };
}

// Abbildung: Rezept-Equipment-Tag → Registry-Kategorie
const EQUIPMENT_CATEGORY: Partial<Record<string, ProductCategory>> = {
  thermometer:    'thermometer',
  'sous-vide':    'sous-vide',
  grill:          'grill',
  smoker:         'smoker',
  oberhitzegrill: 'oberhitzegrill',
  'dry-ager':     'dry-ager',
  messer:         'messer',
  zubehoer:       'zubehoer',
};

export async function generateStaticParams() {
  return allRecipes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = allRecipes.find((r) => r.slug === params.slug);
  if (!recipe) return {};

  const title       = recipe.seoTitle       ?? recipe.title;
  const description = recipe.seoDescription ?? recipe.description;

  return {
    title,
    description,
    keywords: recipe.keywords?.join(', '),
    alternates: { canonical: `https://steakakademie.de${recipe.url}` },
    openGraph: {
      title,
      description,
      url:    `https://steakakademie.de${recipe.url}`,
      images: [{ url: recipe.image, alt: recipe.imageAlt }],
      type:   'article',
    },
  };
}

export default function RecipePage({ params }: Props) {
  const recipe = allRecipes.find((r) => r.slug === params.slug);
  if (!recipe) notFound();

  // Dynamische Hardware-Selektion aus Registry
  const categories = [
    ...(recipe.equipment ?? [])
      .map((tag) => EQUIPMENT_CATEGORY[tag])
      .filter((c): c is ProductCategory => !!c),
    // Thermometer immer als Fallback — jeder Pitmaster braucht eines
    'thermometer' as ProductCategory,
  ];

  const uniqueCategories = Array.from(new Set(categories));

  const hardwareProducts = getAllProducts()
    .filter((p) => uniqueCategories.includes(p.category))
    .sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0))
    .slice(0, 3);

  return (
    <>
      <Header />
      <main>
        <RecipeTemplate recipe={recipe} hardwareProducts={hardwareProducts} />
      </main>
      <Footer />
    </>
  );
}
