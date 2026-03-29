'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, UploadCloud, CheckCircle2, ShoppingCart } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import generatePayload from 'promptpay-qr';
import { useCartStore } from '@/store/useCartStore';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/cart');
      return;
    }

    if (!file) {
      setError("Please upload your payment proof before completing the order.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Upload proof to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (uploadError) throw new Error("Failed to upload payment proof. " + uploadError.message);

      // Get public URL (even though bucket might be private for users, we store the path)
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // 2. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_price: getTotalPrice(),
          payment_proof_url: publicUrl,
          status: 4, // Pending
        })
        .select()
        .single();

      if (orderError) throw new Error("Failed to create order. " + orderError.message);

      // 3. Create Order Items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id.startsWith('dummy-') ? null : item.id, // Handle dummy data gracefully
        quantity: item.quantity,
        price_at_purchase: item.price,
        cost_at_purchase: item.cost || 0
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw new Error("Failed to add items to order. " + itemsError.message);

      // 4. Success cleanup
      setSuccess(true);
      clearCart();
      setTimeout(() => {
        router.push('/profile');
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-[60vh]"></div>;

  if (items.length === 0 && !success) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] py-12">
        <div className="text-center">
          <ShoppingCart size={64} className="mx-auto text-white/20 mb-6" />
          <h1 className="text-3xl font-serif text-white font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-white/60 mb-8 max-w-md mx-auto">Looks like you haven't added any premium stationery to your cart yet.</p>
          <Button onClick={() => router.push('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] py-12">
        <Card className="max-w-md w-full text-center py-12">
          <CheckCircle2 size={64} className="mx-auto text-gold mb-6" />
          <h1 className="text-3xl font-serif text-white font-bold mb-4">Order Received!</h1>
          <p className="text-white/60 mb-8">Thank you for your purchase. Your order is now pending verification. We will process it shortly.</p>
          <p className="text-sm text-white/40">Redirecting to your profile...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl sm:text-4xl font-serif text-gold font-bold mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Cart Items */}
        <div className="w-full lg:w-2/3 space-y-4">
          <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-white/10 text-sm text-white/50 px-4">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-1 text-right"></div>
          </div>

          {items.map((item) => (
            <Card key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center !p-4 hover:border-white/20">
              <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                <div className="w-20 h-20 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="object-contain w-full h-full" />
                  ) : (
                    <span className="text-[10px] text-white/20">Img</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white line-clamp-2">{item.name}</h3>
                  <p className="text-gold text-sm mt-1">${item.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="col-span-1 sm:col-span-3 flex justify-start sm:justify-center">
                <div className="flex items-center glass-dark rounded-full px-2 py-1 w-fit">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                  >-</button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                  >+</button>
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 text-right">
                <span className="font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
              </div>

              <div className="col-span-1 sm:col-span-1 flex justify-end">
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Payment & Summary Details */}
        <div className="w-full lg:w-1/3">
          <Card className="sticky top-28 flex flex-col gap-6">
            <h3 className="text-xl font-serif text-white font-bold border-b border-white/10 pb-4">Order Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-gold font-bold text-xl pt-4 border-t border-white/10">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-2">
              <h4 className="text-sm font-bold text-white mb-2">Payment Details</h4>
              <p className="text-xs text-white/70 mb-1">Bank: <span className="text-white">K plus (กสิกร)</span></p>
              <p className="text-xs text-white/70 mb-1">Account No: <span className="text-white font-mono break-all">062-3-26849-7</span></p>
              <p className="text-xs text-white/70 mb-4">Account Name: <span className="text-white">kabshop Co., Ltd.</span></p>

              {/* PromptPay QR Code */}
              <div className="w-full bg-white rounded-xl flex flex-col items-center justify-center p-4 mx-auto max-w-[200px] mb-4 shadow-lg border-2 border-[#113566]">
                <div className="bg-[#113566] w-full py-2 text-center rounded-t-lg mb-4 flex items-center justify-center">
                  <div className="flex items-center font-sans tracking-tight">
                    <span className="text-white font-bold text-lg select-none">Prompt</span>
                    <span className="text-blue-200 font-bold text-lg ml-0.5 select-none">Pay</span>
                  </div>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <QRCodeSVG
                    value={generatePayload('0969828778', { amount: getTotalPrice() })}
                    size={140}
                  />
                </div>
                <div className="text-[#113566] font-semibold text-xs mt-3 text-center w-full py-1">
                  kabshop Co., Ltd.
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/90">Upload Payment Slip <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="payment-proof"
                  />
                  <div className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-xl transition-colors ${previewUrl ? 'border-gold bg-gold/5' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}>
                    {previewUrl ? (
                      <div className="text-center">
                        <img src={previewUrl} alt="Preview" className="h-16 w-auto mx-auto mb-2 object-cover rounded" />
                        <span className="text-xs text-gold font-medium">Change image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-white/50">
                        <UploadCloud size={24} />
                        <span className="text-xs text-center">Click or drag image to upload slip</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              fullWidth
              size="lg"
              onClick={handleCheckout}
              disabled={loading || !file}
            >
              {loading ? 'Processing...' : 'Confirm Order'}
            </Button>

            {!user && (
              <p className="text-xs text-center text-white/50">You will be asked to sign in before checkout.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
