"""Source crawlers — HN, arXiv, Reddit, RSS feeds, Dev.to, GitHub Trending."""
from __future__ import annotations

import calendar
import time
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import feedparser
import httpx

from app.config import settings

HN_SEARCH_URL = "https://hn.algolia.com/api/v1/search_by_date"
ARXIV_URL = "https://export.arxiv.org/api/query"
REDDIT_HOT_URL = "https://www.reddit.com/r/{subs}/hot.json"
DEVTO_URL = "https://dev.to/api/articles"
GITHUB_SEARCH_URL = "https://api.github.com/search/repositories"
_ATOM = "{http://www.w3.org/2005/Atom}"
_REDDIT_UA = "AI-Pulse/0.1 (AI intelligence aggregator)"

RSS_FEEDS: list[tuple[str, str]] = [
    ("VentureBeat AI", "https://venturebeat.com/category/ai/feed/"),
    ("TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/"),
    ("The Verge AI", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"),
    ("Wired AI", "https://www.wired.com/feed/tag/ai/latest/rss"),
    ("AI News", "https://artificialintelligence-news.com/feed/"),
    ("MIT Tech Review", "https://www.technologyreview.com/feed/"),
    ("IEEE Spectrum", "https://spectrum.ieee.org/feeds/feed.rss"),
]


@dataclass
class RawItem:
    title: str
    url: str
    source: str
    author: str | None
    published_at: datetime
    points: int
    num_comments: int
    # Optional richer body (e.g. a paper abstract) for the AI summarizer + scorer.
    content: str | None = None
    # "news" or "paper" — routes items into the right view (Feed vs Research Hub).
    kind: str = "news"
    # Citation count for papers, populated by the Semantic Scholar enrichment step.
    citation_count: int = 0


def fetch_hacker_news(query: str | None = None, limit: int | None = None) -> list[RawItem]:
    """Pull recent AI-related stories from Hacker News."""
    query = query or settings.ingest_query
    limit = limit or settings.ingest_limit

    params = {
        "query": query,
        "tags": "story",
        "numericFilters": "points>5",  # skip noise
        "hitsPerPage": limit,
    }
    resp = httpx.get(HN_SEARCH_URL, params=params, timeout=30.0, follow_redirects=True)
    resp.raise_for_status()
    hits = resp.json().get("hits", [])

    items: list[RawItem] = []
    for h in hits:
        # Stories without an external URL fall back to the HN discussion page.
        url = h.get("url") or f"https://news.ycombinator.com/item?id={h.get('objectID')}"
        title = h.get("title")
        created = h.get("created_at_i")
        if not title or created is None:
            continue
        items.append(
            RawItem(
                title=title.strip(),
                url=url,
                source="Hacker News",
                author=h.get("author"),
                published_at=datetime.fromtimestamp(created, tz=timezone.utc),
                points=int(h.get("points") or 0),
                num_comments=int(h.get("num_comments") or 0),
                kind="news",
            )
        )
    return items


def fetch_arxiv(limit: int | None = None) -> list[RawItem]:
    """Pull the latest AI research papers from arXiv (cs.AI / cs.LG / cs.CL).

    arXiv returns Atom XML. Papers have no engagement signal, so `points` and
    `num_comments` stay 0 — their Impact Score is carried by source authority,
    entities, and content signals (see app/scoring.py).
    """
    limit = limit or settings.ingest_limit
    params = {
        "search_query": "cat:cs.AI OR cat:cs.LG OR cat:cs.CL",
        "sortBy": "submittedDate",
        "sortOrder": "descending",
        "max_results": limit,
    }
    resp = httpx.get(ARXIV_URL, params=params, timeout=30.0, follow_redirects=True)
    resp.raise_for_status()
    root = ET.fromstring(resp.text)

    items: list[RawItem] = []
    for entry in root.findall(f"{_ATOM}entry"):
        title_el = entry.find(f"{_ATOM}title")
        id_el = entry.find(f"{_ATOM}id")
        pub_el = entry.find(f"{_ATOM}published")
        summary_el = entry.find(f"{_ATOM}summary")
        if title_el is None or id_el is None or pub_el is None:
            continue

        authors = [
            a.findtext(f"{_ATOM}name", "").strip()
            for a in entry.findall(f"{_ATOM}author")
        ]
        published = datetime.fromisoformat(pub_el.text.replace("Z", "+00:00"))

        items.append(
            RawItem(
                title=" ".join((title_el.text or "").split()),
                url=(id_el.text or "").strip(),
                source="arXiv",
                author=", ".join(a for a in authors if a) or None,
                published_at=published,
                points=0,
                num_comments=0,
                content=" ".join((summary_el.text or "").split()) if summary_el is not None else None,
                kind="paper",
            )
        )
    return items


def fetch_reddit(limit: int | None = None) -> list[RawItem]:
    """Pull hot posts from AI subreddits (community discussion).

    Reddit posts carry score + comment counts, so they slot straight into the
    same engagement-based scoring as Hacker News — and links shared on both HN
    and Reddit dedupe against each other via the normalized-URL key.
    """
    limit = limit or settings.ingest_limit
    url = REDDIT_HOT_URL.format(subs=settings.reddit_subs)
    resp = httpx.get(
        url,
        params={"limit": limit},
        headers={"User-Agent": _REDDIT_UA},
        timeout=30.0,
        follow_redirects=True,
    )
    resp.raise_for_status()
    children = resp.json().get("data", {}).get("children", [])

    items: list[RawItem] = []
    for child in children:
        d = child.get("data", {})
        title = d.get("title")
        created = d.get("created_utc")
        if not title or d.get("stickied") or created is None:
            continue
        permalink = d.get("permalink", "")
        external = d.get("url") or f"https://www.reddit.com{permalink}"
        items.append(
            RawItem(
                title=title.strip(),
                url=external,
                source=f"Reddit r/{d.get('subreddit', '')}",
                author=d.get("author"),
                published_at=datetime.fromtimestamp(created, tz=timezone.utc),
                points=int(d.get("score") or 0),
                num_comments=int(d.get("num_comments") or 0),
                content=(d.get("selftext") or None),
                kind="news",
            )
        )
    return items


_RSS_TIMEOUT_S = 15.0
# Publisher feeds update a few times an hour and rate-limit aggressive
# pollers (VentureBeat returned 429 at the 60s news cadence), so each feed is
# re-fetched at most this often; in between, the cached parse is reused.
_RSS_MIN_INTERVAL_S = 600.0
_rss_cache: dict[str, tuple[float, object]] = {}
_rss_failed_at: dict[str, float] = {}


def _get_feed(feed_url: str):
    """Parsed feed, a cached parse, or None while cooling down after a failure."""
    now = time.time()
    cached = _rss_cache.get(feed_url)
    if cached and now - cached[0] < _RSS_MIN_INTERVAL_S:
        return cached[1]
    if now - _rss_failed_at.get(feed_url, 0.0) < _RSS_MIN_INTERVAL_S:
        return cached[1] if cached else None  # don't re-hit a feed that just 429'd/404'd
    # feedparser.parse(url) fetches with no timeout at all, so a single slow
    # feed could stall the whole news cycle (and the scheduler) indefinitely.
    try:
        resp = httpx.get(
            feed_url,
            timeout=_RSS_TIMEOUT_S,
            follow_redirects=True,
            headers={"User-Agent": "Novique/0.2 (AI news aggregator; +https://novique-ai.com)"},
        )
        resp.raise_for_status()
    except Exception:
        _rss_failed_at[feed_url] = now
        raise
    parsed = feedparser.parse(resp.content)
    _rss_cache[feed_url] = (time.time(), parsed)
    return parsed


def fetch_rss_feeds(limit: int | None = None) -> list[RawItem]:
    """Pull from major AI news RSS feeds (VentureBeat, TechCrunch, The Verge, Wired, etc.)."""
    per_feed = max(3, (limit or 30) // len(RSS_FEEDS))
    items: list[RawItem] = []
    # Fetch all feeds concurrently: sequentially, worst case was 7 x timeout.
    with ThreadPoolExecutor(max_workers=len(RSS_FEEDS)) as pool:
        futures = [pool.submit(_get_feed, url) for _, url in RSS_FEEDS]
    feeds = []
    for (source_name, _), fut in zip(RSS_FEEDS, futures):
        try:
            feed = fut.result()
            if feed is not None:
                feeds.append((source_name, feed))
        except Exception as exc:
            print(f"[ingest] RSS feed {source_name} failed: {exc}")
    if not feeds:
        raise RuntimeError("every RSS feed failed")
    for source_name, feed in feeds:
        try:
            for entry in feed.entries[:per_feed]:
                title = (entry.get("title") or "").strip()
                link = entry.get("link") or entry.get("id") or ""
                if not title or not link:
                    continue
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    published = datetime.fromtimestamp(
                        calendar.timegm(entry.published_parsed), tz=timezone.utc
                    )
                else:
                    published = datetime.now(timezone.utc)
                content = entry.get("summary") or entry.get("description") or None
                items.append(
                    RawItem(
                        title=title,
                        url=link,
                        source=source_name,
                        author=entry.get("author") or None,
                        published_at=published,
                        points=0,
                        num_comments=0,
                        content=content,
                        kind="news",
                    )
                )
        except Exception:
            pass  # tolerate per-feed failures; other sources still run
    return items


def fetch_devto(limit: int | None = None) -> list[RawItem]:
    """Pull top AI articles from Dev.to (free public API)."""
    limit = min(limit or 20, 30)
    resp = httpx.get(
        DEVTO_URL,
        params={"tag": "ai", "per_page": limit},
        timeout=30.0,
        follow_redirects=True,
    )
    resp.raise_for_status()
    items: list[RawItem] = []
    for a in resp.json():
        title = (a.get("title") or "").strip()
        url = a.get("url") or a.get("canonical_url") or ""
        if not title or not url:
            continue
        try:
            published = datetime.fromisoformat((a["published_at"] or "").replace("Z", "+00:00"))
        except Exception:
            published = datetime.now(timezone.utc)
        items.append(
            RawItem(
                title=title,
                url=url,
                source="Dev.to",
                author=(a.get("user") or {}).get("name") or None,
                published_at=published,
                points=int(a.get("public_reactions_count") or 0),
                num_comments=int(a.get("comments_count") or 0),
                content=a.get("description") or None,
                kind="news",
            )
        )
    return items


def fetch_github_trending(limit: int | None = None) -> list[RawItem]:
    """Pull trending AI/ML repos pushed in the last 24 hours from GitHub search."""
    limit = min(limit or 10, 15)
    since = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    resp = httpx.get(
        GITHUB_SEARCH_URL,
        params={
            # GitHub's OR only applies to text terms, not qualifiers: the old
            # "topic:a OR topic:b" form was rejected with 422 on every cycle.
            "q": f"llm OR machine-learning OR artificial-intelligence in:topics pushed:>{since} stars:>50",
            "sort": "stars",
            "order": "desc",
            "per_page": limit,
        },
        headers={
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "AI-Pulse/0.1",
        },
        timeout=30.0,
        follow_redirects=True,
    )
    resp.raise_for_status()
    items: list[RawItem] = []
    for repo in resp.json().get("items", []):
        name = repo.get("full_name") or ""
        description = (repo.get("description") or "").strip()
        url = repo.get("html_url") or ""
        if not name or not url:
            continue
        try:
            published = datetime.fromisoformat((repo["pushed_at"] or "").replace("Z", "+00:00"))
        except Exception:
            published = datetime.now(timezone.utc)
        items.append(
            RawItem(
                title=f"{name}: {description}" if description else name,
                url=url,
                source="GitHub",
                author=(repo.get("owner") or {}).get("login") or None,
                published_at=published,
                points=int(repo.get("stargazers_count") or 0),
                num_comments=int(repo.get("open_issues_count") or 0),
                content=description or None,
                kind="news",
            )
        )
    return items
