"use client";

import React from "react";
import { X, ExternalLink, Calculator, BookOpen, ShieldCheck } from "lucide-react";

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MethodologyModal({ isOpen, onClose }: MethodologyModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="methodology-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#121935] border border-[#223056] rounded-2xl p-6 sm:p-8 text-[#E8ECF8] shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-lg text-[#8FA0C8] hover:text-[#E8ECF8] hover:bg-[#1A2347] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#2DE2A6]/10 text-[#2DE2A6]">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 id="methodology-title" className="text-xl sm:text-2xl font-bold tracking-tight font-heading">
              Scoring Methodology & Formula
            </h2>
            <p className="text-xs text-[#8FA0C8]">
              Transparent, repeatable math powered by SerpApi real-time engine telemetry.
            </p>
          </div>
        </div>

        <div className="space-y-5 text-sm leading-relaxed text-[#8FA0C8]">
          <section className="bg-[#0B1020] p-4 rounded-xl border border-[#223056]/80">
            <h3 className="font-semibold text-[#E8ECF8] mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2DE2A6]" />
              1. Logarithmic Scaling
            </h3>
            <p>
              Search result volumes range from 0 to over 100,000. Raw counts are normalized into 0–100 levels via log-scaling:
            </p>
            <div className="font-mono text-xs bg-[#1A2347] text-[#2DE2A6] p-2.5 rounded-lg mt-2 overflow-x-auto">
              level = min(100, 100 × log10(1 + count) / log10(1 + cap))
            </div>
          </section>

          <section className="bg-[#0B1020] p-4 rounded-xl border border-[#223056]/80">
            <h3 className="font-semibold text-[#E8ECF8] mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7C6CFF]" />
              2. Supply & Gap Index
            </h3>
            <p>
              Supply measures how crowded commercial IP and marketplaces already are:
            </p>
            <div className="font-mono text-xs bg-[#1A2347] text-[#7C6CFF] p-2.5 rounded-lg mt-2">
              supply = 0.5 × patent_level + 0.5 × product_level
            </div>
            <p className="mt-2">
              The <strong>Gap</strong> indicates where research exists but commercial supply hasn't filled it:
            </p>
            <div className="font-mono text-xs bg-[#1A2347] text-[#7C6CFF] p-2.5 rounded-lg mt-2">
              gap = clamp(50 + 0.5 × (research_level - supply), 0, 100)
            </div>
          </section>

          <section className="bg-[#0B1020] p-4 rounded-xl border border-[#223056]/80">
            <h3 className="font-semibold text-[#E8ECF8] mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFB020]" />
              3. Demand Index
            </h3>
            <p>
              Demand combines Google Trends time-series growth with job openings and news momentum:
            </p>
            <div className="font-mono text-xs bg-[#1A2347] text-[#FFB020] p-2.5 rounded-lg mt-2">
              demand = 0.5 × trend_level + 0.25 × jobs_level + 0.25 × news_level
            </div>
          </section>

          <section className="bg-[#0B1020] p-4 rounded-xl border border-[#223056]/80">
            <h3 className="font-semibold text-[#E8ECF8] mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2DE2A6]" />
              4. Final Opportunity Score & Verdict
            </h3>
            <div className="font-mono text-xs bg-[#1A2347] text-[#2DE2A6] p-2.5 rounded-lg my-2">
              opportunity = round(0.6 × gap + 0.4 × demand)
            </div>
            <ul className="grid grid-cols-3 gap-2 text-center text-xs mt-3">
              <li className="bg-[#2DE2A6]/10 border border-[#2DE2A6]/30 text-[#2DE2A6] p-2 rounded-lg font-semibold">
                70–100: Open Gap
              </li>
              <li className="bg-[#FFB020]/10 border border-[#FFB020]/30 text-[#FFB020] p-2 rounded-lg font-semibold">
                45–69: Emerging
              </li>
              <li className="bg-[#FF5D6C]/10 border border-[#FF5D6C]/30 text-[#FF5D6C] p-2 rounded-lg font-semibold">
                0–44: Crowded
              </li>
            </ul>
          </section>

          <div className="flex items-center justify-between pt-2 border-t border-[#223056] text-xs">
            <span className="text-[#8FA0C8] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2DE2A6]" />
              100% Traceable. Every number links to SerpApi live data.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1A2347] hover:bg-[#223056] text-[#E8ECF8] rounded-xl font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
