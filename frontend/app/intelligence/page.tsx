"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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

// Today's AI Snapshot: mock counts, animated in when the row scrolls into view
const SNAPSHOT_STATS: { label: string; value: number }[] = [
  { label: "Intelligence Updates", value: 38 },
  { label: "Model Releases", value: 6 },
  { label: "Research Papers", value: 11 },
  { label: "Funding Events", value: 3 },
  { label: "Acquisitions", value: 2 },
  { label: "Major Announcements", value: 5 },
];

const TRENDING_TODAY = ["AI Agents", "MCP", "Reasoning", "Video Generation", "Enterprise AI"];

// Trending Technologies: proportional bars, longest = most trending
const TRENDING_TECH = [
  { name: "AI Agents", pct: 100 },
  { name: "MCP", pct: 87 },
  { name: "Reasoning Models", pct: 76 },
  { name: "Coding AI", pct: 63 },
  { name: "Video AI", pct: 51 },
  { name: "Vision AI", pct: 40 },
];

// Quick filter chips: genuinely filter the live feed via title/topic/summary text match,
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

// Breaking Intelligence categorization: keyword buckets applied to the live feed's
// title/topics/summary text, using the same keyword-match approach the quick filters use.
const BREAKING_CATEGORIES: { key: string; label: string; icon: string; keywords: string[] }[] = [
  { key: "launches", label: "Launches", icon: "🚀", keywords: ["launch", "release", "unveil", "debut", "introduc"] },
  { key: "acquisitions", label: "Acquisitions", icon: "🤝", keywords: ["acqui", "merger", "buys ", "bought"] },
  { key: "funding", label: "Funding", icon: "💰", keywords: ["funding", "raises", "raised", "series ", "investment", "valuation"] },
  { key: "regulations", label: "Regulations", icon: "⚖️", keywords: ["regulat", "policy", "compliance", "legislat", "lawsuit", "antitrust"] },
  { key: "opensource", label: "Open Source", icon: "🧩", keywords: ["open source", "open-source", "open weight", "github"] },
];

// Keywords used to identify model-focused coverage for the "Most Impactful Models" ranking
const MODEL_KEYWORDS = ["gpt", "claude", "gemini", "llama", "mistral", "grok", "model", "llm"];

const getHaystack = (a: { title: string; topics: string[] | null; summary_30s: string | null }) =>
  `${a.title} ${(a.topics ?? []).join(" ")} ${a.summary_30s ?? ""}`.toLowerCase();

const matchesKeywords = (haystack: string, keywords: string[]) => keywords.some((k) => haystack.includes(k));

// AI Trend Radar: cooling topics and enterprise adoption have no live backend metric yet,
// so these two lists are illustrative editorial estimates (same convention as PREDICTION above).
const DECLINING_TOPICS = [
  { name: "Generic Chatbot Wrappers", pct: -18 },
  { name: "Prompt Engineering Guides", pct: -12 },
  { name: "Basic RAG Tutorials", pct: -9 },
  { name: "NFT + AI Experiments", pct: -31 },
];

const ENTERPRISE_ADOPTION = [
  { sector: "Financial Services", pct: 74 },
  { sector: "Healthcare", pct: 58 },
  { sector: "Retail & Ecommerce", pct: 66 },
  { sector: "Manufacturing", pct: 41 },
  { sector: "Government", pct: 29 },
];

// AI Opportunity Signals: startup whitespace and hiring surges are editorial estimates;
// investment opportunities and commercialization-ready research below are derived from the live feed.
const STARTUP_OPPORTUNITIES = [
  { idea: "Vertical AI agents for legal contract review", gap: "High demand, few specialized players" },
  { idea: "Local-first coding copilots for regulated industries", gap: "Data residency concerns unmet by incumbents" },
  { idea: "AI-native QA and testing for agent workflows", gap: "Agent reliability tooling still immature" },
  { idea: "Compliance automation for AI model deployment", gap: "Regulation is outpacing existing tooling" },
];

const HIRING_SURGES = [
  { role: "AI Infrastructure Engineer", velocity: "+41%" },
  { role: "Applied Research Scientist", velocity: "+27%" },
  { role: "Prompt / Agent Systems Engineer", velocity: "+35%" },
  { role: "AI Safety & Policy Specialist", velocity: "+19%" },
];

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">{eyebrow}</span>
        <div className="h-[1px] bg-white/[0.06] flex-1" />
      </div>
      <h2 className="text-xl md:text-2xl font-display font-extrabold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-textSecondary">{subtitle}</p>}
    </div>
  );
}

