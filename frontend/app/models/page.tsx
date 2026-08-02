"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { MODELS, type ModelSummary, type PurposeTag } from "@/lib/modelsData";

const PURPOSE_TAGS: PurposeTag[] = [
  "Coding", "Reasoning", "Vision", "Video", "Audio", "Agents", "Writing",
  "Research", "Math", "Enterprise", "Open Source", "Commercial",
  "API Available", "Free", "Multimodal", "Long Context", "Fast", "Cheap",
];

const LOGO_STYLES: Record<ModelSummary["logoColor"], string> = {
  accent: "bg-accent/10 border-accent/25 text-accent",
  teal: "bg-tealAccent/10 border-tealAccent/25 text-tealAccent",
  gold: "bg-goldAccent/10 border-goldAccent/25 text-goldAccent",
};

function topBy(models: ModelSummary[], keyFn: (m: ModelSummary) => number, n: number) {
  return models.slice().sort((a, b) => keyFn(b) - keyFn(a)).slice(0, n);
}

const FEATURED_SECTIONS: { emoji: string; title: string; desc: string; models: ModelSummary[] }[] = [
  { emoji: "⭐", title: "Editor's Picks", desc: "Novique recommends these models based on overall capability.", models: topBy(MODELS, (m) => m.aiScore, 3) },
  { emoji: "💻", title: "Best for Coding", desc: "Highest-scoring models for software development and code generation.", models: topBy(MODELS, (m) => m.scores.coding, 3) },
  { emoji: "🧠", title: "Best for Reasoning", desc: "Strongest logical and multi-step reasoning performance.", models: topBy(MODELS, (m) => m.scores.reasoning, 3) },
  { emoji: "🎨", title: "Best for Creativity", desc: "Top picks for writing, ideation, and creative generation.", models: topBy(MODELS, (m) => m.scores.creativity, 3) },
  { emoji: "🎥", title: "Best Multimodal", desc: "Leading models across vision, audio, and video understanding.", models: topBy(MODELS, (m) => m.scores.multimodal, 3) },
  { emoji: "💰", title: "Best Value", desc: "The strongest capability-per-dollar across the field.", models: topBy(MODELS, (m) => m.scores.value, 3) },
  { emoji: "⚡", title: "Fastest Models", desc: "Lowest latency and quickest token throughput.", models: topBy(MODELS, (m) => m.scores.speed, 3) },
  { emoji: "📖", title: "Longest Context", desc: "Models built to process the largest documents and codebases.", models: topBy(MODELS, (m) => m.contextWindowTokens, 3) },
  { emoji: "🌍", title: "Open Source Models", desc: "Openly licensed weights for self-hosting and fine-tuning.", models: MODELS.filter((m) => m.license === "Open Source") },
  { emoji: "🚀", title: "Recently Released", desc: "The newest model releases and version updates.", models: topBy(MODELS, (m) => new Date(m.latestReleaseDate).getTime(), 3) },
  { emoji: "📈", title: "Most Popular", desc: "The most widely adopted models by developers and enterprises.", models: topBy(MODELS, (m) => m.popularity, 3) },
];

function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = score >= 90 ? "#16C79A" : score >= 80 ? "#6C63FF" : "#F6C453";
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="transparent" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-display font-extrabold text-white" style={{ fontSize: size * 0.3 }}>{score}</span>
    </div>
  );
}

