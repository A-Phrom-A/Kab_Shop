'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gold font-bold mb-2">Welcome Back</h1>
          <p className="text-white/60">Sign in to your premium account</p>
        </div>

        <Card variant="glass-dark" className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              fullWidth
            />
            
            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                fullWidth
              />
              <div className="flex justify-end">
                <Link href="#" className="text-sm text-gold hover:text-gold/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
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
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-gold hover:text-gold/80 hover:underline transition-colors">
              Create one
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
