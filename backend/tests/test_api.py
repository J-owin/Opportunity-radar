import pytest
from fastapi.testclient import TestClient
from backend.main import app, ip_request_timestamps

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

def test_radar_topic_validation():
    # Too short (< 3 chars)
    res_short = client.get("/api/radar?topic=ab")
    assert res_short.status_code == 400

    # Too long (> 120 chars)
    res_long = client.get(f"/api/radar?topic={'a'*121}")
    assert res_long.status_code == 400

    # Valid topic
    res_valid = client.get("/api/radar?topic=microplastics+removal")
    assert res_valid.status_code == 200
    data = res_valid.json()
    assert "analysis" in data
    assert "score" in data["analysis"]
    assert "results" in data

def test_summary_grounding_validation():
    radar_res = client.get("/api/radar?topic=affordable+prosthetics")
    assert radar_res.status_code == 200
    radar_data = radar_res.json()

    summary_res = client.post("/api/summary", json=radar_data)
    assert summary_res.status_code == 200
    summary_data = summary_res.json()
    assert "headline" in summary_data
    assert "findings" in summary_data
    assert len(summary_data["findings"]) >= 2

    # Check citation source_ids are in the payload items
    valid_ids = {
        item["id"]
        for k in ["research", "patents", "jobs", "news", "products"]
        for item in radar_data["results"][k]["items"]
    }
    for f in summary_data["findings"]:
        for sid in f["source_ids"]:
            assert sid in valid_ids

def test_rate_limiting():
    # Clear rate limiter timestamps for test client
    ip_request_timestamps.clear()

    # Perform 10 requests
    for _ in range(10):
        res = client.get("/api/radar?topic=water+filters")
        assert res.status_code == 200

    # 11th request should trigger 429
    res_limit = client.get("/api/radar?topic=water+filters")
    assert res_limit.status_code == 429
    assert "Rate limit exceeded" in res_limit.json()["detail"]

    # Reset
    ip_request_timestamps.clear()
