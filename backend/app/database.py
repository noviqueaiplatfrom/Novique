"""SQLAlchemy engine, session factory, and declarative base.

For the vertical slice we use `Base.metadata.create_all()` (see main.py /
seed.py) instead of Alembic migrations. Alembic comes in the scaffold phase
once the schema stabilizes across all modules.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)
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
