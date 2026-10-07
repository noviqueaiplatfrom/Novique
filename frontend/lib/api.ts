import type { Article, Kind, Sort } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Render's free tier spins the backend down after inactivity; a cold start can take
// up to ~50s to accept connections. This timeout is long enough to let that finish
// rather than firing isError while the service is still legitimately waking up.
// (Measured cold boot ~57s in practice, so keep real margin above that.)
const COLD_START_TIMEOUT_MS = 80000;

async function fetchWithTimeout(url: string, timeoutMs = COLD_START_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchFeed(sort: Sort, kind: Kind): Promise<Article[]> {
  const params = new URLSearchParams({ sort, limit: "40" });
  if (kind !== "all") params.set("kind", kind);
  const res = await fetchWithTimeout(`${API_URL}/api/feed?${params}`);
  if (!res.ok) throw new Error(`Feed request failed: ${res.status}`);
  return res.json();
}

export interface Stats {
  total_articles: number;
  total_sources: number;
  total_papers: number;
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetchWithTimeout(`${API_URL}/api/stats`);
  if (!res.ok) throw new Error(`Stats request failed: ${res.status}`);
  return res.json();
}

export interface ReportListItem {
  slug: string;
  title: string;
  date_label: string;
  week_of: string;
  executive_summary: string;
  signal_count: number;
  source_count: number;
}

export interface ReportDetail extends ReportListItem {
  top_signals: { title: string; source: string; impact: number; momentum: number; summary: string; topic: string }[];
  model_updates: { name: string; update: string; significance: string }[];
  funding: { company: string; amount: string; round: string; focus: string }[];
  papers: { title: string; authors: string; finding: string }[];
  outlook: string[];
  generated_by: string;
}

export async function fetchReports(): Promise<ReportListItem[]> {
  const res = await fetchWithTimeout(`${API_URL}/api/reports`);
  if (!res.ok) throw new Error(`Reports request failed: ${res.status}`);
  return res.json();
}

export async function fetchReport(slug: string): Promise<ReportDetail | null> {
  const res = await fetchWithTimeout(`${API_URL}/api/reports/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Report request failed: ${res.status}`);
  return res.json();
}

export interface TrendingModel {
  slug: string;
  name: string;
  maker: string | null;
  blurb: string | null;
  topics: string[] | null;
  mention_count_7d: number;
  mention_count_30d: number;
  is_trending: boolean;
  first_seen_at: string;
}

export async function fetchTrendingModels(): Promise<TrendingModel[]> {
  const res = await fetchWithTimeout(`${API_URL}/api/models/trending`);
  if (!res.ok) throw new Error(`Trending models request failed: ${res.status}`);
  return res.json();
}

export interface ModelStats {
  total_tracked: number;
  weekly: { period: string; count: number }[];
  monthly: { period: string; count: number }[];
}

export async function fetchModelStats(): Promise<ModelStats> {
  const res = await fetchWithTimeout(`${API_URL}/api/models/stats`);
  if (!res.ok) throw new Error(`Model stats request failed: ${res.status}`);
  return res.json();
}

export interface OpportunitySignals {
  weeks: Record<string, number | string>[];
  totals: Record<string, number>;
  topics: string[];
  source_article_count: number;
}

export async function fetchOpportunitySignals(): Promise<OpportunitySignals> {
  const res = await fetchWithTimeout(`${API_URL}/api/opportunities`);
  if (!res.ok) throw new Error(`Opportunity signals request failed: ${res.status}`);
  return res.json();
}
