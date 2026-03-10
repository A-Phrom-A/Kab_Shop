'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart, ArrowLeft, CheckCircle2, X, ZoomIn } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Image Interactive States
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const addItemToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      let data = null;
      
      // If valid UUID, search database
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(id)) {
        const { data: dbData } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('id', id)
          .single();
        data = dbData;
      }

      // Dummy fallback if not found in db
      if (!data) {
        data = {
          id: id,
          name: `Premium Item ${id.replace('dummy-', '')}`,
          price: 25.99,
          description: "An elegantly crafted piece of stationery designed for the modern creator. The matte finish and weighted core provide a satisfying tactile experience for writing, sketching, or drafting.",
          sku: `KAB-ITM-${id.toUpperCase()}`,
          stock: 15,
          image_urls: [],
          categories: { name: "Popular" },
          specs: {
            "Material": "Anodized Aluminum",
            "Weight": "24g",
            "Dimensions": "142mm length x 10mm diameter",
            "Manufacturer": "kabshop Origins, JP"
          }
        };
      }
      
      setProduct(data);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) return <div className="text-center py-20 text-white/50">Product not found.</div>;

  const images = product.image_urls?.length > 0 ? product.image_urls : [null, null, null]; // Fallback images dummy array

  const handleAddToCart = () => {
    addItemToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      cost: product.cost || 0,
      quantity: quantity,
      image_url: product.image_urls?.[0] || null,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <button 
        onClick={() => router.back()} 
        className="flex items-center text-sm text-white/90 font-medium hover:text-gold transition-colors mb-8 group text-shadow-sm"
      >
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to shopping
      </button>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Left: Image Gallery */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div 
            className="aspect-square bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative cursor-zoom-in group"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setIsLightboxOpen(true)}
          >
            {images[activeImage] ? (
              <>
                <img src={images[activeImage]} alt={product.name} className="object-cover w-full h-full transition-opacity group-hover:opacity-0" />
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    backgroundImage: `url(${images[activeImage]})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: '200%',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              </>
            ) : (
              <span className="text-white/20">No Image Available</span>
            )}
            
            {product.stock <= 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Out of Stock
              </div>
            )}
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((img: string | null, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-24 h-24 flex-shrink-0 rounded-xl border-2 overflow-hidden flex items-center justify-center transition-all ${activeImage === idx ? 'border-gold' : 'border-transparent bg-black/20 opacity-80 hover:opacity-100'}`}
              >
                {img ? (
                  <img src={img} alt={`Thumbnail ${idx}`} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-[10px] text-white/20">Img {idx+1}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info & Zoom Portal Window */}
        <div className="w-full md:w-1/2 flex flex-col relative">
          
          {/* Zoom Overlay Portal (Only visible when hovering image) */}
          {isZooming && images[activeImage] && (
            <div className="absolute inset-0 z-20 hidden md:block rounded-2xl overflow-hidden bg-black/50 backdrop-blur-sm pointer-events-none border border-gold/30 shadow-2xl shadow-gold/10">
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${images[activeImage]})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: '250%',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            </div>
          )}

          <p className="text-gold uppercase tracking-widest text-sm mb-2 font-medium">{product.categories?.name}</p>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-gold text-shadow-sm">${Number(product.price).toFixed(2)}</span>
            <span className="px-2 py-1 bg-black/20 text-white/90 font-medium text-xs rounded border border-white/20 uppercase tracking-wider">
              SKU: {product.sku || 'N/A'}
            </span>
          </div>

          <div className="glass-dark p-6 mb-8 mt-2">
            <h3 className="text-white font-semibold mb-2">Description</h3>
            <p className="text-white/90 leading-relaxed text-sm">
              {product.description || "No description provided."}
            </p>
          </div>

          <div className="flex items-end gap-4 mb-10 w-full sm:w-auto">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white/90 font-medium">Quantity</label>
              <div className="flex items-center glass-dark rounded-full px-2 py-1 w-fit bg-[#043927]/80">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white font-bold transition-colors"
                >-</button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(product.stock > quantity ? quantity + 1 : quantity)}
                  className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white font-bold transition-colors"
                >+</button>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="flex-1 min-w-[200px]" 
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              {addedToCart ? (
                <><CheckCircle2 className="mr-2" size={20} /> Added</>
              ) : (
                <><ShoppingCart className="mr-2" size={20} /> Add to Cart</>
              )}
            </Button>
          </div>

          {/* Specs Table */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div>
              <h3 className="text-xl font-serif text-white font-bold mb-4 border-b border-white/10 pb-2">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex flex-col border-b border-white/10 pb-2">
                    <span className="text-white/80 font-medium">{key}</span>
                    <span className="text-white font-semibold">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && images[activeImage] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={() => setIsLightboxOpen(false)}>
          <button 
            className="absolute top-6 right-6 p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X size={24} />
          </button>
          
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={images[activeImage]} 
              alt={product.name} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
            />
            
            {/* Lightbox Thumbnails */}
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex gap-3">
              {images.map((img: string | null, idx: number) => img && (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveImage(idx); }}
                  className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-gold scale-110' : 'border-white/20 opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
