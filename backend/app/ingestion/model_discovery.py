"""Trending-model auto-detection from the live article feed.

Scans recent article titles/summaries for known AI-model name patterns and
tracks mention volume. A name crossing the mention threshold within the last
30 days and not already tracked gets auto-added as a trending model — this
supplements (doesn't replace) the hand-curated baseline index in the frontend.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AIModel, Article

# Expandable: each pattern should match a specific model name/family, not a
# generic word, so mention counts stay meaningful.
MODEL_PATTERNS: list[tuple[str, str]] = [
    (r"\bGPT-5(\.\d)?\b", "OpenAI"),
    (r"\bGPT-4\.5\b", "OpenAI"),
    (r"\bo4(-mini)?\b", "OpenAI"),
    (r"\bClaude (Opus|Sonnet|Haiku) ?4(\.\d)?\b", "Anthropic"),
    (r"\bClaude (Opus|Sonnet|Haiku) ?5\b", "Anthropic"),
    (r"\bGemini ?3(\.\d)?( Pro| Flash| Ultra)?\b", "Google DeepMind"),
    (r"\bGemini ?2\.5( Pro| Flash)?\b", "Google DeepMind"),
    (r"\bLlama ?4\b", "Meta AI"),
    (r"\bGrok ?[234]\b", "xAI"),
    (r"\bMistral (Large|Medium|Small) ?3?\b", "Mistral AI"),
    (r"\bQwen ?[23](\.\d)?\b", "Alibaba"),
    (r"\bDeepSeek[- ]?(V3|R1|R2)\b", "DeepSeek AI"),
    (r"\bCommand[- ]?R\+?\b", "Cohere"),
    (r"\bMixtral ?8x22B\b", "Mistral AI"),
    (r"\bPhi-4\b", "Microsoft AI"),
    (r"\bFirefunction[- ]?v2\b", "Fireworks AI"),
]

_COMPILED = [(re.compile(pat, re.IGNORECASE), maker) for pat, maker in MODEL_PATTERNS]

MENTION_THRESHOLD = 2  # distinct articles within 30d before we call it "trending"


def _slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def discover_trending_models(db: Session) -> dict:
    now = datetime.now()
    window_30d = now - timedelta(days=30)
    window_7d = now - timedelta(days=7)

    articles = list(
        db.scalars(select(Article).where(Article.published_at >= window_30d))
    )

    # name -> {"maker": str, "mentions_30d": set[int], "mentions_7d": set[int], "blurb": str, "topics": set}
    found: dict[str, dict] = {}
    for a in articles:
        haystack = f"{a.title} {a.summary_30s or ''}"
        for pattern, maker in _COMPILED:
            m = pattern.search(haystack)
            if not m:
                continue
            name = re.sub(r"\s+", " ", m.group(0)).strip()
            entry = found.setdefault(
                name, {"maker": maker, "mentions_30d": set(), "mentions_7d": set(), "blurb": a.summary_30s or a.title, "topics": set()}
            )
            entry["mentions_30d"].add(a.id)
            if a.published_at >= window_7d:
                entry["mentions_7d"].add(a.id)
            if a.topics:
                entry["topics"].update(a.topics)

    created, updated = 0, 0
    for name, info in found.items():
        if len(info["mentions_30d"]) < MENTION_THRESHOLD:
            continue
        slug = _slugify(name)
        row = db.scalar(select(AIModel).where(AIModel.slug == slug))
        if row is None:
            row = AIModel(
                slug=slug,
                name=name,
                maker=info["maker"],
                blurb=info["blurb"][:500],
                topics=sorted(info["topics"]),
                mention_count_7d=len(info["mentions_7d"]),
                mention_count_30d=len(info["mentions_30d"]),
                is_trending=True,
                first_seen_at=now,
                last_seen_at=now,
            )
            db.add(row)
            created += 1
        else:
            row.mention_count_7d = len(info["mentions_7d"])
            row.mention_count_30d = len(info["mentions_30d"])
            row.last_seen_at = now
            updated += 1

    db.commit()
    return {"scanned_articles": len(articles), "created": created, "updated": updated}
