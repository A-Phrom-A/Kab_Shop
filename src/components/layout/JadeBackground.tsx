'use client';

import React from 'react';

export default function JadeBackground() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-[#043927] overflow-hidden pointer-events-none">
      
      {/* Animated Mesh Gradient Blobs */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-60 mix-blend-screen mix-blend-lighten blur-[120px] animate-blob"
        style={{ backgroundColor: '#00A86B' }}
      ></div>
      
      <div 
        className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-40 mix-blend-screen mix-blend-lighten blur-[100px] animate-blob animation-delay-2000"
        style={{ backgroundColor: '#E0FFF0' }}
      ></div>
      
      <div 
        className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] rounded-full opacity-50 mix-blend-screen mix-blend-lighten blur-[150px] animate-blob animation-delay-4000"
        style={{ backgroundColor: '#00A86B' }}
      ></div>

      {/* Noise / Grain Texture Overlay */}
      <div className="absolute inset-0 w-full h-full bg-noise"></div>
      
    </div>
  );
}
