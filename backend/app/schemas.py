"""Pydantic response models for the API."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ArticleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    url: str
    source: str
    kind: str
    domain: str
    author: str | None
    published_at: datetime
    points: int
    num_comments: int
    citation_count: int

    summary_30s: str | None
    why_it_matters: str | None
    who_is_impacted: str | None
    what_to_watch: str | None
    what_changed: str | None
    key_takeaways: list[str] | None
    topics: list[str] | None
    sentiment: str | None
    summarized_by: str | None

    impact_score: float
    trend_score: float


class IngestResult(BaseModel):
    fetched: int
    cleaned: int
    created: int
    updated: int


class StatsOut(BaseModel):
    total_articles: int
    total_sources: int
    total_papers: int


# --- Auth / personalization ------------------------------------------------
class UserCreate(BaseModel):
    email: str
    password: str = Field(min_length=8)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    role: str
    name: str | None = None
    picture: str | None = None


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    access_token: str | None = None
    refresh_token: str | None = None
    token_type: str = "bearer"
    status: str = "success"  # "success" or "mfa_required"
    email: str | None = None


class Verify2FaRequest(BaseModel):
    email: str
    code: str


class RefreshIn(BaseModel):
    refresh_token: str


class AccessToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


class InterestIn(BaseModel):
    topic: str = Field(min_length=1, max_length=64)


class BookmarkIn(BaseModel):
    article_id: int


# --- Reports -----------------------------------------------------------
class ReportListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    title: str
    date_label: str
    week_of: str
    executive_summary: str
    signal_count: int
    source_count: int


class ReportDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    title: str
    date_label: str
    week_of: str
    executive_summary: str
    top_signals: list[dict]
    model_updates: list[dict]
    funding: list[dict]
    papers: list[dict]
    outlook: list[str]
    signal_count: int
    source_count: int
    generated_by: str


# --- Trending models -----------------------------------------------------
class AIModelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    name: str
    maker: str | None
    blurb: str | None
    topics: list[str] | None
    mention_count_7d: int
    mention_count_30d: int
    is_trending: bool
    first_seen_at: datetime


class ModelStatsOut(BaseModel):
    total_tracked: int
    weekly: list[dict]
    monthly: list[dict]


# --- Opportunity signals ---------------------------------------------------
class OpportunitySignalsOut(BaseModel):
    weeks: list[dict]
    totals: dict[str, int]
    topics: list[str]
    source_article_count: int
