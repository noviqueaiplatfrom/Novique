"""Application configuration, loaded from environment / .env."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Postgres
    database_url: str = "postgresql+psycopg2://novique:novique@localhost:5432/novique"

    # Redis — Celery broker + result backend (scheduled ingestion).
    redis_url: str = "redis://localhost:6379/0"

    # AI layer. If anthropic_api_key is unset, the pipeline falls back to a
    # deterministic heuristic summarizer so the slice still runs end-to-end.
    anthropic_api_key: str | None = None
    ai_model: str = "claude-opus-4-8"

    # Ingestion
    ingest_query: str = "AI OR LLM OR GPT OR Claude OR Gemini"
    ingest_limit: int = 25  # stories to pull per run
    reddit_subs: str = "MachineLearning+artificial+LocalLLaMA+OpenAI"

    # Auth (JWT). CHANGE jwt_secret in any real deployment (≥32 bytes).
    jwt_secret: str = "dev-secret-change-me-in-production-please-32b"
    jwt_algorithm: str = "HS256"
    access_token_ttl_min: int = 30
    refresh_token_ttl_days: int = 7

    # Google Sign-In: the OAuth client ID this backend accepts tokens for. Must
    # match the frontend's NEXT_PUBLIC_GOOGLE_CLIENT_ID, or tokens meant for a
    # completely different site could be replayed against this API.
    google_client_id: str | None = None

    # Shared secret required in the `x-ingest-secret` header to trigger
    # POST /api/ingest on demand (the scheduled Celery beat job does not use
    # this endpoint, so locking it down doesn't affect the real pipeline).
    ingest_secret: str | None = None

    # SMTP
    smtp_host: str = "smtp-relay.brevo.com"
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str = "no-reply@novique-ai.com"

    # API
    cors_origins: str = "http://localhost:3000"

    # Set DEBUG=true only for local development. Gates behavior that must
    # never run in production (e.g. logging OTP codes as a fallback).
    debug: bool = False


settings = Settings()
