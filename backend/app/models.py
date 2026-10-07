"""Database models.

Slice scope: a single `Article` table that carries the raw item, the AI
Explainer fields, the topic tags, and the two proprietary scores. Other tables
(Sources, Topics, Companies, Models, ResearchPapers, Users, ...) arrive as the
corresponding modules are built out.
"""
from datetime import datetime

from sqlalchemy import (
    JSON,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Article(Base):
    __tablename__ = "articles"
    __table_args__ = (UniqueConstraint("dedupe_key", name="uq_articles_dedupe_key"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # --- Raw item (post-clean) ---
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    source: Mapped[str] = mapped_column(String(128), nullable=False)  # e.g. "Hacker News"
    kind: Mapped[str] = mapped_column(String(16), nullable=False, default="news")  # news | paper
    domain: Mapped[str] = mapped_column(String(256), nullable=False, default="")
    author: Mapped[str | None] = mapped_column(String(256), nullable=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    dedupe_key: Mapped[str] = mapped_column(String(64), nullable=False)

    # Raw engagement signals captured at ingest time (feed the scores).
    points: Mapped[int] = mapped_column(Integer, default=0)
    num_comments: Mapped[int] = mapped_column(Integer, default=0)
    citation_count: Mapped[int] = mapped_column(Integer, default=0)  # papers (Semantic Scholar)

    # --- AI Explainer Engine output ---
    summary_30s: Mapped[str | None] = mapped_column(Text, nullable=True)
    why_it_matters: Mapped[str | None] = mapped_column(Text, nullable=True)
    who_is_impacted: Mapped[str | None] = mapped_column(Text, nullable=True)
    what_to_watch: Mapped[str | None] = mapped_column(Text, nullable=True)
    what_changed: Mapped[str | None] = mapped_column(Text, nullable=True)
    key_takeaways: Mapped[list | None] = mapped_column(JSON, nullable=True)
    topics: Mapped[list | None] = mapped_column(JSON, nullable=True)
    sentiment: Mapped[str | None] = mapped_column(String(16), nullable=True)
    summarized_by: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # --- Proprietary scores (the differentiator) ---
    impact_score: Mapped[float] = mapped_column(Float, default=0.0)
    trend_score: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now()
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(256), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(256), nullable=True)
    google_sub: Mapped[str | None] = mapped_column(String(256), unique=True, nullable=True)
    name: Mapped[str | None] = mapped_column(String(256), nullable=True)
    picture: Mapped[str | None] = mapped_column(String(512), nullable=True)
    role: Mapped[str] = mapped_column(String(32), nullable=False, default="user")  # RBAC stub
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now()
    )


class Interest(Base):
    """A topic a user follows — explicit personalization signal."""
    __tablename__ = "user_interests"
    __table_args__ = (UniqueConstraint("user_id", "topic", name="uq_interest"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    topic: Mapped[str] = mapped_column(String(64), nullable=False)


class Report(Base):
    """A weekly synthesis report, generated/refreshed by a scheduled task.

    The current (in-progress) week's slug is upserted daily from a rolling
    7-day window so the page never goes stale; once the week closes, the row
    is frozen and next week gets a new slug.
    """
    __tablename__ = "reports"
    __table_args__ = (UniqueConstraint("slug", name="uq_reports_slug"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    week_of: Mapped[str] = mapped_column(String(64), nullable=False)
    date_label: Mapped[str] = mapped_column(String(64), nullable=False)

    executive_summary: Mapped[str] = mapped_column(Text, nullable=False)
    top_signals: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    model_updates: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    funding: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    papers: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    outlook: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    source_count: Mapped[int] = mapped_column(Integer, default=0)
    signal_count: Mapped[int] = mapped_column(Integer, default=0)

    generated_by: Mapped[str] = mapped_column(String(64), nullable=False, default="heuristic")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(), onupdate=lambda: datetime.now()
    )


class AIModel(Base):
    """An AI model auto-detected as trending from mentions in the live feed.

    Supplements the curated model index — this table only holds models the
    ingestion pipeline noticed gaining mention volume, not the hand-curated
    baseline list (which stays in the frontend for now).
    """
    __tablename__ = "ai_models"
    __table_args__ = (UniqueConstraint("slug", name="uq_ai_models_slug"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(128), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    maker: Mapped[str | None] = mapped_column(String(128), nullable=True)
    blurb: Mapped[str | None] = mapped_column(Text, nullable=True)
    topics: Mapped[list | None] = mapped_column(JSON, nullable=True)

    mention_count_7d: Mapped[int] = mapped_column(Integer, default=0)
    mention_count_30d: Mapped[int] = mapped_column(Integer, default=0)
    is_trending: Mapped[bool] = mapped_column(default=True)

    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now()
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now()
    )


class Bookmark(Base):
    """A saved article — both a user feature and an implicit interest signal."""
    __tablename__ = "bookmarks"
    __table_args__ = (UniqueConstraint("user_id", "article_id", name="uq_bookmark"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    article_id: Mapped[int] = mapped_column(ForeignKey("articles.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now()
    )
