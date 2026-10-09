"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Radar, HelpCircle, Compass } from "lucide-react";
import { MethodologyModal } from "./MethodologyModal";

export function Navbar() {
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#223056]/80 bg-[#0B1020]/90 backdrop-blur-md">
        <div className="max-w-[1120px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DE2A6] rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-[#121935] border border-[#223056] flex items-center justify-center text-[#2DE2A6] shadow-sm group-hover:border-[#2DE2A6]/50 transition-colors">
              <Radar className="w-5 h-5 transition-transform group-hover:rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg tracking-tight font-heading text-[#E8ECF8]">
                Opportunity Radar
              </span>
              <span className="text-[10px] text-[#8FA0C8] tracking-wider uppercase font-mono-numbers">
                Track 05 · SerpApi
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMethodology(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#8FA0C8] hover:text-[#E8ECF8] bg-[#121935] hover:bg-[#1A2347] border border-[#223056] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DE2A6]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#2DE2A6]" />
              <span>How it works</span>
            </button>
          </div>
        </div>
      </header>

      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />
    </>
  );
}
