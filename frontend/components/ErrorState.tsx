"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, RefreshCw, ArrowLeft, Clock } from "lucide-react";

interface PartialFailureProps {
  failedEngines: string[];
}

export function PartialFailureBanner({ failedEngines }: PartialFailureProps) {
  if (!failedEngines || failedEngines.length === 0) return null;

  return (
    <div
      role="alert"
      className="p-3.5 mb-6 rounded-xl bg-[#FFB020]/10 border border-[#FFB020]/40 text-[#FFB020] flex items-center justify-between text-xs"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>
          Partial telemetry issue: Data from <strong>{failedEngines.join(", ")}</strong> could not be fully loaded. Remaining engines succeeded.
        </span>
      </div>
    </div>
  );
}

interface TotalErrorProps {
  message: string;
  isRateLimit?: boolean;
  onRetry?: () => void;
}

export function TotalErrorState({ message, isRateLimit, onRetry }: TotalErrorProps) {
  return (
    <div className="max-w-md mx-auto my-16 p-8 text-center bg-[#121935] border border-[#223056] rounded-2xl shadow-xl">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-[#FF5D6C]/10 text-[#FF5D6C]">
        {isRateLimit ? <Clock className="w-6 h-6 text-[#FFB020]" /> : <AlertCircle className="w-6 h-6" />}
      </div>

      <h2 className="text-xl font-bold font-heading text-[#E8ECF8] mb-2">
        {isRateLimit ? "Scan Rate Limit Reached" : "Scan Error"}
      </h2>

      <p className="text-xs sm:text-sm text-[#8FA0C8] mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2DE2A6] hover:bg-[#25C893] text-[#0B1020] font-semibold text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A2347] hover:bg-[#223056] text-[#E8ECF8] font-medium text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </Link>
      </div>
    </div>
  );
}
