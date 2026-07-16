import type { Article, Kind, Sort } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface User {
  id: number;
  email: string;
  role: string;
  name?: string | null;
  picture?: string | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.detail ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  status: string;
  email?: string;
}

// --- Auth ---
export const register = (email: string, password: string) =>
  request<LoginResponse>("/api/auth/register", { method: "POST", body: { email, password } });

export const login = (email: string, password: string) =>
  request<LoginResponse>("/api/auth/login", { method: "POST", body: { email, password } });

export const verify2fa = (email: string, code: string) =>
  request<TokenPair>("/api/auth/verify-2fa", { method: "POST", body: { email, code } });

export const loginWithGoogle = (idToken: string) =>
  request<TokenPair>("/api/auth/google", { method: "POST", body: { id_token: idToken } });

export const getMe = (token: string) => request<User>("/api/me", { token });

// --- Interests ---
export const getInterests = (token: string) =>
  request<string[]>("/api/me/interests", { token });

export const addInterest = (token: string, topic: string) =>
  request<string[]>("/api/me/interests", { method: "POST", body: { topic }, token });

export const removeInterest = (token: string, topic: string) =>
  request<string[]>(`/api/me/interests/${encodeURIComponent(topic)}`, {
    method: "DELETE",
    token,
  });

// --- Bookmarks ---
export const getBookmarks = (token: string) =>
  request<Article[]>("/api/me/bookmarks", { token });

export const addBookmark = (token: string, articleId: number) =>
  request("/api/me/bookmarks", { method: "POST", body: { article_id: articleId }, token });

export const removeBookmark = (token: string, articleId: number) =>
  request(`/api/me/bookmarks/${articleId}`, { method: "DELETE", token });

// --- Personalized feed ---
export const fetchMyFeed = (token: string, sort: Sort, kind: Kind) => {
  const params = new URLSearchParams({ sort, limit: "40" });
  if (kind !== "all") params.set("kind", kind);
  return request<Article[]>(`/api/feed/me?${params}`, { token });
};