function RankRow({
  rank,
  primary,
  secondary,
  value,
  valueClassName,
}: {
  rank: number;
  primary: string;
  secondary?: string;
  value?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[10px] font-black text-zinc-600 w-4 shrink-0">{rank}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-zinc-200 truncate">{primary}</p>
          {secondary && <p className="text-[10px] text-zinc-500 truncate">{secondary}</p>}
        </div>
      </div>
      {value && <span className={`text-[11px] font-bold shrink-0 ${valueClassName ?? "text-zinc-400"}`}>{value}</span>}
    </div>
  );
}

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

export default function IntelligencePage() {
  return (
    <Suspense fallback={null}>
      <IntelligencePageInner />
    </Suspense>
  );
}

function IntelligencePageInner() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<Sort>("impact");
  const [kind, setKind] = useState<Kind>("all");
  const [mode, setMode] = useState<Mode>("discover");
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const [activeBreaking, setActiveBreaking] = useState<string | null>(null);
  const effectiveMode: Mode = token ? mode : "discover";

  const toggleTopic = (topic: string) =>
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );

  const toggleQuickFilter = (label: string) =>
    setSelectedQuickFilters((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );

  // Animated "Today's AI Snapshot" counters: count up once the row scrolls into view
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

  // Feed fetching: auto-refresh every 60 seconds
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

  // Client-side filtering: search text + selected topic chips + quick filter chips + breaking category
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
    const haystack = getHaystack(a);
    const matchesQuickFilters =
      selectedQuickFilters.length === 0 ||
      selectedQuickFilters.some((f) => haystack.includes(f.toLowerCase()));
    const activeCategory = BREAKING_CATEGORIES.find((c) => c.key === activeBreaking);
    const matchesBreaking = !activeCategory || matchesKeywords(haystack, activeCategory.keywords);
    return matchesSearch && matchesTopics && matchesQuickFilters && matchesBreaking;
  });

  // ---- Derived intelligence dashboards (computed live from the current feed corpus) ----
  const safeData = useMemo(() => data ?? [], [data]);

  // AI Market Pulse: composite market health, trend momentum, and top-impact events
  const marketHealth = useMemo(() => {
    if (safeData.length === 0) return 0;
    const avgImpact = safeData.reduce((sum, a) => sum + (a.impact_score ?? 0), 0) / safeData.length;
    const avgTrend = safeData.reduce((sum, a) => sum + (a.trend_score ?? 0), 0) / safeData.length;
    return Math.round(avgImpact * 0.6 + avgTrend * 0.4);
  }, [safeData]);

  const trendMomentum = useMemo(() => {
    if (safeData.length === 0) return 0;
    return Math.round(safeData.reduce((sum, a) => sum + (a.trend_score ?? 0), 0) / safeData.length);
  }, [safeData]);

  const majorEvents = useMemo(
    () => [...safeData].sort((a, b) => b.impact_score - a.impact_score).slice(0, 4),
    [safeData]
  );

  // Breaking Intelligence: live counts per category, derived from the same feed the article list uses
  const breakingCounts = useMemo(
    () =>
      BREAKING_CATEGORIES.map((c) => ({
        ...c,
        count: safeData.filter((a) => matchesKeywords(getHaystack(a), c.keywords)).length,
      })),
    [safeData]
  );

  // AI Trend Radar: topic-level stats derived from the live feed's topics + trend/impact scores
  const topicStats = useMemo(() => {
    const map = new Map<string, { count: number; trendSum: number; impactSum: number }>();
    safeData.forEach((a) => {
      (a.topics ?? []).forEach((t) => {
        const entry = map.get(t) ?? { count: 0, trendSum: 0, impactSum: 0 };
        entry.count += 1;
        entry.trendSum += a.trend_score ?? 0;
        entry.impactSum += a.impact_score ?? 0;
        map.set(t, entry);
      });
    });
    return Array.from(map.entries()).map(([topic, s]) => ({
      topic,
      count: s.count,
      avgTrend: s.trendSum / s.count,
      avgImpact: s.impactSum / s.count,
    }));
  }, [safeData]);

  const fastGrowingTopics = useMemo(
    () => [...topicStats].sort((a, b) => b.avgTrend - a.avgTrend).slice(0, 5),
    [topicStats]
  );

  const emergingTechnologies = useMemo(
    () =>
      [...topicStats]
        .filter((t) => t.count <= 2)
        .sort((a, b) => b.avgTrend - a.avgTrend)
        .slice(0, 5),
    [topicStats]
  );

  // AI Opportunity Signals: funding-tagged coverage and commercialization-ready papers
  const investmentOpportunities = useMemo(() => {
    const fundingKeywords = BREAKING_CATEGORIES.find((c) => c.key === "funding")!.keywords;
    return [...safeData]
      .filter((a) => matchesKeywords(getHaystack(a), fundingKeywords))
      .sort((a, b) => b.impact_score - a.impact_score)
      .slice(0, 5);
  }, [safeData]);

  const commercializationReady = useMemo(
    () =>
      [...safeData]
        .filter((a) => a.kind === "paper")
        .sort((a, b) => b.impact_score - a.impact_score)
        .slice(0, 5),
    [safeData]
  );

  // Weekly Intelligence Report: source-level aggregates and specialty rankings
  const sourceStats = useMemo(() => {
    const map = new Map<
      string,
      { count: number; impactSum: number; trendSum: number; positive: number; negative: number }
    >();
    safeData.forEach((a) => {
      const key = a.source || a.domain;
      const entry = map.get(key) ?? { count: 0, impactSum: 0, trendSum: 0, positive: 0, negative: 0 };
      entry.count += 1;
      entry.impactSum += a.impact_score ?? 0;
      entry.trendSum += a.trend_score ?? 0;
      const s = (a.sentiment ?? "").toLowerCase();
      if (s.includes("pos")) entry.positive += 1;
      if (s.includes("neg")) entry.negative += 1;
      map.set(key, entry);
    });
    return Array.from(map.entries()).map(([source, s]) => ({
      source,
      count: s.count,
      avgImpact: s.impactSum / s.count,
      avgTrend: s.trendSum / s.count,
      positive: s.positive,
      negative: s.negative,
    }));
  }, [safeData]);

  const biggestWinners = useMemo(
    () =>
      [...sourceStats]
        .sort((a, b) => b.positive - a.positive || b.avgImpact - a.avgImpact)
        .slice(0, 5),
    [sourceStats]
  );

  const biggestLosers = useMemo(
    () =>
      [...sourceStats]
        .filter((s) => s.negative > 0)
        .sort((a, b) => b.negative - a.negative || a.avgImpact - b.avgImpact)
        .slice(0, 5),
    [sourceStats]
  );

  const fastestMoving = useMemo(
    () => [...sourceStats].sort((a, b) => b.avgTrend - a.avgTrend).slice(0, 5),
    [sourceStats]
  );

  const keyResearch = useMemo(
    () =>
      [...safeData]
        .filter((a) => a.kind === "paper")
        .sort((a, b) => (b.citation_count ?? 0) - (a.citation_count ?? 0))
        .slice(0, 5),
    [safeData]
  );

  const impactfulModels = useMemo(
    () =>
      [...safeData]
        .filter((a) => matchesKeywords(getHaystack(a), MODEL_KEYWORDS))
        .sort((a, b) => b.impact_score - a.impact_score)
        .slice(0, 5),
    [safeData]
  );

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

        {/* SECTION 1: AI MARKET PULSE */}
        <section className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="Section 01"
            title="AI Market Pulse"
            subtitle="Overall market health, momentum, and the biggest events moving the needle right now."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Market Health */}
            <div className="bg-panel border border-white/[0.05] rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Market Health Score</span>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-display font-extrabold text-white">{marketHealth}</span>
                <span className="text-xs text-zinc-500 mb-1">/ 100</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-tealAccent" style={{ width: `${Math.min(marketHealth, 100)}%` }} />
              </div>
              <p className="text-[10px] text-zinc-500">Composite index blending live impact and trend scores across today's corpus.</p>
            </div>

            {/* Trend Momentum */}
            <div className="bg-panel border border-white/[0.05] rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Trend Momentum</span>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-display font-extrabold text-white">{trendMomentum}</span>
                <span className="text-xs text-zinc-500 mb-1">/ 100</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(trendMomentum, 100)}%` }} />
              </div>
              <p className="text-[10px] text-zinc-500">Average momentum across active signals. Higher means faster-growing attention.</p>
            </div>

            {/* Major Events */}
            <div className="bg-panel border border-white/[0.05] rounded-2xl p-5 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Major Events</span>
              {majorEvents.length === 0 && <p className="text-[11px] text-zinc-500">No signals loaded yet.</p>}
              {majorEvents.map((a, i) => (
                <button key={a.id} onClick={() => setSearchQuery(a.title.slice(0, 18))} className="text-left">
                  <RankRow
                    rank={i + 1}
                    primary={a.title}
                    secondary={a.source}
                    value={`${Math.round(a.impact_score)}`}
                    valueClassName="text-goldAccent"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Today's AI Snapshot (weekly activity score) */}
          <div ref={snapshotRef} className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">Weekly Activity Score</span>
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
        </section>

        {/* SECTION 2: BREAKING INTELLIGENCE (live feed + sidebar) */}
        <section className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="Section 02"
            title="Breaking Intelligence"
            subtitle="Live updates across launches, acquisitions, funding, regulation, and open-source releases."
          />

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

            {/* Breaking Intelligence: live category counts, derived from the feed below */}
            <div className="flex flex-wrap gap-2">
              {breakingCounts.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveBreaking((prev) => (prev === c.key ? null : c.key))}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                    activeBreaking === c.key
                      ? "border-accent/60 bg-accent/15 text-white"
                      : "border-white/[0.05] bg-panel text-zinc-300 hover:border-zinc-600"
                  }`}
                >
                  <span>{c.icon} {c.label}</span>
                  <span className={activeBreaking === c.key ? "text-accent" : "text-zinc-500"}>{c.count}</span>
                </button>
              ))}
              {activeBreaking && (
                <button
                  onClick={() => setActiveBreaking(null)}
                  className="text-[10px] text-zinc-500 hover:text-white font-bold self-center"
                >
                  Clear category
                </button>
              )}
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
        </section>

        {/* SECTION 3: AI TREND RADAR */}
        <section className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="Section 03"
            title="AI Trend Radar"
            subtitle="Emerging technologies, fast-growing and cooling topics, and enterprise adoption by sector."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Emerging Technologies */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-tealAccent" />
                Emerging Technologies
              </h4>
              {emergingTechnologies.length === 0 && (
                <p className="text-xs text-zinc-500">Not enough low-volume, high-momentum topics in the current feed yet.</p>
              )}
              <div className="flex flex-col">
                {emergingTechnologies.map((t, i) => (
                  <button key={t.topic} onClick={() => setSearchQuery(t.topic)} className="text-left w-full">
                    <RankRow
                      rank={i + 1}
                      primary={t.topic}
                      secondary={`${t.count} signal${t.count === 1 ? "" : "s"} tracked`}
                      value={`${Math.round(t.avgTrend)}`}
                      valueClassName="text-tealAccent"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Fast-Growing Topics */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Fast-Growing Topics
              </h4>
              {fastGrowingTopics.length === 0 && <p className="text-xs text-zinc-500">No topic data yet.</p>}
              <div className="flex flex-col">
                {fastGrowingTopics.map((t, i) => (
                  <button key={t.topic} onClick={() => setSearchQuery(t.topic)} className="text-left w-full">
                    <RankRow
                      rank={i + 1}
                      primary={t.topic}
                      secondary={`Avg impact ${Math.round(t.avgImpact)}`}
                      value={`${Math.round(t.avgTrend)}`}
                      valueClassName="text-accent"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Declining Topics (illustrative) */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-negative" />
                Cooling Topics
              </h4>
              <div className="flex flex-col gap-3">
                {DECLINING_TOPICS.map((t) => (
                  <div key={t.name} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-semibold">{t.name}</span>
                    <span className="text-negative font-bold">{t.pct}%</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 mt-4">Illustrative editorial index. No live decline metric is tracked yet.</p>
            </div>

            {/* Enterprise Adoption (illustrative) */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-goldAccent" />
                Enterprise Adoption
              </h4>
              <div className="flex flex-col gap-3">
                {ENTERPRISE_ADOPTION.map((s) => (
                  <div key={s.sector}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-zinc-300">{s.sector}</span>
                      <span className="text-[10px] text-zinc-500">{s.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-goldAccent" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 mt-4">Illustrative editorial index. No live adoption metric is tracked yet.</p>
            </div>
          </div>
        </section>

        {/* SECTION 4: AI OPPORTUNITY INTELLIGENCE */}
        <section className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="Section 04"
            title="AI Opportunity Intelligence"
            subtitle="Startup whitespace, commercialization-ready research, hiring surges, and live investment activity."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* New Startup Opportunities (illustrative) */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                New Startup Opportunities
              </h4>
              <div className="flex flex-col gap-4">
                {STARTUP_OPPORTUNITIES.map((o) => (
                  <div key={o.idea} className="border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold text-zinc-200 leading-relaxed">{o.idea}</p>
                    <p className="text-[10px] text-zinc-500 mt-1">{o.gap}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 mt-4">Illustrative whitespace estimates, not derived from live signals.</p>
            </div>

            {/* Research Ready for Commercialization */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-tealAccent" />
                Research Ready for Commercialization
              </h4>
              {commercializationReady.length === 0 && (
                <p className="text-xs text-zinc-500">No research papers in the current feed.</p>
              )}
              <div className="flex flex-col">
                {commercializationReady.map((a, i) => (
                  <button key={a.id} onClick={() => setSearchQuery(a.title.slice(0, 18))} className="text-left w-full">
                    <RankRow
                      rank={i + 1}
                      primary={a.title}
                      secondary={a.source}
                      value={`${Math.round(a.impact_score)}`}
                      valueClassName="text-tealAccent"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Hiring Surges (illustrative) */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-goldAccent" />
                Hiring Surges
              </h4>
              <div className="flex flex-col gap-3">
                {HIRING_SURGES.map((h) => (
                  <div key={h.role} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-semibold">{h.role}</span>
                    <span className="text-positive font-bold">{h.velocity}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 mt-4">Illustrative hiring index, not derived from live signals.</p>
            </div>

            {/* Investment Opportunities */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Investment Opportunities
              </h4>
              {investmentOpportunities.length === 0 && (
                <p className="text-xs text-zinc-500">No funding-tagged signals in the current feed.</p>
              )}
              <div className="flex flex-col">
                {investmentOpportunities.map((a, i) => (
                  <button key={a.id} onClick={() => setSearchQuery(a.title.slice(0, 18))} className="text-left w-full">
                    <RankRow
                      rank={i + 1}
                      primary={a.title}
                      secondary={a.source}
                      value={`${Math.round(a.impact_score)}`}
                      valueClassName="text-accent"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: WEEKLY INTELLIGENCE REPORT */}
        <section className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="Section 05"
            title="Weekly Intelligence Report"
            subtitle="Biggest winners and losers, fastest-moving companies, key research, and the most impactful models."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Biggest Winners */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-positive" />
                Biggest Winners
              </h4>
              {biggestWinners.length === 0 && <p className="text-xs text-zinc-500">No source data yet.</p>}
              <div className="flex flex-col">
                {biggestWinners.map((s, i) => (
                  <RankRow
                    key={s.source}
                    rank={i + 1}
                    primary={s.source}
                    secondary={`${s.count} signal${s.count === 1 ? "" : "s"}`}
                    value={`${Math.round(s.avgImpact)}`}
                    valueClassName="text-positive"
                  />
                ))}
              </div>
            </div>

            {/* Biggest Losers */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-negative" />
                Biggest Losers
              </h4>
              {biggestLosers.length === 0 && (
                <p className="text-xs text-zinc-500">No negative-sentiment signals detected this week.</p>
              )}
              <div className="flex flex-col">
                {biggestLosers.map((s, i) => (
                  <RankRow
                    key={s.source}
                    rank={i + 1}
                    primary={s.source}
                    secondary={`${s.count} signal${s.count === 1 ? "" : "s"}`}
                    value={`${Math.round(s.avgImpact)}`}
                    valueClassName="text-negative"
                  />
                ))}
              </div>
            </div>

            {/* Fastest-Moving Companies */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Fastest-Moving Companies
              </h4>
              {fastestMoving.length === 0 && <p className="text-xs text-zinc-500">No source data yet.</p>}
              <div className="flex flex-col">
                {fastestMoving.map((s, i) => (
                  <RankRow
                    key={s.source}
                    rank={i + 1}
                    primary={s.source}
                    secondary={`Avg impact ${Math.round(s.avgImpact)}`}
                    value={`${Math.round(s.avgTrend)}`}
                    valueClassName="text-accent"
                  />
                ))}
              </div>
            </div>

            {/* Key Research */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-tealAccent" />
                Key Research
              </h4>
              {keyResearch.length === 0 && <p className="text-xs text-zinc-500">No research papers in the current feed.</p>}
              <div className="flex flex-col">
                {keyResearch.map((a, i) => (
                  <button key={a.id} onClick={() => setSearchQuery(a.title.slice(0, 18))} className="text-left w-full">
                    <RankRow
                      rank={i + 1}
                      primary={a.title}
                      secondary={a.source}
                      value={`${a.citation_count} cites`}
                      valueClassName="text-tealAccent"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Most Impactful Models */}
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 shadow-md lg:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-goldAccent" />
                Most Impactful Models
              </h4>
              {impactfulModels.length === 0 && <p className="text-xs text-zinc-500">No model-focused signals in the current feed.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {impactfulModels.map((a, i) => (
                  <button key={a.id} onClick={() => setSearchQuery(a.title.slice(0, 18))} className="text-left w-full">
                    <RankRow
                      rank={i + 1}
                      primary={a.title}
                      secondary={a.source}
                      value={`${Math.round(a.impact_score)}`}
                      valueClassName="text-goldAccent"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
