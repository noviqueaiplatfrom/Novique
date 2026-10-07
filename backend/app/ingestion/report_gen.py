"""Weekly report synthesis — builds a Report row from the last 7 days of articles.

Primary path: Anthropic structured output, same pattern as summarize.py. Falls
back to a deterministic heuristic (built directly from real Article rows) so
the report always refreshes even without an API key.
"""
from __future__ import annotations

from datetime import datetime, timedelta

from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Article, Report


class Signal(BaseModel):
    title: str
    source: str
    impact: int
    momentum: int
    summary: str
    topic: str


class ModelUpdate(BaseModel):
    name: str
    update: str
    significance: str


class FundingItem(BaseModel):
    company: str
    amount: str
    round: str
    focus: str


class PaperItem(BaseModel):
    title: str
    authors: str
    finding: str


class WeeklyReportContent(BaseModel):
    executive_summary: str = Field(description="3-5 sentence synthesis of the week's AI news.")
    top_signals: list[Signal] = Field(description="Up to 5 highest-impact stories of the week.")
    model_updates: list[ModelUpdate] = Field(description="Notable model releases/updates mentioned this week, if any.")
    funding: list[FundingItem] = Field(description="Funding rounds mentioned this week, if any.")
    papers: list[PaperItem] = Field(description="Notable research papers this week, if any.")
    outlook: list[str] = Field(description="3-5 short bullets on what to watch next week.")


def _fmt(d: datetime, with_year: bool = False) -> str:
    out = f"{d.strftime('%B')} {d.day}"
    return f"{out}, {d.year}" if with_year else out


def _iso_week_slug(d: datetime) -> tuple[str, str, str]:
    year, week, _ = d.isocalendar()
    slug = f"{year}-w{week:02d}"
    week_start = d - timedelta(days=d.isoweekday() - 1)
    week_end = week_start + timedelta(days=6)
    week_of = f"{_fmt(week_start)} – {_fmt(week_end, with_year=True)}"
    title = f"Weekly AI Synthesis — Week {week}, {year}"
    return slug, title, week_of


def _heuristic_content(articles: list[Article]) -> WeeklyReportContent:
    top = sorted(articles, key=lambda a: a.impact_score, reverse=True)[:5]
    signals = [
        Signal(
            title=a.title,
            source=a.source,
            impact=round(a.impact_score),
            momentum=round(a.trend_score),
            summary=a.summary_30s or a.title,
            topic=(a.topics or ["AI"])[0],
        )
        for a in top
    ]

    model_articles = [a for a in articles if a.topics and "LLMs" in a.topics][:4]
    model_updates = [
        ModelUpdate(
            name=a.title.split(" ")[0] if a.title else "Model",
            update=a.summary_30s or a.title,
            significance=a.why_it_matters or "Notable development tracked by Novique this week.",
        )
        for a in model_articles
    ]

    funding_articles = [a for a in articles if a.topics and "Funding" in a.topics][:4]
    funding = [
        FundingItem(company=a.title[:60], amount="See article", round="N/A", focus=a.summary_30s or a.title)
        for a in funding_articles
    ]

    papers = [
        PaperItem(title=a.title, authors=a.author or a.source, finding=a.summary_30s or a.title)
        for a in articles
        if a.kind == "paper"
    ][:4]

    outlook = [a.what_to_watch for a in top if a.what_to_watch][:5] or [
        "No standout signals this week — check back as the feed fills in."
    ]

    exec_summary = (
        f"Novique tracked {len(articles)} signals across {len({a.source for a in articles})} sources this week. "
        + (signals[0].summary if signals else "No major developments were detected in this window.")
    )

    return WeeklyReportContent(
        executive_summary=exec_summary,
        top_signals=signals,
        model_updates=model_updates,
        funding=funding,
        papers=papers,
        outlook=outlook,
    )


def _llm_content(articles: list[Article]) -> tuple[WeeklyReportContent, str]:
    if not settings.anthropic_api_key:
        return _heuristic_content(articles), "heuristic"

    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    top = sorted(articles, key=lambda a: a.impact_score, reverse=True)[:25]
    digest = "\n".join(
        f"- [{a.kind}] {a.title} (source: {a.source}, topics: {', '.join(a.topics or [])}, "
        f"impact: {a.impact_score:.0f}, trend: {a.trend_score:.0f})\n"
        f"  {a.summary_30s or ''}"
        for a in top
    )
    prompt = (
        "Here are this week's highest-impact AI news items and papers tracked by Novique:\n\n"
        f"{digest}\n\n"
        "Synthesize this into a weekly report. Only use what is in the items above — do not "
        "invent facts, companies, or figures not present in the source material."
    )
    try:
        resp = client.messages.parse(
            model=settings.ai_model,
            max_tokens=2048,
            thinking={"type": "adaptive"},
            system="You are Novique's weekly synthesis engine, producing a structured AI intelligence report from real tracked items.",
            messages=[{"role": "user", "content": prompt}],
            output_format=WeeklyReportContent,
        )
        parsed = resp.parsed_output
        if parsed is None:
            return _heuristic_content(articles), "heuristic"
        return parsed, settings.ai_model
    except Exception:
        return _heuristic_content(articles), "heuristic"


def generate_weekly_report(db: Session) -> Report:
    """Upsert the current week's report from a rolling 7-day article window."""
    now = datetime.now()
    window_start = now - timedelta(days=7)
    articles = list(
        db.scalars(
            select(Article)
            .where(Article.published_at >= window_start)
            .order_by(Article.impact_score.desc())
            .limit(100)
        )
    )

    slug, title, week_of = _iso_week_slug(now)
    content, generated_by = _llm_content(articles) if articles else (_heuristic_content([]), "heuristic")

    existing = db.scalar(select(Report).where(Report.slug == slug))
    row = existing or Report(slug=slug)
    row.title = title
    row.week_of = week_of
    row.date_label = _fmt(now, with_year=True)
    row.executive_summary = content.executive_summary
    row.top_signals = [s.model_dump() for s in content.top_signals]
    row.model_updates = [m.model_dump() for m in content.model_updates]
    row.funding = [f.model_dump() for f in content.funding]
    row.papers = [p.model_dump() for p in content.papers]
    row.outlook = content.outlook
    row.source_count = len({a.source for a in articles})
    row.signal_count = len(articles)
    row.generated_by = generated_by

    if not existing:
        db.add(row)
    db.commit()
    db.refresh(row)
    return row
