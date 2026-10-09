import math
from typing import List, Tuple, Union, Optional
from backend.config import (
    CAP_RESEARCH,
    CAP_PATENTS,
    CAP_PRODUCTS,
    CAP_JOBS,
    CAP_NEWS,
)
from backend.models import (
    EngineLevels,
    AnalysisResult,
    RadarResults,
)

def clamp(val: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    return max(min_val, min(max_val, val))

def compute_log_level(count: int, cap: int) -> int:
    """
    Converts raw count n into 0-100 level using log scaling:
    level = min(100, 100 * log10(1 + n) / log10(1 + cap))
    """
    if count <= 0:
        return 0
    if cap <= 0:
        return 0
    num = math.log10(1.0 + count)
    denom = math.log10(1.0 + cap)
    level = (num / denom) * 100.0
    return int(round(clamp(level, 0.0, 100.0)))

def compute_trend_growth(series: List[List[Union[str, int]]]) -> float:
    """
    trend_growth = (avg of last quarter of series - avg of first quarter) / max(avg of first quarter, 1)
    clipped to [-1.0, 1.0]
    """
    if not series or len(series) < 2:
        return 0.0

    values = []
    for item in series:
        if len(item) >= 2 and isinstance(item[1], (int, float)):
            values.append(float(item[1]))

    n = len(values)
    if n == 0:
        return 0.0
    if n < 4:
        # Fall back to first half vs last half
        half = max(1, n // 2)
        q1_avg = sum(values[:half]) / half
        q4_avg = sum(values[-half:]) / half
    else:
        quarter_size = max(1, n // 4)
        q1_avg = sum(values[:quarter_size]) / quarter_size
        q4_avg = sum(values[-quarter_size:]) / quarter_size

    growth = (q4_avg - q1_avg) / max(q1_avg, 1.0)
    return round(clamp(growth, -1.0, 1.0), 3)

def generate_reason(
    research_level: int,
    supply: float,
    demand: float,
    trend_growth: float
) -> str:
    """
    Generates a deterministic, rule-based plain-English explanation sentence.
    """
    parts = []

    if research_level >= 65:
        parts.append("Strong research")
    elif research_level >= 35:
        parts.append("Moderate research foundation")
    else:
        parts.append("Nascent research")

    if supply <= 35:
        parts.append("few patents and products")
    elif supply <= 65:
        parts.append("moderate commercial presence")
    else:
        parts.append("crowded patent and product landscape")

    if trend_growth > 0.15:
        parts.append("rising interest")
    elif trend_growth >= -0.15:
        parts.append("stable market demand")
    else:
        parts.append("cooling public search interest")

    return ", ".join(parts).capitalize() + "."

def calculate_scoring(results: RadarResults) -> AnalysisResult:
    """
    Pure scoring calculation based on Section 8 rules.
    """
    # 1. Compute levels
    research_level = compute_log_level(results.research.count, CAP_RESEARCH)
    patent_level = compute_log_level(results.patents.count, CAP_PATENTS)
    product_level = compute_log_level(results.products.count, CAP_PRODUCTS)
    jobs_level = compute_log_level(results.jobs.count, CAP_JOBS)
    news_level = compute_log_level(results.news.count, CAP_NEWS)

    levels = EngineLevels(
        research=research_level,
        patents=patent_level,
        products=product_level,
        jobs=jobs_level,
        news=news_level,
    )

    # 2. Supply = 0.5 * patent_level + 0.5 * product_level
    supply = 0.5 * patent_level + 0.5 * product_level

    # 3. Gap = clamp(50 + 0.5 * (research_level - supply), 0, 100)
    gap = clamp(50.0 + 0.5 * (research_level - supply), 0.0, 100.0)

    # 4. Trend Growth & Trend Level
    trend_growth = compute_trend_growth(results.trends.series)
    trend_level = clamp(50.0 + 50.0 * trend_growth, 0.0, 100.0)

    # 5. Demand = 0.5 * trend_level + 0.25 * jobs_level + 0.25 * news_level
    demand = 0.5 * trend_level + 0.25 * jobs_level + 0.25 * news_level

    # 6. Opportunity = round(0.6 * gap + 0.4 * demand)
    opportunity = int(round(clamp(0.6 * gap + 0.4 * demand, 0.0, 100.0)))

    # 7. Verdict label
    if opportunity >= 70:
        label = "Open Gap"
    elif opportunity >= 45:
        label = "Emerging"
    else:
        label = "Crowded"

    # 8. Confidence calculation
    failed_engines_count = sum(
        1
        for res in [
            results.research,
            results.patents,
            results.jobs,
            results.news,
            results.products,
        ]
        if res.error is not None
    )
    if results.trends.error is not None:
        failed_engines_count += 1

    if failed_engines_count >= 2:
        confidence = "low"
    elif failed_engines_count == 1:
        confidence = "medium"
    else:
        confidence = "high"

    # 9. One-line plain-English reason
    reason = generate_reason(research_level, supply, demand, trend_growth)

    return AnalysisResult(
        score=opportunity,
        label=label,
        reason=reason,
        confidence=confidence,
        gap=int(round(gap)),
        demand=int(round(demand)),
        levels=levels,
        trend_growth=trend_growth,
    )
