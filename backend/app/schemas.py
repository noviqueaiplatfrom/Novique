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
