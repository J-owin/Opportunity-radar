"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, Award, ShoppingBag, Briefcase, Newspaper } from "lucide-react";
import { RadarResults } from "@/lib/types";
import { SourceCard } from "./SourceCard";

interface SourceTabsProps {
  results: RadarResults;
  highlightedSourceId?: string | null;
  onClearHighlight?: () => void;
}

export type TabKey = "research" | "patents" | "products" | "jobs" | "news";

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prefix: string;
}

const TABS: TabDef[] = [
  { key: "research", label: "Papers", icon: GraduationCap, prefix: "R" },
  { key: "patents", label: "Patents", icon: Award, prefix: "P" },
  { key: "products", label: "Products", icon: ShoppingBag, prefix: "S" },
  { key: "jobs", label: "Jobs", icon: Briefcase, prefix: "J" },
  { key: "news", label: "News", icon: Newspaper, prefix: "N" },
];

export function SourceTabs({
  results,
  highlightedSourceId,
  onClearHighlight,
}: SourceTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("research");

  // When a citation chip is clicked in AI Summary, automatically switch to its tab
  useEffect(() => {
    if (highlightedSourceId) {
      const prefix = highlightedSourceId.charAt(0).toUpperCase();
      const matched = TABS.find((t) => t.prefix === prefix);
      if (matched) {
        setActiveTab(matched.key);
      }
    }
  }, [highlightedSourceId]);

  const activeResult = results[activeTab];
  const items = activeResult?.items || [];
  const error = activeResult?.error;

  return (
    <section
      id="sources-panel"
      aria-labelledby="sources-heading"
      className="bg-[#121935] border border-[#223056] rounded-2xl p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 id="sources-heading" className="text-lg sm:text-xl font-bold font-heading text-[#E8ECF8]">
            Evidence & Search Sources
          </h2>
          <p className="text-xs text-[#8FA0C8]">
            Every metric and AI finding links directly to these verified SerpApi search records.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = results[tab.key]?.count || 0;
            const itemsCount = results[tab.key]?.items?.length || 0;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  if (onClearHighlight) onClearHighlight();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DE2A6] ${
                  isActive
                    ? "bg-[#2DE2A6]/15 border-[#2DE2A6] text-[#2DE2A6] font-semibold"
                    : "bg-[#0B1020] border-[#223056] text-[#8FA0C8] hover:text-[#E8ECF8] hover:bg-[#1A2347]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1A2347] font-mono-numbers">
                  {itemsCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Engine Error Alert if this engine failed */}
      {error && (
        <div className="p-3 mb-4 rounded-xl bg-[#FFB020]/10 border border-[#FFB020]/30 text-xs text-[#FFB020] flex items-center justify-between">
          <span>Notice: This engine encountered a network error ({error}). Results may be limited.</span>
        </div>
      )}

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <SourceCard
              key={item.id}
              item={item}
              isHighlighted={highlightedSourceId === item.id}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-[#8FA0C8] bg-[#0B1020] rounded-xl border border-[#223056]/60">
          No records retrieved for {activeTab} in this scan.
        </div>
      )}
    </section>
  );
}
