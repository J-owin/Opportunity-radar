"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export const EXAMPLE_TOPICS = [
  "low-cost water purification",
  "AI crop disease detection",
  "affordable prosthetics",
  "microplastics removal",
  "AI tutoring for rural schools",
];

interface TopicChipsProps {
  onSelectTopic: (topic: string) => void;
  selectedTopic?: string;
}

export function TopicChips({ onSelectTopic, selectedTopic }: TopicChipsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 mb-2.5 text-xs text-[#8FA0C8]">
        <Sparkles className="w-3.5 h-3.5 text-[#2DE2A6]" />
        <span>Try an example idea:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_TOPICS.map((topic) => {
          const isSelected = selectedTopic === topic;
          return (
            <button
              key={topic}
              type="button"
              onClick={() => onSelectTopic(topic)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DE2A6] ${
                isSelected
                  ? "bg-[#2DE2A6]/15 border-[#2DE2A6] text-[#2DE2A6]"
                  : "bg-[#121935] border-[#223056] text-[#E8ECF8] hover:border-[#2DE2A6]/40 hover:bg-[#1A2347]"
              }`}
            >
              {topic}
            </button>
          );
        })}
      </div>
    </div>
  );
}
