"""FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.feed import router as feed_router
from app.api.me import router as me_router
from app.config import settings
from app.database import Base, engine
from app import models  # noqa: F401  (register models on Base before create_all)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Slice: create tables on startup. Replaced by Alembic migrations later.
    Base.metadata.create_all(bind=engine)
    from app.database import run_migrations
    run_migrations()
    yield


app = FastAPI(title="AI Pulse API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feed_router)
app.include_router(auth_router)
app.include_router(me_router)


@app.get("/health")
def health():
    return {"status": "ok"}
