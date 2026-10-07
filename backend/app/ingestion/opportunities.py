"""Weekly counts of articles tagged with 'opportunity' topics (Hiring, Funding,
Agents, Developer Tools, Robotics, Voice AI, Generative Media, Knowledge & RAG).

This is an honest proxy, not a global economic measure: it reflects what
Novique's own tracked sources are reporting, not all AI activity worldwide.
"""
from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Article

OPPORTUNITY_TOPICS = [
    "Hiring",
    "Funding",
    "Agents",
    "Developer Tools",
    "Robotics",
    "Voice AI",
    "Generative Media",
    "Knowledge & RAG",
]


def weekly_opportunity_signals(db: Session, weeks: int = 8) -> dict:
    now = datetime.now()
    window_start = now - timedelta(weeks=weeks)
    articles = list(
        db.scalars(select(Article).where(Article.published_at >= window_start))
    )

    buckets: dict[str, dict[str, int]] = {}
    for a in articles:
        if not a.topics:
            continue
        year, week, _ = a.published_at.isocalendar()
        key = f"{year}-W{week:02d}"
        bucket = buckets.setdefault(key, {t: 0 for t in OPPORTUNITY_TOPICS})
        for t in a.topics:
            if t in bucket:
                bucket[t] += 1

    ordered_keys = sorted(buckets.keys())[-weeks:]
    series = [{"week": k, **buckets[k]} for k in ordered_keys]
    totals = {t: sum(b.get(t, 0) for b in buckets.values()) for t in OPPORTUNITY_TOPICS}

    return {
        "weeks": series,
        "totals": totals,
        "topics": OPPORTUNITY_TOPICS,
        "source_article_count": len(articles),
    }
