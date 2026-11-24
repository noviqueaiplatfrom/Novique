"""SQLAlchemy engine, session factory, and declarative base.

For the vertical slice we use `Base.metadata.create_all()` (see main.py /
seed.py) instead of Alembic migrations. Alembic comes in the scaffold phase
once the schema stabilizes across all modules.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

_DEFAULT_URL = "postgresql+psycopg2://novique:novique@localhost:5432/novique"


def _normalize_db_url(url: str | None) -> str:
    """Accept whatever connection string the host hands us.

    Render, Neon, Supabase, Heroku etc. all emit `postgres://` or
    `postgresql://` URLs; SQLAlchemy 2.x rejects the `postgres://` scheme
    outright, which would crash the app at import time. An empty value
    (e.g. a dashboard env var that was never filled in) falls back to the
    local default so the API still boots and can report the DB as down via
    /api/status instead of never binding its port.
    """
    url = (url or "").strip()
    if not url:
        return _DEFAULT_URL
    if url.startswith("postgres://"):
        return "postgresql+psycopg2://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg2://" + url[len("postgresql://"):]
    return url


DATABASE_URL = _normalize_db_url(settings.database_url)
IS_POSTGRES = DATABASE_URL.startswith("postgresql")

# Fail fast when the DB is unreachable: without connect_timeout psycopg2 waits
# on the OS TCP timeout (minutes), so every request (including /api/status)
# would hang instead of reporting "database unreachable".
_connect_args: dict = {"connect_timeout": 10} if IS_POSTGRES else {}
if DATABASE_URL.startswith("sqlite"):
    _connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a request-scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_migrations() -> None:
    """Run lightweight schema changes for Google OAuth support."""
    from sqlalchemy import text
    
    # Make hashed_password nullable
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;"))
            print("[migration] hashed_password made nullable")
    except Exception as e:
        print(f"[migration] hashed_password alter skipped/failed: {e}")
    
    # Add google_sub
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN google_sub VARCHAR(256) UNIQUE;"))
            print("[migration] google_sub added")
    except Exception as e:
        print(f"[migration] google_sub add skipped: {e}")
        
    # Add name
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR(256);"))
            print("[migration] name added")
    except Exception as e:
        print(f"[migration] name add skipped: {e}")
        
    # Add picture
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN picture VARCHAR(512);"))
            print("[migration] picture added")
    except Exception as e:
        print(f"[migration] picture add skipped: {e}")

    # Add what_changed (Explainer Engine: "what changed compared with before")
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE articles ADD COLUMN what_changed TEXT;"))
            print("[migration] what_changed added")
    except Exception as e:
        print(f"[migration] what_changed add skipped: {e}")

    # Index ingestion time: /api/status counts "new in the last hour/24h" on it.
    try:
        with engine.begin() as conn:
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_articles_created_at ON articles (created_at);"))
    except Exception as e:
        print(f"[migration] ix_articles_created_at skipped: {e}")
