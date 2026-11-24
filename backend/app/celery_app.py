"""Celery application + beat schedule (OPTIONAL runner, not used in production).

Production runs these same jobs via the in-process scheduler (app/scheduler.py).
To use a dedicated worker instead, set SCHEDULER_ENABLED=false on the API and run:

    celery -A app.celery_app worker --beat --loglevel=info

Cadences come from the same settings as the in-process scheduler.
"""
from celery import Celery

from app.config import settings

celery_app = Celery(
    "novique",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks"],
)

celery_app.conf.update(
    timezone="UTC",
    task_acks_late=True,
    worker_max_tasks_per_child=200,
    beat_schedule={
        # Breaking news — every 60 seconds.
        "ingest-news-every-60-sec": {
            "task": "app.tasks.ingest_news",
            "schedule": float(settings.news_interval_seconds),
        },
        # Research papers — every 30 minutes.
        "ingest-papers-every-30-min": {
            "task": "app.tasks.ingest_papers",
            "schedule": float(settings.papers_interval_seconds),
        },
        # Trend analysis — re-score the corpus hourly so Trend Score reflects
        # current article age (Trend decays over time; Impact does not).
        "recompute-scores-hourly": {
            "task": "app.tasks.recompute_scores",
            "schedule": float(settings.rescore_interval_seconds),
        },
        # Weekly Reports page — refresh the in-progress week's report daily
        # from a rolling 7-day window so it never goes stale.
        "refresh-weekly-report-daily": {
            "task": "app.tasks.refresh_weekly_report",
            "schedule": float(settings.report_interval_seconds),
        },
        # Trending-model discovery — scan the feed for rising model mentions.
        "discover-models-every-6h": {
            "task": "app.tasks.discover_models",
            "schedule": float(settings.models_interval_seconds),
        },
    },
)
