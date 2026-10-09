import time
import sys
from pathlib import Path
from datetime import datetime, timezone

# Add root directory to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.engines import fetch_all_engines_parallel
from backend.scoring import calculate_scoring
from backend.summary import generate_summary
from backend.models import RadarResponse

query = "bioplastic from banana peel"
print(f"=== TESTING LIVE QUERY: '{query}' ===")

t0 = time.time()
res, was_cached = fetch_all_engines_parallel(query)
print(f"Parallel engines took {time.time()-t0:.2f}s (cached={was_cached})")
print(f"Scholar count: {res.research.count} | Error: {res.research.error}")
print(f"Patents count: {res.patents.count} | Error: {res.patents.error}")
print(f"Shopping count: {res.products.count} | Error: {res.products.error}")
print(f"Jobs count: {res.jobs.count} | Error: {res.jobs.error}")
print(f"News count: {res.news.count} | Error: {res.news.error}")
print(f"Trends points: {len(res.trends.series)} | Error: {res.trends.error}")

analysis = calculate_scoring(res)
print(f"\nOpportunity Score: {analysis.score}/100 [{analysis.label}]")
print(f"Reason: {analysis.reason}")

# Test Gemini LLM summary
radar_payload = RadarResponse(
    topic=query,
    generated_at=datetime.now(timezone.utc).isoformat(),
    cached=was_cached,
    analysis=analysis,
    results=res,
)

t1 = time.time()
summary = generate_summary(radar_payload)
print(f"\nSummary took {time.time()-t1:.2f}s (is_fallback={summary.is_fallback})")
print(f"Headline: {summary.headline}")
print(f"Explanation: {summary.explanation}")
if summary.findings:
    print(f"Finding 1: {summary.findings[0].text} (Cited: {summary.findings[0].source_ids})")
