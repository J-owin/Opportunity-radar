"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendChartProps {
  series: [string, number][];
  trendGrowth: number; // e.g. 0.35 (+35%)
}

export function TrendChart({ series, trendGrowth }: TrendChartProps) {
  const chartData = series.map(([date, val]) => ({
    date,
    value: val,
  }));

  const growthPercent = Math.round(trendGrowth * 100);
  const isPositive = growthPercent > 5;
  const isNegative = growthPercent < -5;

  return (
    <div
      role="region"
      aria-label={`Google Trends time-series chart with growth rate of ${growthPercent}%`}
      className="bg-[#121935] border border-[#223056] rounded-2xl p-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#E8ECF8] font-heading">
            Google Trends Interest Over Time
          </h3>
          <p className="text-xs text-[#8FA0C8]">
            Historical normalized search interest index (0–100)
          </p>
        </div>

        {/* Growth Percentage Pill */}
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono-numbers font-semibold border ${
            isPositive
              ? "bg-[#2DE2A6]/15 border-[#2DE2A6]/40 text-[#2DE2A6]"
              : isNegative
              ? "bg-[#FF5D6C]/15 border-[#FF5D6C]/40 text-[#FF5D6C]"
              : "bg-[#1A2347] border-[#223056] text-[#8FA0C8]"
          }`}
        >
          {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
          {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
          {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5" />}
          <span>{growthPercent >= 0 ? `+${growthPercent}%` : `${growthPercent}%`} momentum</span>
        </div>
      </div>

      <div className="h-56 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2DE2A6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2DE2A6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "#8FA0C8", fontSize: 10 }}
                stroke="#223056"
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#8FA0C8", fontSize: 10, fontFamily: "var(--font-mono)" }}
                stroke="#223056"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-[#1A2347] border border-[#223056] p-2.5 rounded-lg shadow-xl text-xs">
                        <p className="text-[#8FA0C8]">{item.date}</p>
                        <p className="font-mono-numbers text-[#2DE2A6] font-bold mt-0.5">
                          Interest: {item.value} / 100
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2DE2A6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#trendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-[#8FA0C8]">
            No time-series trends data available for this query.
          </div>
        )}
      </div>

      {/* Accessible Text Alternative */}
      <div className="sr-only">
        Google Trends data shows a net growth rate of {growthPercent} percent.
      </div>

      <div className="mt-3 pt-3 border-t border-[#223056] flex items-center justify-between text-[11px] text-[#8FA0C8] font-mono-numbers">
        <span>Timeline: Past 12 Months</span>
        <span className="text-[#2DE2A6]">Data source: Google Trends API</span>
      </div>
    </div>
  );
}
