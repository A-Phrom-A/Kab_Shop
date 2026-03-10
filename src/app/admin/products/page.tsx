'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Image as ImageIcon, Trash2, Edit, Search, ExternalLink, Filter } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', sku: '', category_id: '', price: '', cost: '', stock: '', description: '', image_urls: [] as string[], tags: [] as string[] });
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);

  const AVAILABLE_TAGS = [
    "Cheap & Good", "Value for Money", "Minimal", "Luxury", "Premium", 
    "Mechanical", "For Journey", "Creative", "Education", "New"
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tag matching: if filterTags has items, product must have ALL selected tags (using .every)
    // Alternatively, use .some for OR logic. Let's use .every for strict filtering in admin.
    const matchesTags = filterTags.length === 0 || filterTags.every(tag => p.tags?.includes(tag));
    
    // Price matching
    const price = Number(p.price);
    const matchesMin = !minPrice || price >= Number(minPrice);
    const matchesMax = !maxPrice || price <= Number(maxPrice);

    return matchesSearch && matchesTags && matchesMin && matchesMax;
  });

  const fetchData = async () => {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    
    setProducts(productsRes.data || []);
    setCategories(categoriesRes.data || []);
    if (categoriesRes.data && categoriesRes.data.length > 0) {
      setFormData(prev => ({ ...prev, category_id: categoriesRes.data[0].id }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditProduct = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id,
      price: product.price.toString(),
      cost: product.cost ? product.cost.toString() : '0',
      stock: product.stock.toString(),
      description: product.description || '',
      image_urls: product.image_urls || [],
      tags: product.tags || [],
    });
    setFiles([]);
    setIsAdding(true);
    
    // Auto-scroll to form so admin doesn't have to manually scroll up
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', sku: '', category_id: categories[0]?.id || '', price: '', cost: '', stock: '', description: '', image_urls: [], tags: [] });
    setFiles([]);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrls = formData.image_urls || [];
      
      if (files.length > 0) {
        // Upload new files
        const uploadPromises = files.map(async (fileObj) => {
          const fileExt = fileObj.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, fileObj);
          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
          return publicUrl;
        });

        const newUrls = await Promise.all(uploadPromises);
        imageUrls = editingId ? [...imageUrls, ...newUrls] : newUrls; // Append if editing, replace if new
      }

      const productData = {
        name: formData.name,
        sku: formData.sku,
        category_id: formData.category_id,
        price: Number(formData.price),
        cost: Number(formData.cost),
        stock: Number(formData.stock),
        description: formData.description,
        image_urls: imageUrls,
        tags: formData.tags
      };

      if (editingId) {
        // UPDATE Existing
        const { error } = await supabase.from('products').update(productData).eq('id', editingId);
        if (error) throw error;
      } else {
        // INSERT New
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
      }

      handleCancel();
      await fetchData();

    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) await fetchData();
    else alert(error.message);
  };

  if (loading) return <div className="text-center py-20 text-white/50">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div ref={formRef} className="scroll-mt-32"></div>
      
      <div className="flex flex-col glass-dark sticky top-28 p-5 z-10 gap-4 shadow-xl shadow-black/10 transition-all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-serif text-white font-bold text-shadow-sm">Product Management</h1>
            <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
                <input 
                type="text" 
                placeholder="Search by name or SKU..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white font-medium focus:border-gold focus:outline-none placeholder:text-white/60"
                />
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border transition-colors ${showFilters || filterTags.length > 0 || minPrice || maxPrice ? 'bg-gold/20 border-gold/50 text-gold' : 'bg-white/5 border-white/20 text-white/60 hover:text-white'}`}
                title="Toggle Filters"
            >
                <Filter size={20} />
            </button>
            <Button onClick={isAdding ? handleCancel : () => setIsAdding(true)} variant={isAdding ? "secondary" : "primary"} className="whitespace-nowrap shadow-sm text-shadow-sm ml-2">
                {isAdding ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Product</>}
            </Button>
            </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
            <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                
                {/* Price Filter */}
                <div>
                    <label className="text-xs text-white/50 block mb-2">Price Range ($)</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            placeholder="Min" 
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-24 bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:border-gold focus:outline-none"
                        />
                        <span className="text-white/30">-</span>
                        <input 
                            type="number" 
                            placeholder="Max" 
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-24 bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:border-gold focus:outline-none"
                        />
                    </div>
                </div>

                {/* Tags Filter */}
                <div className="lg:col-span-2">
                    <label className="text-xs text-white/50 block mb-2">Filter by Tags</label>
                    <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_TAGS.map(tag => {
                            const isSelected = filterTags.includes(tag);
                            return (
                                <button
                                    key={`filter-${tag}`}
                                    onClick={() => setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                                    className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full border transition-colors ${
                                        isSelected 
                                        ? 'bg-gold/20 text-gold border-gold/50' 
                                        : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30 hover:text-white'
                                    }`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Clear Filters */}
                {(filterTags.length > 0 || minPrice || maxPrice || searchQuery) && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end">
                        <button 
                            onClick={() => {
                                setFilterTags([]);
                                setMinPrice('');
                                setMaxPrice('');
                                setSearchQuery('');
                            }}
                            className="text-xs text-white/40 hover:text-white transition-colors underline"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>

      {isAdding && (
        <Card variant="glass-dark" className="border-gold/30">
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <h2 className="text-xl font-bold text-gold mb-4">{editingId ? 'Edit Product' : 'Create New Product'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 block mb-1">Product Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">SKU</label>
                <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Selling Price ($)</label>
                <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Cost Price ($)</label>
                <input required type="number" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Stock Quantity</label>
                <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Category</label>
                <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-gold focus:outline-none [&>option]:bg-zinc-900">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-white/50 block mb-2">Product Tags (Max 3) - Defines Bespoke Quiz Results</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Cheap & Good", "Value for Money", "Minimal", "Luxury", "Premium", 
                    "Mechanical", "For Journey", "Creative", "Education", "New"
                  ].map(tag => {
                    const isSelected = formData.tags.includes(tag);
                    const isMaxedOut = formData.tags.length >= 3 && !isSelected;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
                          } else if (!isMaxedOut) {
                            setFormData({ ...formData, tags: [...formData.tags, tag] });
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-300 ${
                          isSelected 
                            ? 'bg-gold/20 text-gold border-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                        } ${isMaxedOut ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
                {formData.tags.length >= 3 && <p className="text-xs text-gold/80 mt-2">Maximum 3 tags reached.</p>}
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Product Images (Max 10)</label>
                <div className="flex flex-col gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={e => {
                      const selectedFiles = Array.from(e.target.files || []);
                      if (selectedFiles.length > 10) {
                        alert('You can only upload a maximum of 10 images.');
                        setFiles(selectedFiles.slice(0, 10));
                      } else {
                        setFiles(selectedFiles);
                      }
                    }} 
                    className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" 
                  />
                  {files.length > 0 && <p className="text-xs text-gold">{files.length} new files selected for upload.</p>}
                  {formData.image_urls.length > 0 && editingId && (
                    <p className="text-xs text-white/40">Current images: {formData.image_urls.length} (New uploads will be added to the gallery)</p>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-white/50 block mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-gold focus:outline-none"></textarea>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={uploading}>{uploading ? 'Saving...' : 'Save Product'}</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.length === 0 ? (
           <div className="text-center py-12 text-white/40">No products found matching your search.</div>
        ) : (
          filteredProducts.map(product => (
            <Card key={product.id} className="flex flex-col sm:flex-row gap-4 items-center !p-4">
            <div className="w-16 h-16 bg-white/5 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
              {product.image_urls?.[0] ? <img src={product.image_urls[0]} alt="" className="object-cover w-full h-full" /> : <ImageIcon className="text-white/20" />}
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div>
                <p className="font-bold text-white line-clamp-1">{product.name}</p>
                <p className="text-xs text-white/50">{product.sku}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Category & Tags</p>
                <p className="text-sm text-white/90">{product.categories?.name}</p>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {product.tags.map((t: string) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/20 leading-none">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-white/50">Price / Cost / Stock</p>
                <p className="text-sm font-bold text-gold">
                    ${product.price.toFixed(2)} 
                    <span className="text-white/40 font-normal ml-1">(Cost: ${product.cost ? product.cost.toFixed(2) : '0.00'})</span>
                    <br/><span className="text-white/40 font-normal">📦 {product.stock} in stock</span>
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Link href={`/product/${product.id}`} target="_blank" className="p-2 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="View Public Page">
                  <ExternalLink size={18} />
                </Link>
                <button onClick={() => handleEditProduct(product)} className="p-2 text-white/40 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors" title="Edit Product"><Edit size={18} /></button>
                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete Product"><Trash2 size={18} /></button>
              </div>
            </div>
          </Card>
          ))
        )}
      </div>
    </div>
  );
}
