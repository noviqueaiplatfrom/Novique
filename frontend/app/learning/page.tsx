"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

const LESSONS = [
  {
    slug: "mcp-server-development",
    type: "Skill",
    title: "MCP Server Development",
    description: "Build context-aware AI integrations using Anthropic's Model Context Protocol. One server works with every MCP-compatible client: Cursor, Claude Desktop, VS Code.",
    why: "MCP is now the standard integration layer for AI agents. Engineers who can build MCP servers are being hired at $280k–$340k in the Bay Area.",
    time: "20 min",
    difficulty: "Intermediate",
    impact: "High",
  },
  {
    slug: "local-llm-fine-tuning-unsloth",
    type: "Technology",
    title: "Local LLM Fine-Tuning with Unsloth",
    description: "Train domain-specific models on consumer hardware at 2-5x speed with 60% less VRAM than standard HuggingFace training.",
    why: "Fine-tuned 3B models outperform GPT-4o on narrow enterprise tasks at a fraction of the per-token cost. Unsloth makes this feasible without a cluster.",
    time: "45 min",
    difficulty: "Intermediate",
    impact: "Medium-High",
  },
  {
    slug: "kolmogorov-arnold-networks",
    type: "Research",
    title: "Kolmogorov-Arnold Networks (KANs)",
    description: "Interpretable neural architectures that replace MLPs for scientific computing, using learnable B-spline activations on network edges.",
    why: "KANs can extract symbolic mathematical formulas from data. MIT and DeepMind are applying them to physics and protein-interaction models.",
    time: "60 min",
    difficulty: "Advanced",
    impact: "High",
  },
  {
    slug: "voice-ai-agent-pipeline",
    type: "Startup Integration",
    title: "Voice AI Agent Pipeline Engineering",
    description: "Build sub-200ms speech-to-speech agents using Deepgram STT, OpenAI streaming, and ElevenLabs TTS over WebSocket.",
    why: "Voice agents now replace entire inbound call centers. Companies like Vapi and Retell are hiring pipeline engineers at high velocity.",
    time: "30 min",
    difficulty: "Intermediate",
    impact: "Very High",
  },
  {
    slug: "agentic-rag-pipelines",
    type: "Architecture",
    title: "Agentic RAG Pipelines",
    description: "Build retrieval-augmented generation systems that route queries, re-rank results, and iteratively refine answers using LangChain and vector databases.",
    why: "RAG is now the default architecture for enterprise AI. Engineers who can tune chunking, embeddings, and retrieval strategies are in constant demand.",
    time: "35 min",
    difficulty: "Intermediate",
    impact: "Very High",
  },
  {
    slug: "prompt-engineering-production",
    type: "Skill",
    title: "Prompt Engineering for Production",
    description: "Master chain-of-thought, few-shot prompting, system prompt design, and systematic evaluation for production LLM applications.",
    why: "Prompt quality is still the primary lever for LLM output quality. Structured prompting reduces token costs 30–60% while improving accuracy.",
    time: "25 min",
    difficulty: "Beginner",
    impact: "High",
  },
];

const diffColor: Record<string, string> = {
  Beginner: "text-tealAccent",
  Intermediate: "text-accent",
  Advanced: "text-goldAccent",
};

export default function LearningPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [completed, setCompleted] = useState<Record<string, { pct: number; certId: string }>>({});

  useEffect(() => {
    try { setCompleted(JSON.parse(localStorage.getItem("noviqe_completed") || "{}")); } catch {}
  }, []);

  const filtered = LESSONS.filter((l) => {
    const q = searchQuery.toLowerCase();
    return l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.type.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-tealAccent mb-1.5 block">Noviqe Academy</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Learn What&apos;s Next</h1>
          <p className="text-sm text-textSecondary mt-1">Modular developer-focused lessons covering emerging protocols, techniques, and architectures — each with a graded assessment and certificate.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((lesson) => {
            const done = !!completed[lesson.slug];
            return (
              <div key={lesson.slug} className="bg-panel border border-white/[0.05] p-6 rounded-3xl hover:border-accent/30 transition-all flex flex-col justify-between group shadow-md relative overflow-hidden">
                {done && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-tealAccent/10 border border-tealAccent/25 rounded-full px-2.5 py-0.5">
                    <svg className="w-3 h-3 text-tealAccent" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span className="text-[9px] font-bold text-tealAccent uppercase tracking-widest">Passed {completed[lesson.slug].pct}%</span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-goldAccent bg-goldAccent/10 border border-goldAccent/20 px-2.5 py-0.5 rounded-full">{lesson.type}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${diffColor[lesson.difficulty] ?? "text-zinc-400"}`}>{lesson.difficulty}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold ml-auto">{lesson.time}</span>
                  </div>
                  <h3 className="text-lg font-display font-extrabold text-white mb-2 group-hover:text-accent transition-colors leading-snug">{lesson.title}</h3>
                  <p className="text-xs text-textSecondary leading-relaxed mb-4">{lesson.description}</p>
                  <div className="bg-white/[0.01] border-l-2 border-accent px-3 py-2.5 rounded-r-xl mb-5">
                    <span className="block text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-0.5">Why it matters</span>
                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">{lesson.why}</p>
                  </div>
                </div>
                <Link
                  href={`/learning/${lesson.slug}`}
                  className="w-full text-center py-2.5 bg-secondaryBg/60 hover:bg-secondaryBg border border-white/[0.05] hover:border-accent/30 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all block"
                >
                  {done ? "Review Lesson" : "Start Learning"} &rarr;
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
