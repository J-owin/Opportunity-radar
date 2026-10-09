import json
import re
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import serpapi
from concurrent.futures import ThreadPoolExecutor, as_completed

from backend.config import get_serpapi_key, SAMPLES_DIR
from backend.cache import cache
from backend.models import (
    NormalizedItem,
    EngineResult,
    TrendsResult,
    RadarResults,
)

def _load_sample_if_available(engine_name: str) -> Optional[dict]:
    """Helper to load a verified sample JSON when offline or no API key."""
    sample_file = SAMPLES_DIR / f"{engine_name}_sample.json"
    if sample_file.exists():
        try:
            with open(sample_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return None

def fetch_raw_serpapi(engine: str, params: dict, api_key: Optional[str] = None) -> dict:
    """
    Executes a SerpApi search with disk caching.
    Falls back to saved sample if no API key or in test mode.
    """
    if not api_key:
        api_key = get_serpapi_key()
    query = params.get("q", "")
    cached_data = cache.get(engine, query, params)
    if cached_data is not None:
        return cached_data

    # If no API key provided, fall back to sample JSON
    if not api_key or api_key.startswith("your_"):
        sample_data = _load_sample_if_available(engine)
        if sample_data:
            cache.set(engine, query, sample_data, params)
            return sample_data
        raise ValueError(f"No SERPAPI_KEY configured and no sample found for engine '{engine}'")

    # Real call using serpapi.Client
    try:
        client = serpapi.Client(api_key=api_key)
        full_params = {"engine": engine, **params}
        results = client.search(full_params)
        raw_dict = results.as_dict() if hasattr(results, "as_dict") else dict(results)
        cache.set(engine, query, raw_dict, params)
        return raw_dict
    except Exception as e:
        # Check if sample exists as emergency fallback
        sample_data = _load_sample_if_available(engine)
        if sample_data:
            return sample_data
        raise e

# --- Parsers ---

def parse_scholar(raw: dict) -> EngineResult:
    try:
        organic = raw.get("organic_results", [])
        search_info = raw.get("search_information", {})
        total_results = search_info.get("total_results")

        if total_results is None:
            total_results = len(organic)

        items: List[NormalizedItem] = []
        for idx, item in enumerate(organic[:5]):
            pub_info = item.get("publication_info", {})
            summary = pub_info.get("summary", "") if isinstance(pub_info, dict) else ""
            
            # Extract 4-digit year from summary if present
            year_match = re.search(r"\b(19\d\d|20\d\d)\b", summary)
            date = year_match.group(0) if year_match else None

            items.append(
                NormalizedItem(
                    id=f"R{idx+1}",
                    title=item.get("title"),
                    url=item.get("link"),
                    source=summary or "Google Scholar",
                    snippet=item.get("snippet"),
                    date=date,
                )
            )

        return EngineResult(count=int(total_results), items=items, error=None)
    except Exception as e:
        return EngineResult(count=0, items=[], error=f"Scholar parsing error: {str(e)}")

def parse_patents(raw: dict) -> EngineResult:
    try:
        organic = raw.get("organic_results", [])
        search_info = raw.get("search_information", {})
        total_results = search_info.get("total_results")
        if total_results is None:
            total_results = len(organic)

        items: List[NormalizedItem] = []
        for idx, item in enumerate(organic[:5]):
            assignee = item.get("assignee")
            inventor = item.get("inventor")
            source = assignee or inventor or "Google Patents"
            date = item.get("grant_date") or item.get("filing_date")

            items.append(
                NormalizedItem(
                    id=f"P{idx+1}",
                    title=item.get("title") or item.get("patent_id"),
                    url=item.get("link"),
                    source=source,
                    snippet=item.get("snippet"),
                    date=date,
                )
            )

        return EngineResult(count=int(total_results), items=items, error=None)
    except Exception as e:
        return EngineResult(count=0, items=[], error=f"Patents parsing error: {str(e)}")

def parse_jobs(raw: dict) -> EngineResult:
    try:
        jobs = raw.get("jobs_results", [])
        total_results = len(jobs)

        items: List[NormalizedItem] = []
        for idx, item in enumerate(jobs[:5]):
            company = item.get("company_name", "")
            via = item.get("via", "")
            source = f"{company} {via}".strip() or "Google Jobs"
            ext = item.get("detected_extensions", {})
            date = ext.get("posted_at") if isinstance(ext, dict) else None

            items.append(
                NormalizedItem(
                    id=f"J{idx+1}",
                    title=item.get("title"),
                    url=item.get("share_link") or item.get("link"),
                    source=source,
                    snippet=item.get("description") or item.get("snippet"),
                    date=date,
                )
            )

        return EngineResult(count=total_results, items=items, error=None)
    except Exception as e:
        return EngineResult(count=0, items=[], error=f"Jobs parsing error: {str(e)}")

def parse_news(raw: dict) -> EngineResult:
    try:
        news = raw.get("news_results", [])
        total_results = len(news)

        items: List[NormalizedItem] = []
        for idx, item in enumerate(news[:5]):
            source_raw = item.get("source")
            source = source_raw.get("name") if isinstance(source_raw, dict) else (source_raw or "Google News")

            items.append(
                NormalizedItem(
                    id=f"N{idx+1}",
                    title=item.get("title"),
                    url=item.get("link"),
                    source=source,
                    snippet=item.get("snippet"),
                    date=item.get("date"),
                )
            )

        return EngineResult(count=total_results, items=items, error=None)
    except Exception as e:
        return EngineResult(count=0, items=[], error=f"News parsing error: {str(e)}")

def parse_shopping(raw: dict) -> EngineResult:
    try:
        shopping = raw.get("shopping_results", [])
        total_results = len(shopping)

        items: List[NormalizedItem] = []
        for idx, item in enumerate(shopping[:5]):
            source = item.get("source") or "Google Shopping"
            price = item.get("price")
            source_label = f"{source} ({price})" if price else source

            items.append(
                NormalizedItem(
                    id=f"S{idx+1}",
                    title=item.get("title"),
                    url=item.get("link"),
                    source=source_label,
                    snippet=item.get("snippet"),
                    date=None,
                )
            )

        return EngineResult(count=total_results, items=items, error=None)
    except Exception as e:
        return EngineResult(count=0, items=[], error=f"Shopping parsing error: {str(e)}")

def parse_trends(raw: dict) -> TrendsResult:
    try:
        timeline = raw.get("interest_over_time", {}).get("timeline_data", [])
        series: List[List[Any]] = []

        for entry in timeline:
            date_label = entry.get("date", "")
            values = entry.get("values", [])
            val = 0
            if values:
                val = values[0].get("extracted_value", 0)
                if val is None or val == "":
                    try:
                        val = int(values[0].get("value", 0))
                    except Exception:
                        val = 0
            series.append([date_label, int(val)])

        return TrendsResult(series=series, error=None)
    except Exception as e:
        return TrendsResult(series=[], error=f"Trends parsing error: {str(e)}")

# --- Isolated Fetch Functions ---

def fetch_scholar(topic: str, api_key: Optional[str] = None) -> EngineResult:
    try:
        raw = fetch_raw_serpapi("google_scholar", {"q": topic}, api_key=api_key)
        return parse_scholar(raw)
    except Exception as e:
        return EngineResult(count=0, items=[], error=str(e))

def fetch_patents(topic: str, api_key: Optional[str] = None) -> EngineResult:
    try:
        raw = fetch_raw_serpapi("google_patents", {"q": topic}, api_key=api_key)
        return parse_patents(raw)
    except Exception as e:
        return EngineResult(count=0, items=[], error=str(e))

def fetch_jobs(topic: str, api_key: Optional[str] = None) -> EngineResult:
    try:
        raw = fetch_raw_serpapi("google_jobs", {"q": topic}, api_key=api_key)
        return parse_jobs(raw)
    except Exception as e:
        return EngineResult(count=0, items=[], error=str(e))

def fetch_news(topic: str, api_key: Optional[str] = None) -> EngineResult:
    try:
        raw = fetch_raw_serpapi("google_news", {"q": topic}, api_key=api_key)
        return parse_news(raw)
    except Exception as e:
        return EngineResult(count=0, items=[], error=str(e))

def fetch_shopping(topic: str, api_key: Optional[str] = None) -> EngineResult:
    try:
        raw = fetch_raw_serpapi("google_shopping", {"q": topic}, api_key=api_key)
        return parse_shopping(raw)
    except Exception as e:
        return EngineResult(count=0, items=[], error=str(e))

def fetch_trends(topic: str, api_key: Optional[str] = None) -> TrendsResult:
    try:
        raw = fetch_raw_serpapi("google_trends", {"q": topic, "data_type": "TIMESERIES"}, api_key=api_key)
        return parse_trends(raw)
    except Exception as e:
        return TrendsResult(series=[], error=str(e))

def fetch_all_engines_parallel(topic: str, api_key: Optional[str] = None) -> Tuple[RadarResults, bool]:
    """
    Executes all six engine calls concurrently in a ThreadPoolExecutor.
    Returns (RadarResults, cached_flag).
    """
    tasks = {
        "research": lambda: fetch_scholar(topic, api_key),
        "patents": lambda: fetch_patents(topic, api_key),
        "jobs": lambda: fetch_jobs(topic, api_key),
        "news": lambda: fetch_news(topic, api_key),
        "products": lambda: fetch_shopping(topic, api_key),
        "trends": lambda: fetch_trends(topic, api_key),
    }

    # Check if all engines are already in cache
    all_cached = True
    for eng, params in [
        ("google_scholar", {"q": topic}),
        ("google_patents", {"q": topic}),
        ("google_jobs", {"q": topic}),
        ("google_news", {"q": topic}),
        ("google_shopping", {"q": topic}),
        ("google_trends", {"q": topic, "data_type": "TIMESERIES"}),
    ]:
        if cache.get(eng, topic, params) is None:
            all_cached = False
            break

    results = {}
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(fn): name for name, fn in tasks.items()}
        for future in as_completed(futures):
            name = futures[future]
            try:
                results[name] = future.result()
            except Exception as e:
                if name == "trends":
                    results[name] = TrendsResult(series=[], error=str(e))
                else:
                    results[name] = EngineResult(count=0, items=[], error=str(e))

    radar_results = RadarResults(
        research=results["research"],
        patents=results["patents"],
        jobs=results["jobs"],
        news=results["news"],
        products=results["products"],
        trends=results["trends"],
    )

    return radar_results, all_cached
