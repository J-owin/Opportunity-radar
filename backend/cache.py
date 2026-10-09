import hashlib
import json
import time
from pathlib import Path
from typing import Any, Optional
from backend.config import CACHE_DIR, CACHE_TTL_SECONDS

class DiskCache:
    """
    Disk cache storing JSON responses in backend/.cache
    Keyed by SHA-256 hash of (engine + query + sorted_params).
    Enforces a configurable TTL (default 24 hours).
    """

    def __init__(self, cache_dir: Path = CACHE_DIR, ttl_seconds: int = CACHE_TTL_SECONDS):
        self.cache_dir = cache_dir
        self.ttl_seconds = ttl_seconds
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_key(self, engine: str, query: str, params: Optional[dict] = None) -> str:
        param_str = ""
        if params:
            # Sort keys for deterministic hashing
            param_str = json.dumps(params, sort_keys=True)
        raw = f"{engine}:{query.strip().lower()}:{param_str}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def _cache_path(self, key: str) -> Path:
        return self.cache_dir / f"{key}.json"

    def get(self, engine: str, query: str, params: Optional[dict] = None) -> Optional[dict]:
        key = self._get_key(engine, query, params)
        file_path = self._cache_path(key)

        if not file_path.exists():
            return None

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Check expiration
            saved_at = data.get("_cached_at", 0)
            if time.time() - saved_at > self.ttl_seconds:
                # Expired
                try:
                    file_path.unlink(missing_ok=True)
                except OSError:
                    pass
                return None

            return data.get("payload")
        except Exception:
            return None

    def set(self, engine: str, query: str, payload: Any, params: Optional[dict] = None) -> None:
        key = self._get_key(engine, query, params)
        file_path = self._cache_path(key)

        data = {
            "_cached_at": time.time(),
            "engine": engine,
            "query": query,
            "payload": payload,
        }

        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[Cache Warning] Failed to write cache {file_path}: {e}")

# Global cache singleton
cache = DiskCache()
