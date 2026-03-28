'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Search, X } from 'lucide-react';
import Image from 'next/image';

// 1: Delivered, 2: Shipping, 3: Canceled, 4: Pending
const STATUS_MAP: Record<number, string> = {
  1: 'Delivered',
  2: 'Shipping (Paid)',
  3: 'Canceled',
  4: 'Pending Verification',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Prompt States
  const [trackingPromptOrderId, setTrackingPromptOrderId] = useState<string | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  
  const [cancelPromptOrderId, setCancelPromptOrderId] = useState<string | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("");
  
  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(name, phone, shipping_address), order_items(quantity, price_at_purchase, products(name, sku))')
      .order('created_at', { ascending: false });

    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: number, tracking?: string, cancelReason?: string) => {
    if (newStatus === 2 && !tracking) {
      setTrackingPromptOrderId(orderId);
      return;
    }
    if (newStatus === 3 && !cancelReason) {
      setCancelPromptOrderId(orderId);
      return;
    }

    setUpdatingId(orderId);
    
    const updates: any = { status: newStatus };
    if (tracking !== undefined) updates.tracking_number = tracking;
    if (cancelReason !== undefined) updates.cancellation_reason = cancelReason;

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      alert("Failed to update order status: " + error.message);
    } else {
      await fetchOrders(); // Refresh table
    }
    
    setUpdatingId(null);
    setTrackingPromptOrderId(null);
    setTrackingNumberInput("");
    setCancelPromptOrderId(null);
    setCancelReasonInput("");
  };

  if (loading) {
    return <div className="animate-pulse bg-white/5 h-[500px] rounded-xl flex items-center justify-center text-white/50">Loading Orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-dark sticky top-28 p-5 z-10 gap-4 shadow-xl shadow-black/10">
        <div>
          <h1 className="text-3xl font-serif text-white font-bold text-shadow-sm">Order Verification</h1>
          <p className="text-white/80 font-medium mt-1">Review payment proofs and manage shipping statuses.</p>
        </div>
      </div>

      <Card variant="glass-dark" className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10 text-white/50 text-sm uppercase tracking-wider">
              <th className="py-4 px-4 font-medium">Order Details</th>
              <th className="py-4 px-4 font-medium">Customer</th>
              <th className="py-4 px-4 font-medium">Amount</th>
              <th className="py-4 px-4 font-medium text-center">Payment Proof</th>
              <th className="py-4 px-4 font-medium">Status & Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-white/50">No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  
                  {/* Order Details */}
                  <td className="py-4 px-4 align-top">
                    <p className="font-mono text-xs text-white/60 mb-2">ID: {order.id.split('-')[0]}</p>
                    <div className="space-y-1 text-sm">
                      {order.order_items?.map((item: any, idx: number) => (
                        <p key={idx} className="text-white/80 line-clamp-1" title={item.products?.name}>
                          <span className="text-gold">{item.quantity}x</span> {item.products?.name || 'Unknown Item'}
                        </p>
                      ))}
                    </div>
                  </td>

                  {/* Customer Info */}
                  <td className="py-4 px-4 align-top text-sm">
                    <p className="font-bold text-white mb-1">{order.profiles?.name}</p>
                    <p className="text-white/60 text-xs mb-1">{order.profiles?.phone}</p>
                    <p className="text-white/40 text-[11px] line-clamp-2" title={order.profiles?.shipping_address}>{order.profiles?.shipping_address}</p>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4 align-top">
                    <p className="font-bold text-gold">${Number(order.total_price).toFixed(2)}</p>
                    <p className="text-xs text-white/40 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                  </td>

                  {/* Payment Proof */}
                  <td className="py-4 px-4 align-top text-center">
                    {order.payment_proof_url ? (
                      <button 
                        onClick={() => setSelectedImage(order.payment_proof_url)} 
                        className="inline-flex flex-col items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 p-2 rounded-lg cursor-pointer border border-blue-500/20 hover:border-blue-500/50"
                      >
                        <ExternalLink size={20} />
                        <span className="text-xs font-medium">View Slip</span>
                      </button>
                    ) : (
                      <span className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded inline-block mt-2">No Slip</span>
                    )}
                  </td>

                  {/* Status & Actions */}
                  <td className="py-4 px-4 align-top">
                    <div className="flex flex-col gap-2">
                      <span className={`text-xs px-2 py-1 rounded w-fit ${
                        order.status === 4 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                        order.status === 2 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                        order.status === 1 ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                        'bg-red-500/20 text-red-400 border border-red-500/50'
                      }`}>
                        {STATUS_MAP[order.status] || 'Unknown'}
                      </span>
                      {order.tracking_number && (
                        <p className="text-[11px] text-white/50 mt-1">Tracking: <span className="text-white/80">{order.tracking_number}</span></p>
                      )}
                      {order.cancellation_reason && order.status === 3 && (
                        <p className="text-[11px] text-red-400 mt-1">Reason: {order.cancellation_reason}</p>
                      )}
                      
                      {order.status === 4 && (
                        <div className="flex gap-2 mt-2">
                          <button 
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 2)}
                            className="text-xs bg-gold text-black px-3 py-1.5 rounded font-bold hover:bg-gold/80 transition-colors disabled:opacity-50"
                          >
                            Verify & Ship
                          </button>
                          <button 
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 3)}
                            className="text-xs text-red-300 hover:text-red-500 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {order.status === 2 && (
                        <button 
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 1)}
                          className="text-xs border border-green-500 text-green-500 hover:bg-green-500 hover:text-black px-3 py-1.5 rounded transition-colors mt-2 disabled:opacity-50 w-fit"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Image Modal overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-all"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            <div 
              className="relative w-full h-[80vh] bg-black/50 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Used standard img tag to bypass next/image domain restrictions for external supabase URLs if they aren't configured */}
              <img 
                src={selectedImage} 
                alt="Payment Slip Proof" 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-white/50 text-sm mt-4 text-center">Click outside or press X to close</p>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingPromptOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
           <Card variant="glass-dark" className="max-w-md w-full !p-6 border-blue-500/30">
               <h3 className="text-xl font-bold text-blue-400 mb-2">Ship Order</h3>
               <p className="text-sm text-white/60 mb-6">Please enter the tracking number (e.g. Kerry, Flash) before marking this order as shipped.</p>
               <input 
                 autoFocus
                 type="text" 
                 value={trackingNumberInput}
                 onChange={e => setTrackingNumberInput(e.target.value)}
                 placeholder="Enter Tracking Number..."
                 className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none mb-6"
               />
               <div className="flex justify-end gap-3">
                 <Button variant="secondary" onClick={() => {
                   setTrackingPromptOrderId(null);
                   setTrackingNumberInput("");
                 }}>Cancel</Button>
                 <Button onClick={() => handleUpdateStatus(trackingPromptOrderId, 2, trackingNumberInput, undefined)} disabled={!trackingNumberInput.trim() || updatingId !== null}>
                    Confirm & Ship
                 </Button>
               </div>
           </Card>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {cancelPromptOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
           <Card variant="glass-dark" className="max-w-md w-full !p-6 border-red-500/30">
               <h3 className="text-xl font-bold text-red-400 mb-2">Cancel Order</h3>
               <p className="text-sm text-white/60 mb-6">Please provide a reason for cancelling this order. The customer will see this message.</p>
               <textarea 
                 autoFocus
                 value={cancelReasonInput}
                 onChange={e => setCancelReasonInput(e.target.value)}
                 placeholder="e.g. Out of stock, Fake proof of payment..."
                 className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-red-400 focus:outline-none mb-6 resize-none h-24"
               ></textarea>
               <div className="flex justify-end gap-3">
                 <Button variant="secondary" onClick={() => {
                   setCancelPromptOrderId(null);
                   setCancelReasonInput("");
                 }}>Back</Button>
                 <Button onClick={() => handleUpdateStatus(cancelPromptOrderId, 3, undefined, cancelReasonInput)} 
                         disabled={!cancelReasonInput.trim() || updatingId !== null}
                         className="!bg-red-500 hover:!bg-red-600 !text-white !border-0">
                    Confirm Cancellation
                 </Button>
               </div>
           </Card>
        </div>
      )}
    </div>
  );
}
