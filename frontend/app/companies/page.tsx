"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

type ResearchLevel = "High" | "Moderate" | "Low";
type HiringLevel = "High" | "Stable" | "Low";
type Trend = "up" | "flat" | "down";

interface CompanySummary {
  slug: string;
  name: string;
  logoLetter: string;
  tagline: string;
  momentumScore: number;
  growthRate: number;
  latestModelRelease: string;
  signalsThisWeek: number;
  researchActivity: ResearchLevel;
  hiringMomentum: HiringLevel;
  hiringTrend: Trend;
  techFocus: string[];
  fundingHeadline: string;
  fundingDate: string;
  foundedYear: number;
}

const COMPANIES: CompanySummary[] = [
  {
    slug: "openai",
    name: "OpenAI",
    logoLetter: "O",
    tagline: "General Cognitive Intelligence Platforms",
    momentumScore: 96,
    growthRate: 38,
    latestModelRelease: "GPT-5",
    signalsThisWeek: 18,
    researchActivity: "High",
    hiringMomentum: "High",
    hiringTrend: "up",
    techFocus: ["LLMs", "Reasoning", "Agents", "Voice AI"],
    fundingHeadline: "$6.6B raised",
    fundingDate: "Oct 2024 round",
    foundedYear: 2015,
  },
  {
    slug: "anthropic",
    name: "Anthropic",
    logoLetter: "A",
    tagline: "Safety & Agentic Developer Environments",
    momentumScore: 97,
    growthRate: 45,
    latestModelRelease: "Claude 5",
    signalsThisWeek: 21,
    researchActivity: "High",
    hiringMomentum: "High",
    hiringTrend: "up",
    techFocus: ["LLMs", "AI Safety", "Agents", "Coding AI"],
    fundingHeadline: "$4B Amazon + $2B Google backing",
    fundingDate: "2024 rounds",
    foundedYear: 2021,
  },
  {
    slug: "google-deepmind",
    name: "Google DeepMind",
    logoLetter: "G",
    tagline: "Scientific Breakthrough & Foundational Models",
    momentumScore: 93,
    growthRate: 22,
    latestModelRelease: "Gemini 3",
    signalsThisWeek: 16,
    researchActivity: "High",
    hiringMomentum: "Stable",
    hiringTrend: "flat",
    techFocus: ["LLMs", "Vision", "Science AI", "Robotics"],
    fundingHeadline: "Parent-Alphabet backed",
    fundingDate: "Ongoing",
    foundedYear: 2010,
  },
  {
    slug: "meta-ai",
    name: "Meta AI",
    logoLetter: "M",
    tagline: "Open Weights & Decentralized Architectures",
    momentumScore: 91,
    growthRate: 19,
    latestModelRelease: "Llama 4",
    signalsThisWeek: 14,
    researchActivity: "High",
    hiringMomentum: "Stable",
    hiringTrend: "up",
    techFocus: ["LLMs", "Open Source", "Vision", "AR/VR"],
    fundingHeadline: "Parent-Meta backed",
    fundingDate: "Ongoing",
    foundedYear: 2013,
  },
  {
    slug: "mistral",
    name: "Mistral",
    logoLetter: "M",
    tagline: "Efficient, Highly Parameter-dense Edge Models",
    momentumScore: 84,
    growthRate: 15,
    latestModelRelease: "Mistral Large 3",
    signalsThisWeek: 9,
    researchActivity: "Moderate",
    hiringMomentum: "Stable",
    hiringTrend: "flat",
    techFocus: ["LLMs", "Edge AI", "Coding AI"],
    fundingHeadline: "$640M raised",
    fundingDate: "Series B",
    foundedYear: 2023,
  },
  {
    slug: "cursor",
    name: "Cursor (Anysphere)",
    logoLetter: "C",
    tagline: "AI-Augmented Developer Environments",
    momentumScore: 92,
    growthRate: 64,
    latestModelRelease: "Composer 2 Agent Engine",
    signalsThisWeek: 12,
    researchActivity: "Moderate",
    hiringMomentum: "High",
    hiringTrend: "up",
    techFocus: ["Coding AI", "Agents", "Developer Tools"],
    fundingHeadline: "$60M raised",
    fundingDate: "Series B",
    foundedYear: 2022,
  },
  {
    slug: "perplexity",
    name: "Perplexity",
    logoLetter: "P",
    tagline: "AI-Driven Search & Information Indexing",
    momentumScore: 88,
    growthRate: 33,
    latestModelRelease: "Sonar 2 Search Model",
    signalsThisWeek: 11,
    researchActivity: "Moderate",
    hiringMomentum: "Stable",
    hiringTrend: "up",
    techFocus: ["Search AI", "LLMs", "Agents"],
    fundingHeadline: "$500M raised, $9B valuation",
    fundingDate: "2025 round",
    foundedYear: 2022,
  },
  {
    slug: "microsoft-ai",
    name: "Microsoft AI",
    logoLetter: "M",
    tagline: "Enterprise Copilots & Agentic Productivity",
    momentumScore: 90,
    growthRate: 17,
    latestModelRelease: "Copilot Actions Agent Suite",
    signalsThisWeek: 15,
    researchActivity: "High",
    hiringMomentum: "Stable",
    hiringTrend: "flat",
    techFocus: ["Enterprise AI", "Agents", "LLMs", "Copilots"],
    fundingHeadline: "Parent-Microsoft backed, $13B OpenAI stake",
    fundingDate: "Ongoing",
    foundedYear: 2023,
  },
  {
    slug: "xai",
    name: "xAI",
    logoLetter: "X",
    tagline: "Truth-Seeking Reasoning Models at Scale",
    momentumScore: 89,
    growthRate: 58,
    latestModelRelease: "Grok 5",
    signalsThisWeek: 13,
    researchActivity: "Moderate",
    hiringMomentum: "High",
    hiringTrend: "up",
    techFocus: ["LLMs", "Reasoning", "Real-time Data"],
    fundingHeadline: "$12B raised",
    fundingDate: "2025 round",
    foundedYear: 2023,
  },
  {
    slug: "deepseek",
    name: "DeepSeek",
    logoLetter: "D",
    tagline: "Efficient Training & Open Frontier Models",
    momentumScore: 86,
    growthRate: 71,
    latestModelRelease: "DeepSeek V4",
    signalsThisWeek: 10,
    researchActivity: "High",
    hiringMomentum: "Stable",
    hiringTrend: "up",
    techFocus: ["LLMs", "Efficient Training", "Open Source"],
    fundingHeadline: "Backed by High-Flyer Capital",
    fundingDate: "Self-funded",
    foundedYear: 2023,
  },
  {
    slug: "cohere",
    name: "Cohere",
    logoLetter: "C",
    tagline: "Enterprise-Grade Language & Retrieval Models",
    momentumScore: 78,
    growthRate: 12,
    latestModelRelease: "Command R3",
    signalsThisWeek: 7,
    researchActivity: "Moderate",
    hiringMomentum: "Low",
    hiringTrend: "flat",
    techFocus: ["Enterprise AI", "LLMs", "RAG"],
    fundingHeadline: "$500M raised",
    fundingDate: "Series D",
    foundedYear: 2019,
  },
  {
    slug: "hugging-face",
    name: "Hugging Face",
    logoLetter: "H",
    tagline: "Open Source Model Hub & Tooling",
    momentumScore: 85,
    growthRate: 24,
    latestModelRelease: "Inference Endpoints 2.0",
    signalsThisWeek: 12,
    researchActivity: "High",
    hiringMomentum: "Stable",
    hiringTrend: "up",
    techFocus: ["Open Source", "Model Hub", "Developer Tools"],
    fundingHeadline: "$235M raised",
    fundingDate: "Series D",
    foundedYear: 2016,
  },
];

