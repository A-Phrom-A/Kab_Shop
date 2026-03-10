'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { DollarSign, Package, ShoppingBag, Users, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { format, subDays, parseISO, isAfter, startOfDay } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface OrderItem {
  id: string;
  order_id: string;
  price_at_purchase: number;
  cost_at_purchase: number;
  quantity: number;
}

interface Order {
  id: string;
  total_price: number;
  status: number;
  created_at: string;
  order_items: OrderItem[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCost: 0,
    trueProfit: 0,
    profitMargin: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });
  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30); // Default to last 30 days

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch Orders with their items to calculate cost
      // Only get relevant statuses for historical data (1=Shipping, 2=Delivered)
      const { data: dbOrders, error: orderError } = await supabase
        .from('orders')
        .select(`
          id, total_price, status, created_at,
          order_items (id, order_id, price_at_purchase, cost_at_purchase, quantity)
        `)
        .order('created_at', { ascending: false });
        
      if (orderError) console.error("Error fetching orders:", orderError);

      const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

      if (dbOrders) {
        setOrdersData(dbOrders as unknown as Order[]);
        
        // Active/Pending calculations
        const pendingOrders = dbOrders.filter(o => o.status === 4).length;
        
        // Calculate all-time aggregate metrics
        // We only consider "Sold" items (Shipping/Delivered) for revenue & profit
        const soldOrders = dbOrders.filter(o => o.status === 1 || o.status === 2);
        
        let totalSales = 0;
        let totalCost = 0;

        soldOrders.forEach(order => {
          totalSales += Number(order.total_price);
          
          if (order.order_items) {
             order.order_items.forEach(item => {
               // Total cost for this item line = unit_cost * quantity
               const unitCost = Number(item.cost_at_purchase) || 0;
               totalCost += (unitCost * Number(item.quantity));
             });
          }
        });

        const trueProfit = totalSales - totalCost;
        const profitMargin = totalSales > 0 ? (trueProfit / totalSales) * 100 : 0;

        setStats({
          totalSales,
          totalCost,
          trueProfit,
          profitMargin,
          totalOrders: dbOrders.length,
          pendingOrders,
          totalProducts: productCount || 0,
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!ordersData.length) return [];

    // Filter to last N days and only considered sold items
    const cutoffDate = startOfDay(subDays(new Date(), timeRange));
    const soldOrders = ordersData.filter(o => 
      (o.status === 1 || o.status === 2) && 
      isAfter(parseISO(o.created_at), cutoffDate)
    );

    // Group by Date formatted string
    const grouped = soldOrders.reduce((acc: any, order) => {
      const dateStr = format(parseISO(order.created_at), 'MMM dd');
      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, revenue: 0, cost: 0, profit: 0 };
      }
      
      let orderCost = 0;
      if (order.order_items) {
        order.order_items.forEach(item => {
          orderCost += (Number(item.cost_at_purchase || 0) * Number(item.quantity));
        });
      }

      acc[dateStr].revenue += Number(order.total_price);
      acc[dateStr].cost += orderCost;
      acc[dateStr].profit += (Number(order.total_price) - orderCost);
      
      return acc;
    }, {});

    // Ensure we have entries for days with no sales for continuous graph
    const dataList = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const targetDate = format(subDays(new Date(), i), 'MMM dd');
      if (grouped[targetDate]) {
        dataList.push(grouped[targetDate]);
      } else {
        dataList.push({ date: targetDate, revenue: 0, cost: 0, profit: 0 });
      }
    }

    return dataList;
  }, [ordersData, timeRange]);


  if (loading) {
    return <div className="animate-pulse bg-white/5 h-64 rounded-xl"></div>;
  }

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-white/70 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
             <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
               {entry.name}: ${Number(entry.value).toFixed(2)}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white font-bold">Dashboard Overview</h1>
          <p className="text-white/60 mt-2">Welcome to the central kabshop command center.</p>
        </div>
        
        {/* Time Range Selector for Charts */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg w-fit">
          <button 
            onClick={() => setTimeRange(7)} 
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${timeRange === 7 ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            7D
          </button>
          <button 
            onClick={() => setTimeRange(30)} 
             className={`px-4 py-1.5 text-sm rounded-md transition-all ${timeRange === 30 ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            30D
          </button>
          <button 
            onClick={() => setTimeRange(90)} 
             className={`px-4 py-1.5 text-sm rounded-md transition-all ${timeRange === 90 ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            90D
          </button>
        </div>
      </div>

      {/* Primary Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="glass-dark" className="flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gold/10 rounded-full blur-2xl group-hover:bg-gold/20 transition-all duration-500"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-gold/20 bg-gold/10 flex items-center justify-center text-gold shadow-[0_0_15px_rgba(198,168,124,0.15)]">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider font-bold">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${stats.totalSales.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card variant="glass-dark" className="flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-500"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-green-500/20 bg-green-500/10 flex items-center justify-center text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.15)]">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider font-bold">True Profit</p>
              <p className="text-2xl font-bold text-green-400">${stats.trueProfit.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card variant="glass-dark" className="flex flex-col gap-4 relative overflow-hidden group">
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-blue-500/20 bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.15)]">
              {stats.profitMargin >= 30 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider font-bold">Profit Margin</p>
              <p className="text-2xl font-bold text-white">{stats.profitMargin.toFixed(1)}%</p>
              <p className="text-xs text-white/40 mt-1">Target: {'>'}30%</p>
            </div>
          </div>
        </Card>

        <Card variant="glass-dark" className="flex flex-col gap-4 relative overflow-hidden group">
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-purple-500/20 bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(167,139,250,0.15)]">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider font-bold">Avg. Order Value</p>
              <p className="text-2xl font-bold text-white">
                ${stats.totalOrders > 0 ? (stats.totalSales / stats.totalOrders).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Revenue vs Profit Chart */}
        <Card variant="glass-dark" className="col-span-1 lg:col-span-2 p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-serif text-white font-bold mb-6 flex items-center gap-2">
            <Activity className="text-gold" size={20} />
            Financial Performance Overview
          </h3>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6A87C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C6A87C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickMargin={10} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', color: '#ffffff80' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#C6A87C" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" name="True Profit" stroke="#4ADE80" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Breakdown / Secondary Stats */}
        <div className="flex flex-col gap-6">
          <Card variant="glass-dark" className="flex-1 flex flex-col">
             <h3 className="text-lg font-serif text-white font-bold mb-4">Cost vs Profit Ratio</h3>
             <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Overall', Profit: stats.trueProfit, Cost: stats.totalCost }]} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} hide />
                    <YAxis stroke="#ffffff50" fontSize={12} tickFormatter={(value) => `$${Math.round(value/1000)}k`} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                    <Bar dataKey="Cost" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={60} />
                    <Bar dataKey="Profit" fill="#4ADE80" radius={[4, 4, 0, 0]} barSize={60} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </Card>

          <Card variant="glass-dark" className="p-5">
            <h3 className="text-sm text-white/50 uppercase tracking-wider font-bold mb-4">Inventory Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <Users size={16} />
                  </div>
                  <span className="text-sm text-white/80">Pending Orders</span>
                </div>
                <span className="text-white font-bold">{stats.pendingOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                    <Package size={16} />
                  </div>
                  <span className="text-sm text-white/80">Active Products</span>
                </div>
                <span className="text-white font-bold">{stats.totalProducts}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions / Getting Started */}
      <Card>
        <h3 className="text-lg font-serif text-gold font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/orders" className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-gold/30 transition-colors cursor-pointer group block">
            <h4 className="font-medium text-white group-hover:text-gold transition-colors">Verify Pending Orders</h4>
            <p className="text-sm text-white/50 mt-1">Review payment proofs and deduct stock securely.</p>
          </Link>
          <Link href="/admin/products" className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-gold/30 transition-colors cursor-pointer group block">
            <h4 className="font-medium text-white group-hover:text-gold transition-colors">Add New Product</h4>
            <p className="text-sm text-white/50 mt-1">Upload images, set SKU, and list items dynamically.</p>
          </Link>
        </div>
      </Card>
    </div>
  );
}
