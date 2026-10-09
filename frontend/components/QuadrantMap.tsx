"use client";

import React from "react";
import { Compass } from "lucide-react";

interface QuadrantMapProps {
  supply: number; // 0-100 (X axis)
  demand: number; // 0-100 (Y axis)
  topic: string;
}

export function QuadrantMap({ supply, demand, topic }: QuadrantMapProps) {
  // Constrain position between 8% and 92% so the pin never overflows the box
  const clampedSupply = Math.max(8, Math.min(92, supply));
  const clampedDemand = Math.max(8, Math.min(92, demand));

  return (
    <div
      role="region"
      aria-label="Opportunity Quadrant Map: Supply vs Demand"
      className="bg-[#121935] border border-[#223056] rounded-2xl p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-[#2DE2A6]/10 text-[#2DE2A6] flex-shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold font-heading text-[#E8ECF8]">
              Opportunity Quadrant Map
            </h3>
            <p className="text-xs text-[#8FA0C8]">
              Market Whitespace (Supply vs Demand)
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono-numbers text-[#8FA0C8] px-2.5 py-1 rounded-full bg-[#1A2347] border border-[#223056] whitespace-nowrap flex-shrink-0">
          S: <strong className="text-[#E8ECF8]">{Math.round(supply)}</strong> · D: <strong className="text-[#E8ECF8]">{Math.round(demand)}</strong>
        </span>
      </div>

      {/* 2x2 Quadrant Grid Container */}
      <div className="relative w-full h-60 bg-[#0B1020] border border-[#223056] rounded-xl overflow-hidden select-none">
        {/* 2x2 Grid for the 4 Quadrants (Guarantees zero overlapping text) */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {/* Top-Left: High Demand, Low Supply (Prime Gap) */}
          <div className="p-2.5 sm:p-3 border-r border-b border-[#223056] flex flex-col justify-start items-start bg-[#2DE2A6]/[0.04]">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2DE2A6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DE2A6]" />
              <span>Prime Gap</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-[#8FA0C8]/80 leading-tight mt-0.5">
              Low supply · High demand
            </span>
          </div>

          {/* Top-Right: High Demand, High Supply (Competitive) */}
          <div className="p-2.5 sm:p-3 border-b border-[#223056] flex flex-col justify-start items-end text-right bg-[#FFB020]/[0.03]">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FFB020]">
              <span>Competitive</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020]" />
            </div>
            <span className="text-[9px] sm:text-[10px] text-[#8FA0C8]/80 leading-tight mt-0.5">
              High supply · High demand
            </span>
          </div>

          {/* Bottom-Left: Low Demand, Low Supply (Niche / Early) */}
          <div className="p-2.5 sm:p-3 border-r border-[#223056] flex flex-col justify-end items-start bg-[#121935]/40">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8FA0C8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FA0C8]" />
              <span>Niche / Early</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-[#8FA0C8]/70 leading-tight mt-0.5">
              Low supply · Low demand
            </span>
          </div>

          {/* Bottom-Right: Low Demand, High Supply (Saturated) */}
          <div className="p-2.5 sm:p-3 flex flex-col justify-end items-end text-right bg-[#FF5D6C]/[0.03]">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FF5D6C]">
              <span>Saturated</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5D6C]" />
            </div>
            <span className="text-[9px] sm:text-[10px] text-[#8FA0C8]/70 leading-tight mt-0.5">
              High supply · Low demand
            </span>
          </div>
        </div>

        {/* Current Idea Marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700 ease-out flex flex-col items-center pointer-events-none"
          style={{
            left: `${clampedSupply}%`,
            top: `${100 - clampedDemand}%`, // Invert Y because 100 demand is at top
          }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-6 h-6 rounded-full bg-[#2DE2A6]/40 animate-ping" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#2DE2A6] border-2 border-[#0B1020] shadow-[0_0_12px_#2DE2A6]" />
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-md bg-[#121935] border border-[#2DE2A6]/60 text-[10px] font-bold text-[#E8ECF8] whitespace-nowrap shadow-xl max-w-[140px] truncate">
            {topic}
          </span>
        </div>
      </div>

      {/* Axis Footer */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#8FA0C8] font-mono-numbers">
        <span>← Low Supply (Patents & Products)</span>
        <span>High Supply →</span>
      </div>
    </div>
  );
}
