"""Feed + ingest routes."""
from __future__ import annotations

from enum import Enum

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.ingestion.pipeline import run_pipeline
from app.models import Article
from app.schemas import ArticleOut, IngestResult, StatsOut

router = APIRouter(prefix="/api", tags=["feed"])


class Sort(str, Enum):
    impact = "impact"
    trend = "trend"
    recent = "recent"


class Kind(str, Enum):
    news = "news"
    paper = "paper"


@router.get("/feed", response_model=list[ArticleOut])
def get_feed(
    sort: Sort = Sort.impact,
    kind: Kind | None = Query(None, description="Filter to news or research papers."),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Personalized-feed precursor: the corpus ranked by a chosen signal.

    `kind=paper` powers the Research Hub view; omitting `kind` returns the mixed
    feed. The recommendation engine (reading history, interests) layers on top of
    this in the Personalized Feed module.
    """
    order = {
        Sort.impact: Article.impact_score.desc(),
        Sort.trend: Article.trend_score.desc(),
        Sort.recent: Article.published_at.desc(),
    }[sort]
    stmt = select(Article)
    if kind is not None:
        stmt = stmt.where(Article.kind == kind.value)
    rows = db.scalars(stmt.order_by(order).limit(limit)).all()
    return rows


@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    """Live corpus counters for homepage trust indicators."""
    total_articles = db.scalar(select(func.count(Article.id))) or 0
    total_sources = db.scalar(select(func.count(func.distinct(Article.source)))) or 0
    total_papers = db.scalar(select(func.count(Article.id)).where(Article.kind == "paper")) or 0
    return StatsOut(
        total_articles=total_articles,
        total_sources=total_sources,
        total_papers=total_papers,
    )


@router.post("/ingest", response_model=IngestResult)
def ingest(db: Session = Depends(get_db)):
    """Trigger one ingestion cycle on demand (stand-in for the Celery beat job)."""
    return run_pipeline(db)
