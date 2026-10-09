"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { RadarSweep } from "@/components/RadarSweep";
import { TopicChips } from "@/components/TopicChips";
import { Search, ArrowRight, Zap, Target, BookCheck, Shield } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = topic.trim();
    if (clean.length < 3) {
      setErrorMsg("Please enter at least 3 characters for your topic or idea.");
      return;
    }
    if (clean.length > 120) {
      setErrorMsg("Topic must be 120 characters or less.");
      return;
    }
    setErrorMsg("");
    router.push(`/results?topic=${encodeURIComponent(clean)}`);
  };

  const handleChipSelect = (selected: string) => {
    setTopic(selected);
    setErrorMsg("");
    router.push(`/results?topic=${encodeURIComponent(selected)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1020] text-[#E8ECF8]">
      <Navbar />

      <main className="flex-1 max-w-[1120px] w-full mx-auto px-4 py-8 sm:py-16 flex flex-col items-center justify-center">
        {/* Subtle Radar sweep in the background header */}
        <div className="mb-6 flex items-center justify-center">
          <RadarSweep />
        </div>

        {/* Hero Copy */}
        <div className="text-center max-w-2xl mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading mb-4 text-[#E8ECF8]">
            See where the gap is{" "}
            <span className="text-[#2DE2A6]">before you build.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#8FA0C8] leading-relaxed">
            Type an idea. We scan academic papers, patents, commercial products, job postings, news, and search trends in seconds.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="w-full max-w-xl mb-6">
          <form
            onSubmit={handleScan}
            className="relative flex items-center bg-[#121935] border border-[#223056] rounded-2xl p-2 radar-glow-focus transition-all duration-200"
          >
            <div className="pl-3 text-[#8FA0C8]">
              <Search className="w-5 h-5 text-[#2DE2A6]" />
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="e.g. low-cost water purification, modular micro-wind"
              autoFocus
              className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base text-[#E8ECF8] placeholder-[#8FA0C8]/60 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2DE2A6] hover:bg-[#25C893] text-[#0B1020] font-bold text-xs sm:text-sm tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <span>Scan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Validation message */}
          {errorMsg && (
            <p className="mt-2 text-xs text-[#FF5D6C] font-medium pl-2">
              {errorMsg}
            </p>
          )}
        </div>

        {/* 5 Example Chips */}
        <div className="w-full max-w-xl mb-14">
          <TopicChips onSelectTopic={handleChipSelect} selectedTopic={topic} />
        </div>

        {/* How It Works Row of 3 Cards */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#223056]/60">
          <div className="p-5 rounded-2xl bg-[#121935] border border-[#223056] flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#2DE2A6]/10 text-[#2DE2A6] flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-heading text-[#E8ECF8] mb-1">
              1. Search 6 Engines
            </h3>
            <p className="text-xs text-[#8FA0C8] leading-relaxed">
              We query Scholar, Patents, Shopping, Jobs, News, and Trends simultaneously via SerpApi.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121935] border border-[#223056] flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#7C6CFF]/10 text-[#7C6CFF] flex items-center justify-center mb-3">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-heading text-[#E8ECF8] mb-1">
              2. Score Whitespace
            </h3>
            <p className="text-xs text-[#8FA0C8] leading-relaxed">
              Logarithmic formula calculates research depth, commercial supply saturation, and demand.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121935] border border-[#223056] flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#FFB020]/10 text-[#FFB020] flex items-center justify-center mb-3">
              <BookCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-heading text-[#E8ECF8] mb-1">
              3. Decide Grounded
            </h3>
            <p className="text-xs text-[#8FA0C8] leading-relaxed">
              Read transparent opportunity briefs with clickable citation chips directly to primary sources.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#223056]/80 py-6 text-center text-xs text-[#8FA0C8]">
        <div className="max-w-[1120px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#2DE2A6]" />
            <span>Scores are a guide, not a guarantee. Always check primary sources.</span>
          </div>
          <span className="font-mono-numbers text-[11px] text-[#8FA0C8]/80">
            Powered by SerpApi · Track 05
          </span>
        </div>
      </footer>
    </div>
  );
}
