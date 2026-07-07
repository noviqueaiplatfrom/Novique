"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [completed, setCompleted] = useState<Record<string, { pct: number; certId: string }>>({});
  const router = useRouter();

  useEffect(() => {
    try { setCompleted(JSON.parse(localStorage.getItem("noviqe_completed") || "{}")); } catch {}
  }, []);

  const opportunities = [
    {
      slug: "mcp-server-development",
      type: "Skill",
      title: "Model Context Protocol (MCP) Server Development",
      reason: "Mentions in job postings for AI integration engineers have spiked 38% this week. Companies are standardizing context loading pipelines.",
      time: "20 minutes",
      impact: "High",
      adopters: ["Anthropic", "OpenAI", "Microsoft"],
      highlight: true,
    },
    {
      slug: "agentic-rag-pipelines",
      type: "Architecture",
      title: "Agentic RAG Pipeline Engineering",
      reason: "RAG is the default enterprise AI architecture. Engineers who can tune chunking, embeddings, re-ranking, and retrieval strategies see 40%+ salary premiums.",
      time: "35 minutes",
      impact: "Very High",
      adopters: ["LangChain", "LlamaIndex", "Pinecone"],
      highlight: false,
    },
    {
      slug: "voice-ai-agent-pipeline",
      type: "Startup Integration",
      title: "Voice AI Agent Pipeline Engineering",
      reason: "Low-latency WebSocket voice bots are replacing legacy IVR telephone directories. Massive demand for engineers who can configure real-time audio channels.",
      time: "30 minutes",
      impact: "Very High",
      adopters: ["Retell AI", "Vapi", "Bland AI"],
      highlight: false,
    },
    {
      slug: "local-llm-fine-tuning-unsloth",
      type: "Technology",
      title: "Local LLM Fine-Tuning with Unsloth",
      reason: "Unsloth training speedups reduce Llama 3 fine-tuning times by 2-5x. Essential for startups building domain-specific models without a cluster.",
      time: "45 minutes",
      impact: "Medium-High",
      adopters: ["Anysphere (Cursor)", "Replicate", "Together AI"],
      highlight: false,
    },
    {
      slug: "prompt-engineering-production",
      type: "Skill",
      title: "Prompt Engineering for Production",
      reason: "Structured prompting reduces token costs 30-60% while improving accuracy. Every LLM application team is hiring for this skill.",
      time: "25 minutes",
      impact: "High",
      adopters: ["Brex", "Notion", "Linear"],
      highlight: false,
    },
    {
      slug: "kolmogorov-arnold-networks",
      type: "Research",
      title: "Implementing Kolmogorov-Arnold Networks (KANs)",
      reason: "KANs have shown a high performance-to-compute ratio in scientific models. High demand for engineers who can convert KAN research into production code.",
      time: "60 minutes",
      impact: "High",
      adopters: ["MIT Physics Labs", "DeepMind Biological Research"],
      highlight: false,
    },
  ];

  const filteredOpps = opportunities.filter((o) => {
    const q = searchQuery.toLowerCase();
    return o.title.toLowerCase().includes(q) || o.reason.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-goldAccent mb-1.5 block">Career Signals</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">AI Opportunities</h1>
          <p className="text-sm text-textSecondary mt-1">High-impact skills, open-source technologies, and startups showing substantial momentum spikes.</p>
        </div>

        {/* Featured */}
        {opportunities[0] && (
          <div className="bg-panel border-2 border-goldAccent/40 rounded-3xl p-7 md:p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 justify-between shadow-[0_20px_50px_rgba(246,196,83,0.06)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-goldAccent/2 rounded-full blur-3xl pointer-events-none" />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-black bg-goldAccent px-3.5 py-0.5 rounded-full">
                    AI Opportunity of the Day
                  </span>
                  {completed[opportunities[0].slug] && (
                    <span className="inline-flex items-center gap-1 bg-tealAccent/10 border border-tealAccent/25 rounded-full px-2.5 py-0.5">
                      <svg className="w-3 h-3 text-tealAccent" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      <span className="text-[9px] font-bold text-tealAccent uppercase tracking-widest">Passed {completed[opportunities[0].slug].pct}%</span>
                    </span>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-extrabold text-white leading-tight mb-2">{opportunities[0].title}</h3>
                <p className="text-sm text-textSecondary mt-2 leading-relaxed max-w-2xl">{opportunities[0].reason}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/[0.06] pt-5 mt-5">
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Type</span>
                  <span className="text-xs font-semibold text-white">{opportunities[0].type}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Learning Time</span>
                  <span className="text-xs font-semibold text-white">{opportunities[0].time}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Career Impact</span>
                  <span className="text-xs font-semibold text-tealAccent">{opportunities[0].impact}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Adopters</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {opportunities[0].adopters.map((a) => (
                      <span key={a} className="text-[9px] bg-white/[0.04] px-1 py-0.5 rounded text-white">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/6 flex items-center justify-end">
              <button
                onClick={() => router.push(`/learning/${opportunities[0].slug}`)}
                className="w-full md:w-auto px-5 py-3 rounded-xl font-bold bg-goldAccent hover:bg-[#e0b23f] text-black transition-all text-xs text-center shadow-lg shadow-goldAccent/10"
              >
                {completed[opportunities[0].slug] ? "Review Lesson" : "Start Learning"}
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {filteredOpps.slice(1).map((opp) => {
            const done = !!completed[opp.slug];
            return (
              <div key={opp.slug} className="bg-panel border border-white/[0.05] p-6 rounded-3xl hover:border-accent/30 hover:bg-panel/80 transition-all flex flex-col justify-between group shadow-md relative">
                {done && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-tealAccent/10 border border-tealAccent/25 rounded-full px-2 py-0.5">
                    <svg className="w-2.5 h-2.5 text-tealAccent" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span className="text-[8px] font-bold text-tealAccent uppercase tracking-widest">{completed[opp.slug].pct}%</span>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-accent uppercase tracking-widest mb-4">
                    <span>{opp.type}</span>
                    <span className="text-tealAccent">{opp.impact} Impact</span>
                  </div>
                  <h4 className="text-lg font-display font-extrabold text-white mb-2 group-hover:text-accent transition-colors leading-snug pr-12">{opp.title}</h4>
                  <p className="text-xs text-textSecondary leading-relaxed mb-6">{opp.reason}</p>
                </div>
                <div className="border-t border-white/[0.04] pt-4 mt-auto">
                  <div className="flex justify-between text-xs mb-4">
                    <span className="text-zinc-500">Adopters:</span>
                    <span className="font-semibold text-white">{opp.adopters.join(", ")}</span>
                  </div>
                  <button
                    onClick={() => router.push(`/learning/${opp.slug}`)}
                    className="w-full text-center py-2 bg-secondaryBg/60 hover:bg-secondaryBg border border-white/[0.05] hover:border-accent/30 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all"
                  >
                    {done ? "Review Lesson" : "Start Learning"} &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
