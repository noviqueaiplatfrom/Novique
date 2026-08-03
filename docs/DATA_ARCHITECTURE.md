# Novique — Data Architecture & Page-by-Page Data Sources

This documents, for every page in the app, what data is shown and exactly where it comes from: a live backend endpoint, a hardcoded array in the frontend, something computed client-side from another source, or browser `localStorage`. It reflects the codebase as of 2026-08-02.

## Legend

- **LIVE** — fetched from the FastAPI backend at request/render time.
- **STATIC** — a hardcoded array/object literal in a frontend `.tsx`/`.ts` file. Editing the number or content means editing code.
- **DERIVED** — computed client-side from another source already listed (a live fetch, static data, or localStorage). No separate network/storage call of its own.
- **LOCALSTORAGE** — persisted only in the visitor's own browser. Not synced across devices, not visible to anyone else, lost if they clear site data.

---

## 1. Backend API reference

Backend: FastAPI, `backend/app/`. Three DB tables back everything real: `Article`, `User`, `Interest` (table `user_interests`), `Bookmark` (`backend/app/models.py`).

### `feed.py` — prefix `/api`

| Method + Path | Returns | Touches |
|---|---|---|
| `GET /api/feed?sort=impact\|trend\|recent&kind=news\|paper&limit=` | `ArticleOut[]` — the corpus ranked by impact score, trend score, or recency | `Article` (read) |
| `GET /api/stats` | `{total_articles, total_sources, total_papers}` | `Article` (read, aggregate) |
| `POST /api/ingest` | `IngestResult` — runs one ingestion cycle on demand | `Article` (write, via ingestion pipeline) |

### `auth.py` — prefix `/api/auth`

| Method + Path | Returns | Touches |
|---|---|---|
| `POST /api/auth/register` | `LoginResponse` (`mfa_required`) — creates user, emails OTP | `User` (write) |
| `POST /api/auth/login` | `LoginResponse` (`mfa_required`) — verifies password, emails OTP | `User` (read) |
| `POST /api/auth/verify-2fa` | `TokenPair` (access + refresh JWT) | `User` (read); OTP lives in Redis, not a table |
| `POST /api/auth/refresh` | `AccessToken` | `User` (existence check) |
| `POST /api/auth/google` | `TokenPair` — verifies Google ID token, finds/creates user by `google_sub`/email | `User` (read/write) |

### `me.py` — prefix `/api`, all routes require a valid JWT

| Method + Path | Returns | Touches |
|---|---|---|
| `GET /api/me` | `UserOut` | `User` |
| `GET /api/me/interests` | `string[]` followed topics | `Interest` |
| `POST /api/me/interests` | updated `string[]` | `Interest` (write) |
| `DELETE /api/me/interests/{topic}` | updated `string[]` | `Interest` (delete) |
| `GET /api/me/bookmarks` | `ArticleOut[]` | `Bookmark` → `Article` |
| `POST /api/me/bookmarks` | `{status, article_id}` | `Bookmark` (write) |
| `DELETE /api/me/bookmarks/{article_id}` | `{status, article_id}` | `Bookmark` (delete) |
| `GET /api/feed/me?sort=&kind=&limit=` | `ArticleOut[]` — re-ranked via `app/personalize.py` using the user's interests + bookmark history | `Article`, `Interest`, `Bookmark` |

---

## 2. Frontend API clients

### `frontend/lib/api.ts` (public, no auth)

| Function | Endpoint | Purpose |
|---|---|---|
| `fetchFeed(sort, kind)` | `GET /api/feed` | The ranked article/paper feed |
| `fetchStats()` | `GET /api/stats` | Live corpus counters for homepage trust indicators |

Both go through `fetchWithTimeout` (55s timeout) to tolerate Render free-tier cold starts rather than hanging indefinitely.

### `frontend/lib/auth.ts` (JWT-aware)

| Function | Endpoint |
|---|---|
| `register`, `login` | `POST /api/auth/register`, `/login` |
| `verify2fa` | `POST /api/auth/verify-2fa` |
| `loginWithGoogle` | `POST /api/auth/google` |
| `getMe` | `GET /api/me` |
| `getInterests` / `addInterest` / `removeInterest` | `/api/me/interests` |
| `getBookmarks` / `addBookmark` / `removeBookmark` | `/api/me/bookmarks` |
| `fetchMyFeed` | `GET /api/feed/me` |

---

## 3. Page-by-page

### Home — `/` (`app/page.tsx`)

