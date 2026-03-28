'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const tagsParam = searchParams.get('tags');
  const minParam = searchParams.get('min');
  const maxParam = searchParams.get('max');
  const router = useRouter();

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      if (!query.trim() && !tagsParam && !minParam && !maxParam) {
        setResults([]);
        setLoading(false);
        return;
      }

      // Base Query
      let dbQuery = supabase
        .from('products')
        .select('*, categories(name)');

      // 1. Text Search (if provided)
      if (query.trim()) {
         dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // 2. Tags Filter (if provided)
      if (tagsParam) {
          const tagsArray = tagsParam.split(',');
          // Using contains (needs to have all selected tags) or overlaps (has any of the selected tags)
          // Opting for overlaps allowing broader discovery, but could be 'contains' if strict matching needed
          dbQuery = dbQuery.contains('tags', tagsArray); 
      }

      // 3. Price Filters (if provided)
      if (minParam) dbQuery = dbQuery.gte('price', Number(minParam));
      if (maxParam) dbQuery = dbQuery.lte('price', Number(maxParam));

      // Execute Order
      const { data, error } = await dbQuery.order('created_at', { ascending: false });

      if (error) {
          console.error("Search error:", error);
      }

      setResults(data || []);
      setLoading(false);
    };

    fetchResults();
  }, [query, tagsParam, minParam, maxParam]);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8 border-b border-white/10 pb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gold font-bold mb-2">Search Results</h1>
          <p className="text-white/60">
            {loading ? 'Searching...' : `Found ${results.length} result(s)`}
            {!loading && (query || tagsParam || minParam || maxParam) && (
                <span className="ml-2 text-sm text-white/40">
                    Filters applied: 
                    {query && ` "${query}"`}
                    {tagsParam && ` [Tags: ${tagsParam}]`}
                    {minParam && ` [Min: $${minParam}]`}
                    {maxParam && ` [Max: $${maxParam}]`}
                </span>
            )}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-white/50 mb-6">No products found matching your criteria.</p>
          <Button onClick={() => router.push('/')} variant="secondary">Back to Store</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {results.map((product) => (
            <Card key={product.id} className="group cursor-pointer hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full !p-0">
              <Link href={`/product/${product.id}`} className="flex flex-col h-full">
                <div className="aspect-square bg-white/5 relative overflow-hidden">
                  {product.image_urls && product.image_urls[0] ? (
                    <img src={product.image_urls[0]} alt={product.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <span className="text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-white line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-white/50">{product.categories?.name}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gold font-bold">${Number(product.price).toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex justify-center w-full max-w-7xl mx-auto">
        <div className="animate-spin w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
