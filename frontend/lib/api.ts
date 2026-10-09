import { RadarResponse, SummaryResponse } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function fetchRadar(topic: string): Promise<RadarResponse> {
  const url = `${API_BASE_URL}/api/radar?topic=${encodeURIComponent(topic.trim())}`;
  
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 429) {
        throw new ApiError(
          "Rate limit exceeded (10 scans per minute). Please wait a moment before scanning again.",
          429
        );
      }
      const errData = await res.json().catch(() => null);
      const msg = errData?.detail || `API request failed with status ${res.status}`;
      throw new ApiError(msg, res.status);
    }

    return await res.json();
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error?.message || "Unable to connect to Opportunity Radar API server. Please check backend connection.",
      500
    );
  }
}

export async function fetchSummary(radarData: RadarResponse): Promise<SummaryResponse> {
  const url = `${API_BASE_URL}/api/summary`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(radarData),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new ApiError(errData?.detail || "Failed to generate AI summary", res.status);
    }

    return await res.json();
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to fetch summary from server", 500);
  }
}
