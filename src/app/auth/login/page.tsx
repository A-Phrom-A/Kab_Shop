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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResetMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setResetMessage('Password reset link sent! Please check your email.');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gold font-bold mb-2">Welcome Back</h1>
          <p className="text-white/60">{isForgotPassword ? 'Reset your password' : 'Sign in to your premium account'}</p>
        </div>

        <Card variant="glass-dark" className="p-8">
          <form onSubmit={isForgotPassword ? handleResetPassword : handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            {resetMessage && (
              <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm text-center">
                {resetMessage}
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
            
            {!isForgotPassword && (
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
                  <button type="button" onClick={() => { setIsForgotPassword(true); setError(null); setResetMessage(null); }} className="text-sm text-gold hover:text-gold/80 transition-colors">
                    Forgot password?
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading 
                ? (isForgotPassword ? 'Sending Link...' : 'Signing in...') 
                : (isForgotPassword ? 'Send Reset Link' : 'Sign In')}
            </Button>
            
            {isForgotPassword && (
               <div className="text-center mt-4 text-sm text-white/60">
                 Remember your password?{' '}
                 <button type="button" onClick={() => { setIsForgotPassword(false); setError(null); setResetMessage(null); }} className="text-gold hover:text-gold/80 hover:underline transition-colors">
                   Back to Login
                 </button>
               </div>
            )}
          </form>

          {!isForgotPassword && (
            <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-white/60">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-gold hover:text-gold/80 hover:underline transition-colors">
                Create one
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
