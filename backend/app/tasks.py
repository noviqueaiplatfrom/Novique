"""Celery tasks: optional alternative runner for the scheduled pipeline jobs.

Production does NOT use these: the in-process scheduler (app/scheduler.py)
runs the same jobs inside the API process. Use Celery only if ingestion ever
needs its own dedicated worker (then set SCHEDULER_ENABLED=false on the API,
or each job runs on both cadences). Either way every run goes through
app.jobs.run_job, so it is locked per job and recorded in ingest_runs.
"""
from app.celery_app import celery_app
from app.jobs import run_job


@celery_app.task(name="app.tasks.ingest_news")
def ingest_news() -> dict:
    """News cadence: all fast-moving sources (HN, Reddit, RSS feeds, Dev.to, GitHub)."""
    return run_job("news")


@celery_app.task(name="app.tasks.ingest_papers")
def ingest_papers() -> dict:
    return run_job("papers")


@celery_app.task(name="app.tasks.recompute_scores")
def recompute_scores() -> dict:
    return run_job("rescore")


@celery_app.task(name="app.tasks.refresh_weekly_report")
def refresh_weekly_report() -> dict:
    """Upserts the current week's report from the last 7 days, daily, so the
    Reports page never goes stale even though reports are weekly-scoped."""
    return run_job("report")


@celery_app.task(name="app.tasks.discover_models")
def discover_models() -> dict:
    return run_job("models")
