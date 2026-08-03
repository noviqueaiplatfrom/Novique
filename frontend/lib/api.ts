import type { Article, Kind, Sort } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Render's free tier spins the backend down after inactivity; a cold start can take
// up to ~50s to accept connections. This timeout is long enough to let that finish
// rather than firing isError while the service is still legitimately waking up.
const COLD_START_TIMEOUT_MS = 55000;

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
