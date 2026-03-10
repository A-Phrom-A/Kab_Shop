'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, ShoppingCart, User, ShieldAlert, SlidersHorizontal, X } from 'lucide-react';
import { SidebarDrawer } from './SidebarDrawer';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/useCartStore';

export const Header = () => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [mounted, setMounted] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const AVAILABLE_TAGS = [
    "Cheap & Good", "Value for Money", "Minimal", "Luxury", "Premium", 
    "Mechanical", "For Journey", "Creative", "Education", "New"
  ];

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsFiltersOpen(false);
      }
    }
    if (isFiltersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFiltersOpen]);

  useEffect(() => {
    setMounted(true);
    const checkUserRole = async (currentUser: any) => {
      setUser(currentUser);
      if (currentUser) {
        const { data } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single();
        setIsAdmin(data?.role === 'Admin');
      } else {
        setIsAdmin(false);
      }
    };

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkUserRole(session?.user ?? null);
    });

    // Listen for changes on auth state (log in, log out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUserRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
    if (minPrice) params.append('min', minPrice);
    if (maxPrice) params.append('max', maxPrice);

    // Only route if there's actually a query or filter applied
    if (params.toString()) {
      setIsFiltersOpen(false);
      router.push(`/search?${params.toString()}`);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full glass rounded-none border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left: Hamburger Menu */}
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gold hover:bg-gold/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50"
              aria-label="Open menu"
            >
              <Menu size={28} strokeWidth={1.5} />
            </button>
          </div>

          {/* Center: Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="kabshop logo" className="h-12 sm:h-16 w-auto object-contain drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]" />
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <form ref={formRef} className="hidden sm:flex items-center relative mr-2" onSubmit={handleSearch}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." 
                className="w-48 lg:w-64 glass-dark pl-4 pr-16 py-2 text-sm text-white placeholder:text-white/40 border border-[#C5A059]/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-300 rounded-full"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button 
                  type="button" 
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className={`p-1.5 transition-colors rounded-full ${isFiltersOpen ? 'bg-gold/20 text-gold' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                  title="Advanced Filters"
                >
                  <SlidersHorizontal size={14} strokeWidth={2} />
                </button>
                <div className="w-[1px] h-4 bg-white/20"></div>
                <button type="submit" className="p-1.5 text-gold hover:text-white transition-colors rounded-full hover:bg-gold/10">
                  <Search size={14} strokeWidth={2} />
                </button>
              </div>

              {/* Filter Dropdown Panel */}
              {isFiltersOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-[#030c08]/98 backdrop-blur-3xl border border-gold/30 rounded-2xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gold font-serif font-semibold flex items-center gap-2">
                        <SlidersHorizontal size={16} /> Filters
                    </h3>
                    <button type="button" onClick={() => setIsFiltersOpen(false)} className="text-white/50 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Price Range */}
                  <div className="mb-5">
                    <label className="text-xs text-white/70 block mb-2 uppercase tracking-wider">Price Range</label>
                    <div className="flex items-center justify-between gap-2">
                        <input 
                            type="number" 
                            placeholder="Min $" 
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
                        />
                        <span className="text-white/30">-</span>
                        <input 
                            type="number" 
                            placeholder="Max $" 
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
                        />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-6">
                    <label className="text-xs text-white/70 block mb-2 uppercase tracking-wider">Category Tags</label>
                    <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_TAGS.map(tag => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`text-[10px] px-2.5 py-1 rounded-full transition-colors border ${
                                        isSelected 
                                        ? 'bg-gold/20 text-gold border-gold/50' 
                                        : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
                                    }`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <button 
                        type="button" 
                        onClick={() => { setSelectedTags([]); setMinPrice(''); setMaxPrice(''); }}
                        className="text-xs text-white/50 hover:text-white transition-colors"
                    >
                        Clear All
                    </button>
                    <button 
                        type="submit" 
                        className="bg-gold text-black text-xs font-semibold px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors"
                    >
                        Apply & Search
                    </button>
                  </div>
                </div>
              )}
            </form>

            <button onClick={() => router.push('/search')} className="sm:hidden p-2 text-gold hover:bg-gold/10 rounded-full transition-colors">
              <Search size={24} strokeWidth={1.5} />
            </button>

            <Link href="/cart" className="p-2 text-gold hover:bg-gold/10 rounded-full transition-colors relative">
              <ShoppingCart size={24} strokeWidth={1.5} />
              {mounted && totalItems > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white border border-black">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link href="/admin" className="p-2 text-gold hover:bg-gold/10 rounded-full transition-colors hidden sm:flex items-center gap-2" title="Admin Dashboard">
                <ShieldAlert size={20} strokeWidth={1.5} />
              </Link>
            )}

            <Link href={user ? "/profile" : "/auth/login"} className="p-2 text-gold hover:bg-gold/10 rounded-full transition-colors hidden sm:flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full border border-gold flex items-center justify-center overflow-hidden ${user ? 'bg-gold text-black' : ''}`}>
                <User size={18} strokeWidth={1.5} />
              </div>
            </Link>
          </div>

        </div>
      </header>
      
      <SidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};
