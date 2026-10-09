"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface SupplyBarsProps {
  researchLevel: number;
  patentsLevel: number;
  productsLevel: number;
}

export function SupplyBars({
  researchLevel,
  patentsLevel,
  productsLevel,
}: SupplyBarsProps) {
  const data = [
    { name: "Research", level: researchLevel, fill: "#2DE2A6", description: "Academic & Scholar Papers" },
    { name: "Patents", level: patentsLevel, fill: "#7C6CFF", description: "Google Patents Filings" },
    { name: "Products", level: productsLevel, fill: "#FFB020", description: "Marketplace / Shopping Items" },
  ];

  return (
    <div
      role="region"
      aria-label="Supply comparison chart: Research vs Patents vs Products"
      className="bg-[#121935] border border-[#223056] rounded-2xl p-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#E8ECF8] font-heading">
            Research vs Commercial Supply
          </h3>
          <p className="text-xs text-[#8FA0C8]">
            Comparing academic scientific volume against commercial patents & products (0–100 log scale)
          </p>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: "#8FA0C8", fontSize: 11, fontFamily: "var(--font-mono)" }}
              stroke="#223056"
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#E8ECF8", fontSize: 12, fontWeight: 500 }}
              stroke="#223056"
              width={75}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[#1A2347] border border-[#223056] p-2.5 rounded-lg shadow-xl text-xs">
                      <p className="font-semibold text-[#E8ECF8]">{item.name}</p>
                      <p className="text-[#8FA0C8]">{item.description}</p>
                      <p className="font-mono-numbers text-[#2DE2A6] font-bold mt-1">
                        Activity Level: {item.level} / 100
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="level" radius={[0, 6, 6, 0]} barSize={22}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible Text Alternative */}
      <div className="sr-only">
        Research activity level is {researchLevel} out of 100.
        Patents activity level is {patentsLevel} out of 100.
        Commercial products activity level is {productsLevel} out of 100.
      </div>

      <div className="mt-3 pt-3 border-t border-[#223056] grid grid-cols-3 gap-2 text-center text-[11px] font-mono-numbers">
        <div>
          <span className="text-[#8FA0C8] block text-[10px]">Research</span>
          <span className="text-[#2DE2A6] font-bold">{researchLevel}/100</span>
        </div>
        <div>
          <span className="text-[#8FA0C8] block text-[10px]">Patents</span>
          <span className="text-[#7C6CFF] font-bold">{patentsLevel}/100</span>
        </div>
        <div>
          <span className="text-[#8FA0C8] block text-[10px]">Products</span>
          <span className="text-[#FFB020] font-bold">{productsLevel}/100</span>
        </div>
      </div>
    </div>
  );
}
