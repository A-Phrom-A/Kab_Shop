'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, FolderTree } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setSaving(true);
    
    // Auto-generate slug if empty
    const finalSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, '-');

    const { error } = await supabase.from('categories').insert({
      name: name.trim(),
      slug: finalSlug,
    });

    if (error) {
      alert("Error adding category: " + error.message);
    } else {
      setIsAdding(false);
      setName('');
      setSlug('');
      await fetchCategories();
    }
    setSaving(false);
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${catName}"? This might fail if there are products attached to it.`)) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert("Cannot delete category. " + error.message);
    } else {
      await fetchCategories();
    }
  };

  if (loading) return <div className="text-center py-20 text-white/50">Loading categories...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-dark sticky top-28 p-5 z-10 gap-4 shadow-xl shadow-black/10">
        <div>
          <h1 className="text-3xl font-serif text-white font-bold text-shadow-sm">Category Management</h1>
          <p className="text-white/80 font-medium mt-1">Manage product groupings and navigation links.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "secondary" : "primary"} className="shadow-sm text-shadow-sm">
          {isAdding ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Category</>}
        </Button>
      </div>

      {isAdding && (
        <Card variant="glass-dark" className="border-gold/30">
          <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs text-white/80 font-medium block mb-1">Category Name</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white font-medium focus:border-gold focus:outline-none placeholder:text-white/40" 
                placeholder="e.g. Fountain Pens"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs text-white/80 font-medium block mb-1">Slug (URL)</label>
              <input 
                type="text" 
                value={slug} 
                onChange={e => setSlug(e.target.value)} 
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white font-medium focus:border-gold focus:outline-none placeholder:text-white/40" 
                placeholder="e.g. fountain-pens (Optional)"
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto h-10">
              {saving ? 'Saving...' : 'Save Category'}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map(category => (
          <Card key={category.id} className="group hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-gold/50 group-hover:text-gold transition-colors">
                  <FolderTree size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{category.name}</h3>
                  <p className="text-xs text-white/40 font-mono">/{category.slug}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteCategory(category.id, category.name)} 
                className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Category"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
        {categories.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center text-white/40 border-2 border-dashed border-white/10 rounded-xl">
            No categories defined. Click 'Add Category' to get started.
          </div>
        )}
      </div>
    </div>
  );
}
