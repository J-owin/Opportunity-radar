"use client";

import React from "react";
import { ExternalLink, Calendar, BookOpen } from "lucide-react";
import { NormalizedItem } from "@/lib/types";

interface SourceCardProps {
  item: NormalizedItem;
  isHighlighted?: boolean;
}

export function SourceCard({ item, isHighlighted }: SourceCardProps) {
  return (
    <article
      id={`source-${item.id}`}
      className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
        isHighlighted
          ? "bg-[#1A2347] border-[#2DE2A6] shadow-[0_0_20px_rgba(45,226,166,0.35)] ring-2 ring-[#2DE2A6]"
          : "bg-[#121935] border-[#223056] hover:border-[#223056]/80 hover:bg-[#1A2347]/60"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Source ID Chip */}
          <span className="px-2 py-0.5 rounded-md bg-[#2DE2A6]/15 border border-[#2DE2A6]/40 text-[#2DE2A6] font-mono-numbers text-xs font-bold">
            {item.id}
          </span>

          {item.date && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#8FA0C8] font-mono-numbers">
              <Calendar className="w-3 h-3" />
              {item.date}
            </span>
          )}
        </div>

        <h4 className="text-sm font-semibold text-[#E8ECF8] mb-1.5 line-clamp-2 leading-snug">
          {item.title || "Untitled Record"}
        </h4>

        {item.source && (
          <p className="text-xs text-[#2DE2A6]/90 font-medium mb-2 line-clamp-1">
            {item.source}
          </p>
        )}

        {item.snippet && (
          <p className="text-xs text-[#8FA0C8] line-clamp-2 leading-relaxed mb-3">
            {item.snippet}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-[#223056]/80 flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#8FA0C8]/70">Verified search hit</span>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2DE2A6] hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-[#2DE2A6] rounded"
          >
            <span>Open</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-[11px] text-[#8FA0C8] italic">No direct link</span>
        )}
      </div>
    </article>
  );
}
