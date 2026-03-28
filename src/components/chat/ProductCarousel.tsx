'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, ExternalLink, Plus } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';

interface MiniProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_urls: string[];
}

export function ProductCarousel({ ids }: { ids: string[] }) {
  const addItem = useCartStore(state => state.addItem);
  const [products, setProducts] = useState<MiniProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (!ids || ids.length === 0) return;
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock, image_urls')
        .in('id', ids);
      
      if (!error && data) {
        setProducts(data as any);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [ids]);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto py-2 custom-scrollbar">
        {[1, 2, 3].map(i => (
          <div key={i} className="min-w-[140px] h-[180px] bg-white/5 animate-pulse rounded-xl border border-white/10 shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto py-3 custom-scrollbar snap-x">
      {products.map(product => {
        const primaryImage = product.image_urls?.[0];
        
        return (
          <div 
            key={product.id}
            className="min-w-[160px] max-w-[160px] glass-dark rounded-xl border border-white/10 overflow-hidden shrink-0 hover:border-gold/50 transition-all group snap-start block relative"
          >
            <div className="h-[120px] w-full bg-black/40 relative overflow-hidden">
              {primaryImage ? (
                 <Image src={primaryImage} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-white/10 bg-white/5">No Image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                 <a href={`/product/${product.id}`} target="_blank" className="text-[10px] text-white flex items-center gap-1 hover:text-gold transition-colors">
                    <ExternalLink size={10} /> Details
                 </a>
              </div>
            </div>
            <div className="p-3">
              <h4 className="text-white text-xs font-bold truncate mb-1" title={product.name}>{product.name}</h4>
              <p className="text-gold font-black text-sm mb-3">${product.price.toFixed(2)}</p>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: primaryImage || null
                  });
                  // Show a simple alert if toast isn't configured, but try to be premium
                  if (typeof window !== 'undefined') {
                    const btn = e.currentTarget;
                    const originalText = btn.innerHTML;
                    btn.innerHTML = "Added! ✨";
                    btn.classList.add('bg-green-500/20', 'text-green-400');
                    setTimeout(() => {
                      btn.innerHTML = originalText;
                      btn.classList.remove('bg-green-500/20', 'text-green-400');
                    }, 2000);
                  }
                }}
                className="w-full py-2 bg-white/10 hover:bg-gold hover:text-black transition-all rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 text-white border border-white/10 active:scale-95"
              >
                <Plus size={12} /> Add to Cart
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
