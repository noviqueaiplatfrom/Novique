"""Ingestion pipeline orchestrator.

    Fetch -> Clean -> Deduplicate -> AI Summarize -> Tag Topics
          -> Calculate Impact + Trend Score -> Store

In production this runs on a Celery beat schedule (breaking news every 5 min,
etc.). For the slice it is a plain callable invoked by `seed.py` or the
`POST /api/ingest` endpoint.
"""
from __future__ import annotations

from collections import Counter
from collections.abc import Callable, Sequence
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ingestion.clean import clean_items
from app.ingestion.crawler import RawItem, fetch_arxiv, fetch_hacker_news, fetch_reddit
from app.ingestion.enrich import enrich_citations
from app.ingestion.summarize import summarize
from app.models import Article
from app.scoring import ScoreInput, impact_score, trend_score

# Default source set for a full cycle. Celery tasks pass a subset to run each
# source on its own cadence (see app/tasks.py).
DEFAULT_SOURCES: tuple[Callable[[], list[RawItem]], ...] = (
    fetch_hacker_news,
    fetch_reddit,
    fetch_arxiv,
)


def _age_hours(published_at: datetime) -> float:
    now = datetime.now(timezone.utc)
    return max((now - published_at).total_seconds() / 3600.0, 0.0)


def _fetch(fetchers: Sequence[Callable[[], list[RawItem]]]) -> list[RawItem]:
    """Fan out across the given sources, tolerating per-source failures."""
    items: list[RawItem] = []
    for fetch in fetchers:
        try:
            items.extend(fetch())
        except Exception as exc:  # one bad source must not sink the whole run
            print(f"[ingest] source {fetch.__name__} failed: {exc}")
    return items


def run_pipeline(
    db: Session,
    fetchers: Sequence[Callable[[], list[RawItem]]] | None = None,
) -> dict:
    """Run one ingestion cycle for the given sources (default: all). Returns a summary."""
    raw = _fetch(fetchers or DEFAULT_SOURCES)
    enrich_citations(raw)  # adds Semantic Scholar citation counts to paper items
    cleaned = clean_items(raw)

    # Summarize first so topic tags are available for the batch-level
    # topic-momentum signal used by the Trend Score.
    enriched = []
    for item, domain, key in cleaned:
        explainer, summarized_by = summarize(item, domain)
        enriched.append((item, domain, key, explainer, summarized_by))

    # Topic momentum: how concentrated each item's topics are across the batch.
    topic_counts: Counter[str] = Counter()
    for _, _, _, ex, _ in enriched:
        topic_counts.update(t.lower() for t in ex.topics)
    max_topic = max(topic_counts.values()) if topic_counts else 1

    created, updated = 0, 0
    for item, domain, key, ex, summarized_by in enriched:
        abstract = (item.content or "")[:500]
        text = f"{item.title} {ex.summary_30s} {abstract} {' '.join(ex.topics)}"
        momentum = (
            max((topic_counts[t.lower()] for t in ex.topics), default=1) / max_topic
        )
        si = ScoreInput(
            domain=domain,
            points=item.points,
            num_comments=item.num_comments,
            age_hours=_age_hours(item.published_at),
            text=text,
            topic_momentum=momentum,
            citation_count=item.citation_count,
        )
        impact = impact_score(si)
        trend = trend_score(si)

        existing = db.scalar(select(Article).where(Article.dedupe_key == key))
        if existing is None:
            db.add(
                Article(
                    title=item.title,
                    url=item.url,
                    source=item.source,
                    kind=item.kind,
                    domain=domain,
                    author=item.author,
                    published_at=item.published_at,
                    dedupe_key=key,
                    points=item.points,
                    num_comments=item.num_comments,
                    citation_count=item.citation_count,
                    summary_30s=ex.summary_30s,
                    why_it_matters=ex.why_it_matters,
                    who_is_impacted=ex.who_is_impacted,
                    what_changed=ex.what_changed,
                    what_to_watch=ex.what_to_watch,
                    key_takeaways=ex.key_takeaways,
                    topics=ex.topics,
                    sentiment=ex.sentiment,
                    summarized_by=summarized_by,
                    impact_score=impact,
                    trend_score=trend,
                )
            )
            created += 1
        else:
            # Refresh volatile signals (engagement + citations + scores) on re-ingest.
            existing.points = item.points
            existing.num_comments = item.num_comments
            existing.citation_count = item.citation_count
            existing.impact_score = impact
            existing.trend_score = trend
            updated += 1

    db.commit()
    return {"fetched": len(raw), "cleaned": len(cleaned), "created": created, "updated": updated}


def recompute_all_scores(db: Session) -> dict:
    """Re-score every stored article from its persisted signals.

    The hourly "trend analysis" job: Trend Score depends on article age, so it
    must be refreshed even when no new content arrives. Impact is recomputed too
    (cheap, and citation counts may have moved).
    """
    rows = db.scalars(select(Article)).all()

    topic_counts: Counter[str] = Counter()
    for a in rows:
        topic_counts.update(t.lower() for t in (a.topics or []))
    max_topic = max(topic_counts.values()) if topic_counts else 1

    for a in rows:
        text = f"{a.title} {a.summary_30s or ''} {' '.join(a.topics or [])}"
        momentum = (
            max((topic_counts[t.lower()] for t in (a.topics or [])), default=1) / max_topic
        )
        si = ScoreInput(
            domain=a.domain,
            points=a.points,
            num_comments=a.num_comments,
            age_hours=_age_hours(a.published_at),
            text=text,
            topic_momentum=momentum,
            citation_count=a.citation_count or 0,
        )
        a.impact_score = impact_score(si)
        a.trend_score = trend_score(si)

    db.commit()
    return {"rescored": len(rows)}
