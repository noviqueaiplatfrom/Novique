"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchFeed } from "@/lib/api";
import * as authApi from "@/lib/auth";
import { ArticleCard } from "@/components/ArticleCard";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "./auth-context";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

export default function Home() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => { setGreeting(getGreeting()); }, []);
  const [sort, setSort] = useState<"impact" | "trend" | "recent">("recent");
  const [kind, setKind] = useState<"all" | "news" | "paper">("all");

  // Animated snapshot counters
  const SNAP_TARGETS = [6, 2, 1, 3, 4, 94];
  const [snapCounts, setSnapCounts] = useState([0, 0, 0, 0, 0, 0]);
  const [dialVisible, setDialVisible] = useState(false);
  const snapshotRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  // Brief Countdown Timer State (60 seconds loop)
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Counter animation when snapshot section enters viewport
  useEffect(() => {
    if (!snapshotRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const duration = 1000;
        const steps = 45;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const ease = 1 - Math.pow(1 - step / steps, 3);
          setSnapCounts(SNAP_TARGETS.map((t) => Math.round(t * ease)));
          if (step >= steps) clearInterval(timer);
        }, duration / steps);
      },
      { threshold: 0.3 }
    );
    obs.observe(snapshotRef.current);
    return () => obs.disconnect();
  }, []);

  // Confidence dial SVG animation when insight section enters viewport
  useEffect(() => {
    if (!dialRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setDialVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(dialRef.current);
    return () => obs.disconnect();
  }, []);

  // Fetch Signals — auto-refresh every 60 seconds
  const { data, isLoading, isError } = useQuery({
    queryKey: ["feed", "discover", sort, kind, !!token],
    queryFn: () => fetchFeed(sort, kind),
    refetchInterval: 60000,
  });

  // Bookmark & interest states for cards
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

  // Scroll-reveal: add .in-view to every [data-animate] when it enters viewport
  // Runs after data loads so dynamically added ArticleCard wrappers are picked up
  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => reveal.observe(el));
    return () => reveal.disconnect();
  }, [data]);

  // Filter and show top 5 only for the homepage signals
  const topFiveArticles = data
    ?.filter((a) => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        (a.topics ?? []).some((t) => t.toLowerCase().includes(q))
      );
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F7F9FC] relative font-sans selection:bg-[#6C63FF]/30 selection:text-white">
      {/* Mesh Glow Background */}
      <div className="absolute top-0 left-0 right-0 h-[700px] bg-gradient-to-b from-[#6C63FF]/10 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[12%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-[#6C63FF]/3 blur-[130px] pointer-events-none" />
      <div className="absolute top-[38%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-[#16C79A]/3 blur-[130px] pointer-events-none" />

      {/* Navbar */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Homepage Main Body */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-20 md:gap-28 relative z-10">
        
        {/* 1. HERO SECTION */}
        <section className="flex flex-col lg:flex-row items-stretch gap-10 md:gap-14">
          {/* Left Column */}
          <div data-animate className="flex-1 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#16C79A] mb-4 bg-[#16C79A]/10 px-3.5 py-1 rounded-full w-max">
              The AI Intelligence Platform
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6.5xl font-display font-extrabold text-white mb-4 leading-[1.1] tracking-tight">
              {greeting} 👋
            </h1>
            <p className="text-lg md:text-xl text-[#9AA8BD] font-light mb-4">
              Understand today's AI landscape in under 5 minutes.
            </p>
            <p className="text-sm text-[#9AA8BD] font-normal leading-relaxed mb-8 max-w-md">
              The fastest way for engineers, founders, investors, and AI professionals to understand what happened, why it matters, and what action to take next.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signals"
                className="px-6 py-3 rounded-xl font-bold bg-[#6C63FF] hover:bg-[#5a54e5] text-white transition-all hover:scale-[1.02] shadow-lg shadow-[#6C63FF]/20"
              >
                Read Today's Brief
              </Link>
              <Link
                href="/signals"
                className="px-6 py-3 rounded-xl font-bold border border-white/[0.08] bg-white/[0.02] text-[#9AA8BD] hover:text-white hover:bg-white/[0.05] transition-all"
              >
                Explore Signals
              </Link>
            </div>
          </div>

          {/* Right Column: Brief Indicator */}
          <div data-animate data-delay="2" className="flex-1 bg-[#17253A] border border-white/[0.05] rounded-3xl p-7 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-[0_24px_55px_rgba(0,0,0,0.4)] animate-float">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#6C63FF]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-[#F7F9FC] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16C79A] shadow-[0_0_8px_#16c79a] animate-pulse"></span>
                Active briefing status
              </h2>
              <span className="text-[10px] font-bold text-[#9AA8BD] bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded uppercase tracking-wider">Live</span>
            </div>

            <p className="text-sm text-textSecondary leading-relaxed mb-6 font-normal">
              Novique engines are aggregating reference nodes. Read the snapshot or skip directly to active signals.
            </p>

            <div className="text-[11px] text-[#9AA8BD] border-t border-white/[0.05] pt-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#16C79A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Next refresh in <strong className="text-white font-mono">{formatTime(secondsLeft)}</strong>
              </span>
              <Link href="/signals" className="text-[#6C63FF] font-bold hover:underline">Review signals &rarr;</Link>
            </div>
          </div>
        </section>

        {/* 2. TODAY'S AI SNAPSHOT */}
        <div ref={snapshotRef} className="flex flex-col gap-6">
          <div data-animate className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD]">Today's AI Snapshot</h3>
            <div className="h-[1px] bg-white/[0.06] flex-1 ml-4"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: "Major Updates",  highlight: false },
              { label: "Model Launches", highlight: false },
              { label: "Breakthroughs",  highlight: false },
              { label: "Funding Rounds", highlight: false },
              { label: "OS Launches",    highlight: false },
              { label: "Momentum Index", highlight: true  },
            ].map((item, idx) => (
              <div
                key={idx}
                data-animate
                data-delay={String(idx + 1) as "1" | "2" | "3" | "4" | "5" | "6"}
                className="bg-[#101B2D] border border-white/[0.05] p-5 rounded-2xl transition-all hover:border-[#6C63FF]/30 hover:-translate-y-1"
              >
                <span className={`block text-3xl font-display font-black tabular-nums ${item.highlight ? "text-[#16C79A]" : "text-white"}`}>
                  {idx === 5 ? `${snapCounts[5]}%` : snapCounts[idx]}
                </span>
                <span className="text-[10px] font-bold text-[#9AA8BD] uppercase tracking-wider mt-1 block">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. AI INSIGHT OF THE DAY (Gold Highlighted) */}
        <section className="flex flex-col gap-5">
          <div data-animate className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD]">AI Insight of the Day</span>
            <div className="h-[1px] bg-white/[0.06] flex-1 ml-4"></div>
          </div>

          <div data-animate data-delay="1" className="bg-[#17253A] border-2 border-[#F6C453]/40 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col lg:flex-row gap-8 shadow-[0_20px_50px_rgba(246,196,83,0.05)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F6C453]/2 rounded-full blur-3xl pointer-events-none" />
            
            {/* Left Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-black bg-[#F6C453] px-3.5 py-0.5 rounded-full">
                    Premium Insight
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#F6C453] bg-[#F6C453]/10 border border-[#F6C453]/20 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6C453] shadow-[0_0_4px_#F6C453]" />
                    96% Confidence Index
                  </span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-white mb-4">
                  Open-source coding models are improving faster than proprietary alternatives this week.
                </h3>
                
                <p className="text-sm md:text-base leading-relaxed text-[#9AA8BD] mb-6 font-normal">
                  The acceleration of open-source coding integrations (specifically via MCP servers and direct local context tools) has created a significant surge in workflow velocity. Small, fine-tuned developer-centric models are matching GPT-4 class systems on logical reasoning tasks while bypassing external latency.
                </p>
              </div>

              {/* Grid detail */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-white/[0.06] pt-5">
                <div>
                  <span className="text-[10px] font-bold text-[#F6C453] uppercase tracking-wider block mb-1">Why it matters</span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    This commoditizes generic API wrappers and shifts value to private context and local data connections.
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#16C79A] uppercase tracking-wider block mb-1">Who it impacts</span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    Founders building wrappers lose pricing power; Engineers gain 30% speed; IT gains direct local data auditability.
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-wider block mb-1">Recommended Action</span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    Begin building custom private MCP servers for your internal database schemas rather than writing custom REST APIs.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Confidence Score Dial */}
            <div ref={dialRef} className="w-full lg:w-[240px] flex flex-col items-center justify-center border-l lg:border-l border-white/[0.06] pl-0 lg:pl-8 pt-6 lg:pt-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F6C453] mb-4 block">Confidence Rating</span>

              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#F6C453"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray="263.89"
                    strokeDashoffset={dialVisible ? undefined : "263.89"}
                    strokeLinecap="round"
                    className={dialVisible ? "animate-dash-in" : ""}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-display font-black text-white">96%</span>
                  <span className="text-[9px] uppercase font-bold text-[#F6C453] tracking-wider">Confirmed</span>
                </div>
              </div>

              <span className="text-xs text-[#9AA8BD] font-semibold text-center mt-4">
                Validated across all reference nodes
              </span>
            </div>

          </div>
        </section>

        {/* 4. TODAY'S SIGNALS (TOP 5) */}
        <section className="flex flex-col gap-6">
          <div data-animate className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-plus-jakarta">Today's Signals</h2>
              <p className="text-xs text-textSecondary mt-0.5 font-normal">Top five executive analysis logs</p>
            </div>
            <Link href="/signals" className="text-xs font-semibold text-[#6C63FF] hover:text-[#5a54e5] flex items-center gap-1.5">
              View All Signals &rarr;
            </Link>
          </div>

          {/* Filter Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101B2D] border border-white/[0.05] p-3 rounded-2xl">
            {/* Left: Sort tabs */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-2 ml-1">Sort:</span>
              {[
                { key: "recent", label: "⏱️ Latest" },
                { key: "impact", label: "🔥 Top Impact" },
                { key: "trend", label: "📈 Trending" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sort === s.key
                      ? "bg-white/10 text-white"
                      : "text-[#9AA8BD] hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Right: Kind filter */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-2 ml-1">Type:</span>
              {[
                { key: "all", label: "All Items" },
                { key: "news", label: "News" },
                { key: "paper", label: "Papers" },
              ].map((k) => (
                <button
                  key={k.key}
                  onClick={() => setKind(k.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    kind === k.key
                      ? "bg-white/10 text-white"
                      : "text-[#9AA8BD] hover:text-white"
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl border border-white/[0.05] bg-[#17253A] p-7 md:p-8 flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="skeleton h-6 w-32 rounded-full" />
                    <div className="skeleton h-4 w-20 rounded-full" />
                    <div className="skeleton h-4 w-16 rounded-full" />
                  </div>
                  <div className="skeleton h-7 w-3/4" />
                  <div className="flex flex-col gap-2">
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-5/6" />
                    <div className="skeleton h-4 w-4/6" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="skeleton h-20 rounded-2xl" />
                    <div className="skeleton h-20 rounded-2xl" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="skeleton h-16 rounded-2xl" />
                    <div className="skeleton h-16 rounded-2xl" />
                    <div className="skeleton h-16 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {isError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
              Error connecting to the Novique pipeline engine.
            </div>
          )}

          <div className="flex flex-col gap-6">
            {topFiveArticles?.map((article, idx) => (
              <div key={article.id} data-animate data-delay={String(Math.min(idx + 1, 5)) as "1" | "2" | "3" | "4" | "5"}>
                <ArticleCard
                  article={article}
                  authed={!!token}
                  bookmarked={bookmarkedIds.has(article.id)}
                  onToggleBookmark={(id) => bookmarkMut.mutate(id)}
                  followed={followed}
                  onToggleFollow={(topic) => followMut.mutate(topic)}
                />
              </div>
            ))}

            {topFiveArticles?.length === 0 && (
              <div className="bg-[#17253A] border border-white/[0.05] p-10 rounded-3xl text-center text-[#9AA8BD] text-sm">
                No matching briefings found on the active stack.
              </div>
            )}
          </div>
        </section>

        {/* 5. MARKET MOMENTUM (Auto-scrolling ticker) */}
        <section className="flex flex-col gap-4">
          <div data-animate className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD]">Market Momentum</h3>
            <div className="h-[1px] bg-white/[0.06] flex-1 ml-4"></div>
          </div>

          <div className="overflow-hidden py-2 -my-2 relative">
            {/* Fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#07111F] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#07111F] to-transparent z-10" />

            {/* Duplicate the list so the loop is seamless */}
            <div className="flex items-center gap-2.5 animate-ticker w-max">
              {[
                { icon: "🤖", label: "AI Agents",        trend: "+14.2%" },
                { icon: "⚡", label: "MCP",              trend: "+32.6%", highlight: true },
                { icon: "💻", label: "Coding Models",    trend: "+8.4%"  },
                { icon: "🎙", label: "Voice AI",         trend: "+5.9%"  },
                { icon: "🦾", label: "Robotics",         trend: "+18.7%" },
                { icon: "🧠", label: "Reasoning Models", trend: "+24.1%" },
                { icon: "🏢", label: "Enterprise AI",    trend: "+9.3%"  },
                { icon: "🌐", label: "AI Infrastructure",trend: "+11.8%" },
                { icon: "🔬", label: "AI Research",      trend: "+6.2%"  },
                // duplicate for seamless loop
                { icon: "🤖", label: "AI Agents",        trend: "+14.2%" },
                { icon: "⚡", label: "MCP",              trend: "+32.6%", highlight: true },
                { icon: "💻", label: "Coding Models",    trend: "+8.4%"  },
                { icon: "🎙", label: "Voice AI",         trend: "+5.9%"  },
                { icon: "🦾", label: "Robotics",         trend: "+18.7%" },
                { icon: "🧠", label: "Reasoning Models", trend: "+24.1%" },
                { icon: "🏢", label: "Enterprise AI",    trend: "+9.3%"  },
                { icon: "🌐", label: "AI Infrastructure",trend: "+11.8%" },
                { icon: "🔬", label: "AI Research",      trend: "+6.2%"  },
              ].map((topic, i) => (
                <button
                  key={i}
                  onClick={() => setSearchQuery(topic.label)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold transition-all shrink-0 hover:scale-[1.03] ${
                    (topic as any).highlight
                      ? "bg-[#6C63FF]/10 border-[#6C63FF]/30 text-[#C084FC]"
                      : "bg-[#17253A] border-white/[0.05] text-zinc-300 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <span>{topic.icon} {topic.label}</span>
                  <span className={`text-[10px] font-semibold ${(topic as any).highlight ? "text-[#C084FC]" : "text-zinc-500"}`}>
                    {topic.trend}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 6. COMPANY WATCHLIST (TOP 6) */}
        <section className="flex flex-col gap-6">
          <div data-animate className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-plus-jakarta">Company Watchlist</h2>
              <p className="text-xs text-textSecondary mt-0.5">Top six firms tracking momentum indices</p>
            </div>
            <Link href="/companies" className="text-xs font-semibold text-[#6C63FF] hover:text-[#5a54e5] flex items-center gap-1.5">
              View All Companies &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: "OpenAI",           momentum: "9.8/10", launch: "GPT-4o realtime API",       funding: "$6.6B raised",      focus: "General Cognitive Intelligence Platforms"    },
              { name: "Anthropic",        momentum: "9.9/10", launch: "Claude 3.5 Sonnet & MCP",   funding: "$4B Amazon backing", focus: "Safety & Agentic Developer Environments"    },
              { name: "Google DeepMind",  momentum: "9.4/10", launch: "AlphaFold 3 code release",  funding: "Alphabet backed",   focus: "Scientific & Foundational Models"           },
              { name: "Meta AI",          momentum: "9.5/10", launch: "Llama 3.1 405B base",       funding: "Meta backed",       focus: "Open Weights & Decentralized Systems"       },
              { name: "Mistral",          momentum: "8.9/10", launch: "Codestral 22B coder",        funding: "$640M raised",      focus: "Efficient Edge Models"                      },
              { name: "Cursor (Anysphere)",momentum:"9.7/10", launch: "Composer tab & loops",       funding: "$30M Series A",     focus: "AI Developer Tooling"                       },
            ].map((company, idx) => (
              <Link
                key={company.name}
                href={`/companies/${company.name.toLowerCase().split(" ")[0].replace(/[()]/g, "")}`}
                data-animate
                data-delay={String(idx + 1) as "1" | "2" | "3" | "4" | "5" | "6"}
                className="bg-[#17253A] border border-white/[0.05] p-5 rounded-3xl hover:border-[#6C63FF]/30 hover:-translate-y-1 transition-all flex flex-col justify-between gap-4 group text-left"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-accent transition-colors">{company.name}</h4>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                    <span>⚡ Momentum: {company.momentum}</span>
                    <span className="text-[#16C79A]">{company.funding}</span>
                  </div>
                  <p className="text-[11px] text-[#9AA8BD] mt-2.5 leading-snug">Focus: {company.focus}</p>
                </div>
                <div className="border-t border-white/[0.04] pt-3 text-[11px] text-[#9AA8BD]">
                  <span>Latest: <strong className="text-white font-medium">{company.launch}</strong></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 7. RESEARCH INTELLIGENCE (TOP 3) */}
        <section className="flex flex-col gap-6">
          <div data-animate className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-plus-jakarta">Research Intelligence</h2>
              <p className="text-xs text-textSecondary mt-0.5">Top three academic paper reviews</p>
            </div>
            <Link href="/research" className="text-xs font-semibold text-[#6C63FF] hover:text-[#5a54e5] flex items-center gap-1.5">
              View All Research &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "KAN: Kolmogorov-Arnold Networks",
                explanation: "An alternative to Multi-Layer Perceptrons (MLPs). Uses spline-based activation functions on edges rather than nodes, improving interpretability.",
                citations: "1,240 citations",
                confidence: "98% Confidence",
                url: "https://arxiv.org/abs/2404.19756"
              },
              {
                title: "Model Context Protocol (MCP)",
                explanation: "Anthropic's open-source architecture connecting AI agents to environments. Standardizes data query formatting to streamline workflows.",
                citations: "128 citations",
                confidence: "96% Confidence",
                url: "https://github.com/modelcontextprotocol"
              },
              {
                title: "Attention Is All You Need",
                explanation: "The foundational paper replacing sequential architectures (RNNs) with self-attention networks, forming the basis of modern generative models.",
                citations: "112,490 citations",
                confidence: "100% Confidence",
                url: "https://arxiv.org/abs/1706.03762"
              }
            ].map((paper, idx) => (
              <div key={idx} data-animate data-delay={String(idx + 1) as "1" | "2" | "3"} className="bg-[#17253A] border border-white/[0.05] p-6 rounded-3xl hover:border-[#6C63FF]/30 hover:-translate-y-1 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#16C79A] uppercase tracking-widest mb-4">
                    <span>{paper.confidence}</span>
                    <span className="text-zinc-500">{paper.citations}</span>
                  </div>
                  <h4 className="text-base font-display font-extrabold text-white mb-2 group-hover:text-accent transition-colors leading-snug">{paper.title}</h4>
                  <p className="text-xs text-[#9AA8BD] leading-relaxed mb-4">{paper.explanation}</p>

                </div>
                <div className="border-t border-white/[0.04] pt-4 mt-auto">
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2 bg-[#101B2D]/60 hover:bg-[#101B2D] border border-white/[0.05] hover:border-accent/30 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all block"
                  >
                    Read Paper &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. LEARN WHAT'S NEXT */}
        <section className="flex flex-col gap-6">
          <div data-animate className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-plus-jakarta">Learn What's Next</h2>
              <p className="text-xs text-textSecondary mt-0.5 font-normal">Modular guides for active technical concepts</p>
            </div>
            <Link href="/learning" className="text-xs font-semibold text-[#6C63FF] hover:text-[#5a54e5] flex items-center gap-1.5">
              View All Lessons &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { slug: "mcp-server-development",      title: "Introduction to MCP",      desc: "Model Context Protocol communication APIs developed by Anthropic.", time: "5 min",  diff: "Intermediate" },
              { slug: "agentic-rag-pipelines",       title: "Agentic RAG Pipelines",    desc: "Retrieval-augmented generation architectures for vector data loading.", time: "10 min", diff: "Beginner"     },
              { slug: "prompt-engineering-production",title: "Prompt Engineering",       desc: "Production-grade prompt patterns and chain-of-thought optimisation.", time: "8 min",  diff: "Advanced"     },
            ].map((lesson, idx) => (
              <Link
                key={idx}
                href={`/learning/${lesson.slug}`}
                data-animate
                data-delay={String(idx + 1) as "1" | "2" | "3"}
                className="bg-[#17253A] border border-white/[0.05] p-5 rounded-3xl hover:border-[#6C63FF]/30 hover:-translate-y-1 transition-all flex flex-col justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center justify-between text-[9px] font-bold text-[#16C79A] uppercase tracking-wider mb-2">
                    <span>{lesson.diff}</span>
                    <span className="text-zinc-500">{lesson.time} read</span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1 group-hover:text-accent transition-colors">{lesson.title}</h4>
                  <p className="text-xs text-[#9AA8BD] leading-relaxed">{lesson.desc}</p>
                </div>
                <span className="py-2 px-3 bg-[#101B2D]/60 group-hover:bg-[#101B2D] border border-white/[0.05] group-hover:border-accent/30 rounded-xl text-xs font-bold text-zinc-300 group-hover:text-white transition-all text-center block">
                  Start Lesson &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 9. AI OPPORTUNITY OF THE DAY (Gold Highlighted) */}
        <section data-animate className="relative rounded-3xl p-0.5 overflow-hidden animate-gradient-bg bg-gradient-to-r from-[#F6C453] via-[#6C63FF] to-[#16C79A] shadow-[0_20px_50px_rgba(246,196,83,0.08)]">
          <div className="bg-[#101B2D] p-6 md:p-8 rounded-[22px] flex flex-col md:flex-row gap-8 justify-between">
            {/* Left */}
            <div className="md:w-1/3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F6C453] block">
                    AI Opportunity of the Day
                  </span>
                  <span className="text-[9px] text-zinc-500 font-semibold">Traction Spike</span>
                </div>
                <h3 className="text-2xl font-plus-jakarta font-extrabold text-white leading-tight">
                  Model Context Protocol
                </h3>
              </div>
              <p className="text-xs text-[#9AA8BD] mt-3 leading-relaxed">
                Mentions in enterprise developer postings increased 38% this week. Standardizing database connections.
              </p>
            </div>

            {/* Middle */}
            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-bold text-[#F6C453] uppercase tracking-widest block mb-1">Career Impact</span>
                <p className="text-base font-bold text-white">High (Enterprise Integrators)</p>
                
                <span className="text-[10px] font-bold text-[#16C79A] uppercase tracking-widest block mb-1 mt-4">Estimated Learning Time</span>
                <p className="text-xs text-zinc-300">20 minutes module</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#C084FC] uppercase tracking-widest block mb-1.5">Companies Adopting It</span>
                <div className="flex flex-wrap gap-1.5">
                  {["Anthropic", "OpenAI", "Microsoft"].map((adopter) => (
                    <span key={adopter} className="text-[10px] font-semibold text-white bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded">
                      {adopter}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right CTA */}
            <div className="md:w-1/6 flex flex-col justify-center items-end gap-2">
              <Link
                href="/learning/mcp-server-development"
                className="w-full md:w-auto px-5 py-3 rounded-xl font-bold bg-[#F6C453] hover:bg-[#e0b23f] text-black transition-all text-xs text-center shadow-lg shadow-[#F6C453]/10"
              >
                Start Learning
              </Link>
              <Link href="/opportunities" className="text-[10px] text-zinc-500 font-semibold hover:underline">
                View All Opportunities &rarr;
              </Link>
            </div>

          </div>
        </section>

        {/* 10. WEEKLY INTELLIGENCE REPORT (Gold Highlighted) */}
        <section data-animate className="bg-[#17253A] border-2 border-[#F6C453]/30 rounded-3xl p-7 md:p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
          <div className="flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F6C453] block mb-2">Weekly Synthesis</span>
            <h3 className="text-2xl font-display font-extrabold text-white mb-2">Weekly Intelligence Report</h3>
            <p className="text-xs text-[#9AA8BD] max-w-xl leading-relaxed">
              Consolidated executive intelligence report on rising stars, breakthroughs, and enterprise shifts across the entire AI landscape. Download the full PDF synthesis.
            </p>
          </div>

          <Link
            href="/weekly-reports/july-week-1-2026"
            className="py-3 px-6 bg-[#F6C453] hover:bg-[#e0b23f] text-black rounded-xl text-xs font-bold transition-all shrink-0 shadow-lg shadow-[#F6C453]/10"
          >
            Read This Week's Report
          </Link>
        </section>

      </main>

      {/* 11. FOOTER */}
      <footer className="border-t border-white/[0.05] py-10 mt-16 bg-[#07111F]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#9AA8BD]">
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">About</span>
            <span className="hover:text-white cursor-pointer transition-colors">API</span>
            <span className="hover:text-white cursor-pointer transition-colors">Blog</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
          </div>
          <div>
            &copy; 2026 Novique. Scored and aggregated by the Novique AI platform.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-white cursor-pointer transition-colors">GitHub</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
