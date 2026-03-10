'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface BespokeButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function BespokeButton({ onClick, children, variant = 'primary', className = '' }: BespokeButtonProps) {
  // A subtle, elegant click sound (using a very short synthesized base64 clip for reliability without external files)
  const audioContextRef = useRef<AudioContext | null>(null);

  const playHapticSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Sharp, glass-like 'tick' sound profile
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.error('Audio playback failed', e);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    playHapticSound();
    if (onClick) onClick();
  };

  const isPrimary = variant === 'primary';

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-full font-serif font-semibold tracking-wide
        transition-all duration-500 ease-out group px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg
        ${isPrimary ? 'text-[#043927]' : 'text-gold border border-gold/50 bg-white/5'}
        ${className}
      `}
    >
      {isPrimary && (
        <>
          {/* Base Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-gold via-yellow-200 to-gold z-0"></div>
          
          {/* Liquid Hover Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0">
             <div className="absolute inset-[-100%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent opacity-50 blur-xl group-hover:animate-spin-slow"></div>
          </div>
          
          {/* Crackle Glow on Tap */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileTap={{ opacity: 1, scale: 1.1, textShadow: "0 0 15px rgba(255,255,255,0.8)" }}
            className="absolute inset-0 border-2 border-white/60 rounded-full blur-[2px] z-0"
          />
        </>
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

    </motion.button>
  );
}
