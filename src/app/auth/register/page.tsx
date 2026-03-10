'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Sign up user and pass metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          phone: formData.phone,
          shipping_address: formData.address,
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. The database trigger handle_new_user will now use raw_user_meta_data 
    // to create the profile automatically with phone, name, and address.
    
    if (authData.user) {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[70vh] py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gold font-bold mb-2">Create Account</h1>
          <p className="text-white/60">Join our premium stationery community</p>
        </div>

        <Card variant="glass-dark" className="p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                fullWidth
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08X-XXX-XXXX"
                required
                fullWidth
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              fullWidth
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              fullWidth
            />

            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm font-medium text-white/90">
                Shipping Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your full shipping address"
                required
                rows={3}
                className="glass-dark w-full px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-200 resize-none rounded-[12px]"
              />
            </div>

            <Button type="submit" fullWidth disabled={loading} className="mt-4">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 glass-dark text-white/50 rounded-full">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'facebook' })} 
              className="hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/50"
            >
              Facebook
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-white/60">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gold hover:text-gold/80 hover:underline transition-colors">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
