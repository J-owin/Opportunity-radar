export interface NormalizedItem {
  id: string;
  title: string | null;
  url: string | null;
  source: string | null;
  snippet: string | null;
  date: string | null;
}

export interface EngineResult {
  count: number;
  items: NormalizedItem[];
  error: string | null;
}

export interface TrendsResult {
  series: [string, number][];
  error: string | null;
}

export interface EngineLevels {
  research: number;
  patents: number;
  products: number;
  jobs: number;
  news: number;
}

export interface AnalysisResult {
  score: number;
  label: "Open Gap" | "Emerging" | "Crowded";
  reason: string;
  confidence: "high" | "medium" | "low";
  gap: number;
  demand: number;
  levels: EngineLevels;
  trend_growth: number;
}

export interface RadarResults {
  research: EngineResult;
  patents: EngineResult;
  jobs: EngineResult;
  news: EngineResult;
  products: EngineResult;
  trends: TrendsResult;
}

export interface RadarResponse {
  topic: string;
  generated_at: string;
  cached: boolean;
  analysis: AnalysisResult;
  results: RadarResults;
}

export interface Finding {
  text: string;
  source_ids: string[];
}

export interface SummaryResponse {
  headline: string;
  explanation: string;
  findings: Finding[];
  risks: string[];
  next_steps: string[];
  is_fallback: boolean;
}
