import os
from pathlib import Path
from dotenv import load_dotenv

def get_serpapi_key() -> str:
    load_dotenv(Path(__file__).parent / ".env", override=True)
    load_dotenv(Path(__file__).parent.parent / ".env", override=True)
    return os.getenv("SERPAPI_KEY", "")

def get_llm_api_key() -> str:
    load_dotenv(Path(__file__).parent / ".env", override=True)
    load_dotenv(Path(__file__).parent.parent / ".env", override=True)
    return os.getenv("LLM_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")

SERPAPI_KEY = get_serpapi_key()
LLM_API_KEY = get_llm_api_key()

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGIN", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

# Cache configuration
CACHE_DIR = Path(__file__).parent / ".cache"
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "86400")) # 24 hours

# Samples directory for offline/fallback/testing
SAMPLES_DIR = Path(__file__).parent / "samples"

# Scoring Caps (log scaling parameters)
CAP_RESEARCH = 50000
CAP_PATENTS = 5000
CAP_PRODUCTS = 100
CAP_JOBS = 100
CAP_NEWS = 100

# Rate limiting
RATE_LIMIT_REQUESTS_PER_MINUTE = 10