| Section | Source |
|---|---|
| Live feed (Today's Intelligence top 5), sort/kind filters | **LIVE** `fetchFeed` |
| "Active briefing status" card (update count, freshest timestamp) | **DERIVED** from the same `fetchFeed` result |
| Trusted-by stats: AI Updates Analyzed, AI Sources Connected | **LIVE** `fetchStats` |
| Trusted-by stats: Companies Tracked, Models Monitored | **DERIVED** — `COMPANIES.length` / `MODELS.length` from the static data files below |
| Today's AI Brief (Major Updates, Model Launches, Breakthroughs, Funding Rounds, OS Launches, Momentum Index) | **DERIVED** — keyword/date/kind filters applied to the same `fetchFeed` batch |
| Trending Intelligence topic pills | **DERIVED** — topic frequency + average trend score, tallied from the same `fetchFeed` batch |
| Greeting ("Good Morning/Afternoon/Evening/Night") | **DERIVED** — client's local device clock, computed on mount |
| Bookmark/follow state on article cards | **LIVE** `authApi.getBookmarks` / `getInterests` (only when signed in) |
| AI Insight of the Day, AI Ecosystem Preview (weekly timeline), AI Opportunity of the Day, Research Highlights, Company Watchlist, Featured Models, Market Momentum role/company/model showcase | **STATIC** — hardcoded arrays inline in `app/page.tsx`, not derived from the live feed |

### Intelligence — `/intelligence` (`app/intelligence/page.tsx`)

| Section | Source |
|---|---|
| Main feed, sort/kind/search/topic filters | **LIVE** `fetchFeed` |
| Breaking Intelligence categories, sentiment breakdown, impactful-models list, funding-tagged list, trending topics | **DERIVED** — keyword-matched against the live feed's `title`/`topics`/`kind` fields, client-side |
| Bookmarks/follows | **LIVE** `authApi` |
| Startup whitespace estimates, hiring-surge index | **STATIC** — explicitly commented in code as "illustrative... not derived from live signals" |
| `?q=` URL param (from Home's Trending Intelligence pills) | **DERIVED** — pre-fills the search box on load via `useSearchParams` |

### Companies — `/companies` (`app/companies/page.tsx`) and `/companies/[slug]`

- List page and detail page: **STATIC**, 100%. List data lives in `frontend/lib/companiesData.ts`; each company's detail content (quick stats, "latest intelligence" items, funding, hiring, etc.) is a hardcoded object embedded directly in `app/companies/[slug]/page.tsx`. No backend call of any kind.

### Models — `/models` (`app/models/page.tsx`) and `/models/[slug]`

- List page: **STATIC** — `frontend/lib/modelsData.ts`.
- Detail page: **STATIC** — a separate, unrelated `MODEL_DATABASE` object hardcoded inline in `app/models/[slug]/page.tsx` (not the same data as the list page). The "AI Recommendation Engine" widget is **DERIVED** by sorting that static object client-side; nothing is fetched.

### Research — `/research` (`app/research/page.tsx`)

- Paper content, snapshot counters, category/tech filter chips: **STATIC**, hardcoded in the file. The counters animate up to fixed target numbers on scroll — cosmetic, not live.
- "Save Paper" / "Follow Author" / "Follow Topic": **LOCALSTORAGE** (`novique_saved_research`, `novique_followed_authors`, `novique_followed_topics`) — a separate mechanism from the real backend `Bookmark`/`Interest` tables used elsewhere. Not visible to anyone but that browser.

### Learning — `/learning` (`app/learning/page.tsx`) and `/learning/[slug]`

- Nearly everything (lesson catalog, skill data, career paths, mentor Q&A, leaderboard, badges, interview prep, quiz questions, code samples) is **STATIC**, hardcoded across these two files. The Prompt Playground responses are explicitly canned text — no model is actually called.
- Progress/completion, daily streak, and roadmap checkboxes: **LOCALSTORAGE** (`novique_completed`, `novique_daily_streak`, `novique_roadmap_progress`). Quiz results and certificate IDs are generated and stored client-side only — there is no backend record of a user's learning progress or certificates.
- Dashboard numbers (skills completed, hours invested, streak label, earned badges, tiered lesson lists): **DERIVED** from the static `LESSONS` array plus the localStorage progress state.
- `MOCK_LEADERBOARD` is explicitly a static mock, not real community data.

### Opportunities — `/opportunities` (`app/opportunities/page.tsx`)

- Opportunity cards: **STATIC** hardcoded array. Not derived from the live feed despite the visual similarity to Intelligence.
- "Passed X%" / "Review Lesson" badges: **LOCALSTORAGE**, same `novique_completed` key as Learning.

### Weekly Reports — `/weekly-reports` and `/weekly-reports/[slug]`

- Both list and detail: **STATIC**, fully hardcoded (six reports, embedded directly in the respective files). "Save as PDF" is just `window.print()` on the static content — nothing is generated or fetched.

### Saved — `/saved` (`app/saved/page.tsx`)

| Tab | Source |
|---|---|
| Intelligence | **LIVE** `authApi.getBookmarks` |
| Research, Companies, Models | **STATIC** — small mock arrays hardcoded in this file, explicitly commented `mock` |

### Profile — `/profile` (`app/profile/page.tsx`)

- Identity (email, name, picture): **LIVE**, via `useAuth()` → `authApi.getMe` → `GET /api/me`.
- "Targeted Role Focus" and "Interest Signals" toggles: local component state only — **not** saved to the backend `Interest` table (unlike the real follow feature used on Home/Intelligence) and **not** localStorage. Resets on reload.
- "Developer API Keys" field: **STATIC** masked placeholder, not real.

### Navbar search (`components/Navbar.tsx`)

- Autocomplete suggestions: **STATIC** `SEARCH_CATALOG` (~26 entries: companies, models, papers, topics). Filtering is **DERIVED** client-side substring matching — there is no search API endpoint.

---

## 4. Things to know before treating a number as "real"

- The only genuinely live, database-backed numbers anywhere in the product are: the main feed (`/api/feed`), the homepage trust stats sourced from `/api/stats`, and a signed-in user's own bookmarks/interests/personalized feed.
- Companies, Models, Research, Learning, Opportunities, and Weekly Reports are entirely static content today — there are no `Company`, `Model`, `ResearchPaper`, or `Report` tables in the database (`backend/app/models.py` only defines `Article`, `User`, `Interest`, `Bookmark`). Growing those sections currently means editing frontend source, not seeding a database.
- Three independent, unrelated "save/follow" mechanisms coexist: the real backend `Bookmark`/`Interest` tables, Research's own `localStorage` save/follow keys, and Learning/Opportunities' `localStorage` completion tracking. None of the three talk to each other.
- Learning progress and certificates are not backed by the database — clearing browser storage or switching devices loses them.
