"""Authenticated user routes: profile, interests, bookmarks, personalized feed."""
from __future__ import annotations

from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Article, Bookmark, Interest, User
from app.personalize import personalized_feed
from app.schemas import ArticleOut, BookmarkIn, InterestIn, UserOut
from app.security import get_current_user

router = APIRouter(prefix="/api", tags=["me"])


class Sort(str, Enum):
    impact = "impact"
    trend = "trend"


class Kind(str, Enum):
    news = "news"
    paper = "paper"


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete the current user's account. Bookmarks/interests cascade via FK ondelete."""
    db.delete(user)
    db.commit()


# --- Interests -------------------------------------------------------------
@router.get("/me/interests", response_model=list[str])
def list_interests(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [t for (t,) in db.execute(select(Interest.topic).where(Interest.user_id == user.id))]


@router.post("/me/interests", response_model=list[str], status_code=status.HTTP_201_CREATED)
def add_interest(
    body: InterestIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topic = body.topic.strip()
    exists = db.scalar(
        select(Interest).where(Interest.user_id == user.id, Interest.topic == topic)
    )
    if not exists:
        db.add(Interest(user_id=user.id, topic=topic))
        db.commit()
    return list_interests(user, db)


@router.delete("/me/interests/{topic}", response_model=list[str])
def remove_interest(
    topic: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.scalar(
        select(Interest).where(Interest.user_id == user.id, Interest.topic == topic)
    )
    if obj:
        db.delete(obj)
        db.commit()
    return list_interests(user, db)


# --- Bookmarks -------------------------------------------------------------
@router.get("/me/bookmarks", response_model=list[ArticleOut])
def list_bookmarks(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ids = [aid for (aid,) in db.execute(select(Bookmark.article_id).where(Bookmark.user_id == user.id))]
    if not ids:
        return []
    return db.scalars(select(Article).where(Article.id.in_(ids))).all()


@router.post("/me/bookmarks", status_code=status.HTTP_201_CREATED)
def add_bookmark(
    body: BookmarkIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.get(Article, body.article_id) is None:
        raise HTTPException(status_code=404, detail="Article not found")
    exists = db.scalar(
        select(Bookmark).where(
            Bookmark.user_id == user.id, Bookmark.article_id == body.article_id
        )
    )
    if not exists:
        db.add(Bookmark(user_id=user.id, article_id=body.article_id))
        db.commit()
    return {"status": "saved", "article_id": body.article_id}


@router.delete("/me/bookmarks/{article_id}")
def remove_bookmark(
    article_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.scalar(
        select(Bookmark).where(
            Bookmark.user_id == user.id, Bookmark.article_id == article_id
        )
    )
    if obj:
        db.delete(obj)
        db.commit()
    return {"status": "removed", "article_id": article_id}


# --- Personalized feed -----------------------------------------------------
@router.get("/feed/me", response_model=list[ArticleOut])
def my_feed(
    sort: Sort = Sort.impact,
    kind: Kind | None = Query(None),
    limit: int = Query(30, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """The corpus re-ranked for this user by interest + reading-history overlap."""
    return personalized_feed(
        db, user.id, sort=sort.value, limit=limit, kind=kind.value if kind else None
    )
