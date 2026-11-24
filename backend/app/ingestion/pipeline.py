"""Ingestion pipeline orchestrator.

    Fetch -> Clean -> Deduplicate -> AI Summarize -> Tag Topics
          -> Calculate Impact + Trend Score -> Store

In production this is driven by the in-process scheduler (app/scheduler.py)
through app/jobs.py, which records every run in `ingest_runs`. It is still a
plain callable, so `seed.py`, Celery tasks, and `POST /api/ingest` reuse it.
"""
from __future__ import annotations

import time
from collections import Counter
from collections.abc import Callable, Sequence
from concurrent.futures import ThreadPoolExecutor
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
    if published_at.tzinfo is None:  # SQLite returns naive datetimes (stored as UTC)
        published_at = published_at.replace(tzinfo=timezone.utc)
    return max((now - published_at).total_seconds() / 3600.0, 0.0)


SOURCE_LABELS: dict[str, str] = {
    "fetch_hacker_news": "Hacker News",
    "fetch_reddit": "Reddit",
    "fetch_rss_feeds": "News RSS",
    "fetch_devto": "Dev.to",
    "fetch_github_trending": "GitHub",
    "fetch_arxiv": "arXiv",
}

# Per-source exponential backoff (process-local): a source that keeps failing
# (e.g. Reddit returning 403 to unauthenticated clients) is retried at 1, 2,
# 4 ... up to 30 minutes instead of being hammered every 60s cycle.
_MAX_BACKOFF_S = 1800
_backoff: dict[str, tuple[int, float]] = {}


def _fetch(fetchers: Sequence[Callable[[], list[RawItem]]]) -> tuple[list[RawItem], dict[str, str]]:
    """Fan out across sources in parallel, tolerating per-source failures.

    Returns (items, health) where health maps a source label to "ok",
    "backoff", or "error: ...". Items keep the given fetcher order, so
    cross-posted links dedupe to the same source every run.
    """
    now = time.time()
    health: dict[str, str] = {}
    active = []
    for fetch in fetchers:
        label = SOURCE_LABELS.get(fetch.__name__, fetch.__name__)
        if _backoff.get(fetch.__name__, (0, 0.0))[1] > now:
            health[label] = "backoff"
        else:
            active.append(fetch)

    results: dict[str, list[RawItem]] = {}
    with ThreadPoolExecutor(max_workers=max(len(active), 1)) as pool:
        futures = {fetch.__name__: pool.submit(fetch) for fetch in active}
    for name, fut in futures.items():
        label = SOURCE_LABELS.get(name, name)
        try:
            results[name] = fut.result()
            health[label] = "ok"
            _backoff.pop(name, None)
        except Exception as exc:  # one bad source must not sink the whole run
            fails = _backoff.get(name, (0, 0.0))[0] + 1
            _backoff[name] = (fails, time.time() + min(60 * 2 ** (fails - 1), _MAX_BACKOFF_S))
            health[label] = f"error: {exc}"[:200]
            print(f"[ingest] source {name} failed: {exc}")

    items = [item for fetch in fetchers for item in results.get(fetch.__name__, [])]
    return items, health


def run_pipeline(
    db: Session,
    fetchers: Sequence[Callable[[], list[RawItem]]] | None = None,
) -> dict:
    """Run one ingestion cycle for the given sources (default: all). Returns a summary."""
    raw, source_health = _fetch(fetchers or DEFAULT_SOURCES)
    enrich_citations(raw)  # adds Semantic Scholar citation counts to paper items
    cleaned = clean_items(raw)

    # One query to find which items are already stored, so only genuinely new
    # items go through the explainer. Most of every news batch is items we
    # already have; re-summarizing them each cycle (one LLM call apiece when an
    # API key is set) made a 60s cycle take minutes, so runs overlapped and the
    # feed fell behind. Already-stored items reuse their saved topics.
    keys = [key for _, _, key in cleaned]
    existing_by_key: dict[str, Article] = (
        {a.dedupe_key: a for a in db.scalars(select(Article).where(Article.dedupe_key.in_(keys)))}
        if keys
        else {}
    )

    # Summarize first so topic tags are available for the batch-level
    # topic-momentum signal used by the Trend Score.
    enriched = []
    for item, domain, key in cleaned:
        existing = existing_by_key.get(key)
        if existing is None:
            explainer, summarized_by = summarize(item, domain)
            topics, summary = explainer.topics, explainer.summary_30s
        else:
            explainer, summarized_by = None, None
            topics, summary = existing.topics or [], existing.summary_30s or ""
        enriched.append((item, domain, key, existing, explainer, summarized_by, topics, summary))

    # Topic momentum: how concentrated each item's topics are across the batch.
    topic_counts: Counter[str] = Counter()
    for *_, topics, _ in enriched:
        topic_counts.update(t.lower() for t in topics)
    max_topic = max(topic_counts.values()) if topic_counts else 1

    created, updated = 0, 0
    for item, domain, key, existing, ex, summarized_by, topics, summary in enriched:
        abstract = (item.content or "")[:500]
        text = f"{item.title} {summary} {abstract} {' '.join(topics)}"
        momentum = (
            max((topic_counts[t.lower()] for t in topics), default=1) / max_topic
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
    return {
        "fetched": len(raw),
        "cleaned": len(cleaned),
        "created": created,
        "updated": updated,
        "sources": source_health,
    }


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
