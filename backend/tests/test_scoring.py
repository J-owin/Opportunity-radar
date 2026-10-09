import pytest
from backend.models import EngineResult, TrendsResult, RadarResults
from backend.scoring import (
    compute_log_level,
    compute_trend_growth,
    calculate_scoring,
)

def make_radar_results(
    research_count=1000,
    patents_count=10,
    jobs_count=5,
    news_count=10,
    products_count=5,
    series=None,
    research_error=None,
    patents_error=None,
    jobs_error=None,
    news_error=None,
    products_error=None,
    trends_error=None,
):
    if series is None:
        series = [["Jan", 40], ["Feb", 50], ["Mar", 60], ["Apr", 80]]

    return RadarResults(
        research=EngineResult(count=research_count, items=[], error=research_error),
        patents=EngineResult(count=patents_count, items=[], error=patents_error),
        jobs=EngineResult(count=jobs_count, items=[], error=jobs_error),
        news=EngineResult(count=news_count, items=[], error=news_error),
        products=EngineResult(count=products_count, items=[], error=products_error),
        trends=TrendsResult(series=series, error=trends_error),
    )

def test_compute_log_level():
    assert compute_log_level(0, 1000) == 0
    assert compute_log_level(1000, 1000) == 100
    assert 0 < compute_log_level(100, 1000) < 100

def test_pure_gap_topic():
    """High research, zero supply, rising trend => Open Gap (70-100)"""
    results = make_radar_results(
        research_count=50000, # 100% cap
        patents_count=0,
        products_count=0,
        jobs_count=50,
        news_count=50,
        series=[["Q1", 20], ["Q2", 30], ["Q3", 60], ["Q4", 90]], # High growth
    )
    analysis = calculate_scoring(results)
    assert analysis.score >= 70
    assert analysis.label == "Open Gap"
    assert analysis.confidence == "high"
    assert "Strong research" in analysis.reason
    assert "few patents and products" in analysis.reason

def test_crowded_topic():
    """Low/moderate research, huge patents and products => Crowded (0-44)"""
    results = make_radar_results(
        research_count=100,
        patents_count=10000, # Over cap
        products_count=200,  # Over cap
        jobs_count=10,
        news_count=10,
        series=[["Q1", 80], ["Q2", 70], ["Q3", 50], ["Q4", 30]], # Declining
    )
    analysis = calculate_scoring(results)
    assert analysis.score <= 44
    assert analysis.label == "Crowded"
    assert "crowded" in analysis.reason.lower()

def test_flat_trend():
    """Flat trend gives ~0 growth and ~50 trend_level"""
    flat_series = [["Jan", 50], ["Feb", 50], ["Mar", 50], ["Apr", 50]]
    growth = compute_trend_growth(flat_series)
    assert growth == 0.0

    results = make_radar_results(
        research_count=5000,
        patents_count=500,
        products_count=20,
        series=flat_series,
    )
    analysis = calculate_scoring(results)
    assert analysis.trend_growth == 0.0
    assert 40 <= analysis.score <= 75

def test_missing_engines_confidence():
    """Two or more failed engines trigger confidence: low"""
    results = make_radar_results(
        research_error="Timeout connecting to Scholar",
        patents_error="Patents 503 Service Unavailable",
    )
    analysis = calculate_scoring(results)
    assert analysis.confidence == "low"

    results_single_error = make_radar_results(
        trends_error="Trends 429 Too Many Requests"
    )
    analysis_single = calculate_scoring(results_single_error)
    assert analysis_single.confidence == "medium"

def test_three_sample_topics_give_sensible_labels():
    # 1. Emerging Topic
    emerging = make_radar_results(
        research_count=1500,
        patents_count=150,
        products_count=15,
        jobs_count=10,
        news_count=20,
        series=[["Jan", 30], ["Feb", 35], ["Mar", 40], ["Apr", 45]],
    )
    analysis_emerging = calculate_scoring(emerging)
    assert analysis_emerging.label in ["Emerging", "Open Gap"]

    # 2. Pure Open Gap
    open_gap = make_radar_results(
        research_count=40000,
        patents_count=2,
        products_count=0,
        jobs_count=20,
        news_count=30,
        series=[["Jan", 20], ["Apr", 80]],
    )
    assert calculate_scoring(open_gap).label == "Open Gap"

    # 3. Crowded Market
    crowded = make_radar_results(
        research_count=50,
        patents_count=5000,
        products_count=100,
        jobs_count=5,
        news_count=5,
        series=[["Jan", 60], ["Apr", 20]],
    )
    assert calculate_scoring(crowded).label == "Crowded"
