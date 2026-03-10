import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Fetch all categories to find the matching one by slug
  const { data: categories } = await supabase.from('categories').select('*');
  
  if (!categories) notFound();

  const category = categories.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === slug);
  
  if (!category) {
    notFound();
  }

  // Filter products by the current category
  const { data: categoryProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8 flex flex-col items-start gap-4">
        <Link href="/" className="text-white/50 hover:text-gold flex items-center gap-2 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div>
          <h1 className="text-4xl font-serif text-gold font-bold mb-2">{category.name}</h1>
          <p className="text-white/60">Explore our collection of premium {category.name.toLowerCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {categoryProducts && categoryProducts.map((product) => (
          <ProductCard key={product.id} product={{...product, category: category.name}} />
        ))}
      </div>
    </div>
  );
}
