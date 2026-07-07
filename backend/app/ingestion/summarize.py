"""AI Explainer Engine — turns a raw item into structured explainer fields.

Primary path: Anthropic Messages API with structured outputs (Pydantic schema)
on `claude-opus-4-8`. If no ANTHROPIC_API_KEY is configured, we fall back to a
deterministic heuristic so the whole pipeline still runs end-to-end for a demo.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.config import settings
from app.ingestion.crawler import RawItem


class Explainer(BaseModel):
    """Structured output schema returned by the model (and the fallback)."""
    summary_30s: str = Field(description="A crisp 1-2 sentence, 30-second summary.")
    key_takeaways: list[str] = Field(description="2-4 bullet takeaways.")
    why_it_matters: str = Field(description="Why this matters for the AI field.")
    who_is_impacted: str = Field(description="Who is most affected (devs, founders, etc.).")
    what_to_watch: str = Field(description="What to watch next as a result.")
    topics: list[str] = Field(description="3-6 short topic tags, e.g. 'LLMs', 'Funding'.")
    sentiment: Literal["positive", "neutral", "negative"]


_SYSTEM = (
    "You are the analyst engine for AI Pulse, a real-time AI intelligence "
    "platform. Given an AI news item or research paper, produce a tight, factual "
    "explainer. Answer: what happened, why it matters, who is impacted, and what "
    "to watch next. For research papers (an abstract is provided), explain the "
    "contribution in plain English first, then note the technical significance. "
    "Be concise and concrete. Do not speculate beyond the given text; if details "
    "are unknown, say what a reader should look for."
)


_TOPIC_PATTERNS: list[tuple[list[str], str]] = [
    (["agent", "autonomous", "agentic", "mcp", "multi-agent", "tool use", "tool call"], "Agents"),
    (["llm", "language model", "open source", "fine-tun", "quantiz", "gguf", "inference", "transformer"], "LLMs"),
    (["fund", "raised", "invest", "series a", "series b", "acqui", "valuation", "ipo"], "Funding"),
    (["robot", "hardware", "embodied", "drone", "sensor", "actuator", "physical"], "Robotics"),
    (["voice", "audio", "speech", "tts", "whisper", "sound", "real-time audio"], "Voice AI"),
    (["coding", "code", "cursor", "copilot", "ide", "developer tool", "github", "devtool", "pair programming"], "Developer Tools"),
    (["hiring", "jobs", "recruit", "career", "resume", "talent", "workforce", "salary", "interview"], "Hiring"),
    (["safety", "alignment", "jailbreak", "bias", "ethic", "regulation", "policy", "governance"], "AI Safety"),
    (["image", "video", "vision", "diffusion", "stable diffusion", "sora", "generation", "generative media"], "Generative Media"),
    (["search", "retrieval", "rag", "embedding", "vector", "knowledge graph"], "Knowledge & RAG"),
]

_WHO: dict[str, str] = {
    "Agents": "Software teams building automation workflows, product managers evaluating AI-native pipelines, and enterprises reducing manual processes.",
    "LLMs": "ML engineers selecting models for production, startups weighing build-vs-buy decisions, and researchers tracking capability improvements.",
    "Funding": "Founders benchmarking their own positioning, investors tracking deal flow, and engineers monitoring acquisition targets.",
    "Robotics": "Hardware engineers, supply-chain operators, and research labs working on embodied AI.",
    "Voice AI": "Product teams building conversational interfaces, call-center operators, and accessibility-tool developers.",
    "Developer Tools": "Software engineers adopting AI-assisted workflows, engineering managers setting team tooling standards, and technical recruiters updating evaluation criteria.",
    "Hiring": "Software engineers, technical recruiters, and engineering managers navigating AI-augmented hiring expectations.",
    "AI Safety": "Policy teams, AI researchers, legal counsel at AI companies, and regulators drafting AI governance frameworks.",
    "Generative Media": "Creative teams, media companies, content platforms, and IP lawyers tracking synthetic media.",
    "Knowledge & RAG": "Enterprise AI teams building internal search, data engineers, and product teams shipping knowledge assistants.",
}

_WATCH: dict[str, str] = {
    "Agents": "Emerging MCP integrations, standardization proposals, and enterprise pilots measuring agent error rates.",
    "LLMs": "Follow-up benchmarks, downstream fine-tune results, and hardware cost curves as newer models ship.",
    "Funding": "Follow-on rounds, product announcements, and whether the acquired team ships under the new parent.",
    "Robotics": "Hardware cost-per-unit trends, VLA model transfer results, and pilot deployments in logistics.",
    "Voice AI": "Latency improvements, real-time API pricing changes, and regulatory stances on synthetic voice.",
    "Developer Tools": "Adoption rates in open job postings, changes to interview rubrics at large tech companies, and competing tool benchmarks.",
    "Hiring": "How major employers update job descriptions, new AI screening tools, and survey data on tool adoption among engineers.",
    "AI Safety": "Regulatory timelines, company responses to new requirements, and independent audit results.",
    "Generative Media": "Platform content policies, watermarking standards, and litigation outcomes on synthetic content.",
    "Knowledge & RAG": "Retrieval accuracy benchmarks, enterprise adoption case studies, and open-source retrieval framework updates.",
}


def _heuristic(item: RawItem, domain: str) -> Explainer:
    """Key-free fallback: derives context from title+content instead of hardcoded strings."""
    combined = f"{item.title} {item.content or ''}".lower()

    detected: list[str] = []
    for keywords, label in _TOPIC_PATTERNS:
        if any(kw in combined for kw in keywords):
            detected.append(label)
    if not detected:
        detected = ["Research"] if item.kind == "paper" else ["AI"]

    primary = detected[0]

    blurb = (item.content[:240] + "...") if item.content and len(item.content) > 60 else f"{item.title}."

    if item.content and len(item.content) > 120:
        first_sentence = item.content[:300].split(". ")[0].strip()
        why = (first_sentence + ".") if len(first_sentence) > 40 else blurb
    else:
        why = f"{item.title}."

    return Explainer(
        summary_30s=blurb,
        key_takeaways=[item.title, f"Source: {domain or item.source}"],
        why_it_matters=why,
        who_is_impacted=_WHO.get(primary, "Engineers, product teams, and researchers tracking AI developments."),
        what_to_watch=_WATCH.get(primary, "Follow-up coverage, related announcements, and technical deep-dives."),
        topics=detected[:6],
        sentiment="neutral",
    )


def summarize(item: RawItem, domain: str) -> tuple[Explainer, str]:
    """Return (explainer, summarized_by). `summarized_by` is the model id or 'heuristic'."""
    if not settings.anthropic_api_key:
        return _heuristic(item, domain), "heuristic"

    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    kind_label = "Research paper" if item.kind == "paper" else "News item"
    abstract = f"Abstract: {item.content[:1500]}\n" if item.content else ""
    prompt = (
        f"Type: {kind_label}\n"
        f"Title: {item.title}\n"
        f"Source: {item.source}\n"
        f"Domain: {domain}\n"
        f"URL: {item.url}\n"
        f"{abstract}\n"
        "Produce the structured explainer."
    )
    try:
        resp = client.messages.parse(
            model=settings.ai_model,
            max_tokens=1024,
            thinking={"type": "adaptive"},
            system=_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
            output_format=Explainer,
        )
        parsed = resp.parsed_output
        if parsed is None:  # refusal or unparseable
            return _heuristic(item, domain), "heuristic"
        return parsed, settings.ai_model
    except Exception:
        # Network / rate-limit / parse failure — keep the pipeline moving.
        return _heuristic(item, domain), "heuristic"
