"""Ensure DB tables exist before the Celery worker starts processing.

The worker can boot before the API has run its create_all, so we retry while
Postgres comes up. Replaced by Alembic migrations in the scaffold phase.
"""
import time

from sqlalchemy.exc import OperationalError

from app import models  # noqa: F401  (register models on Base)
from app.database import Base, engine


def ensure_tables(retries: int = 15, delay: float = 2.0) -> None:
    for attempt in range(retries):
        try:
            Base.metadata.create_all(bind=engine)
            from app.database import run_migrations
            run_migrations()
            print("[bootstrap] tables ready")
            return
        except OperationalError:
            print(f"[bootstrap] DB not ready (attempt {attempt + 1}/{retries})…")
            time.sleep(delay)
    # Final attempt — let the error surface if the DB is genuinely unreachable.
    Base.metadata.create_all(bind=engine)
    from app.database import run_migrations
    run_migrations()


if __name__ == "__main__":
    ensure_tables()
