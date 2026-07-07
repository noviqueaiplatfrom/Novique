"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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

export default function SignalsPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [sort, setSort] = useState<Sort>("impact");
  const [kind, setKind] = useState<Kind>("all");
  const [mode, setMode] = useState<Mode>("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const effectiveMode: Mode = token ? mode : "discover";

  const toggleTopic = (topic: string) =>
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );

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

  // Client-side filtering: search text + selected topic chips
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
    return matchesSearch && matchesTopics;
  });

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      {/* Mesh Glow Background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />

      {/* Navbar */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent mb-1.5 block">Noviqe Pipeline</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Market Signals</h1>
          <p className="text-sm text-textSecondary mt-1">Real-time intelligence aggregation of corporate, academic and open-source updates.</p>
        </div>

        {/* SIGNAL FEED SPLIT LAYOUT (FEED + SIDEBAR) */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Feed Column */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Feed Header / Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.05]">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">Active Intelligence</h2>
                <p className="text-xs text-textSecondary mt-0.5">Scored by Noviqe proprietary scoring matrix</p>
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
                Noviqe Engine connection failure.
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

          </div>

          {/* Right Sidebar Column */}
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
            
            {/* Sidebar Block 1: What's Happening */}
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

            {/* Sidebar Block 2: Contributors */}
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
