# Opportunity Radar 🛰️

> **Tagline:** *See where the gap is before you build.*  
> **Hackathon:** SerpApi Hackathon · **Track 05:** Knowledge & Public Interest

---

## 1. Problem & Solution

### The Problem
Students, researchers, and early founders spend days—or weeks—manually checking scientific literature, patent databases, commercial marketplaces, job boards, and news to determine if an idea has already been built or patented. More frequently, they skip this crucial diligence altogether and spend months reinventing existing products.

### The Solution
**Opportunity Radar** queries six specialized search engines via SerpApi in parallel:
1. **Academic Papers** (`google_scholar`)
2. **Patents & Prior Art** (`google_patents`)
3. **Retail Products** (`google_shopping`)
4. **Talent & Hiring** (`google_jobs`)
5. **News Momentum** (`google_news`)
6. **Public Interest Over Time** (`google_trends`)

In seconds, it synthesizes these signals into a transparent **Opportunity Score (0–100)**, an **Opportunity Quadrant Map**, and an **AI Intelligence Brief** where every claim cites a clickable, verifiable primary source.

**Core Principle:** *Every single number and claim traces directly to a real search result. The AI never invents facts.*

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15+ Frontend                     │
│    Tailwind CSS v4 (Radar Theme) · Recharts · TypeScript    │
│       Mobile-first · Accessible WCAG AA · PDF Export        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                HTTP REST (NEXT_PUBLIC_API_URL)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       FastAPI Backend                       │
│    CORS Middleware · Rate Limiter (10 req/min/IP) · Pydantic│
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
          /api/radar                    /api/summary
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Engine Orchestrator     │ │      Gemini 2.5 Flash      │
│  (ThreadPoolExecutor, n=6)   │ │  Strict Grounding Prompt   │
│  Per-Engine Error Isolation  │ │  (8-second hard timeout)   │
└──────────────┬───────────────┘ └─────────────┬──────────────┘
               │                               │
       ┌───────┴───────┐                       ▼
       ▼               ▼            Deterministic Rule Fallback
  Disk Cache      6x SerpApi
(SHA-256 / 24h)    Engines
```

---

## 3. Quick Start & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Clone & Configure Environment
```bash
cp .env.example .env
```
Edit `.env` (optional for local demo testing, as pre-cached datasets are included):
```env
SERPAPI_KEY=your_serpapi_api_key_here
LLM_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Start the Backend
```bash
# Windows PowerShell
backend\venv\Scripts\python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# macOS / Linux
source backend/venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*Health Check:* `http://localhost:8000/api/health` returns `{"status": "ok"}`.

### 3. Start the Frontend
```bash
cd frontend
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 4. Scoring Methodology & Equations

All metrics use pure, deterministic mathematical functions located in `backend/scoring.py`:

### A. Logarithmic Scaling
Search volumes range from 0 to over 100,000. Raw counts $n$ are scaled logarithmically:
$$\text{level} = \min\left(100, 100 \times \frac{\log_{10}(1 + n)}{\log_{10}(1 + \text{cap})}\right)$$
*Tunable Caps:* Research (50,000), Patents (5,000), Products (100), Jobs (100), News (100).

### B. Supply & Gap Index
$$\text{supply} = 0.5 \times \text{patent\_level} + 0.5 \times \text{product\_level}$$
$$\text{gap} = \text{clamp}\left(50 + 0.5 \times (\text{research\_level} - \text{supply}), 0, 100\right)$$
*Intuition:* High research paired with low commercial supply creates a massive whitespace opportunity.

### C. Demand Momentum
Google Trends interest growth compares the average of the last quarter against the first quarter:
$$\text{trend\_growth} = \text{clip}\left(\frac{\text{avg}(Q_4) - \text{avg}(Q_1)}{\max(\text{avg}(Q_1), 1)}, -1.0, 1.0\right)$$
$$\text{trend\_level} = \text{clamp}(50 + 50 \times \text{trend\_growth}, 0, 100)$$
$$\text{demand} = 0.5 \times \text{trend\_level} + 0.25 \times \text{jobs\_level} + 0.25 \times \text{news\_level}$$

### D. Opportunity Score & Verdict
$$\text{opportunity} = \text{round}(0.6 \times \text{gap} + 0.4 \times \text{demand})$$

- **70–100:** 🟢 **Open Gap** — Abundant research foundation, low commercial saturation, strong demand.
- **45–69:** 🟡 **Emerging** — Growing early patent activity and developing commercial momentum.
- **0–44:** 🔴 **Crowded** — Saturated patent claims and high density of existing consumer products.

---

## 5. Pre-Cached Topics & Fast Demos

To ensure seamless offline or speed-critical demos, the five core demo topics are pre-warmed in `backend/.cache` (responses return in `< 0.1s`):
1. `low-cost water purification`
2. `AI crop disease detection`
3. `affordable prosthetics`
4. `microplastics removal`
5. `AI tutoring for rural schools`

To re-seed or refresh the cache:
```bash
python -m backend.scripts.warm_cache
```

---

## 6. Assumptions & Known Limitations

1. **Total Result Fallbacks:** For engines that do not return a metadata `total_results` count (e.g. `google_shopping`, `google_jobs`, `google_news`), the system falls back to the length of retrieved results on the primary page and log-scales against a calibrated cap of 100.
2. **LLM Timeout Boundary:** The Gemini summary endpoint enforces an 8.0-second timeout. If the LLM call times out or the `LLM_API_KEY` is not configured, the system automatically falls back to an instant, deterministic rule-based summary that strictly references real IDs (`R1`, `P1`, etc.).
3. **CORS:** Restricted to frontend development and production origins via `CORS_ORIGINS`.
4. **Rate Limiting:** In-memory sliding-window limiter allows a maximum of 10 scans per minute per client IP.

---

## 7. 60-Second Demo Script

1. **Hook (0:00 - 0:10):** *"Hackathon teams and student founders spend months building things that already exist. Opportunity Radar tells you where the whitespace is before you write a single line of code."*
2. **Action (0:10 - 0:25):** Click on the example chip **`low-cost water purification`** and press **Scan**. Show the six SerpApi engines lighting up in parallel.
3. **The Score (0:25 - 0:40):** Show the **Opportunity Score (69/100, Emerging / Open Gap)**. Point to the **Research vs Supply** chart: *"Hundreds of papers on solar-driven purification, but almost no patented consumer products. That's a massive gap."*
4. **Traceability (0:40 - 0:50):** Click citation chip **`[R1]`** in the AI summary. Watch the screen smoothly scroll to and highlight Nature Energy paper `R1`.
5. **Pitch Close (0:50 - 1:00):** *"Every claim is 100% grounded in SerpApi live telemetry. No hallucinations, no false hope—just real market whitespace."*

---

## 8. Testing Suite

Run full backend test suite:
```bash
python -m pytest backend/tests -v
```
All 10 tests cover:
- Score formula math and log scaling
- Pure gap, crowded market, and flat trend edge cases
- Partial failure and confidence degradation
- Citation grounding and unknown ID elimination
- IP rate limiting and input validation boundaries
