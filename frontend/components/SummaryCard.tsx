"use client";

import React from "react";
import { Sparkles, AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { SummaryResponse } from "@/lib/types";

interface SummaryCardProps {
  summary: SummaryResponse | null;
  isLoading: boolean;
  onCitationClick: (sourceId: string) => void;
}

export function SummaryCard({
  summary,
  isLoading,
  onCitationClick,
}: SummaryCardProps) {
  if (isLoading) {
    return (
      <div className="bg-[#121935] border border-[#223056] rounded-2xl p-6 sm:p-8 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-[#2DE2A6]/30 rounded-full" />
          <div className="h-4 w-40 bg-[#1A2347] rounded-md" />
        </div>
        <div className="h-6 w-3/4 bg-[#1A2347] rounded-md mb-3" />
        <div className="h-4 w-full bg-[#1A2347] rounded-md mb-2" />
        <div className="h-4 w-5/6 bg-[#1A2347] rounded-md mb-6" />
        <div className="space-y-3">
          <div className="h-10 w-full bg-[#1A2347] rounded-xl" />
          <div className="h-10 w-full bg-[#1A2347] rounded-xl" />
          <div className="h-10 w-full bg-[#1A2347] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-[#121935] border border-[#223056] rounded-2xl p-6 sm:p-8">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#2DE2A6]/15 text-[#2DE2A6]">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF8]">
            Intelligence Brief
          </span>
        </div>

        {summary.is_fallback ? (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1A2347] border border-[#223056] text-[#8FA0C8] font-mono-numbers">
            Rule-Based Deterministic Summary
          </span>
        ) : (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#2DE2A6]/10 border border-[#2DE2A6]/30 text-[#2DE2A6] font-mono-numbers">
            AI-Grounded Brief (Gemini)
          </span>
        )}
      </div>

      {/* Headline */}
      <h3 className="text-lg sm:text-xl font-bold font-heading text-[#E8ECF8] mb-2">
        {summary.headline}
      </h3>

      {/* Explanation */}
      <p className="text-sm text-[#8FA0C8] leading-relaxed mb-6">
        {summary.explanation}
      </p>

      {/* Key Findings with clickable Citation Chips */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8FA0C8] mb-3">
          Key Findings & Citations
        </h4>
        <div className="space-y-2.5">
          {summary.findings.map((finding, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#0B1020] border border-[#223056]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#E8ECF8]"
            >
              <span className="leading-relaxed">{finding.text}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {finding.source_ids.map((sid) => (
                  <button
                    key={sid}
                    type="button"
                    onClick={() => onCitationClick(sid)}
                    aria-label={`Jump to source ${sid}`}
                    className="px-2 py-0.5 rounded bg-[#2DE2A6]/15 hover:bg-[#2DE2A6]/30 border border-[#2DE2A6]/40 text-[#2DE2A6] font-mono-numbers text-[11px] font-bold cursor-pointer transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#2DE2A6]"
                  >
                    [{sid}]
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column Risks & Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#223056]/80 text-xs">
        {/* Risks */}
        <div className="bg-[#0B1020] p-4 rounded-xl border border-[#223056]/60">
          <div className="flex items-center gap-1.5 text-[#FFB020] font-semibold mb-2.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Critical Risks & Hurdles</span>
          </div>
          <ul className="space-y-2 text-[#8FA0C8]">
            {summary.risks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#FFB020] mt-0.5">•</span>
                <span className="leading-relaxed">{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-[#0B1020] p-4 rounded-xl border border-[#223056]/60">
          <div className="flex items-center gap-1.5 text-[#2DE2A6] font-semibold mb-2.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Recommended Next Steps</span>
          </div>
          <ul className="space-y-2 text-[#8FA0C8]">
            {summary.next_steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#2DE2A6] mt-0.5 font-mono-numbers font-bold">{idx + 1}.</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
