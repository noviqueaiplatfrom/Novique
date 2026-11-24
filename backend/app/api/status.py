"""Pipeline status: what the homepage "Active briefing status" card shows.

Everything here is measured, not inferred: when the news job last actually
completed (from `ingest_runs`), how many articles were genuinely *ingested*
recently (by `created_at`, not source publish time), and whether the
scheduler and database are up. Deliberately does not use the get_db
dependency, so an unreachable database yields a clear "offline" answer
instead of a 500.
"""
from __future__ import annotations

import time
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Response
from sqlalchemy import func, select

from app.config import settings
from app.database import SessionLocal
from app.models import Article, IngestRun
from app.schemas import JobRunOut, StatusOut
from app.scheduler import scheduler

router = APIRouter(prefix="/api", tags=["status"])

# A boot-time grace window: right after a cold start the first cycle is
# still running, which is "starting", not "stalled".
_STARTUP_GRACE_SECONDS = 180
_DELAYED_AFTER_SECONDS = 30 * 60


def _aware(dt: datetime | None) -> datetime | None:
    """SQLite returns naive datetimes (stored as UTC); make every value explicit
    UTC so the browser doesn't parse them as local time."""
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


@router.get("/status", response_model=StatusOut)
def get_status(response: Response) -> StatusOut:
    response.headers["Cache-Control"] = "no-store"
    now = datetime.now(timezone.utc)
    interval = settings.news_interval_seconds
    next_due = scheduler.next_due("news")
    uptime = time.time() - scheduler.started_at if scheduler.started_at else None

    base = dict(
        server_time=now,
        scheduler_running=scheduler.running,
        running_job=scheduler.current_job,
        news_interval_seconds=interval,
        next_run_at=datetime.fromtimestamp(next_due, timezone.utc) if next_due else None,
    )

    try:
        with SessionLocal() as db:
            # Most recent *finished* news cycle (an in-flight one is reported
            # via running_job), so its counts and per-source health are final.
            last_run = db.scalar(
                select(IngestRun)
                .where(IngestRun.job == "news", IngestRun.finished_at.is_not(None))
                .order_by(IngestRun.finished_at.desc())
                .limit(1)
            )
            last_success_at = _aware(
                db.scalar(
                    select(func.max(IngestRun.finished_at)).where(
                        IngestRun.job == "news", IngestRun.status == "ok"
                    )
                )
            )
            total_articles = db.scalar(select(func.count(Article.id))) or 0
            total_sources = db.scalar(select(func.count(func.distinct(Article.source)))) or 0
            new_last_hour = (
                db.scalar(select(func.count(Article.id)).where(Article.created_at >= now - timedelta(hours=1))) or 0
            )
            new_last_24h = (
                db.scalar(select(func.count(Article.id)).where(Article.created_at >= now - timedelta(hours=24))) or 0
            )
            latest_ingested_at = _aware(db.scalar(select(func.max(Article.created_at))))
            latest_published_at = _aware(db.scalar(select(func.max(Article.published_at))))
            last_run_out = None
            if last_run is not None:
                last_run_out = JobRunOut.model_validate(last_run)
                last_run_out.started_at = _aware(last_run_out.started_at)
                last_run_out.finished_at = _aware(last_run_out.finished_at)
    except Exception as exc:
        print(f"[status] database unreachable: {exc}")
        return StatusOut(
            **base,
            state="offline",
            message="The pipeline database is unreachable, so no new intelligence can be ingested right now.",
            database="unreachable",
            last_run=None,
            last_success_at=None,
            total_articles=0,
            total_sources=0,
            new_last_hour=0,
            new_last_24h=0,
            latest_ingested_at=None,
            latest_published_at=None,
        )

    age = (now - last_success_at).total_seconds() if last_success_at else None
    live_window = max(3 * interval, 180)
    if age is not None and age <= live_window:
        state, message = "live", "Pipeline is ingesting on schedule."
    elif uptime is not None and uptime <= _STARTUP_GRACE_SECONDS:
        state, message = "starting", "Pipeline just woke up and is running its first refresh."
    elif age is not None and age <= _DELAYED_AFTER_SECONDS:
        state, message = "delayed", "The latest ingest cycle is running behind schedule."
    elif not scheduler.running and settings.scheduler_enabled:
        state, message = "stalled", "The ingest scheduler is not running."
    else:
        state, message = "stalled", "No successful ingest cycle in the last 30 minutes."
    if state != "live" and last_run_out is not None and last_run_out.status == "error":
        message += " Last cycle failed; it will retry automatically."

    return StatusOut(
        **base,
        state=state,
        message=message,
        database="ok",
        last_run=last_run_out,
        last_success_at=last_success_at,
        total_articles=total_articles,
        total_sources=total_sources,
        new_last_hour=new_last_hour,
        new_last_24h=new_last_24h,
        latest_ingested_at=latest_ingested_at,
        latest_published_at=latest_published_at,
    )
