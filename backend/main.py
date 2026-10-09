import time
from datetime import datetime, timezone
from collections import defaultdict
from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.config import CORS_ORIGINS, RATE_LIMIT_REQUESTS_PER_MINUTE
from backend.engines import fetch_all_engines_parallel
from backend.scoring import calculate_scoring
from backend.models import RadarResponse, SummaryResponse, RadarResults
from backend.summary import generate_summary

app = FastAPI(title="Opportunity Radar API", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory IP-based rate limiter (10 requests per minute)
ip_request_timestamps = defaultdict(list)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Only rate limit /api/radar and /api/summary
    if request.url.path in ["/api/radar", "/api/summary"]:
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - 60

        # Purge timestamps older than 60 seconds
        timestamps = [t for t in ip_request_timestamps[client_ip] if t > window_start]
        if len(timestamps) >= RATE_LIMIT_REQUESTS_PER_MINUTE:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Maximum 10 scans per minute allowed."}
            )
        timestamps.append(now)
        ip_request_timestamps[client_ip] = timestamps

    response = await call_next(request)
    return response

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/radar", response_model=RadarResponse)
def get_radar(topic: str = Query(..., description="Topic or idea to analyze")):
    clean_topic = topic.strip()
    if len(clean_topic) < 3 or len(clean_topic) > 120:
        raise HTTPException(
            status_code=400,
            detail="Topic must be between 3 and 120 characters."
        )

    results, was_cached = fetch_all_engines_parallel(clean_topic)
    analysis = calculate_scoring(results)

    return RadarResponse(
        topic=clean_topic,
        generated_at=datetime.now(timezone.utc).isoformat(),
        cached=was_cached,
        analysis=analysis,
        results=results,
    )

@app.post("/api/summary", response_model=SummaryResponse)
def post_summary(payload: RadarResponse):
    return generate_summary(payload)