function trendGlyph(trend: Trend) {
  if (trend === "up") return { icon: "↑", cls: "text-positive" };
  if (trend === "down") return { icon: "↓", cls: "text-negative" };
  return { icon: "→", cls: "text-textSecondary" };
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const steps = 30;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const ease = 1 - Math.pow(1 - step / steps, 3);
          setDisplay(Math.round(value * ease));
          if (step >= steps) clearInterval(timer);
        }, 900 / steps);
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function MomentumBar({ score }: { score: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWidth(score);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [score]);

  return (
    <div ref={ref} className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent to-tealAccent transition-all duration-[1100ms] ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function CompanyLogo({ letter, size = "md" }: { letter: string; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-base";
  return (
    <div
      className={`${dims} shrink-0 rounded-2xl bg-gradient-to-br from-accent/25 to-tealAccent/15 border border-white/[0.08] flex items-center justify-center font-display font-extrabold text-white`}
    >
      {letter}
    </div>
  );
}

function DiscoveryRow({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div data-animate className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">{children}</div>
    </div>
  );
}

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = COMPANIES.filter((c) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.tagline.toLowerCase().includes(q) ||
      c.techFocus.some((t) => t.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => reveal.observe(el));
    return () => reveal.disconnect();
  }, []);

  const trending = [...COMPANIES].sort((a, b) => b.momentumScore - a.momentumScore).slice(0, 6);
  const recentReleases = COMPANIES.slice(0, 8);
  const fastestGrowing = [...COMPANIES].sort((a, b) => b.growthRate - a.growthRate).slice(0, 6);
  const researchActive = COMPANIES.filter((c) => c.researchActivity === "High").sort(
    (a, b) => b.momentumScore - a.momentumScore
  );
  const mostActive = [...COMPANIES].sort((a, b) => b.signalsThisWeek - a.signalsThisWeek).slice(0, 6);
  const fundingActivity = [...COMPANIES].sort((a, b) => b.momentumScore - a.momentumScore).slice(0, 6);
  const hiringMomentum = [...COMPANIES].sort((a, b) => {
    const rank = { High: 2, Stable: 1, Low: 0 };
    return rank[b.hiringMomentum] - rank[a.hiringMomentum];
  });

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12 relative z-10 animate-fade-in">
        {/* Hero */}
        <div data-animate>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent mb-1.5 block">Company Intelligence</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Companies Intelligence</h1>
          <p className="text-base text-white font-semibold mt-2">Track and understand every major AI company.</p>
          <p className="text-sm text-textSecondary mt-1 max-w-2xl">
            Discover their latest models, research, hiring trends, technology focus, and AI momentum. Search names
            like OpenAI, Anthropic, Google DeepMind, Meta AI, Microsoft AI, Mistral, DeepSeek, Cohere, Perplexity,
            Cursor, xAI, or Hugging Face to jump straight to a company.
          </p>
        </div>

        {/* Discovery sections */}
        <div className="flex flex-col gap-9">
          <DiscoveryRow emoji="🔥" title="Trending Companies">
            {trending.map((c) => (
              <Link
                key={c.slug}
                href={`/companies/${c.slug}`}
                className="shrink-0 w-52 bg-panel border border-white/[0.05] rounded-2xl p-4 hover:border-accent/30 transition-all flex flex-col gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <CompanyLogo letter={c.logoLetter} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{c.name}</p>
                    <p className="text-[10px] text-textSecondary">Momentum <AnimatedNumber value={c.momentumScore} /></p>
                  </div>
                </div>
                <MomentumBar score={c.momentumScore} />
              </Link>
            ))}
          </DiscoveryRow>

          <DiscoveryRow emoji="🚀" title="Recently Released Models">
            {recentReleases.map((c) => (
              <Link
                key={c.slug}
                href={`/companies/${c.slug}`}
                className="shrink-0 w-56 bg-panel border border-white/[0.05] rounded-2xl p-4 hover:border-accent/30 transition-all"
              >
                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">{c.name}</span>
                <p className="text-sm font-display font-bold text-white mt-1 leading-snug">{c.latestModelRelease}</p>
                <span className="text-[10px] text-tealAccent font-semibold mt-2 block">View Intelligence &rarr;</span>
              </Link>
            ))}
          </DiscoveryRow>

          <DiscoveryRow emoji="📈" title="Fastest Growing Companies">
            {fastestGrowing.map((c) => (
              <Link
                key={c.slug}
                href={`/companies/${c.slug}`}
                className="shrink-0 w-48 bg-panel border border-white/[0.05] rounded-2xl p-4 hover:border-accent/30 transition-all flex flex-col gap-1.5"
              >
                <span className="text-xs font-bold text-white truncate">{c.name}</span>
                <span className="text-lg font-display font-extrabold text-positive">
                  +<AnimatedNumber value={c.growthRate} suffix="%" />
                </span>
                <span className="text-[10px] text-textSecondary">Momentum growth, 90d</span>
              </Link>
            ))}
          </DiscoveryRow>

          <DiscoveryRow emoji="📚" title="Most Research Active">
            {researchActive.map((c) => (
              <Link
                key={c.slug}
                href={`/companies/${c.slug}`}
                className="shrink-0 w-48 bg-panel border border-white/[0.05] rounded-2xl p-4 hover:border-accent/30 transition-all flex flex-col gap-2"
              >
                <span className="text-xs font-bold text-white truncate">{c.name}</span>
                <span className="text-[10px] font-extrabold text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider w-fit">
                  {c.researchActivity} Activity
                </span>
                <span className="text-[10px] text-textSecondary">{c.techFocus[0]} research focus</span>
              </Link>
            ))}
          </DiscoveryRow>

          <DiscoveryRow emoji="⚡" title="Most Active Companies">
            {mostActive.map((c) => (
              <Link
                key={c.slug}
                href={`/companies/${c.slug}`}
                className="shrink-0 w-48 bg-panel border border-white/[0.05] rounded-2xl p-4 hover:border-accent/30 transition-all flex flex-col gap-1.5"
              >
                <span className="text-xs font-bold text-white truncate">{c.name}</span>
                <span className="text-lg font-display font-extrabold text-goldAccent">
                  <AnimatedNumber value={c.signalsThisWeek} />
                </span>
                <span className="text-[10px] text-textSecondary">signals this week</span>
              </Link>
            ))}
          </DiscoveryRow>

          <DiscoveryRow emoji="💰" title="Funding Activity">
            {fundingActivity.map((c) => (
              <Link
                key={c.slug}
                href={`/companies/${c.slug}`}
                className="shrink-0 w-56 bg-panel border border-white/[0.05] rounded-2xl p-4 hover:border-accent/30 transition-all flex flex-col gap-1.5"
              >
                <span className="text-xs font-bold text-white truncate">{c.name}</span>
                <span className="text-xs font-semibold text-tealAccent leading-snug">{c.fundingHeadline}</span>
                <span className="text-[10px] text-textSecondary">{c.fundingDate}</span>
              </Link>
            ))}
          </DiscoveryRow>

          <DiscoveryRow emoji="👨‍💻" title="Hiring Momentum">
            {hiringMomentum.map((c) => {
              const glyph = trendGlyph(c.hiringTrend);
              return (
                <Link
                  key={c.slug}
                  href={`/companies/${c.slug}`}
                  className="shrink-0 w-44 bg-panel border border-white/[0.05] rounded-2xl p-4 hover:border-accent/30 transition-all flex flex-col gap-1.5"
                >
                  <span className="text-xs font-bold text-white truncate">{c.name}</span>
                  <span className={`text-sm font-extrabold flex items-center gap-1.5 ${glyph.cls}`}>
                    {c.hiringMomentum} <span>{glyph.icon}</span>
                  </span>
                  <span className="text-[10px] text-textSecondary">hiring trend</span>
                </Link>
              );
            })}
          </DiscoveryRow>
        </div>

        {/* Browse All Companies */}
        <div data-animate className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-display font-extrabold text-white">Browse All Companies</h2>
            <p className="text-sm text-textSecondary mt-1">
              Full roster of tracked AI companies, updated with every signal, release, and hire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((c) => {
              const glyph = trendGlyph(c.hiringTrend);
              return (
                <Link
                  key={c.slug}
                  href={`/companies/${c.slug}`}
                  className="bg-panel border border-white/[0.05] p-6 rounded-3xl hover:border-accent/30 hover:bg-panel/85 transition-all flex flex-col gap-5 group shadow-md text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CompanyLogo letter={c.logoLetter} />
                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-white group-hover:text-accent transition-colors truncate">{c.name}</h4>
                        <p className="text-[11px] text-textSecondary truncate">{c.tagline}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] text-textSecondary font-bold uppercase tracking-wider mb-1.5">
                      <span>AI Momentum Score</span>
                      <span className="text-white font-display text-sm normal-case tracking-normal">
                        <AnimatedNumber value={c.momentumScore} />/100
                      </span>
                    </div>
                    <MomentumBar score={c.momentumScore} />
                  </div>

                  <div className="border-t border-white/[0.04] pt-4 text-xs flex flex-col gap-2.5">
                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500 font-medium shrink-0">Latest Model:</span>
                      <span className="font-semibold text-white text-right">{c.latestModelRelease}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500 font-medium shrink-0">Signals This Week:</span>
                      <span className="font-semibold text-goldAccent">{c.signalsThisWeek}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500 font-medium shrink-0">Research Activity:</span>
                      <span className="font-semibold text-zinc-300">{c.researchActivity}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500 font-medium shrink-0">Hiring Momentum:</span>
                      <span className={`font-semibold flex items-center gap-1 ${glyph.cls}`}>
                        {c.hiringMomentum} <span>{glyph.icon}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {c.techFocus.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-zinc-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-bold text-accent group-hover:underline mt-auto">View Intelligence &rarr;</span>
                </Link>
              );
            })}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-16 text-sm text-textSecondary">
              No companies match &quot;{searchQuery}&quot;. Try OpenAI, Anthropic, or Mistral.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
