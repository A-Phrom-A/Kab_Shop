import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroActions } from "@/components/HeroActions";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export const revalidate = 60; // optionally revalidate every 60s

export default async function Home() {
  // Fetch from Supabase
  const { data: categories } = await supabase.from('categories').select('*');
  const { data: products } = await supabase.from('products').select('*');

  const safeCategories = categories || [];
  const safeProducts = products || [];

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden rounded-3xl glass-dark border-gold/20">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-gold/20 z-0"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center gap-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-white mb-4">
            Elevate Your <span className="text-gold italic">Craft</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 mb-8 max-w-2xl">
            Discover our curated collection of premium stationery. Where minimalist aesthetic meets unparalleled quality.
          </p>
          <HeroActions />
        </div>
      </section>

      {/* Popular Section Built from Tags */}
      {(() => {
        const popCategory = safeCategories.find(c => c.name.toLowerCase() === 'popular');
        const popularProducts = safeProducts
          .filter(p => (p.tags && p.tags.includes('Popular')) || (popCategory && p.category_id === popCategory.id))
          .slice(0, 5);

        if (popularProducts.length === 0) return null;

        return (
          <section id="popular" className="scroll-mt-24">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-3xl font-serif text-gold font-bold">Popular</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {popularProducts.map((product) => (
                <ProductCard 
                   key={product.id} 
                   product={{
                       ...product, 
                       category: safeCategories.find(c => c.id === product.category_id)?.name || 'Popular'
                   }} 
                />
              ))}
            </div>
          </section>
        );
      })()}

      {/* Categories Loop */}
      <div className="flex flex-col gap-16 mt-16">
        {safeCategories
          .filter(c => c.name.toLowerCase() !== 'popular')
          .map((category) => {
          const categoryProducts = safeProducts
            .filter(p => p.category_id === category.id)
            .slice(0, 5); // Take only first 5 for the homepage

          if (categoryProducts.length === 0) return null; // Hide empty categories

          // Create a slug from the name for UI URLs
          const slug = category.name.toLowerCase().replace(/\s+/g, '-');

          return (
            <section key={category.id} id={slug} className="scroll-mt-24">
              <div className="flex items-end justify-between mb-8">
                <h2 className="text-3xl font-serif text-gold font-bold">{category.name}</h2>
                <Link href={`/category/${slug}`} className="text-sm text-white/60 hover:text-gold transition-colors flex items-center gap-1">
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {categoryProducts.map((product) => (
                  <ProductCard 
                     key={product.id} 
                     product={{...product, category: category.name}} 
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
