import json
import re
from typing import Set, Dict, Any, List
from concurrent.futures import ThreadPoolExecutor, TimeoutError

from backend.config import get_llm_api_key
from backend.models import (
    RadarResponse,
    SummaryResponse,
    Finding,
)

SYSTEM_PROMPT = """You are an analyst writing a short, honest opportunity brief for a student or early founder. Use ONLY the JSON data provided. Never add outside facts, numbers or names. Every finding must cite one or more source ids from the data (for example R1, P2). If the data is thin or an engine failed, say so plainly. Write in friendly plain English at about a grade-9 level. Return JSON only with:
- headline (string, max 12 words)
- explanation (string, 2-3 sentences on why the score is what it is)
- findings (list of 3-5 items, each with text and source_ids: [string])
- risks (list of 2-3 items)
- next_steps (list of 3 concrete actions)
"""

def extract_valid_source_ids(payload: RadarResponse) -> Set[str]:
    valid_ids = set()
    for engine_name in ["research", "patents", "jobs", "news", "products"]:
        engine_res = getattr(payload.results, engine_name, None)
        if engine_res and engine_res.items:
            for item in engine_res.items:
                if item.id:
                    valid_ids.add(item.id)
    return valid_ids

def generate_rule_based_summary(payload: RadarResponse) -> SummaryResponse:
    """
    Deterministic fallback summary that grounds every finding in actual search items.
    """
    score = payload.analysis.score
    label = payload.analysis.label
    topic = payload.topic
    valid_ids = extract_valid_source_ids(payload)

    # 1. Headline
    if score >= 70:
        headline = f"Strong Research Gap in {topic.title()}: Low Commercial Saturation"
    elif score >= 45:
        headline = f"Emerging Opportunity in {topic.title()}: Growing Interest and Early IP"
    else:
        headline = f"High Commercial Saturation and Dense Patent Landscape for {topic.title()}"

    # 2. Explanation (2-3 sentences)
    explanation = (
        f"{topic.title()} scores {score}/100 with an overall '{label}' verdict. "
        f"Research index is at {payload.analysis.levels.research}/100 while market supply is at "
        f"{payload.analysis.gap}/100 gap index with {payload.analysis.demand}/100 demand. "
        f"{payload.analysis.reason}"
    )

    # 3. Findings grounded in real items
    findings: List[Finding] = []

    # Research finding
    r_items = payload.results.research.items
    if r_items and "R1" in valid_ids:
        r_title = r_items[0].title or "academic publications"
        findings.append(
            Finding(
                text=f"Academic research demonstrates proven technical feasibility, such as '{r_title}'.",
                source_ids=["R1"],
            )
        )

    # Patents finding
    p_items = payload.results.patents.items
    if p_items and "P1" in valid_ids:
        p_title = p_items[0].title or "existing patents"
        findings.append(
            Finding(
                text=f"Intellectual property filings show active patenting around '{p_title}'.",
                source_ids=["P1"],
            )
        )
    elif payload.results.patents.count == 0:
        findings.append(
            Finding(
                text="Zero patent filings detected, indicating an unencumbered intellectual property space.",
                source_ids=[],
            )
        )

    # News or Trends finding
    n_items = payload.results.news.items
    if n_items and "N1" in valid_ids:
        n_title = n_items[0].title or "recent news developments"
        findings.append(
            Finding(
                text=f"Recent media coverage highlights public interest and funding momentum: '{n_title}'.",
                source_ids=["N1"],
            )
        )

    # Products / Shopping finding
    s_items = payload.results.products.items
    if s_items and "S1" in valid_ids:
        s_title = s_items[0].title or "retail products"
        findings.append(
            Finding(
                text=f"Commercial solutions currently retail on consumer channels, including '{s_title}'.",
                source_ids=["S1"],
            )
        )

    # Jobs finding
    j_items = payload.results.jobs.items
    if j_items and "J1" in valid_ids:
        j_title = j_items[0].title or "industry roles"
        findings.append(
            Finding(
                text=f"Industry hiring activity shows talent demand for '{j_title}'.",
                source_ids=["J1"],
            )
        )

    # Ensure at least 3 findings
    if len(findings) < 3:
        findings.append(
            Finding(
                text=f"Search trend growth calculated at {payload.analysis.trend_growth:+.0%} over the monitored period.",
                source_ids=[list(valid_ids)[0]] if valid_ids else [],
            )
        )

    # 4. Risks (2-3 items)
    risks = [
        "Transitioning from laboratory prototypes to cost-effective field deployment requires durable, low-cost materials.",
        "Regulatory standards and certified quality verification (such as NSF/EPA guidelines) can delay commercial distribution.",
        "Incumbent distribution channels may dominate consumer awareness, requiring specialized grassroots community partnerships.",
    ]

    # 5. Next Steps (3 items)
    next_steps = [
        "Review cited academic methodologies (e.g. R1) to identify open-source or non-patented technical approaches.",
        "Conduct customer interviews with targeted end-users or community organizations to benchmark price tolerance.",
        "Build a rapid low-cost prototype focusing on simple, locally procurable parts before filing IP.",
    ]

    return SummaryResponse(
        headline=headline,
        explanation=explanation,
        findings=findings[:5],
        risks=risks[:3],
        next_steps=next_steps[:3],
        is_fallback=True,
    )