function ModelMiniCard({ model }: { model: ModelSummary }) {
  return (
    <Link
      href={`/models/${model.slug}`}
      className="shrink-0 w-64 bg-panel border border-white/[0.05] rounded-2xl p-5 hover:border-accent/30 transition-all flex flex-col gap-3 group"
    >
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-[11px] font-extrabold ${LOGO_STYLES[model.logoColor]}`}>
          {model.logoLetter}
        </div>
        <ScoreRing score={model.aiScore} size={38} />
      </div>
      <div>
        <h4 className="text-sm font-display font-extrabold text-white group-hover:text-accent transition-colors leading-snug">{model.name}</h4>
        <p className="text-[11px] text-textSecondary mt-0.5 font-medium">{model.maker}</p>
      </div>
      <p className="text-[11px] text-textSecondary leading-relaxed">{model.bestFor}</p>
    </Link>
  );
}

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Set<PurposeTag>>(new Set());

  const toggleTag = (tag: PurposeTag) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const filteredModels = MODELS.filter((m) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.maker.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q) ||
      m.blurb.toLowerCase().includes(q);
    const matchesTags = activeTags.size === 0 || Array.from(activeTags).every((t) => m.tags.includes(t));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12 relative z-10 animate-fade-in">
        {/* Hero */}
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent mb-1.5 block">AI Models</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Discover, compare and understand every major AI model.</h1>
          <p className="text-sm text-textSecondary mt-2 max-w-2xl">Find the right model for your work, not just the newest one.</p>
        </div>

        {/* Quick purpose filters */}
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-textSecondary mb-3 block">Filter by purpose</span>
          <div className="flex flex-wrap gap-2">
            {PURPOSE_TAGS.map((tag) => {
              const active = activeTags.has(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all ${
                    active
                      ? "bg-accent border-accent text-white"
                      : "bg-panel border-white/[0.08] text-textSecondary hover:border-accent/40 hover:text-white"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
            {activeTags.size > 0 && (
              <button
                onClick={() => setActiveTags(new Set())}
                className="text-xs font-bold px-3.5 py-1.5 rounded-full border border-white/[0.08] text-zinc-500 hover:text-white transition-all"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Featured sections */}
        <div className="flex flex-col gap-10">
          {FEATURED_SECTIONS.map((sec) => (
            <section key={sec.title} className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
                  <span>{sec.emoji}</span> {sec.title}
                </h3>
                <p className="text-xs text-textSecondary mt-1">{sec.desc}</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {sec.models.map((m) => (
                  <ModelMiniCard key={`${sec.title}-${m.slug}`} model={m} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Main model grid */}
        <div className="border-t border-white/[0.05] pt-10">
          <div className="mb-6">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-tealAccent mb-1.5 block">Full Index</span>
            <h2 className="text-2xl font-display font-extrabold text-white">All Models</h2>
            <p className="text-sm text-textSecondary mt-1">Deep specifications, capability reviews, and adoption trend tracking for every tracked model.</p>
          </div>

          {filteredModels.length === 0 ? (
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-10 text-center text-sm text-textSecondary">
              No models match your current filters. Try clearing a filter or search term.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredModels.map((model) => (
                <Link
                  key={model.slug}
                  href={`/models/${model.slug}`}
                  className="bg-panel border border-white/[0.05] p-7 md:p-8 rounded-3xl hover:border-accent/30 transition-all flex flex-col gap-5 group shadow-md text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-xs font-extrabold shrink-0 ${LOGO_STYLES[model.logoColor]}`}>
                        {model.logoLetter}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#C084FC] uppercase tracking-widest">
                          <span>{model.maker}</span>
                          <span className="text-zinc-600">&middot;</span>
                          <span className="text-zinc-500 font-semibold normal-case">{model.version}</span>
                        </div>
                        <h4 className="text-xl font-display font-extrabold text-white group-hover:text-accent transition-colors leading-snug">{model.name}</h4>
                      </div>
                    </div>
                    <ScoreRing score={model.aiScore} size={52} />
                  </div>

                  <p className="text-sm text-[#94A3B8] leading-relaxed font-normal">{model.blurb}</p>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-300">
                      {model.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${
                        model.license === "Open Source"
                          ? "bg-tealAccent/10 border-tealAccent/20 text-tealAccent"
                          : "bg-white/[0.04] border-white/[0.06] text-zinc-300"
                      }`}
                    >
                      {model.license}
                    </span>
                  </div>

                  <div className="border-t border-white/[0.04] pt-5 mt-auto grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase tracking-wide mb-1">Best For</span>
                      <span className="font-semibold text-white">{model.bestFor}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase tracking-wide mb-1">Popularity</span>
                      <div className="h-1.5 rounded-full bg-white/10 mt-2">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${model.popularity}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-accent group-hover:underline">View Intelligence &rarr;</span>
                    <span className="text-[10px] font-bold text-zinc-500 border border-white/[0.08] px-2.5 py-1 rounded-lg">Compare</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Closing note */}
        <div className="text-center border-t border-white/[0.05] pt-8">
          <p className="text-xs text-textSecondary italic max-w-xl mx-auto">
            The Models page is not a technical specification sheet, it is an AI decision platform.
          </p>
        </div>
      </main>
    </div>
  );
}
