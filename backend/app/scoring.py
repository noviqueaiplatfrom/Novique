"""Novique proprietary scoring engine.

Two independent metrics, each on a 0-100 scale, are the platform's core IP:

  • AI Impact Score  — *How much does this matter?*  A significance measure that
    blends source authority, audience engagement, entity importance, and the
    presence of high-signal events (launches, funding, breakthroughs). It is
    deliberately recency-agnostic: a landmark release stays high-impact for days.

  • AI Trend Score   — *How fast is this rising right now?*  A momentum measure
    driven by engagement velocity (points per hour), a recency boost, and how
    much the item's topics are co-occurring across the current batch.

Both functions are pure and deterministic so they are unit-testable and can be
recomputed offline when weights change. Inputs are plain values, not ORM
objects, to keep the engine decoupled from the database.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

# --- Source authority table -------------------------------------------------
# Domains of primary AI sources rank highest; major tech press in the middle;
# everything else gets a sensible floor. Matched by domain suffix.
_AUTHORITY: dict[str, float] = {
    "openai.com": 1.0,
    "anthropic.com": 1.0,
    "deepmind.com": 1.0,
    "deepmind.google": 1.0,
    "ai.meta.com": 0.95,
    "ai.googleblog.com": 0.95,
    "blogs.microsoft.com": 0.9,
    "nvidia.com": 0.9,
    "huggingface.co": 0.9,
    "arxiv.org": 0.9,
    "mistral.ai": 0.85,
    "techcrunch.com": 0.7,
    "venturebeat.com": 0.7,
    "technologyreview.com": 0.75,
    "theverge.com": 0.65,
    "wired.com": 0.65,
    "github.com": 0.7,
}
_AUTHORITY_FLOOR = 0.4

# High-signal event vocabulary. Presence of these in a title/summary indicates a
# materially significant event rather than routine commentary.
_EVENT_KEYWORDS = (
    "launch", "release", "announce", "unveil", "introduc", "raises", "funding",
    "acquire", "acquisition", "ipo", "open-source", "open source", "open-weight",
    "breakthrough", "state-of-the-art", "sota", "benchmark", "outperform",
    "partnership", "regulation", "ban", "lawsuit",
)

# Significant named entities (models, labs, companies). Each distinct hit nudges
# entity_significance toward 1.0.
_ENTITIES = (
    "gpt", "claude", "gemini", "llama", "mistral", "deepseek", "qwen", "grok",
    "openai", "anthropic", "google", "deepmind", "meta", "microsoft", "nvidia",
    "hugging face", "huggingface", "mira", "altman", "agi",
)


def source_authority(domain: str) -> float:
    """0-1 trust/authority weight for the publishing domain."""
    domain = (domain or "").lower()
    for known, weight in _AUTHORITY.items():
        if domain == known or domain.endswith("." + known):
            return weight
    return _AUTHORITY_FLOOR


def engagement_norm(points: int, num_comments: int) -> float:
    """0-1 log-scaled audience engagement. ~1000 points saturates to 1.0."""
    raw = max(points, 0) + 1.5 * max(num_comments, 0)
    return min(math.log10(raw + 1) / 3.0, 1.0)


def citation_norm(citations: int) -> float:
    """0-1 log-scaled citation count. ~300 citations saturates to 1.0.

    For research papers (no HN-style points) this is the engagement analog: a
    well-cited paper is the scholarly equivalent of a highly-upvoted story.
    """
    return min(math.log10(max(citations, 0) + 1) / 2.5, 1.0)


def _keyword_score(text: str, vocab: tuple[str, ...], saturate_at: int) -> float:
    text = (text or "").lower()
    hits = sum(1 for kw in vocab if kw in text)
    return min(hits / saturate_at, 1.0)


def entity_significance(text: str) -> float:
    """0-1 based on distinct significant entities mentioned (3 hits -> 1.0)."""
    return _keyword_score(text, _ENTITIES, saturate_at=3)


def content_signal(text: str) -> float:
    """0-1 based on high-signal event vocabulary (2 hits -> 1.0)."""
    return _keyword_score(text, _EVENT_KEYWORDS, saturate_at=2)


@dataclass
class ScoreInput:
    domain: str
    points: int
    num_comments: int
    age_hours: float
    text: str               # title + summary, used for keyword/entity signals
    topic_momentum: float = 0.0  # 0-1, supplied by the batch-level pass
    citation_count: int = 0      # research papers; 0 for news


def impact_score(s: ScoreInput) -> float:
    """AI Impact Score (0-100) — significance, independent of recency.

    The "engagement" term takes the stronger of social engagement (news) and
    citation weight (papers), so one formula serves both content kinds.
    """
    engagement = max(
        engagement_norm(s.points, s.num_comments),
        citation_norm(s.citation_count),
    )
    score = (
        0.30 * source_authority(s.domain)
        + 0.30 * engagement
        + 0.20 * entity_significance(s.text)
        + 0.20 * content_signal(s.text)
    )
    return round(score * 100, 1)


def trend_score(s: ScoreInput) -> float:
    """AI Trend Score (0-100) — momentum / how fast it is rising now."""
    age = max(s.age_hours, 0.5)
    velocity = (s.points + 1.5 * s.num_comments) / age          # engagement per hour
    velocity_norm = min(math.log10(velocity + 1) / 2.0, 1.0)    # ~100/hr saturates
    recency_boost = math.exp(-age / 24.0)                       # 1.0 now -> ~0.37 at 24h
    score = (
        0.50 * velocity_norm
        + 0.30 * recency_boost
        + 0.20 * s.topic_momentum
    )
    return round(score * 100, 1)
