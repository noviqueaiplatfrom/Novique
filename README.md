# Novique — Vertical Slice

The real-time AI intelligence platform. This repository currently contains a
**working vertical slice** of the News Aggregator + AI Explainer + proprietary
scoring engine, proving the full stack end-to-end before the remaining modules
are built out.

```
Sources:  Hacker News + Reddit (news)  +  arXiv (research papers)
  → clean + deduplicate (incl. cross-source: same link on HN & Reddit = 1 entry)
  → enrich citations (Semantic Scholar, papers)
  → AI summarize (Claude, claude-opus-4-8)
  → AI Impact Score + AI Trend Score   ← proprietary engine (app/scoring.py)
  → Postgres (SQLAlchemy)
  → FastAPI  /api/feed (public)  ·  /api/feed/me (personalized, JWT)
  → Next.js 15 dark-mode feed (React Query) — Discover + For You
```

Scheduled by Celery beat: news every 5 min · papers every 30 min · re-score hourly.
Three sources prove the **multi-source contract**: each source is one `fetch_*`
function returning the same `RawItem` shape, and nothing downstream changes.

## Stack (this slice)

| Layer    | Tech                                                |
| -------- | --------------------------------------------------- |
| Frontend | Next.js 15, TypeScript, Tailwind, React Query       |
| Backend  | FastAPI, SQLAlchemy 2, Pydantic                     |
| Data     | PostgreSQL 16                                        |
| Queue    | Celery + Redis (scheduled ingestion)                |
| Auth     | JWT (PyJWT) + bcrypt                                 |
| AI       | Anthropic Claude (`claude-opus-4-8`)                |
| Enrich   | Semantic Scholar (paper citations)                  |
| Infra    | Docker Compose                                       |

## Run it

```bash
# Optional: enable AI-generated summaries (otherwise a heuristic fallback runs)
cp .env.example .env        # then paste your ANTHROPIC_API_KEY

docker compose up --build
```

The Celery worker auto-ingests (news ~5 min, papers ~30 min). To populate
immediately without waiting, trigger one cycle by hand:

```bash
curl -X POST http://localhost:8000/api/ingest
```

Open the feed: **http://localhost:3000**

- Toggle **Top Impact / Trending / Latest** — each ranking is powered by the scores.
- API docs: **http://localhost:8000/docs**

### Run the backend without Docker

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# point at a local Postgres, or use the compose db on :5432
export DATABASE_URL=postgresql+psycopg2://novique:novique@localhost:5432/novique
python -m app.seed          # create tables + run one ingestion cycle
uvicorn app.main:app --reload
```

## The proprietary scoring engine

`backend/app/scoring.py` is the platform's differentiator and is written as pure,
unit-testable functions:

- **AI Impact Score (0–100)** — *significance*, recency-agnostic. Blends source
  authority, audience engagement (log-scaled), entity importance, and
  high-signal event vocabulary (launch / funding / breakthrough …).
- **AI Trend Score (0–100)** — *momentum*. Blends engagement velocity
  (points/hour), a recency boost, and topic co-occurrence across the batch.

Weights live in one place so they can be tuned and scores recomputed offline.

## What's a stub vs. real here

- **Real:** three sources (Hacker News + Reddit + arXiv) with cross-source
  dedup, Semantic Scholar citation enrichment, Claude summarizer (with key-free
  fallback), both scores, persistence, Celery-beat scheduling (news 5 min /
  papers 30 min / hourly re-score), JWT auth (register/login/refresh, bcrypt),
  a personalized "For You" feed (follow topics + save articles), and the
  dark-mode UI with Discover/For You.
- **Deferred to later increments:** Alembic migrations (slice uses
  `create_all`), more sources (Product Hunt, lab blogs), admin panel + full
  RBAC, Elasticsearch, and the remaining modules. Each plugs into the same
  pipeline + scoring contract.

## Layout

```
backend/app/
  scoring.py            # ← Impact + Trend engine (the IP)
  ingestion/
    crawler.py          # source fetchers (HN + Reddit + arXiv; one fn per source)
    clean.py            # normalize + dedupe
    enrich.py           # Semantic Scholar citation counts (papers)
    summarize.py        # AI Explainer Engine (Claude / fallback)
    pipeline.py         # fetch → enrich → clean → summarize → score → store
  celery_app.py tasks.py  # scheduled ingestion (beat cadences) + jobs
  bootstrap.py          # worker-startup table creation
  security.py           # bcrypt + JWT + get_current_user
  personalize.py        # "For You" ranking (interests + reading history)
  api/feed.py           # GET /api/feed, POST /api/ingest
  api/auth.py           # register / login / refresh
  api/me.py             # profile, interests, bookmarks, GET /api/feed/me
  models.py schemas.py database.py config.py main.py seed.py
frontend/
  app/ (page, layout, providers)  components/  lib/
```
