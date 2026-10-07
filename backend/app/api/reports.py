"""Weekly report routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Report
from app.schemas import ReportDetailOut, ReportListOut

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("", response_model=list[ReportListOut])
def list_reports(limit: int = Query(12, ge=1, le=52), db: Session = Depends(get_db)):
    rows = db.scalars(select(Report).order_by(Report.slug.desc()).limit(limit)).all()
    return rows


@router.get("/{slug}", response_model=ReportDetailOut)
def get_report(slug: str, db: Session = Depends(get_db)):
    row = db.scalar(select(Report).where(Report.slug == slug))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return row
