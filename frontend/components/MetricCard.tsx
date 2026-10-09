"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number; // 0-100
  color: "primary" | "accent" | "warning";
  explanation: string;
  tooltipText: string;
}

export function MetricCard({
  title,
  value,
  color,
  explanation,
  tooltipText,
}: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const colorStyles = {
    primary: {
      bar: "bg-[#2DE2A6]",
      text: "text-[#2DE2A6]",
      bg: "bg-[#2DE2A6]/10",
    },
    accent: {
      bar: "bg-[#7C6CFF]",
      text: "text-[#7C6CFF]",
      bg: "bg-[#7C6CFF]/10",
    },
    warning: {
      bar: "bg-[#FFB020]",
      text: "text-[#FFB020]",
      bg: "bg-[#FFB020]/10",
    },
  }[color];

  return (
    <div className="relative bg-[#121935] border border-[#223056] rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8FA0C8]">
              {title}
            </h3>
            <div className="relative inline-block">
              <button
                type="button"
                aria-label={`Info about ${title}`}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-[#8FA0C8] hover:text-[#E8ECF8] p-0.5 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-[#2DE2A6]"
              >
                <Info className="w-3.5 h-3.5" />
              </button>

              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2 bg-[#1A2347] border border-[#223056] text-xs text-[#E8ECF8] rounded-lg shadow-xl z-30 pointer-events-none">
                  {tooltipText}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1A2347]" />
                </div>
              )}
            </div>
          </div>

          <span className={`text-xl font-bold font-mono-numbers ${colorStyles.text}`}>
            {clamped}
            <span className="text-xs text-[#8FA0C8]">/100</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#1A2347] overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${colorStyles.bar}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-[#8FA0C8] leading-relaxed">
        {explanation}
      </p>
    </div>
  );
}
