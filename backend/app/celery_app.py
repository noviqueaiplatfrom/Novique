"""Celery application + beat schedule.

Implements the spec's tiered ingestion cadences. Run a single worker with an
embedded beat scheduler:

    celery -A app.celery_app worker --beat --loglevel=info
"""
from celery import Celery

from app.config import settings

celery_app = Celery(
    "aipulse",
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
            "schedule": 60.0,
        },
        # Research papers — every 30 minutes.
        "ingest-papers-every-30-min": {
            "task": "app.tasks.ingest_papers",
            "schedule": 1800.0,
        },
        # Trend analysis — re-score the corpus hourly so Trend Score reflects
        # current article age (Trend decays over time; Impact does not).
        "recompute-scores-hourly": {
            "task": "app.tasks.recompute_scores",
            "schedule": 3600.0,
        },
    },
)
