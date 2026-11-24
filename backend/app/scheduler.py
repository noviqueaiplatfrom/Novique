"""In-process pipeline scheduler: the production ingestion scheduler.

Replaces the Celery worker + beat that used to be backgrounded with `&`
inside the Render web container. That setup failed silently in ways the
homepage's "Active briefing status" could never see:

  - if the worker died, nothing restarted it, and the API kept serving an
    ever-staler feed while the UI still said "Live";
  - Celery's prefork pool forks one child per *host* CPU, competing with
    uvicorn for memory on a 512 MB free instance;
  - no run was ever recorded, so freshness could only be guessed from
    article publish dates.

This runs as a daemon thread inside the uvicorn process, so if the API is
up, ingestion is running. On boot it resumes each job's cadence from the
last successful run recorded in `ingest_runs` (anything overdue, including
the 60s news job after a cold start, fires immediately), then runs each job
on its interval. Every run goes through app.jobs.run_job, which locks per
job and records the run.
"""
from __future__ import annotations

import threading
import time
from datetime import datetime, timezone

from sqlalchemy import func, select

from app.database import SessionLocal
from app.jobs import JOBS, run_job
from app.models import IngestRun

_TICK_SECONDS = 1.0
# If the database is down, retry this often instead of each job's full interval.
_DB_RETRY_SECONDS = 30.0


def _epoch(dt: datetime | None) -> float | None:
    if dt is None:
        return None
    if dt.tzinfo is None:  # SQLite hands back naive datetimes; stored as UTC
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.timestamp()


class Scheduler:
    def __init__(self) -> None:
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._next_due: dict[str, float] = {}
        self._initialized = False
        self.started_at: float | None = None
        self.current_job: str | None = None
        self.db_ready = False
        self.db_error: str | None = None

    # -- lifecycle ---------------------------------------------------------
    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self.started_at = time.time()
        self._thread = threading.Thread(target=self._loop, name="novique-scheduler", daemon=True)
        self._thread.start()
        print("[scheduler] started")

    def stop(self) -> None:
        self._stop.set()

    @property
    def running(self) -> bool:
        return bool(self._thread and self._thread.is_alive())

    def next_due(self, job: str) -> float | None:
        return self._next_due.get(job)

    # -- internals ---------------------------------------------------------
    def ensure_db(self) -> bool:
        """Create tables / run migrations once the DB is reachable."""
        if self.db_ready:
            return True
        from app.database import Base, engine, run_migrations

        try:
            Base.metadata.create_all(bind=engine)
            run_migrations()
        except Exception as exc:
            self.db_error = f"{type(exc).__name__}: {exc}"[:500]
            print(f"[scheduler] database not ready: {self.db_error}")
            return False
        self.db_ready, self.db_error = True, None
        return True

    def _seed_schedule(self) -> None:
        """Resume each job's cadence from its last successful recorded run."""
        now = time.time()
        last_ok: dict[str, float] = {}
        try:
            with SessionLocal() as db:
                rows = db.execute(
                    select(IngestRun.job, func.max(IngestRun.finished_at))
                    .where(IngestRun.status == "ok")
                    .group_by(IngestRun.job)
                ).all()
            last_ok = {job: ts for job, finished in rows if (ts := _epoch(finished)) is not None}
        except Exception as exc:
            print(f"[scheduler] could not read run history, running everything now: {exc}")
        # Small stagger so boot isn't one burst, in JOBS order (news first).
        for i, (name, job) in enumerate(JOBS.items()):
            due = last_ok[name] + job.interval_seconds if name in last_ok else now
            self._next_due[name] = max(due, now + i * 2)
        self._initialized = True

    def _loop(self) -> None:
        while not self._stop.is_set():
            if not self.ensure_db():
                self._stop.wait(_DB_RETRY_SECONDS)
                continue
            if not self._initialized:
                self._seed_schedule()

            now = time.time()
            for name in [n for n, t in sorted(self._next_due.items(), key=lambda kv: kv[1]) if t <= now]:
                if self._stop.is_set():
                    break
                self.current_job = name
                try:
                    result = run_job(name)
                except Exception as exc:  # run_job shouldn't raise; never let the loop die
                    print(f"[scheduler] {name} crashed: {exc}")
                    result = {"error": str(exc)}
                finally:
                    self.current_job = None
                failed_on_db = str(result.get("error", "")).startswith("database unavailable")
                if failed_on_db:
                    self.db_ready = False  # re-check (and re-create tables) on the next tick
                delay = _DB_RETRY_SECONDS if failed_on_db else JOBS[name].interval_seconds
                self._next_due[name] = time.time() + delay
            self._stop.wait(_TICK_SECONDS)


scheduler = Scheduler()
