"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchFeed } from "@/lib/api";
import * as authApi from "@/lib/auth";
import type { Kind, Sort } from "@/lib/types";
import { ArticleCard } from "@/components/ArticleCard";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "../auth-context";

const SORTS: { key: Sort; label: string }[] = [
  { key: "impact", label: "🔥 Top Impact" },
  { key: "trend", label: "📈 Trending" },
  { key: "recent", label: "⏱️ Latest" },
];

const KINDS: { key: Kind; label: string }[] = [
  { key: "all", label: "All Items" },
  { key: "news", label: "General News" },
  { key: "paper", label: "Research Papers" },
];

type Mode = "discover" | "foryou";

// Today's AI Snapshot — mock counts, animated in when the row scrolls into view
const SNAPSHOT_STATS: { label: string; value: number }[] = [
  { label: "Intelligence Updates", value: 38 },
  { label: "Model Releases", value: 6 },
  { label: "Research Papers", value: 11 },
  { label: "Funding Events", value: 3 },
  { label: "Acquisitions", value: 2 },
  { label: "Major Announcements", value: 5 },
];

const TRENDING_TODAY = ["AI Agents", "MCP", "Reasoning", "Video Generation", "Enterprise AI"];

// Trending Technologies — proportional bars, longest = most trending
const TRENDING_TECH = [
  { name: "AI Agents", pct: 100 },
  { name: "MCP", pct: 87 },
  { name: "Reasoning Models", pct: 76 },
  { name: "Coding AI", pct: 63 },
  { name: "Video AI", pct: 51 },
  { name: "Vision AI", pct: 40 },
];

// Quick filter chips — genuinely filter the live feed via title/topic/summary text match,
// same mechanism the search box already uses. Not tied to API categories the backend lacks.
const CONTENT_TYPES = [
  "Announcements",
  "Research",
  "Funding",
  "Acquisitions",
  "Model Releases",
  "Open Source",
  "Security",
  "Developer Tools",
];
const INDUSTRIES = ["Healthcare", "Finance", "Coding", "Education", "Enterprise", "Gaming", "Robotics"];

// "Should You Care?" mock ratings for today's top story
const CARE_RATINGS = [
  { audience: "Developers", stars: 5 },
  { audience: "Students", stars: 3 },
  { audience: "Researchers", stars: 4 },
  { audience: "Founders", stars: 5 },
  { audience: "Investors", stars: 4 },
];

const PREDICTION = {
  text: "MCP adoption will increase rapidly over the next six months.",
  confidence: 91,
};

function StarRow({ filled }: { filled: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < filled ? "text-goldAccent" : "text-white/10"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.98l-5.2 2.74.99-5.8-4.21-4.1 5.82-.85z" />
        </svg>
      ))}
    </div>
  );
}

