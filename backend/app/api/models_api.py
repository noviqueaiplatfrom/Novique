"""Trending-model + opportunity-signal routes."""
from __future__ import annotations

from collections import defaultdict

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.ingestion.opportunities import weekly_opportunity_signals
from app.models import AIModel
from app.schemas import AIModelOut, ModelStatsOut, OpportunitySignalsOut

router = APIRouter(prefix="/api", tags=["models"])


@router.get("/models/trending", response_model=list[AIModelOut])
def list_trending_models(limit: int = Query(12, ge=1, le=50), db: Session = Depends(get_db)):
    """Auto-detected models gaining mention volume in the live feed —
    supplements the hand-curated baseline index shown on the Models page."""
    rows = db.scalars(
        select(AIModel).order_by(AIModel.mention_count_30d.desc()).limit(limit)
    ).all()
    return rows


@router.get("/models/stats", response_model=ModelStatsOut)
def model_stats(db: Session = Depends(get_db)):
    """Weekly/monthly counts of new model signals Novique's feed detected.

    This reflects Novique's own tracked sources, not every model released
    worldwide — labeled as such in the UI.
    """
    rows = db.scalars(select(AIModel)).all()
    weekly: dict[str, int] = defaultdict(int)
    monthly: dict[str, int] = defaultdict(int)
    for r in rows:
        year, week, _ = r.first_seen_at.isocalendar()
        weekly[f"{year}-W{week:02d}"] += 1
        monthly[f"{year}-{r.first_seen_at.month:02d}"] += 1

    return ModelStatsOut(
        total_tracked=len(rows),
        weekly=[{"period": k, "count": v} for k, v in sorted(weekly.items())[-8:]],
        monthly=[{"period": k, "count": v} for k, v in sorted(monthly.items())[-6:]],
    )


@router.get("/opportunities", response_model=OpportunitySignalsOut)
def opportunities(weeks: int = Query(8, ge=1, le=26), db: Session = Depends(get_db)):
    return weekly_opportunity_signals(db, weeks=weeks)
