from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class NormalizedItem(BaseModel):
    id: str
    title: Optional[str] = None
    url: Optional[str] = None
    source: Optional[str] = None
    snippet: Optional[str] = None
    date: Optional[str] = None

class EngineResult(BaseModel):
    count: int = 0
    items: List[NormalizedItem] = Field(default_factory=list)
    error: Optional[str] = None

class TrendPoint(BaseModel):
    date: str
    value: int

class TrendsResult(BaseModel):
    series: List[List[Union[str, int]]] = Field(default_factory=list) # e.g. [["2025-01-01", 45]]
    error: Optional[str] = None

class EngineLevels(BaseModel):
    research: int = 0
    patents: int = 0
    products: int = 0
    jobs: int = 0
    news: int = 0

class AnalysisResult(BaseModel):
    score: int
    label: str # "Open Gap" | "Emerging" | "Crowded"
    reason: str
    confidence: str # "high" | "medium" | "low"
    gap: int
    demand: int
    levels: EngineLevels
    trend_growth: float

class RadarResults(BaseModel):
    research: EngineResult
    patents: EngineResult
    jobs: EngineResult
    news: EngineResult
    products: EngineResult
    trends: TrendsResult

class RadarResponse(BaseModel):
    topic: str
    generated_at: str
    cached: bool
    analysis: AnalysisResult
    results: RadarResults

# Summary Models
class Finding(BaseModel):
    text: str
    source_ids: List[str] = Field(default_factory=list)

class SummaryResponse(BaseModel):
    headline: str
    explanation: str
    findings: List[Finding]
    risks: List[str]
    next_steps: List[str]
    is_fallback: bool = False
