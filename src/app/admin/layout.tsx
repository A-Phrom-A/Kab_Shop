'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingBag, FolderTree, Settings, ShieldAlert, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login?redirect=/admin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'Admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-serif text-white font-bold mb-4">Access Denied</h1>
        <p className="text-white/60 mb-8 max-w-md">You do not have the required permissions to view this secure area.</p>
        <button onClick={() => router.push('/')} className="text-gold hover:text-gold/80 transition-colors uppercase tracking-wider text-sm font-bold">Return to Store</button>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Order Management', icon: ShoppingBag },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/chat', label: 'Chat Support', icon: MessageSquare },
    { href: '/profile', label: 'Exit Admin', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[70vh] gap-8 py-2">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="glass-dark rounded-[12px] p-6 sticky top-28">
          <h2 className="text-xl font-serif text-gold font-bold mb-6 flex items-center gap-2">
            <ShieldAlert size={20} /> Admin Panel
          </h2>
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-gold/20 text-gold font-bold border border-gold/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]' 
                      : 'text-white/90 font-medium hover:text-gold hover:bg-black/20 border border-transparent'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
