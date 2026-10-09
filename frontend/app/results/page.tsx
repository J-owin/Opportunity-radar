"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Database,
  RotateCcw,
  ShieldCheck,
  Share2,
  Printer,
  Check,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { EngineProgress } from "@/components/EngineProgress";
import { ScoreGauge } from "@/components/ScoreGauge";
import { MetricCard } from "@/components/MetricCard";
import { SupplyBars } from "@/components/SupplyBars";
import { TrendChart } from "@/components/TrendChart";
import { QuadrantMap } from "@/components/QuadrantMap";
import { SummaryCard } from "@/components/SummaryCard";
import { SourceTabs } from "@/components/SourceTabs";
import { PartialFailureBanner, TotalErrorState } from "@/components/ErrorState";
import { MethodologyModal } from "@/components/MethodologyModal";
import { fetchRadar, fetchSummary, ApiError } from "@/lib/api";
import { RadarResponse, SummaryResponse } from "@/lib/types";

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic") || "";

  const [isLoadingRadar, setIsLoadingRadar] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [radarData, setRadarData] = useState<RadarResponse | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const loadData = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setErrorMsg("Topic query must be at least 3 characters.");
      setIsLoadingRadar(false);
      return;
    }

    setIsLoadingRadar(true);
    setErrorMsg(null);
    setIsRateLimited(false);
    setRadarData(null);
    setSummaryData(null);

    try {
      // 1. Fetch Radar Engine Data first (Unblocked)
      const data = await fetchRadar(query);
      setRadarData(data);
      setIsLoadingRadar(false);

      // 2. Fetch AI / Rule-based Summary asynchronously in background
      setIsLoadingSummary(true);
      try {
        const summary = await fetchSummary(data);
        setSummaryData(summary);
      } catch (sumErr) {
        console.warn("Summary generation error:", sumErr);
      } finally {
        setIsLoadingSummary(false);
      }
    } catch (err: any) {
      setIsLoadingRadar(false);
      if (err instanceof ApiError && err.status === 429) {
        setIsRateLimited(true);
      }
      setErrorMsg(err?.message || "An unexpected error occurred while scanning engines.");
    }
  };

  useEffect(() => {
    if (topicParam) {
      loadData(topicParam);
    } else {
      setIsLoadingRadar(false);
      setErrorMsg("No topic specified. Please return to the search page.");
    }
  }, [topicParam]);

  // Click citation chip handler
  const handleCitationClick = (sourceId: string) => {
    setHighlightedId(sourceId);

    // Scroll smoothly to sources panel
    setTimeout(() => {
      const el = document.getElementById(`source-${sourceId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        const panel = document.getElementById("sources-panel");
        panel?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleExportPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Identify failed engines for partial failure banner
  const failedEngines: string[] = [];
  if (radarData) {
    if (radarData.results.research.error) failedEngines.push("Research Papers");
    if (radarData.results.patents.error) failedEngines.push("Patents");
    if (radarData.results.products.error) failedEngines.push("Market Products");
    if (radarData.results.jobs.error) failedEngines.push("Job Postings");
    if (radarData.results.news.error) failedEngines.push("News");
    if (radarData.results.trends.error) failedEngines.push("Search Trends");
  }

  // Calculate composite supply level for quadrant map
  const supplyScore = radarData
    ? 0.5 * radarData.analysis.levels.patents + 0.5 * radarData.analysis.levels.products
    : 50;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1020] text-[#E8ECF8]">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-[1120px] w-full mx-auto px-4 py-8">
        {/* Loading state showing 6 engines scanning */}
        {isLoadingRadar && (
          <EngineProgress topic={topicParam} isComplete={false} />
        )}

        {/* Total Error State */}
        {!isLoadingRadar && errorMsg && (
          <TotalErrorState
            message={errorMsg}
            isRateLimit={isRateLimited}
            onRetry={() => loadData(topicParam)}
          />
        )}

        {/* Results Dashboard */}
        {!isLoadingRadar && radarData && (
          <div className="space-y-6">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#223056]">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="p-2 rounded-xl bg-[#121935] border border-[#223056] text-[#8FA0C8] hover:text-[#E8ECF8] hover:bg-[#1A2347] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DE2A6] print:hidden"
                  title="New scan"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#E8ECF8] capitalize">
                    {radarData.topic}
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8FA0C8]">
                    {radarData.cached ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono-numbers text-[#2DE2A6]">
                        <Database className="w-3 h-3" />
                        Cached Scan (Instant)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono-numbers text-[#7C6CFF]">
                        <Sparkles className="w-3 h-3" />
                        Fresh Live Scan
                      </span>
                    )}
                    <span>•</span>
                    <span className="text-[11px] font-mono-numbers">
                      {new Date(radarData.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons (Share, PDF Export, New Scan) */}
              <div className="flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-[#121935] hover:bg-[#1A2347] border border-[#223056] text-xs font-medium text-[#E8ECF8] transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Share result link"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#2DE2A6]" /> : <Share2 className="w-3.5 h-3.5 text-[#8FA0C8]" />}
                  <span>{copiedLink ? "Copied!" : "Share"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="px-3 py-2 rounded-xl bg-[#121935] hover:bg-[#1A2347] border border-[#223056] text-xs font-medium text-[#E8ECF8] transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Print / Export PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-[#8FA0C8]" />
                  <span>PDF / Print</span>
                </button>

                <Link
                  href="/"
                  className="px-3.5 py-2 rounded-xl bg-[#121935] hover:bg-[#1A2347] border border-[#223056] text-xs font-semibold text-[#E8ECF8] transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#2DE2A6]" />
                  <span>New Scan</span>
                </Link>
              </div>
            </div>

            {/* Partial Failure Notice if any engine failed */}
            <PartialFailureBanner failedEngines={failedEngines} />

            {/* Hero Score Gauge */}
            <ScoreGauge
              score={radarData.analysis.score}
              label={radarData.analysis.label}
              reason={radarData.analysis.reason}
              confidence={radarData.analysis.confidence}
            />

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Research Strength"
                value={radarData.analysis.levels.research}
                color="primary"
                explanation={`Indexed from ${radarData.results.research.count.toLocaleString()} academic publications and citations in Google Scholar.`}
                tooltipText="Measures the depth and volume of peer-reviewed research papers and preprints on Google Scholar."
              />
              <MetricCard
                title="Market Supply (Patents + Products)"
                value={Math.round(supplyScore)}
                color="accent"
                explanation={`${radarData.results.patents.count.toLocaleString()} patents filed and ${radarData.results.products.count.toLocaleString()} products retailed.`}
                tooltipText="Combined measure of commercial IP barrier (Google Patents) and active consumer retail products (Google Shopping)."
              />
              <MetricCard
                title="Market Demand Momentum"
                value={radarData.analysis.demand}
                color="warning"
                explanation={`Search growth: ${radarData.analysis.trend_growth >= 0 ? "+" : ""}${Math.round(radarData.analysis.trend_growth * 100)}%, with ${radarData.results.jobs.count} jobs and ${radarData.results.news.count} news items.`}
                tooltipText="Blends Google Trends time-series trajectory (50%), active hiring volume (25%), and news momentum (25%)."
              />
            </div>

            {/* Visual Charts Row: SupplyBars, TrendChart, QuadrantMap */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <SupplyBars
                researchLevel={radarData.analysis.levels.research}
                patentsLevel={radarData.analysis.levels.patents}
                productsLevel={radarData.analysis.levels.products}
              />
              <TrendChart
                series={radarData.results.trends.series}
                trendGrowth={radarData.analysis.trend_growth}
              />
              <QuadrantMap
                supply={supplyScore}
                demand={radarData.analysis.demand}
                topic={radarData.topic}
              />
            </div>

            {/* AI / Grounded Summary Card */}
            <SummaryCard
              summary={summaryData}
              isLoading={isLoadingSummary}
              onCitationClick={handleCitationClick}
            />

            {/* Sources Panel */}
            <SourceTabs
              results={radarData.results}
              highlightedSourceId={highlightedId}
              onClearHighlight={() => setHighlightedId(null)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#223056]/80 py-6 text-center text-xs text-[#8FA0C8] print:hidden">
        <div className="max-w-[1120px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => setShowMethodology(true)}
            className="hover:text-[#2DE2A6] underline transition-colors cursor-pointer"
          >
            How this score was calculated (Methodology)
          </button>
          <span className="font-mono-numbers text-[11px] text-[#8FA0C8]/80">
            Powered by SerpApi · Track 05
          </span>
        </div>
      </footer>

      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1020] text-[#E8ECF8] flex items-center justify-center">
          <div className="text-center font-mono-numbers text-xs text-[#8FA0C8]">
            Loading Opportunity Radar...
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
