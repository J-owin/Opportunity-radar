"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, AlertCircle, Compass, Sparkles } from "lucide-react";

interface ScoreGaugeProps {
  score: number;
  label: "Open Gap" | "Emerging" | "Crowded";
  reason: string;
  confidence: "high" | "medium" | "low";
}

export function ScoreGauge({ score, label, reason, confidence }: ScoreGaugeProps) {
  // SVG circular gauge geometry
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  // Score clamped between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Verdict theme colors
  let colorHex = "#2DE2A6"; // Open Gap
  let badgeBg = "bg-[#2DE2A6]/15 border-[#2DE2A6]/40 text-[#2DE2A6]";
  let glowStyle = "shadow-[0_0_35px_rgba(45,226,166,0.18)]";

  if (label === "Emerging") {
    colorHex = "#FFB020";
    badgeBg = "bg-[#FFB020]/15 border-[#FFB020]/40 text-[#FFB020]";
    glowStyle = "shadow-[0_0_35px_rgba(255,176,32,0.18)]";
  } else if (label === "Crowded") {
    colorHex = "#FF5D6C";
    badgeBg = "bg-[#FF5D6C]/15 border-[#FF5D6C]/40 text-[#FF5D6C]";
    glowStyle = "shadow-[0_0_35px_rgba(255,93,108,0.18)]";
  }

  return (
    <div
      role="region"
      aria-label={`Opportunity Score: ${score} out of 100, Verdict: ${label}`}
      className={`w-full bg-[#121935] border border-[#223056] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 transition-all ${glowStyle}`}
    >
      {/* Gauge Circle */}
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex-shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background track circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1A2347"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Active progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={colorHex}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl sm:text-5xl font-extrabold font-mono-numbers tracking-tight text-[#E8ECF8]">
            {clampedScore}
          </span>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8FA0C8] mt-0.5">
            / 100 Score
          </span>
        </div>
      </div>

      {/* Score Explanation & Badges */}
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-3">
          {/* Verdict Pill */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${badgeBg}`}>
            <Sparkles className="w-3.5 h-3.5" />
            {label}
          </span>

          {/* Confidence Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono-numbers border ${
              confidence === "high"
                ? "bg-[#1A2347] border-[#223056] text-[#2DE2A6]"
                : confidence === "medium"
                ? "bg-[#1A2347] border-[#FFB020]/40 text-[#FFB020]"
                : "bg-[#FF5D6C]/10 border-[#FF5D6C]/30 text-[#FF5D6C]"
            }`}
          >
            {confidence === "high" && <ShieldCheck className="w-3 h-3 text-[#2DE2A6]" />}
            {confidence === "medium" && <AlertTriangle className="w-3 h-3 text-[#FFB020]" />}
            {confidence === "low" && <AlertCircle className="w-3 h-3 text-[#FF5D6C]" />}
            <span className="capitalize">{confidence} Confidence</span>
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#E8ECF8] mb-2">
          {label === "Open Gap" && "High Opportunity Gap Detected"}
          {label === "Emerging" && "Emerging Field with Developing Activity"}
          {label === "Crowded" && "Saturated Market Landscape"}
        </h1>

        <p className="text-sm sm:text-base text-[#8FA0C8] leading-relaxed max-w-xl">
          {reason}
        </p>

        <div className="mt-4 pt-3 border-t border-[#223056]/80 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-[#8FA0C8]">
          <span>
            <strong className="text-[#E8ECF8]">70-100:</strong> Open Gap
          </span>
          <span>•</span>
          <span>
            <strong className="text-[#E8ECF8]">45-69:</strong> Emerging
          </span>
          <span>•</span>
          <span>
            <strong className="text-[#E8ECF8]">0-44:</strong> Crowded
          </span>
        </div>
      </div>
    </div>
  );
}
