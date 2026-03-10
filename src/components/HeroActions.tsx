'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight } from "lucide-react";
import { BespokeButton } from "./ui/BespokeButton";
import { BespokeJourneyModal } from "./BespokeJourneyModal";

export function HeroActions() {
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <BespokeButton variant="primary" onClick={() => setIsJourneyOpen(true)} className="sm:w-auto w-full group min-h-[56px] min-w-[300px]">
          Start Your Bespoke Journey
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform inline-block" size={20} />
        </BespokeButton>

        <BespokeButton variant="secondary" onClick={() => alert("The Vault (3D Experience) will be available soon.")} className="sm:w-auto w-full min-h-[56px] min-w-[200px]">
          Enter The Vault
        </BespokeButton>
      </div>

      {mounted && createPortal(
        <BespokeJourneyModal isOpen={isJourneyOpen} onClose={() => setIsJourneyOpen(false)} />,
        document.body
      )}
    </>
  );
}