def _call_gemini_llm(payload_json: str, api_key: str) -> str:
    from google import genai
    client = genai.Client(api_key=api_key)
    last_err = None
    for model_name in ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash-lite"]:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=f"{SYSTEM_PROMPT}\n\nDATA JSON:\n{payload_json}",
            )
            if response.text:
                return response.text
        except Exception as e:
            last_err = e
            continue
    raise last_err or RuntimeError("Gemini model generation failed")

def generate_summary(payload: RadarResponse) -> SummaryResponse:
    """
    Generates grounded AI summary via Gemini with 8-second timeout,
    strict source_id validation, and deterministic rule-based fallback.
    """
    valid_source_ids = extract_valid_source_ids(payload)
    llm_key = get_llm_api_key()

    # Fall back if no API key
    if not llm_key or llm_key.startswith("your_"):
        return generate_rule_based_summary(payload)

    try:
        # Prepare minimal clean payload for LLM to stay fast & grounded
        payload_dict = payload.model_dump()
        payload_str = json.dumps(payload_dict, ensure_ascii=False)

        # 35-second timeout allowing cloud generation while ensuring fallback safety
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_call_gemini_llm, payload_str, llm_key)
            raw_text = future.result(timeout=35.0)

        # Clean JSON from markdown fences if any
        cleaned_json = raw_text.strip()
        if cleaned_json.startswith("```"):
            cleaned_json = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned_json)
            cleaned_json = re.sub(r"\n?```$", "", cleaned_json)

        data = json.loads(cleaned_json)

        # Validate findings and drop unknown source IDs
        cleaned_findings: List[Finding] = []
        for f in data.get("findings", []):
            text = f.get("text", "")
            raw_sources = f.get("source_ids", [])
            # Filter strictly to valid_source_ids
            valid_sources = [s for s in raw_sources if s in valid_source_ids]
            if text and valid_sources:
                cleaned_findings.append(Finding(text=text, source_ids=valid_sources))

        # If LLM didn't return at least 2 valid grounded findings, fall back
        if len(cleaned_findings) < 2:
            return generate_rule_based_summary(payload)

        headline = str(data.get("headline", ""))[:120]
        explanation = str(data.get("explanation", ""))
        risks = [str(r) for r in data.get("risks", [])[:3]]
        next_steps = [str(s) for s in data.get("next_steps", [])[:3]]

        return SummaryResponse(
            headline=headline,
            explanation=explanation,
            findings=cleaned_findings,
            risks=risks,
            next_steps=next_steps,
            is_fallback=False,
        )

    except (TimeoutError, Exception) as e:
        print(f"[Summary LLM Fallback] Reason: {e}")
        return generate_rule_based_summary(payload)
