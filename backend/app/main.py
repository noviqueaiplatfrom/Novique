"""FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.feed import router as feed_router
from app.api.me import router as me_router
from app.api.models_api import router as models_router
from app.api.reports import router as reports_router
from app.api.status import router as status_router
from app.config import settings
from app.scheduler import scheduler
from app import models  # noqa: F401  (register models on Base before create_all)


_DEFAULT_JWT_SECRET = "dev-secret-change-me-in-production-please-32b"


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.debug and settings.jwt_secret == _DEFAULT_JWT_SECRET:
        raise RuntimeError(
            "JWT_SECRET is unset and DEBUG is not enabled — refusing to start with the "
            "public default secret, which would let anyone forge valid tokens. Set a real "
            "JWT_SECRET env var, or set DEBUG=true for local development only."
        )
    # Create tables / run migrations, but never refuse to boot over it: if the
    # DB is unreachable the API still binds its port, /api/status reports
    # "database unreachable", and the scheduler keeps retrying in the
    # background. (Previously a missing DB meant uvicorn never started, so
    # every request just hung until the client timed out.)
    if not scheduler.ensure_db():
        print("[startup] database unavailable; serving degraded until it comes back")
    if settings.scheduler_enabled:
        scheduler.start()
    yield
    scheduler.stop()


app = FastAPI(title="Novique API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feed_router)
app.include_router(auth_router)
app.include_router(me_router)
app.include_router(reports_router)
app.include_router(models_router)
app.include_router(status_router)


@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}
