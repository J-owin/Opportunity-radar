"use client";

import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Award,
  ShoppingBag,
  Briefcase,
  Newspaper,
  TrendingUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

export type EngineStatus = "waiting" | "scanning" | "done" | "failed";

interface EngineItem {
  key: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  engineName: string;
}

const ENGINES: EngineItem[] = [
  { key: "research", name: "Research Papers", icon: GraduationCap, engineName: "google_scholar" },
  { key: "patents", name: "Patents & IP", icon: Award, engineName: "google_patents" },
  { key: "products", name: "Market Products", icon: ShoppingBag, engineName: "google_shopping" },
  { key: "jobs", name: "Job Postings", icon: Briefcase, engineName: "google_jobs" },
  { key: "news", name: "News Momentum", icon: Newspaper, engineName: "google_news" },
  { key: "trends", name: "Search Trends", icon: TrendingUp, engineName: "google_trends" },
];

interface EngineProgressProps {
  topic: string;
  isComplete: boolean;
  failedEngines?: string[];
}

export function EngineProgress({ topic, isComplete, failedEngines = [] }: EngineProgressProps) {
  const [statuses, setStatuses] = useState<Record<string, EngineStatus>>({
    research: "scanning",
    patents: "waiting",
    products: "waiting",
    jobs: "waiting",
    news: "waiting",
    trends: "waiting",
  });

  useEffect(() => {
    if (isComplete) {
      const finalStatuses: Record<string, EngineStatus> = {};
      ENGINES.forEach((eng) => {
        finalStatuses[eng.key] = failedEngines.includes(eng.key) ? "failed" : "done";
      });
      setStatuses(finalStatuses);
      return;
    }

    // Step-by-step staggered scanning transition
    const timers: NodeJS.Timeout[] = [];
    ENGINES.forEach((eng, idx) => {
      // scanning trigger
      const t1 = setTimeout(() => {
        setStatuses((prev) => ({
          ...prev,
          [eng.key]: "scanning",
        }));
      }, idx * 400);
      timers.push(t1);

      // done trigger
      const t2 = setTimeout(() => {
        setStatuses((prev) => ({
          ...prev,
          [eng.key]: failedEngines.includes(eng.key) ? "failed" : "done",
        }));
      }, (idx + 1) * 800);
      timers.push(t2);
    });

    return () => timers.forEach(clearTimeout);
  }, [isComplete, failedEngines]);

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DE2A6]/10 border border-[#2DE2A6]/30 text-[#2DE2A6] text-xs font-mono-numbers mb-3">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>PARALLEL SERP ENGINE SCAN</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#E8ECF8] mb-1">
          Analyzing &ldquo;{topic}&rdquo;
        </h2>
        <p className="text-xs sm:text-sm text-[#8FA0C8]">
          Querying six SerpApi engines concurrently to detect whitespace and market saturation.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ENGINES.map((eng) => {
          const status = statuses[eng.key] || "waiting";
          const Icon = eng.icon;

          return (
            <div
              key={eng.key}
              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                status === "done"
                  ? "bg-[#121935] border-[#2DE2A6]/40 shadow-sm"
                  : status === "scanning"
                  ? "bg-[#1A2347] border-[#2DE2A6] shadow-[0_0_15px_rgba(45,226,166,0.15)]"
                  : status === "failed"
                  ? "bg-[#121935] border-[#FF5D6C]/50"
                  : "bg-[#0B1020] border-[#223056]/50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    status === "done"
                      ? "bg-[#2DE2A6]/15 text-[#2DE2A6]"
                      : status === "scanning"
                      ? "bg-[#2DE2A6]/20 text-[#2DE2A6]"
                      : status === "failed"
                      ? "bg-[#FF5D6C]/15 text-[#FF5D6C]"
                      : "bg-[#121935] text-[#8FA0C8]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {status === "done" && (
                  <CheckCircle2 className="w-4 h-4 text-[#2DE2A6]" />
                )}
                {status === "scanning" && (
                  <Loader2 className="w-4 h-4 text-[#2DE2A6] animate-spin" />
                )}
                {status === "failed" && (
                  <AlertCircle className="w-4 h-4 text-[#FF5D6C]" />
                )}
                {status === "waiting" && (
                  <Clock className="w-4 h-4 text-[#8FA0C8]/50" />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-[#E8ECF8] mb-0.5">{eng.name}</p>
                <p className="text-[10px] text-[#8FA0C8] font-mono-numbers">
                  {status === "done"
                    ? "Verified"
                    : status === "scanning"
                    ? "Scanning..."
                    : status === "failed"
                    ? "Engine Error"
                    : "Queued"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
