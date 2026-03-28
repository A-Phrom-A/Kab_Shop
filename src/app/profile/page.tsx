'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Package, Edit2, Check, X, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// 1. Delivered (จัดส่งสำเร็จแล้ว), 2. Shipping (กำลังจัดส่ง), 3. Canceled (ยกเลิก), 4. Pending (รอการจัดส่ง).
const getStatusBadge = (status: number) => {
  switch (status) {
    case 1:
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/50">Delivered</span>;
    case 2:
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/50">Shipping</span>;
    case 3:
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/50">Canceled</span>;
    case 4:
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">Pending</span>;
    default:
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60 border border-white/20">Unknown</span>;
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', shipping_address: '', line_id: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);
      setEditForm({
        name: profileData?.name || '',
        phone: profileData?.phone || '',
        shipping_address: profileData?.shipping_address || '',
        line_id: profileData?.line_id || '',
      });
      setAvatarPreview(profileData?.avatar_url || null);

      // Fetch Orders
      const { data: orderData } = await supabase
        .from('orders')
        .select(`
          id, 
          total_price, 
          status, 
          created_at,
          tracking_number,
          cancellation_reason,
          order_items (
            quantity, 
            price_at_purchase,
            products (name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setOrders(orderData || []);
      setLoading(false);
    };

    fetchProfileData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (profile.role === 'Admin' && (!editForm.line_id || editForm.line_id.trim() === '')) {
      alert("Admin accounts must provide a Line ID.");
      return;
    }

    setSaving(true);
    let newAvatarUrl = profile.avatar_url;

    try {
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);
        
        if (uploadError) throw new Error("Failed to upload avatar: " + uploadError.message);

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        newAvatarUrl = publicUrl;
      }

      const { error } = await supabase.from('profiles').update({
        name: editForm.name,
        phone: editForm.phone,
        shipping_address: editForm.shipping_address,
        line_id: editForm.line_id,
        avatar_url: newAvatarUrl
      }).eq('id', profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        name: editForm.name,
        phone: editForm.phone,
        shipping_address: editForm.shipping_address,
        line_id: editForm.line_id,
        avatar_url: newAvatarUrl
      });
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      shipping_address: profile?.shipping_address || '',
      line_id: profile?.line_id || '',
    });
    setAvatarPreview(profile?.avatar_url || null);
    setAvatarFile(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Profile Info */}
        <div className="w-full md:w-1/3">
          <Card className="sticky top-28 p-6">
            
            {/* Header Actions */}
            <div className="flex justify-between items-start mb-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center text-gold text-3xl font-serif overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profile?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                )}
              </div>
              
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="text-white/40 hover:text-gold transition-colors p-2 bg-white/5 rounded-full" title="Edit Profile">
                  <Edit2 size={16} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={cancelEdit} disabled={saving} className="text-white/40 hover:text-red-400 transition-colors p-2 bg-white/5 rounded-full disabled:opacity-50" title="Cancel">
                    <X size={16} />
                  </button>
                  <button onClick={handleSaveProfile} disabled={saving} className="text-white/40 hover:text-green-400 transition-colors p-2 bg-white/5 rounded-full disabled:opacity-50" title="Save profile">
                    <Check size={16} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Profile Fields */}
            <div className="space-y-4 mb-8">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Full Name</label>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Line ID {profile?.role === 'Admin' && <span className="text-red-500">*</span>}</label>
                    <input 
                      type="text" 
                      value={editForm.line_id} 
                      onChange={(e) => setEditForm({...editForm, line_id: e.target.value})}
                      placeholder="Line ID"
                      className={`w-full bg-black/20 border ${profile?.role === 'Admin' && editForm.line_id.trim() === '' ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none`}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Phone</label>
                    <input 
                      type="text" 
                      value={editForm.phone} 
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Shipping Address</label>
                    <textarea 
                      value={editForm.shipping_address} 
                      onChange={(e) => setEditForm({...editForm, shipping_address: e.target.value})}
                      rows={3}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold outline-none resize-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-white text-shadow-sm">{profile?.name}</h2>
                    <p className="text-white/80 text-sm font-medium">{profile?.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-medium mb-1">Line ID</p>
                    <p className="text-sm font-semibold">{profile?.line_id ? `@${profile.line_id}` : 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-medium mb-1">Phone</p>
                    <p className="text-sm font-semibold">{profile?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-medium mb-1">Shipping Address</p>
                    <p className="text-sm bg-black/20 p-3 rounded-lg border border-white/10 whitespace-pre-wrap leading-relaxed">{profile?.shipping_address || 'Not provided'}</p>
                  </div>
                </>
              )}
            </div>

            <Button variant="outline" fullWidth onClick={handleSignOut} className="text-red-400 border-red-400/50 hover:bg-red-400/10 hover:text-red-300">
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </Card>
        </div>

        {/* Order History */}
        <div className="w-full md:w-2/3">
          <h2 className="text-2xl font-serif text-gold font-bold mb-6 flex items-center gap-2">
            <Package size={24} />
            Order History
          </h2>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card className="text-center py-12">
                <Package size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/60 mb-4">You haven't placed any orders yet.</p>
                <Button variant="secondary" onClick={() => router.push('/')}>Start Shopping</Button>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="hover:border-gold/30 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs text-white/80 font-medium mb-1">Order ID</p>
                      <p className="font-mono text-sm font-semibold">{order.id}</p>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                      <p className="text-xs text-white/80 font-medium">Status</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {(order.tracking_number || order.cancellation_reason) && (
                    <div className="mb-4">
                      {order.tracking_number && (order.status === 1 || order.status === 2) && (
                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg mb-2">
                           <p className="text-xs text-blue-400 font-bold mb-1">Tracking Number</p>
                           <p className="font-mono text-sm text-white select-all">{order.tracking_number}</p>
                        </div>
                      )}
                      {order.cancellation_reason && order.status === 3 && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                           <p className="text-xs text-red-400 font-bold mb-1">Cancellation Reason</p>
                           <p className="text-sm text-red-200">{order.cancellation_reason}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {order.order_items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-white/80">{item.quantity}x {item.products?.name || 'Unknown Product'}</span>
                        <span className="text-white/60">${item.price_at_purchase.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-white/60 text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
                    <span className="text-gold font-bold text-lg">${order.total_price.toFixed(2)}</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
