'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  'Popular', 'Pencils', 'Pens', 'Erasers', 'Various Tools',
  'Correction', 'Notebooks', 'Pocket Notebooks',
  'Math Books', 'Science Books', 'Social Books', 'History Books'
];

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-50 h-full w-[280px] sm:w-[320px] glass-dark rounded-none border-t-0 border-b-0 border-l-0 border-r border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-serif text-gold font-bold">Categories</h2>
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-4">
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      href={`/#${category.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={onClose}
                      className="block px-4 py-3 text-white/80 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors font-medium"
                    >
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 border-t border-white/10">
              <p className="text-sm text-white/50 text-center">kabshop © {new Date().getFullYear()}</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
