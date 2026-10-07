"""Celery tasks — the scheduled ingestion + scoring jobs.

Each task owns its own DB session. Sources run on independent cadences (see
celery_app.py), which is exactly what the multi-source pipeline contract buys us:
the same `run_pipeline` runs against any subset of sources.
"""
from app.celery_app import celery_app
from app.database import SessionLocal
from app.ingestion.crawler import (
    fetch_arxiv,
    fetch_devto,
    fetch_github_trending,
    fetch_hacker_news,
    fetch_reddit,
    fetch_rss_feeds,
)
from app.ingestion.model_discovery import discover_trending_models
from app.ingestion.pipeline import recompute_all_scores, run_pipeline
from app.ingestion.report_gen import generate_weekly_report


@celery_app.task(name="app.tasks.ingest_news")
def ingest_news() -> dict:
    """News cadence — all fast-moving sources (HN, Reddit, RSS feeds, Dev.to, GitHub)."""
    db = SessionLocal()
    try:
        return run_pipeline(
            db,
            fetchers=[
                fetch_hacker_news,
                fetch_reddit,
                fetch_rss_feeds,
                fetch_devto,
                fetch_github_trending,
            ],
        )
    finally:
        db.close()


@celery_app.task(name="app.tasks.ingest_papers")
def ingest_papers() -> dict:
    db = SessionLocal()
    try:
        return run_pipeline(db, fetchers=[fetch_arxiv])
    finally:
        db.close()


@celery_app.task(name="app.tasks.recompute_scores")
def recompute_scores() -> dict:
    db = SessionLocal()
    try:
        return recompute_all_scores(db)
    finally:
        db.close()


@celery_app.task(name="app.tasks.refresh_weekly_report")
def refresh_weekly_report() -> dict:
    """Upserts the current week's report from the last 7 days — runs daily so
    the Reports page never goes stale, even though reports are weekly-scoped."""
    db = SessionLocal()
    try:
        report = generate_weekly_report(db)
        return {"slug": report.slug, "signal_count": report.signal_count}
    finally:
        db.close()


@celery_app.task(name="app.tasks.discover_models")
def discover_models() -> dict:
    db = SessionLocal()
    try:
        return discover_trending_models(db)
    finally:
        db.close()
