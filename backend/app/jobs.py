"""Pipeline job registry + the single runner every scheduler goes through.

`run_job(name)` is used by the in-process scheduler (app/scheduler.py), the
optional Celery tasks (app/tasks.py), and the manual POST /api/ingest hook.
It:

  1. takes a per-job lock (a Postgres advisory lock, plus a thread lock) so
     two runners never execute the same job at once, e.g. the old and new
     instance overlapping during a Render deploy, or the scheduler plus a
     Celery worker;
  2. records the run in `ingest_runs` (start, finish, counts, error), which
     is what /api/status reads to report real pipeline freshness.
"""
from __future__ import annotations

import threading
import traceback
import zlib
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import IS_POSTGRES, SessionLocal, engine
from app.models import IngestRun

# Keep a week of run history; enough for status + debugging, small table.
_RUN_RETENTION = timedelta(days=7)


def _news(db: Session) -> dict:
    from app.ingestion.crawler import (
        fetch_devto,
        fetch_github_trending,
        fetch_hacker_news,
        fetch_reddit,
        fetch_rss_feeds,
    )
    from app.ingestion.pipeline import run_pipeline

    return run_pipeline(
        db,
        fetchers=[fetch_hacker_news, fetch_reddit, fetch_rss_feeds, fetch_devto, fetch_github_trending],
    )


def _papers(db: Session) -> dict:
    from app.ingestion.crawler import fetch_arxiv
    from app.ingestion.pipeline import run_pipeline

    return run_pipeline(db, fetchers=[fetch_arxiv])


def _rescore(db: Session) -> dict:
    from app.ingestion.pipeline import recompute_all_scores

    result = recompute_all_scores(db)
    return {"updated": result.get("rescored", 0)}


def _report(db: Session) -> dict:
    from app.ingestion.report_gen import generate_weekly_report

    report = generate_weekly_report(db)
    return {"slug": report.slug, "updated": 1, "fetched": report.signal_count}


def _models(db: Session) -> dict:
    from app.ingestion.model_discovery import discover_trending_models

    result = discover_trending_models(db)
    return {
        "fetched": result.get("scanned_articles", 0),
        "created": result.get("created", 0),
        "updated": result.get("updated", 0),
    }


@dataclass(frozen=True)
class Job:
    name: str
    interval_seconds: int
    run: Callable[[Session], dict]


# Order matters: it is the order jobs fire in on boot (news first, so a
# cold-started instance refreshes the live feed before anything else).
JOBS: dict[str, Job] = {
    "news": Job("news", settings.news_interval_seconds, _news),
    "papers": Job("papers", settings.papers_interval_seconds, _papers),
    "models": Job("models", settings.models_interval_seconds, _models),
    "report": Job("report", settings.report_interval_seconds, _report),
    "rescore": Job("rescore", settings.rescore_interval_seconds, _rescore),
}

_thread_locks: dict[str, threading.Lock] = {name: threading.Lock() for name in JOBS}


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@contextmanager
def _job_lock(name: str) -> Iterator[bool]:
    """Yield True if this process now exclusively owns `name`, else False."""
    local = _thread_locks[name]
    if not local.acquire(blocking=False):
        yield False
        return
    try:
        if not IS_POSTGRES:
            yield True
            return
        key = zlib.crc32(f"novique-job:{name}".encode())
        with engine.connect() as conn:
            got = conn.execute(text("SELECT pg_try_advisory_lock(:k)"), {"k": key}).scalar()
            if not got:
                yield False
                return
            try:
                yield True
            finally:
                try:
                    conn.execute(text("SELECT pg_advisory_unlock(:k)"), {"k": key})
                except Exception as exc:  # connection dropped: server already released it
                    print(f"[jobs] advisory unlock for {name} failed: {exc}")
    finally:
        local.release()


def run_job(name: str) -> dict:
    """Run one job by name, recording it in ingest_runs. Never raises for job errors."""
    job = JOBS[name]
    with _job_lock(name) as acquired:
        if not acquired:
            return {"job": name, "skipped": "already running"}

        db = SessionLocal()
        run = IngestRun(job=name, status="running", started_at=_utcnow())
        try:
            db.add(run)
            db.commit()
        except Exception as exc:
            # DB unreachable: nothing to record into, and no job can run anyway.
            db.rollback()
            db.close()
            print(f"[jobs] {name}: cannot start, database unavailable: {exc}")
            return {"job": name, "error": f"database unavailable: {exc}"}

        # Plain locals, not `run.*`: the ORM object expires on commit and is
        # detached after close, so reading it afterwards would raise.
        result: dict = {}
        status = "ok"
        try:
            result = job.run(db) or {}
            run.fetched = int(result.get("fetched", 0) or 0)
            run.created = int(result.get("created", 0) or 0)
            run.updated = int(result.get("updated", 0) or 0)
            sources = result.get("sources")
            if sources:
                run.sources = sources
                # A cycle where every attempted source failed ingested nothing;
                # recording it as "ok" would make the status card claim "Live".
                if not any(v == "ok" for v in sources.values()):
                    status = "error"
                    run.error = "No source responded this cycle (failing or in backoff)."
        except Exception as exc:
            db.rollback()
            traceback.print_exc()
            status = "error"
            run.error = f"{type(exc).__name__}: {exc}"[:2000]
            result = {"error": run.error}
        finally:
            run.status = status
            run.finished_at = _utcnow()
            try:
                db.add(run)
                db.execute(delete(IngestRun).where(IngestRun.started_at < _utcnow() - _RUN_RETENTION))
                db.commit()
            except Exception as exc:
                db.rollback()
                print(f"[jobs] {name}: could not record run: {exc}")
            db.close()

        print(f"[jobs] {name}: {status} {result}")
        return {"job": name, "status": status, **result}
