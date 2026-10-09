import time
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)
topics = [
    "low-cost water purification",
    "AI crop disease detection",
    "affordable prosthetics",
    "microplastics removal",
    "AI tutoring for rural schools",
]

for t in topics:
    t0 = time.time()
    res = client.get(f"/api/radar?topic={t}")
    dur = time.time() - t0
    data = res.json()
    print(f"[{dur:.4f}s] {t} -> Score: {data['analysis']['score']}/100, Label: {data['analysis']['label']}, Cached: {data['cached']}")
    assert res.status_code == 200
    assert dur < 0.2
    assert data["cached"] is True

print("ALL 5 DEMO TOPICS BENCHMARK PASSED (ALL <0.2s)!")
