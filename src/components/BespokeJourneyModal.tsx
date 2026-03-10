'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BespokeButton } from './ui/BespokeButton';
import Link from 'next/link';

interface BespokeJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUESTIONS = [
  {
    id: 1,
    title: "How do you define your current lifestyle?",
    options: [
      { text: "Minimal & Focused", tags: ["Minimal", "Education"], color: "from-[#043927] to-[#0A1A14]" },
      { text: "Creative Explorer", tags: ["Creative", "For Journey", "New"], color: "from-[#1A1025] to-[#0D0514]" },
      { text: "Appreciator of Finesse", tags: ["Luxury", "Premium"], color: "from-[#1A1405] to-[#0D0A02]" },
    ]
  },
  {
    id: 2,
    title: "What are you seeking today?",
    options: [
      { text: "Reliable Daily Tools", tags: ["Cheap & Good", "Value for Money", "Mechanical"] },
      { text: "A Meaningful Upgrade", tags: ["Premium", "New", "Luxury"] },
      { text: "Something to Spark Ideas", tags: ["Creative", "For Journey"] },
    ]
  }
];

export function BespokeJourneyModal({ isOpen, onClose }: BespokeJourneyModalProps) {
  const [step, setStep] = useState(0);
  const [accumulatedTags, setAccumulatedTags] = useState<string[]>([]);
  const [bgGradient, setBgGradient] = useState("from-[#043927] via-black to-[#0A1A14]");
  const [matchedProduct, setMatchedProduct] = useState<any>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setAccumulatedTags([]);
      setMatchedProduct(null);
      setBgGradient("from-[#043927] via-black to-[#0A1A14]");
    }
  }, [isOpen]);

  const handleOptionSelect = async (option: any) => {
    // Update background color if option provides one for immersive experience
    if (option.color) {
      setBgGradient(option.color);
    }

    const newTags = [...accumulatedTags, ...option.tags];
    setAccumulatedTags(newTags);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Final step reached, find the match
      setStep(step + 1); // Move to 'analyzing' step
      findBestMatch(newTags);
    }
  };

  const findBestMatch = async (tagsToMatch: string[]) => {
    setLoadingMatch(true);
    
    // Simulating deep AI thought process for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Since supabase doesn't support complex array overlap scoring directly in JS easily, 
      // we fetch all and sort in memory (fine for small product catalogs)
      const { data: products } = await supabase.from('products').select('*');
      
      if (!products || products.length === 0) {
        setLoadingMatch(false);
        return;
      }

      // Default to first product
      let bestMatch = products[0];
      let maxScore = -1;

      products.forEach(product => {
        let score = 0;
        const productTags = product.tags || [];
        
        tagsToMatch.forEach(targetTag => {
          if (productTags.includes(targetTag)) {
            score++;
          }
        });

        if (score > maxScore) {
          maxScore = score;
          bestMatch = product;
        }
      });

      setMatchedProduct(bestMatch);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMatch(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      >
        {/* Solid Base Background to ensure no bleed */}
        <div className="absolute inset-0 bg-black z-0"></div>

        {/* Dynamic Fluid Background */}
        <motion.div 
          animate={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
          className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-90 transition-colors duration-1000 ease-in-out z-0`}
        />
        
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 bg-noise opacity-40 mix-blend-overlay pointer-events-none z-0"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50 bg-black/20 p-2 rounded-full backdrop-blur-md"
        >
          <X size={24} />
        </button>

        <div className="relative z-10 w-full max-w-4xl min-h-[500px] flex flex-col items-center justify-center">
          
          <AnimatePresence mode="wait">
            
            {/* QUIZ STEPS */}
            {step < QUESTIONS.length && (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, filter: 'blur(10px)', transition: { duration: 0.3 } }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full text-center flex flex-col items-center"
              >
                <div className="mb-4 text-gold border border-gold/30 rounded-full px-4 py-1 text-sm inline-flex items-center gap-2 bg-gold/5 backdrop-blur-sm">
                  <Sparkles size={14} /> Step {step + 1} of {QUESTIONS.length}
                </div>
                
                <h2 className="text-3xl md:text-5xl font-serif text-white font-bold mb-12 drop-shadow-lg tracking-tight">
                  {QUESTIONS[step].title}
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-3xl">
                  {QUESTIONS[step].options.map((option, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05, borderColor: 'rgba(212,175,55,0.8)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOptionSelect(option)}
                      className="glass-dark hover:bg-white/10 transition-colors border border-white/10 flex-1 p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center group"
                    >
                      <span className="text-lg md:text-xl font-medium text-white/90 group-hover:text-gold transition-colors block">
                        {option.text}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ANALYZING & RESULTS STEP */}
            {step >= QUESTIONS.length && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="w-full flex flex-col items-center"
              >
                {loadingMatch ? (
                  <div className="flex flex-col items-center justify-center space-y-8">
                    <motion.div 
                      animate={{ 
                        rotate: 360,
                        boxShadow: ["0 0 20px rgba(212,175,55,0)", "0 0 40px rgba(212,175,55,0.4)", "0 0 20px rgba(212,175,55,0)"]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-24 h-24 rounded-full border-t-2 border-r-2 border-gold flex items-center justify-center"
                    >
                      <Sparkles className="text-gold animate-pulse" size={32} />
                    </motion.div>
                    <h3 className="text-2xl font-serif text-white/80 animate-pulse">Curating your bespoke selection...</h3>
                  </div>
                ) : matchedProduct ? (
                  <div className="flex flex-col md:flex-row items-center gap-12 w-full max-w-4xl bg-black/20 backdrop-blur-xl border border-gold/30 p-8 md:p-12 rounded-[2rem] shadow-2xl">
                    
                    {/* 3D Floating Product Image */}
                    <motion.div 
                      className="w-full md:w-1/2 perspective-1000"
                      initial={{ rotateY: 30, opacity: 0, x: -50 }}
                      animate={{ rotateY: 0, opacity: 1, x: 0 }}
                      transition={{ type: "spring", bounce: 0.4, duration: 1.2 }}
                    >
                      <img 
                        src={matchedProduct.image_urls?.[0] || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80'} 
                        alt={matchedProduct.name}
                        className="w-full aspect-[4/3] object-cover rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
                        style={{ transformStyle: 'preserve-3d', transform: 'translateZ(50px)' }}
                      />
                    </motion.div>

                    {/* Product Details */}
                    <div className="w-full md:w-1/2 flex flex-col items-start text-left">
                      <div className="text-gold font-serif italic mb-2 tracking-wider flex items-center gap-2">
                        <Sparkles size={16} /> A Perfect Match
                      </div>
                      <h3 className="text-4xl md:text-5xl font-bold text-white font-serif mb-4 leading-tight">
                        {matchedProduct.name}
                      </h3>
                      <p className="text-white/70 text-lg mb-8 line-clamp-3">
                        {matchedProduct.description}
                      </p>
                      
                      <div className="flex gap-2 flex-wrap mb-8">
                        {matchedProduct.tags?.map((tag: string) => (
                           <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
                             {tag}
                           </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-6 w-full">
                        <Link href={`/product/${matchedProduct.id}`} className="flex-1">
                          <BespokeButton variant="primary" className="w-full">
                            View Details 
                          </BespokeButton>
                        </Link>
                        <div className="text-2xl text-white font-serif">${matchedProduct.price.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-white/50">
                    <p>We couldn't define a perfect match at this moment.</p>
                    <BespokeButton variant="primary" className="mt-8" onClick={onClose}>Return Home</BespokeButton>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