export default function SignalsPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [sort, setSort] = useState<Sort>("impact");
  const [kind, setKind] = useState<Kind>("all");
  const [mode, setMode] = useState<Mode>("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const effectiveMode: Mode = token ? mode : "discover";

  const toggleTopic = (topic: string) =>
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );

  const toggleQuickFilter = (label: string) =>
    setSelectedQuickFilters((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );

  // Animated "Today's AI Snapshot" counters — count up once the row scrolls into view
  const [snapshotCounts, setSnapshotCounts] = useState(SNAPSHOT_STATS.map(() => 0));
  const snapshotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!snapshotRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const duration = 900;
        const steps = 40;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const ease = 1 - Math.pow(1 - step / steps, 3);
          setSnapshotCounts(SNAPSHOT_STATS.map((s) => Math.round(s.value * ease)));
          if (step >= steps) clearInterval(timer);
        }, duration / steps);
      },
      { threshold: 0.3 }
    );
    obs.observe(snapshotRef.current);
    return () => obs.disconnect();
  }, []);

  // Feed fetching — auto-refresh every 60 seconds
  const { data, isLoading, isError } = useQuery({
    queryKey: ["feed", effectiveMode, sort, kind, !!token],
    queryFn: () =>
      effectiveMode === "foryou" && token
        ? authApi.fetchMyFeed(token, sort === "recent" ? "impact" : sort, kind)
        : fetchFeed(sort, kind),
    refetchInterval: 60000,
  });

  // Unique topics derived from current corpus
  const allTopics = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();
    data.forEach((a) => (a.topics ?? []).forEach((t) => seen.add(t)));
    return Array.from(seen).sort();
  }, [data]);

  // Personalization signals
  const { data: bookmarks } = useQuery({
    queryKey: ["bookmarks", !!token],
    queryFn: () => authApi.getBookmarks(token!),
    enabled: !!token,
  });
  const { data: interests } = useQuery({
    queryKey: ["interests", !!token],
    queryFn: () => authApi.getInterests(token!),
    enabled: !!token,
  });

  const bookmarkedIds = new Set((bookmarks ?? []).map((a) => a.id));
  const followed = new Set((interests ?? []).map((t) => t.toLowerCase()));

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["feed"] });
    qc.invalidateQueries({ queryKey: ["bookmarks"] });
    qc.invalidateQueries({ queryKey: ["interests"] });
  };

  const bookmarkMut = useMutation({
    mutationFn: (id: number) =>
      bookmarkedIds.has(id)
        ? authApi.removeBookmark(token!, id)
        : authApi.addBookmark(token!, id),
    onSuccess: refresh,
  });
  const followMut = useMutation({
    mutationFn: (topic: string) =>
      followed.has(topic.toLowerCase())
        ? authApi.removeInterest(token!, topic)
        : authApi.addInterest(token!, topic),
    onSuccess: refresh,
  });

  // Client-side filtering: search text + selected topic chips + quick filter chips
  const filteredArticles = data?.filter((a) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      a.title.toLowerCase().includes(query) ||
      a.source.toLowerCase().includes(query) ||
      (a.topics ?? []).some((t) => t.toLowerCase().includes(query)) ||
      (a.summary_30s ?? "").toLowerCase().includes(query);
    const matchesTopics =
      selectedTopics.length === 0 ||
      selectedTopics.some((t) => (a.topics ?? []).includes(t));
    const haystack = `${a.title} ${(a.topics ?? []).join(" ")} ${a.summary_30s ?? ""}`.toLowerCase();
    const matchesQuickFilters =
      selectedQuickFilters.length === 0 ||
      selectedQuickFilters.some((f) => haystack.includes(f.toLowerCase()));
    return matchesSearch && matchesTopics && matchesQuickFilters;
  });

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      {/* Mesh Glow Background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />

      {/* Navbar */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent mb-1.5 block">Novique Pipeline</span>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">AI Intelligence</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-positive">
              <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
              Updated every 5 minutes
            </span>
          </div>
          <p className="text-sm text-textSecondary mt-1.5">Everything important happening in AI.</p>
          <p className="text-sm text-textSecondary/80 mt-1 max-w-2xl">Cut through the noise. Understand what matters. Simple. Premium.</p>
        </div>

        {/* Today's AI Snapshot */}
        <div ref={snapshotRef} className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">Today's AI Snapshot</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SNAPSHOT_STATS.map((s, i) => (
              <div key={s.label} className="bg-panel border border-white/[0.05] rounded-2xl px-4 py-4 text-center">
                <span className="block text-2xl font-display font-extrabold text-white">{snapshotCounts[i]}</span>
                <span className="block text-[10px] text-textSecondary mt-1 leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mr-1">Trending Today</span>
            {TRENDING_TODAY.map((t) => (
              <button
                key={t}
                onClick={() => setSearchQuery(t)}
                className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[11px] font-semibold text-zinc-300 hover:border-accent/40 hover:text-accent transition-all"
              >
                🔥 {t}
              </button>
            ))}
          </div>
        </div>

        {/* SIGNAL FEED SPLIT LAYOUT (FEED + SIDEBAR) */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Main Feed Column */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Feed Header / Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.05]">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">Active Intelligence</h2>
                <p className="text-xs text-textSecondary mt-0.5">Scored by Novique proprietary scoring matrix</p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Personalization Selector */}
                {token && (
                  <div className="bg-panel border border-white/[0.05] rounded-xl p-1 flex">
                    <button
                      onClick={() => setMode("discover")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        effectiveMode === "discover" ? "bg-white/10 text-white" : "text-[#94A3B8] hover:text-white"
                      }`}
                    >
                      Discover
                    </button>
                    <button
                      onClick={() => setMode("foryou")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        effectiveMode === "foryou" ? "bg-white/10 text-white" : "text-[#94A3B8] hover:text-white"
                      }`}
                    >
                      For You
                    </button>
                  </div>
                )}

                {/* Sort selector */}
                <div className="bg-panel border border-white/[0.05] rounded-xl p-1 flex">
                  {SORTS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSort(s.key)}
                      className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        sort === s.key ? "bg-white/10 text-white" : "text-[#94A3B8] hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Impact vs Trend explainer */}
            <p className="text-[11px] text-textSecondary/70 -mt-3">
              <strong className="text-zinc-400">Impact</strong> scores how important a development is (0-100). <strong className="text-zinc-400">Trend</strong> scores how fast momentum is growing (0-100). Sort by whichever matters more to you right now.
            </p>

            {/* Kind Pill Selectors */}
            <div className="flex items-center gap-2 flex-wrap">
              {KINDS.map((k) => (
                <button
                  key={k.key}
                  onClick={() => setKind(k.key)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                    kind === k.key
                      ? "border-zinc-400 bg-white/[0.04] text-white"
                      : "border-white/[0.05] text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {k.label}
                </button>
              ))}
              {searchQuery && (
                <span className="ml-auto text-xs text-zinc-400 flex items-center gap-2">
                  Filtering: <strong className="text-accent">"{searchQuery}"</strong>
                  <button onClick={() => setSearchQuery("")} className="text-zinc-500 hover:text-white font-bold">&times;</button>
                </span>
              )}
            </div>

            {/* Quick Filters: Content Type / Industry */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Content Type</span>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleQuickFilter(c)}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold border transition-all ${
                        selectedQuickFilters.includes(c)
                          ? "bg-tealAccent/20 border-tealAccent/60 text-tealAccent"
                          : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Industry</span>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => toggleQuickFilter(ind)}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold border transition-all ${
                        selectedQuickFilters.includes(ind)
                          ? "bg-goldAccent/20 border-goldAccent/60 text-goldAccent"
                          : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
              {selectedQuickFilters.length > 0 && (
                <button
                  onClick={() => setSelectedQuickFilters([])}
                  className="self-start text-[10px] text-zinc-500 hover:text-white font-bold transition-colors"
                >
                  Clear quick filters
                </button>
              )}
            </div>

            {/* Topic Interest Filter Chips */}
            {allTopics.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Filter by Interest</span>
                  {selectedTopics.length > 0 && (
                    <button
                      onClick={() => setSelectedTopics([])}
                      className="text-[10px] text-zinc-500 hover:text-white font-bold transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold border transition-all ${
                        selectedTopics.includes(topic)
                          ? "bg-[#6C63FF]/20 border-[#6C63FF]/60 text-[#a8a3ff]"
                          : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Articles List */}
            {isLoading && <p className="text-zinc-500 text-sm">Querying active signals...</p>}
            {isError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                Novique Engine connection failure.
              </div>
            )}

            <div className="flex flex-col gap-6">
              {filteredArticles?.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  authed={!!token}
                  bookmarked={bookmarkedIds.has(article.id)}
                  onToggleBookmark={(id) => bookmarkMut.mutate(id)}
                  followed={followed}
                  onToggleFollow={(topic) => followMut.mutate(topic)}
                />
              ))}

              {filteredArticles?.length === 0 && (
                <div className="bg-panel border border-white/[0.05] p-10 rounded-3xl text-center text-[#94A3B8] text-sm">
                  No signals match the current filters.
                </div>
              )}
            </div>

            {/* Guiding principle footer note */}
            <p className="text-center text-xs text-textSecondary/70 italic mt-2">
              "Where do you keep up with AI? I open Novique for five minutes every morning."
            </p>

          </div>

          {/* Right Sidebar Column */}
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">

            {/* Sidebar Block: Trending Technologies */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-goldAccent" />
                Trending Technologies
              </h4>
              <div className="flex flex-col gap-3">
                {TRENDING_TECH.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setSearchQuery(t.name)}
                    className="text-left group/bar"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-zinc-300 group-hover/bar:text-accent transition-colors">{t.name}</span>
                      <span className="text-[10px] text-zinc-500">{t.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-accent group-hover/bar:bg-accent/80 transition-all"
                        style={{ width: `${t.pct}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar Block: AI Insight + Should You Care */}
            <div className="bg-panel border border-accent/20 rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                AI Insight
              </h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                Today's biggest story is the wave of new coding-agent releases. Novique's models see this as a leading indicator: when three major labs ship coding agents in the same week, expect enterprise adoption of AI pair-programming to jump within a quarter, not a year.
              </p>

              <div className="mt-5 pt-4 border-t border-white/[0.05]">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Should You Care? (Today's Top Story)</span>
                <div className="flex flex-col gap-2">
                  {CARE_RATINGS.map((r) => (
                    <div key={r.audience} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-semibold">{r.audience}</span>
                      <StarRow filled={r.stars} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Block: Community Buzz */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-tealAccent" />
                Community Buzz
              </h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                Developer Sentiment: most developers are excited about GPT-5's coding ability. The biggest concern is pricing at scale for high-volume agent workloads.
              </p>
            </div>

            {/* Sidebar Block: AI Predictions */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-goldAccent" />
                AI Predictions
              </h4>
              <p className="text-xs text-textPrimary font-medium leading-relaxed mb-3">
                Prediction: {PREDICTION.text}
              </p>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                <span>Confidence</span>
                <span className="text-goldAccent font-bold">{PREDICTION.confidence}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-goldAccent" style={{ width: `${PREDICTION.confidence}%` }} />
              </div>
            </div>

            {/* Sidebar Block: What's Happening */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                What's Happening
              </h4>
              <div className="flex flex-col gap-4 text-xs font-normal">
                {[
                  { title: "Cursor Composer mode usage doubles in tech surveys.", velocity: "+22.4%" },
                  { title: "Meta leaks Llama 4 roadmap detailing context boundaries.", velocity: "+18.1%" },
                  { title: "Standardizing MCP server configurations receives global support.", velocity: "+34.9%" },
                  { title: "Venture index reports 12% rise in active robotics seed funding.", velocity: "+12.2%" },
                ].map((item, idx) => (
                  <div key={idx} className="border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                    <p className="text-zinc-300 font-semibold leading-relaxed hover:text-accent cursor-pointer" onClick={() => setSearchQuery(item.title.substring(0, 15))}>
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                      <span>Ref #{idx + 104}</span>
                      <span className="text-positive font-bold">{item.velocity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Block: Contributors */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-tealAccent" />
                Top Contributors
              </h4>
              <div className="flex flex-col gap-3">
                {[
                  { name: "Hacker News", articles: "Live · News" },
                  { name: "Reddit AI", articles: "Live · Community" },
                  { name: "VentureBeat / TechCrunch", articles: "Live · RSS" },
                  { name: "The Verge / Wired", articles: "Live · RSS" },
                  { name: "Dev.to", articles: "Live · Community" },
                  { name: "GitHub Trending", articles: "Live · Open Source" },
                  { name: "arXiv CS", articles: "Every 30 min · Research" },
                ].map((contrib, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="block font-bold text-zinc-200">{contrib.name}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5 block">{contrib.articles}</span>
                    </div>
                    <span className="text-accent text-[10px] font-bold">Active</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
