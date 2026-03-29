'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, 
  Users, 
  Package, 
  Search, 
  Filter, 
  ArrowLeft, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  ShoppingBag,
  DollarSign,
  Briefcase
} from 'lucide-react';

interface RankingData {
  products: any[];
  users: any[];
}

export default function AdminRankingPage() {
  const [activeTab, setActiveTab] = useState<'product' | 'user'>('product');
  const [loading, setLoading] = useState(true);
  const [rankingData, setRankingData] = useState<RankingData>({ products: [], users: [] });
  const [categories, setCategories] = useState<any[]>([]);
  
  // Filters for Product Ranking
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Expanded user details
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const AVAILABLE_TAGS = [
    "Popular", "Cheap & Good", "Value for Money", "Minimal", "Luxury", "Premium", 
    "Mechanical", "For Journey", "Creative", "Education", "New"
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders (Shipping or Delivered statuses)
      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select(`
          id, total_price, status, created_at, user_id,
          profiles(name, phone),
          order_items(id, product_id, quantity, price_at_purchase, cost_at_purchase)
        `)
        .in('status', [1, 2]); // Delivered/Shipping

      if (ordersErr) throw ordersErr;

      // 2. Fetch Products and Categories for metadata
      const { data: productsData } = await supabase.from('products').select('id, name, sku, category_id, tags, image_urls');
      const { data: categoriesData } = await supabase.from('categories').select('id, name');
      
      setCategories(categoriesData || []);

      // AGGREGATION LOGIC
      const productAggr: Record<string, any> = {};
      const userAggr: Record<string, any> = {};

      const productsMap = (productsData || []).reduce((acc: any, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      (orders || []).forEach(order => {
        const profileId = order.user_id;
        
        // Handle Supabase join typing where it might be typed as array
        const profilesData: any = order.profiles;
        const profile = Array.isArray(profilesData) ? profilesData[0] : profilesData;
        
        const profileName = profile?.name || 'Unknown User';
        const profilePhone = profile?.phone || '-';

        if (!userAggr[profileId]) {
          userAggr[profileId] = {
            id: profileId,
            name: profileName,
            phone: profilePhone,
            totalOrders: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            productCounts: {} as Record<string, number>
          };
        }

        userAggr[profileId].totalOrders += 1;
        userAggr[profileId].totalRevenue += Number(order.total_price);

        order.order_items.forEach((item: any) => {
          const pid = item.product_id;
          const qty = Number(item.quantity);
          const price = Number(item.price_at_purchase);
          const cost = Number(item.cost_at_purchase || 0);
          const profit = (price - cost) * qty;

          // Product Aggregation
          // ONLY include in product ranking if the product still exists in the catalog
          const pMeta = productsMap[pid];
          if (pMeta) {
            if (!productAggr[pid]) {
              productAggr[pid] = {
                id: pid,
                name: pMeta.name,
                sku: pMeta.sku,
                category_id: pMeta.category_id,
                tags: pMeta.tags || [],
                image: pMeta.image_urls?.[0],
                totalSold: 0,
                totalRevenue: 0,
                totalCost: 0,
                totalProfit: 0,
                avgCost: 0,
                avgPrice: 0
              };
            }

            productAggr[pid].totalSold += qty;
            productAggr[pid].totalRevenue += price * qty;
            productAggr[pid].totalCost += cost * qty;
            productAggr[pid].totalProfit += profit;
          }

          // User Detailed Tracking (Top Products)
          userAggr[profileId].totalCost += cost * qty;
          userAggr[profileId].totalProfit += profit;
          
          // ONLY track for Top Purchased list if the product still exists in the catalog
          if (pMeta) {
            userAggr[profileId].productCounts[pid] = (userAggr[profileId].productCounts[pid] || 0) + qty;
          }
        });
      });

      // Transform maps to arrays and sort
      const productList = Object.values(productAggr).map((p: any) => ({
        ...p,
        avgCost: p.totalSold > 0 ? p.totalCost / p.totalSold : 0,
        avgPrice: p.totalSold > 0 ? p.totalRevenue / p.totalSold : 0,
        profitPerItem: p.totalSold > 0 ? p.totalProfit / p.totalSold : 0
      })).sort((a, b) => b.totalProfit - a.totalProfit);

      const userList = Object.values(userAggr).sort((a, b) => b.totalProfit - a.totalProfit);

      setRankingData({
        products: productList,
        users: userList
      });

    } catch (err: any) {
      console.error(err);
      alert("Failed to fetch ranking data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Product Ranking
  const filteredProducts = useMemo(() => {
    return rankingData.products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = !filterCategory || p.category_id === filterCategory;
      const matchesTags = filterTags.length === 0 || filterTags.every((tag: string) => p.tags?.includes(tag));
      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [rankingData.products, productSearch, filterCategory, filterTags]);

  const toggleTag = (tag: string) => {
    setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  if (loading) {
    return <div className="animate-pulse bg-white/5 h-[500px] rounded-xl flex items-center justify-center text-white/50">Loading Rankings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-dark sticky top-28 p-5 z-10 gap-4 shadow-xl shadow-black/10 transition-all">
        <div>
          <h1 className="text-3xl font-serif text-white font-bold text-shadow-sm flex items-center gap-3">
            <TrendingUp className="text-gold" /> Performance Rankings
          </h1>
          <p className="text-white/60 font-medium mt-1">Analyze profitability and customer loyalty.</p>
        </div>
        
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('product')} 
            className={`px-4 py-2 text-sm rounded-md transition-all flex items-center gap-2 ${activeTab === 'product' ? 'bg-gold text-black font-bold shadow-lg shadow-gold/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            <Package size={16} /> Products
          </button>
          <button 
            onClick={() => setActiveTab('user')} 
            className={`px-4 py-2 text-sm rounded-md transition-all flex items-center gap-2 ${activeTab === 'user' ? 'bg-gold text-black font-bold shadow-lg shadow-gold/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            <Users size={16} /> Customers
          </button>
        </div>
      </div>

      {activeTab === 'product' && (
        <div className="space-y-4">
          {/* Product Filters */}
          <Card variant="glass-dark" className="!p-4 border-white/5">
             <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search product..." 
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none placeholder:text-white/30"
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm ${showFilters || filterCategory || filterTags.length > 0 ? 'bg-gold/10 border-gold/40 text-gold' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
                >
                  <Filter size={18} />
                  Filters { (filterTags.length > 0) && `(${filterTags.length})` }
                </button>
             </div>

             {showFilters && (
               <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs text-white/40 block mb-2 uppercase tracking-wider font-bold">Category</label>
                      <select 
                        value={filterCategory} 
                        onChange={e => setFilterCategory(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none [&>option]:bg-[#111]"
                      >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                       <label className="text-xs text-white/40 block mb-2 uppercase tracking-wider font-bold">Tags</label>
                       <div className="flex flex-wrap gap-2">
                         {AVAILABLE_TAGS.map(tag => {
                            const isSelected = filterTags.includes(tag);
                            return (
                              <button 
                                key={tag} 
                                onClick={() => toggleTag(tag)}
                                className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${isSelected ? 'bg-gold/20 text-gold border-gold/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30 hover:text-white'}`}
                              >
                                {tag}
                              </button>
                            );
                         })}
                       </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={() => { setFilterCategory(''); setFilterTags([]); setProductSearch(''); }}
                      className="text-xs text-white/40 hover:text-red-400 transition-colors underline underline-offset-4"
                    >
                      Clear All Filters
                    </button>
                  </div>
               </div>
             )}
          </Card>

          {/* Product Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-white/5 text-white/40 text-[11px] uppercase tracking-[0.2em] font-bold">
                <tr>
                  <th className="py-4 px-6 text-center w-16">Rank</th>
                  <th className="py-4 px-4">Product Info</th>
                  <th className="py-4 px-4 text-center">Unit Cost</th>
                  <th className="py-4 px-4 text-center">Unit Profit</th>
                  <th className="py-4 px-4 text-center">Total Sold</th>
                  <th className="py-4 px-4 text-right">Total Cost</th>
                  <th className="py-4 px-6 text-right">Total Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/20">
                {filteredProducts.map((p, idx) => (
                  <tr key={p.id} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="py-5 px-6 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${idx === 0 ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-amber-600 text-white' : 'text-white/40'}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-5 px-4 min-w-[300px]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/10">
                          {p.image ? <img src={p.image} className="w-full h-full object-contain" alt="" /> : <Package className="text-white/20" size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-gold transition-colors">{p.name}</p>
                          <p className="text-[10px] text-white/40 font-mono mt-0.5">{p.sku}</p>
                          {p.tags && p.tags.length > 0 && (
                            <div className="flex gap-1 mt-1.5 overflow-hidden">
                              {p.tags.slice(0, 3).map((t: string) => (
                                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-center font-mono text-sm text-white/60">
                      ${p.avgCost.toFixed(2)}
                    </td>
                    <td className="py-5 px-4 text-center">
                      <p className="font-bold text-green-400 text-sm font-mono">+${p.profitPerItem.toFixed(2)}</p>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold text-white/80 border border-white/10">
                        {p.totalSold} Units
                      </span>
                    </td>
                    <td className="py-5 px-4 text-right font-mono text-sm text-white/40">
                      ${p.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex flex-col items-end">
                        <p className="text-lg font-bold text-green-400 font-mono tracking-tighter">
                          ${p.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">TOTAL PROFIT</p>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-white/30">
                      <Package className="mx-auto mb-4 opacity-10" size={48} />
                      No product ranking data found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'user' && (
        <div className="space-y-4">
           <div className="grid grid-cols-1 gap-4">
             {rankingData.users.map((u, idx) => (
               <div key={u.id} className="group transition-all">
                  <Card 
                    variant="glass-dark" 
                    className={`!p-0 border-white/5 overflow-hidden transition-all duration-300 ${expandedUserId === u.id ? ' ring-1 ring-gold/30' : 'hover:border-white/20'}`}
                  >
                    <div 
                      className="flex flex-col md:flex-row items-center gap-6 p-6 cursor-pointer"
                      onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                    >
                      <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${idx === 0 ? 'bg-gold text-black' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-white/10 text-white/50'}`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                             {u.name}
                             {idx === 0 && <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded border border-gold/40">WHALE</span>}
                          </h3>
                          <p className="text-sm text-white/40 flex items-center gap-1.5 mt-0.5">
                            <Users size={14} className="opacity-50" /> {u.phone}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto md:min-w-[400px]">
                        <div className="text-center md:text-left">
                          <p className="text-[11px] text-white/40 uppercase tracking-wider font-bold mb-1">Total Orders</p>
                          <p className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-1.5">
                            <ShoppingBag size={14} className="text-blue-400" /> {u.totalOrders}
                          </p>
                        </div>
                        <div className="text-center md:text-left">
                           <p className="text-[11px] text-white/40 uppercase tracking-wider font-bold mb-1">Net Profit</p>
                           <p className="text-lg font-bold text-green-400 font-mono tracking-tighter">
                             ${u.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                           </p>
                        </div>
                        <div className="hidden md:flex flex-col items-end justify-center">
                           <div className={`p-2 rounded-full transition-transform ${expandedUserId === u.id ? 'rotate-180 bg-gold/10 text-gold' : 'bg-white/5 text-white/40 group-hover:bg-white/10'}`}>
                              <ChevronDown size={20} />
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Top 10 Products */}
                    {expandedUserId === u.id && (
                      <div className="bg-black/40 border-t border-white/5 p-6 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-6">
                           <TrendingUp className="text-gold" size={18} />
                           <h4 className="text-sm font-bold text-white uppercase tracking-widest">Top Products Purchased</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                          {Object.entries(u.productCounts)
                            .sort((a: any, b: any) => b[1] - a[1])
                            .slice(0, 10)
                            .map(([pid, count]: any, rank) => {
                               // Find product info
                               const pData = rankingData.products.find(x => x.id === pid) || { name: 'Deleted Product', image: null };
                               return (
                                 <div key={pid} className="bg-white/5 rounded-xl p-3 border border-white/10 group/item hover:bg-white/10 transition-colors">
                                   <div className="relative aspect-square rounded-lg bg-black/40 mb-3 overflow-hidden border border-white/5">
                                      {pData.image ? <img src={pData.image} className="w-full h-full object-contain" alt="" /> : <Package className="w-full h-full p-4 opacity-20" />}
                                      <div className="absolute top-1 left-1 bg-black/80 text-gold text-[10px] font-bold px-1.5 py-0.5 rounded border border-gold/20">
                                        #{rank + 1}
                                      </div>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-xs font-bold text-white/90 line-clamp-1 group-hover/item:text-gold transition-colors">{pData.name}</p>
                                      <p className="text-[10px] text-white/40 font-medium">Purchased: <span className="text-white font-bold">{count}x</span></p>
                                   </div>
                                 </div>
                               );
                            })}
                        </div>
                      </div>
                    )}
                  </Card>
               </div>
             ))}
             {rankingData.users.length === 0 && (
               <div className="py-20 text-center text-white/30 bg-white/5 rounded-xl border border-white/10">
                 <Users className="mx-auto mb-4 opacity-10" size={48} />
                 No user ranking data found.
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
}
