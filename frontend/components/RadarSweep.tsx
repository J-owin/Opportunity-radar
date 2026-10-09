"use client";

import React from "react";

export function RadarSweep() {
  return (
    <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-[#223056]/80 flex items-center justify-center overflow-hidden pointer-events-none select-none">
      {/* Concentric rings */}
      <div className="absolute inset-4 rounded-full border border-[#223056]/50" />
      <div className="absolute inset-12 rounded-full border border-[#223056]/40" />
      <div className="absolute inset-20 rounded-full border border-[#223056]/30" />

      {/* Axis crosshairs */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-[#223056]/60 -translate-y-1/2" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-[#223056]/60 -translate-x-1/2" />

      {/* Center blip */}
      <div className="relative z-10 w-3 h-3 rounded-full bg-[#2DE2A6] shadow-[0_0_12px_#2DE2A6] animate-pulse" />

      {/* Rotating Radar Sweep Beam */}
      <div
        className="absolute inset-0 radar-sweep-animate pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(45, 226, 166, 0.25) 0deg, rgba(45, 226, 166, 0.05) 45deg, transparent 75deg, transparent 360deg)",
        }}
      />
    </div>
  );
}
