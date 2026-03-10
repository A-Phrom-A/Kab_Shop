'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand?: string;
    price: number;
    cost?: number;
    category?: string;
    image_url: string | null;
  };
}

import Link from 'next/link';

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addItem(product);
  };

  return (
    <Link href={`/product/${product.id}`} className="block h-full cursor-pointer hover:-translate-y-1 transition-transform duration-300">
      <Card className="group flex flex-col h-full !p-0">
        <div className="aspect-square bg-white/5 relative overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/20 p-4 text-center">
              <span className="text-sm font-medium mb-1 line-clamp-1">{product.brand || 'No Brand'}</span>
              <span className="text-xs opacity-50">No Image</span>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1 justify-between gap-2">
          <div>
            <h3 className="font-medium text-white line-clamp-2 leading-snug">{product.name}</h3>
            {product.category && (
              <p className="text-sm text-white/50 mt-1">{product.category}</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gold font-bold">${product.price.toFixed(2)}</span>
            <button 
              onClick={handleAddToCart}
              className="h-8 w-8 rounded-full border border-gold/50 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-colors" 
              aria-label="Add to cart"
              title="Add to cart"
            >
              +
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
