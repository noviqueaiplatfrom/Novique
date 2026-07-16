"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
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

// ---------------------------------------------------------------------------
// New mock data powering the Learning Intelligence sections around the core
// lesson/quiz/certificate system. Everything below is static/mock content,
// same convention as the rest of the app (no new API routes).
// ---------------------------------------------------------------------------

const CORE_PIPELINE = [
  "Research",
  "New Technology",
  "Companies Adopt It",
  "Models Support It",
  "Industry Demand Increases",
  "Novique Recommends Learning It",
];

const SNAPSHOT_STATS: { label: string; value: number; color: string }[] = [
  { label: "Skills Trending", value: 18, color: "text-tealAccent" },
  { label: "New Technologies", value: 6, color: "text-accent" },
  { label: "Skills Declining", value: 4, color: "text-negative" },
];

const TOP_HIRING_SKILLS = ["AI Agents", "MCP", "Coding Agents", "Reasoning", "Evaluation", "Voice AI", "Knowledge Graphs"];

const TRENDING_SKILLS: { name: string; score: number; delta: string; trend: "up" | "stable" }[] = [
  { name: "AI Agents", score: 98, delta: "+18%", trend: "up" },
  { name: "MCP", score: 95, delta: "+35%", trend: "up" },
  { name: "Evaluation", score: 92, delta: "+12%", trend: "up" },
  { name: "Prompt Engineering", score: 90, delta: "Stable", trend: "stable" },
  { name: "Voice AI", score: 88, delta: "+20%", trend: "up" },
];

const ROLES = ["Data Engineer", "Product Manager", "Founder"] as const;
type Role = (typeof ROLES)[number];

interface RoleRec { title: string; stars: number; note: string; time: string; difficulty: string }

const ROLE_RECOMMENDATIONS: Record<Role, RoleRec[]> = {
  "Data Engineer": [
    { title: "MCP", stars: 5, note: "Growing rapidly across enterprise AI.", time: "Est. 5 Hours", difficulty: "Intermediate" },
    { title: "Vector Databases", stars: 4, note: "Core infrastructure for every RAG pipeline you'll build.", time: "Est. 4 Hours", difficulty: "Intermediate" },
    { title: "Agentic RAG Pipelines", stars: 4, note: "The natural next step once your data layer is solid.", time: "Est. 6 Hours", difficulty: "Advanced" },
  ],
  "Product Manager": [
    { title: "AI Product Evaluation", stars: 5, note: "Ship confidently by knowing how to measure model quality.", time: "Est. 3 Hours", difficulty: "Intermediate" },
    { title: "Prompt Design", stars: 4, note: "Write specs engineers can turn directly into prompts.", time: "Est. 2 Hours", difficulty: "Beginner" },
    { title: "AI UX", stars: 4, note: "Design patterns for latency, uncertainty, and failure states.", time: "Est. 3 Hours", difficulty: "Intermediate" },
    { title: "LLM Evaluation", stars: 5, note: "The top skill hiring managers screen AI PMs for.", time: "Est. 4 Hours", difficulty: "Advanced" },
  ],
  Founder: [
    { title: "Building AI Products", stars: 5, note: "Frameworks for scoping an MVP around a foundation model.", time: "Est. 4 Hours", difficulty: "Intermediate" },
    { title: "Agent Architecture", stars: 4, note: "Understand what you're actually buying when you hire agent engineers.", time: "Est. 5 Hours", difficulty: "Advanced" },
    { title: "Pricing AI APIs", stars: 4, note: "Model your margins before token costs surprise you.", time: "Est. 2 Hours", difficulty: "Beginner" },
    { title: "Model Selection", stars: 5, note: "Choose the right model per feature instead of defaulting to one.", time: "Est. 3 Hours", difficulty: "Intermediate" },
  ],
};

const LEARNING_PATHS: { title: string; steps: string[] }[] = [
  { title: "AI Engineer", steps: ["Python", "Machine Learning Basics", "LLMs", "Prompt Engineering", "Vector Databases", "RAG", "AI Agents", "MCP", "Deployment", "Production AI Systems"] },
  { title: "AI Product Manager", steps: ["LLMs", "Prompt Design", "AI UX", "Evaluation", "Model Selection", "AI Governance", "Agent Design"] },
  { title: "AI Researcher", steps: ["Linear Algebra", "Transformers", "Attention", "RLHF", "Reasoning", "Agent Systems", "Advanced Papers"] },
  { title: "Data Engineer to AI Engineer", steps: ["SQL", "Python", "PySpark", "Vector Databases", "Embeddings", "LLMs", "RAG", "Agents", "Model Evaluation", "Production AI"] },
];

const FLAGSHIP_SKILLS: {
  name: string; industryImportance: number; difficulty: string; estTime: string;
  salaryImpact: number; futureRelevance: number; growth: string; gaugeColor: string;
}[] = [
  { name: "AI Agents", industryImportance: 97, difficulty: "Advanced", estTime: "15-20 Hours", salaryImpact: 5, futureRelevance: 96, growth: "Exploding", gaugeColor: "#6C63FF" },
  { name: "Prompt Engineering", industryImportance: 88, difficulty: "Beginner", estTime: "4-6 Hours", salaryImpact: 4, futureRelevance: 80, growth: "Stable", gaugeColor: "#F6C453" },
];

const SKILL_GRAPH = ["AI Agents", "LLMs", "Prompt Engineering", "Python", "Programming Fundamentals"];

const SKILL_HEALTH: { name: string; demand: number; future: number; growth: number; recommendation: string }[] = [
  { name: "AI Agents", demand: 5, future: 5, growth: 5, recommendation: "Learn if building autonomous or multi-step LLM apps." },
  { name: "Prompt Engineering", demand: 4, future: 3, growth: 3, recommendation: "Learn early. Still the fastest lever for output quality." },
];

const CAREER_INTEL = {
  title: "AI Engineer",
  avgLearningTime: "8 Months",
  demand: 5,
  companies: ["Microsoft", "Google", "OpenAI", "Anthropic", "NVIDIA"],
  topSkills: ["Python", "Agents", "RAG", "Evaluation", "Deployment"],
};

const PROJECT_BUILDER = {
  skill: "RAG",
  projects: ["Document Chatbot", "Medical Assistant", "Financial Q&A", "Legal Search", "Enterprise Knowledge Bot"],
};

const RESOURCE_TYPES = [
  "Official Documentation", "GitHub Repositories", "YouTube Tutorials", "Blog Posts",
  "Courses", "Books", "Conference Talks", "Podcasts", "Cheat Sheets",
];

const MENTOR_QUESTIONS: { q: string; a: string }[] = [
  {
    q: "3 years Data Engineering experience, want to build AI agents, what should I learn?",
    a: "Start from your data strength: Vector Databases, then Embeddings, then move into LLMs, Prompt Engineering, Agentic RAG Pipelines, AI Agents, and MCP. Estimated timeline: 10-12 weeks at 5 hours a week. Your SQL and pipeline background will make the retrieval layer the fastest part of this for you.",
  },
  {
    q: "I'm a Product Manager moving into AI products, where do I start?",
    a: "Skip the model internals for now. Start with LLMs at a conceptual level, then Prompt Design, AI UX, LLM Evaluation, Model Selection, and AI Governance. Estimated timeline: 6-8 weeks at 3 hours a week. Evaluation is the single highest-leverage skill hiring managers screen AI PMs for.",
  },
  {
    q: "Complete beginner, want to become an AI Engineer in 6 months, what's the plan?",
    a: "Follow the AI Engineer path in order: Python, Machine Learning Basics, LLMs, Prompt Engineering, Vector Databases, RAG, AI Agents, MCP, then Deployment. At 8-10 hours a week this clears in roughly 24 weeks. Don't skip the Python fundamentals, everything downstream assumes it.",
  },
];

const CHALLENGES: { title: string; duration: string; difficulty: string; blurb: string }[] = [
  { title: "7-Day Prompt Challenge", duration: "7 Days", difficulty: "Beginner", blurb: "One prompting technique a day: zero-shot, few-shot, chain-of-thought, system design, and structured evaluation." },
  { title: "30-Day AI Engineer Challenge", duration: "30 Days", difficulty: "Advanced", blurb: "A full sprint through the AI Engineer learning path, one milestone every 2-3 days." },
  { title: "Build an AI Agent in 14 Days", duration: "14 Days", difficulty: "Intermediate", blurb: "Ship a working tool-using agent from scratch: planning, memory, tool calls, and evaluation." },
  { title: "Complete RAG in One Week", duration: "7 Days", difficulty: "Intermediate", blurb: "Chunking, embeddings, retrieval, and re-ranking. One working RAG pipeline by day 7." },
];

const SKILL_RADAR: { label: string; emoji: string; textClass: string; borderClass: string; skills: string[] }[] = [
  { label: "Exploding", emoji: "\u{1F680}", textClass: "text-positive", borderClass: "border-positive/25", skills: ["AI Agents", "MCP", "Coding Agents"] },
  { label: "Growing", emoji: "\u{1F4C8}", textClass: "text-tealAccent", borderClass: "border-tealAccent/25", skills: ["Evaluation", "Voice AI"] },
  { label: "Stable", emoji: "➖", textClass: "text-goldAccent", borderClass: "border-goldAccent/25", skills: ["Prompt Engineering"] },
  { label: "Declining", emoji: "\u{1F4C9}", textClass: "text-negative", borderClass: "border-negative/25", skills: ["Traditional Chatbots"] },
];

const CROSS_LINKS: { from: string; href: string; text: string }[] = [
  { from: "Intelligence", href: "/signals", text: "New Skill Recommended: Learn MCP (Est. 4 hours)" },
  { from: "Companies", href: "/companies", text: "Viewing Anthropic? Recommended: Claude API, MCP, Tool Use, Constitutional AI" },
  { from: "Models", href: "/models", text: "Viewing Claude Opus? Recommended: Prompt Engineering, Tool Calling, Agent Design" },
  { from: "Research", href: "/research", text: "Reading Mixture of Experts? Suggested prerequisites: Transformers, Sparse Models, Distributed Training" },
];

const REC_ENGINE_PLAN: { week: string; topic: string; note: string }[] = [
  { week: "Week 1", topic: "Python Refresher", note: "Sharpen the fundamentals every later step depends on." },
  { week: "Week 2", topic: "LLMs", note: "Understand how transformer-based models actually generate output." },
  { week: "Week 3", topic: "Prompt Engineering", note: "Structured prompting and basic evaluation." },
  { week: "Week 4", topic: "Embeddings", note: "Represent text as vectors for search and retrieval." },
  { week: "Week 5", topic: "RAG", note: "Combine retrieval with generation for grounded answers." },
  { week: "Week 6", topic: "Agents", note: "Chain tools and reasoning steps into autonomous workflows." },
  { week: "Week 7", topic: "MCP", note: "Standardize how your agents connect to tools and data." },
  { week: "Week 8", topic: "Deployment", note: "Ship, monitor, and iterate on a production AI system." },
];

const REC_ROLES = ["Data Engineer", "Product Manager", "Founder", "Software Engineer", "Student"];
const REC_GOALS = ["Build AI Agents", "Transition into AI Product Management", "Ship an AI Feature", "Understand AI Research"];
const REC_TIMES = ["2-4 hrs/week", "5-9 hrs/week", "10+ hrs/week"];
const REC_EXPERIENCE = ["Beginner", "Intermediate", "Advanced"];

// ---------------------------------------------------------------------------
// Small reusable presentational helpers
// ---------------------------------------------------------------------------

function SectionHeader({ eyebrow, title, subtitle, color = "text-tealAccent" }: { eyebrow: string; title: string; subtitle?: string; color?: string }) {
  return (
    <div>
      <span className={`text-[10px] font-extrabold uppercase tracking-widest ${color} mb-1.5 block`}>{eyebrow}</span>
      <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-textSecondary mt-1.5 max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "teal" | "gold" }) {
  const toneClasses: Record<string, string> = {
    default: "bg-white/[0.03] border-white/[0.08] text-textSecondary",
    accent: "bg-accent/10 border-accent/25 text-accent",
    teal: "bg-tealAccent/10 border-tealAccent/25 text-tealAccent",
    gold: "bg-goldAccent/10 border-goldAccent/25 text-goldAccent",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={`w-3.5 h-3.5 ${i < count ? "text-goldAccent" : "text-white/10"}`} fill="currentColor">
          <path d="M10 1.5l2.6 5.4 5.9.9-4.3 4.1 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.8l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function ProgressBar({ pct, colorClass = "bg-accent" }: { pct: number; colorClass?: string }) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  return (
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div className={`h-full rounded-full ${colorClass} transition-all duration-700 ease-out`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

function useCountUp(target: number, trigger: boolean, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, target, duration]);
  return value;
}

function CountUp({ target, trigger, className }: { target: number; trigger: boolean; className?: string }) {
  const value = useCountUp(target, trigger);
  return <span className={className}>{value}</span>;
}

function RadialGauge({ value, visible, colorHex, size = 108 }: { value: number; visible: boolean; colorHex: string; size?: number }) {
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="7" fill="transparent" />
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke={colorHex}
          strokeWidth="7"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={visible ? offset : circumference}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-display font-black text-white">
          <CountUp target={clamped} trigger={visible} />%
        </span>
      </div>
    </div>
  );
}

function StepChain({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-secondaryBg/60 border border-white/[0.06] text-xs font-bold text-white whitespace-nowrap">
            {step}
          </span>
          {i < steps.length - 1 && <span className="text-textSecondary/50 text-sm">&rarr;</span>}
        </div>
      ))}
    </div>
  );
}

export default function LearningPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [completed, setCompleted] = useState<Record<string, { pct: number; certId: string }>>({});

  useEffect(() => {
    try { setCompleted(JSON.parse(localStorage.getItem("novique_completed") || "{}")); } catch {}
  }, []);

  // Scroll-reveal for every [data-animate] section on this page
  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => reveal.observe(el));
    return () => reveal.disconnect();
  }, []);

  // Snapshot counter animation
  const snapshotRef = useRef<HTMLDivElement>(null);
  const [snapshotVisible, setSnapshotVisible] = useState(false);
  useEffect(() => {
    if (!snapshotRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setSnapshotVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(snapshotRef.current);
    return () => obs.disconnect();
  }, []);

  // Trending skills bar/counter animation
  const trendingRef = useRef<HTMLDivElement>(null);
  const [trendingVisible, setTrendingVisible] = useState(false);
  useEffect(() => {
    if (!trendingRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTrendingVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(trendingRef.current);
    return () => obs.disconnect();
  }, []);

  // Skill Intelligence gauge animation
  const skillIntelRef = useRef<HTMLDivElement>(null);
  const [skillIntelVisible, setSkillIntelVisible] = useState(false);
  useEffect(() => {
    if (!skillIntelRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setSkillIntelVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(skillIntelRef.current);
    return () => obs.disconnect();
  }, []);

  // Personalized dashboard role picker
  const [role, setRole] = useState<Role>("Data Engineer");

  // Recommendation engine widget
  const [recRole, setRecRole] = useState(REC_ROLES[0]);
  const [recGoal, setRecGoal] = useState(REC_GOALS[0]);
  const [recTime, setRecTime] = useState(REC_TIMES[1]);
  const [recExperience, setRecExperience] = useState(REC_EXPERIENCE[0]);
  const [planGenerated, setPlanGenerated] = useState(false);

  // AI Mentor mock-ask widget
  const [mentorIdx, setMentorIdx] = useState<number | null>(null);

  const filtered = LESSONS.filter((l) => {
    const q = searchQuery.toLowerCase();
    return l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.type.toLowerCase().includes(q);
  });

  // Progress dashboard: derive real stats from novique_completed where cheap to do so
  const completedSlugs = Object.keys(completed);
  const skillsCompletedCount = completedSlugs.length;
  const nextLesson = LESSONS.find((l) => !completed[l.slug]);
  const currentLearning = nextLesson ? nextLesson.title : "All lessons complete";
  const hoursInvested = completedSlugs.reduce((sum, slug) => {
    const lesson = LESSONS.find((l) => l.slug === slug);
    if (!lesson) return sum;
    const minutes = parseInt(lesson.time, 10) || 0;
    return sum + minutes / 60;
  }, 0);
  const learningStreak = skillsCompletedCount > 0 ? "3-Day Streak" : "Start Your Streak";

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-14 relative z-10 animate-fade-in">

        {/* Hero */}
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-tealAccent mb-1.5 block">Novique Learning</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Stay Ahead of AI. Learn the Right Skills Before Everyone Else.</h1>
          <p className="text-sm text-textSecondary mt-2 max-w-2xl leading-relaxed">
            Personalized. Industry-driven. Always up to date. Novique continuously analyzes the AI ecosystem, research, company adoption, and hiring signals to answer one question: what should I learn next?
          </p>
        </div>

        {/* Core Philosophy pipeline */}
        <section data-animate className="bg-panel border border-white/[0.05] rounded-3xl p-6 md:p-8">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent mb-4 block">Core Philosophy</span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
            {CORE_PIPELINE.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${i === CORE_PIPELINE.length - 1 ? "bg-accent/15 border border-accent/30 text-accent" : "bg-secondaryBg/60 border border-white/[0.06] text-white"}`}>
                  {step}
                </span>
                {i < CORE_PIPELINE.length - 1 && <span className="text-textSecondary/50">&rarr;</span>}
              </div>
            ))}
          </div>
          <p className="text-sm text-textSecondary leading-relaxed mt-5 max-w-3xl">
            The rest of Novique tells users what is happening. Learning tells users what they should do about it.
          </p>
        </section>

        {/* AI Skill Snapshot */}
        <section ref={snapshotRef} data-animate className="flex flex-col gap-5">
          <SectionHeader eyebrow="Live Snapshot" title="Today's AI Learning Snapshot" color="text-tealAccent" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {SNAPSHOT_STATS.map((stat) => (
              <div key={stat.label} className="bg-panel border border-white/[0.05] rounded-3xl p-6 flex flex-col items-start">
                <span className={`text-4xl font-display font-black ${stat.color}`}>
                  <CountUp target={stat.value} trigger={snapshotVisible} />
                </span>
                <span className="text-xs text-textSecondary font-semibold mt-2">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="bg-panel border border-white/[0.05] rounded-3xl p-6">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-goldAccent mb-3 block">Top Hiring Skills</span>
            <div className="flex flex-wrap gap-2">
              {TOP_HIRING_SKILLS.map((skill) => <Chip key={skill} tone="gold">{skill}</Chip>)}
            </div>
          </div>
        </section>

        {/* Trending Skills */}
        <section ref={trendingRef} data-animate className="flex flex-col gap-5">
          <SectionHeader eyebrow="Momentum" title="\u{1F525} Trending Skills" subtitle="Skill Momentum Score blends job postings, GitHub activity, model releases, and search volume into a single 0-100 signal." color="text-goldAccent" />
          <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 md:p-8 flex flex-col gap-5">
            {TRENDING_SKILLS.map((skill, i) => (
              <div key={skill.name} className="flex items-center gap-4">
                <span className="text-xs font-bold text-zinc-500 w-5 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-white">{skill.name}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-display font-extrabold text-white">
                        <CountUp target={skill.score} trigger={trendingVisible} />
                      </span>
                      <span className={`text-xs font-bold ${skill.trend === "up" ? "text-positive" : "text-zinc-400"}`}>
                        {skill.trend === "up" ? "↑ " : ""}{skill.delta}
                      </span>
                    </span>
                  </div>
                  <ProgressBar pct={trendingVisible ? skill.score : 0} colorClass={skill.trend === "up" ? "bg-tealAccent" : "bg-zinc-500"} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Personalized Dashboard */}
        <section data-animate className="flex flex-col gap-5">
          <SectionHeader eyebrow="For You" title="⭐ Personalized Dashboard" subtitle="What you should learn next depends entirely on your role. Pick one to see how Novique's recommendations change." color="text-accent" />
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${role === r ? "bg-accent/15 border-accent/40 text-white" : "bg-secondaryBg/60 border-white/[0.06] text-textSecondary hover:text-white hover:border-accent/25"}`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLE_RECOMMENDATIONS[role].map((rec) => (
              <div key={rec.title} className="bg-panel border border-white/[0.05] rounded-3xl p-5 hover:border-accent/30 transition-all flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display font-bold text-white">{rec.title}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${diffColor[rec.difficulty] ?? "text-zinc-400"}`}>{rec.difficulty}</span>
                </div>
                <Stars count={rec.stars} />
                <p className="text-xs text-textSecondary leading-relaxed">{rec.note}</p>
                <span className="text-[10px] text-zinc-500 font-semibold mt-auto">{rec.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Paths */}
        <section data-animate className="flex flex-col gap-5">
          <SectionHeader eyebrow="Roadmaps" title="Learning Paths" subtitle="Structured chains of skills to follow in order, from foundational to production-ready." color="text-tealAccent" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {LEARNING_PATHS.map((path) => (
              <div key={path.title} className="bg-panel border border-white/[0.05] rounded-3xl p-6">
                <h3 className="text-base font-display font-extrabold text-white mb-4">{path.title}</h3>
                <StepChain steps={path.steps} />
              </div>
            ))}
          </div>
        </section>

        {/* Existing lesson grid: the concrete, actionable core of the page */}
        <section data-animate className="flex flex-col gap-5">
          <SectionHeader eyebrow="Novique Academy" title="Start Learning Now" subtitle="Modular developer-focused lessons covering emerging protocols, techniques, and architectures, each with a graded assessment and certificate." color="text-goldAccent" />
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
        </section>

        {/* Skill Intelligence */}
        <section ref={skillIntelRef} data-animate className="flex flex-col gap-5">
          <SectionHeader eyebrow="Deep Dive" title="⭐ Skill Intelligence" subtitle="A closer look at two flagship skills: where they stand today and where they're headed." color="text-accent" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FLAGSHIP_SKILLS.map((skill) => (
              <div key={skill.name} className="bg-panel border border-white/[0.05] rounded-3xl p-6 md:p-7 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-display font-extrabold text-white">{skill.name}</h3>
                  <Chip tone={skill.growth === "Exploding" ? "teal" : "gold"}>{skill.growth}</Chip>
                </div>
                <div className="flex items-center gap-6">
                  <RadialGauge value={skill.industryImportance} visible={skillIntelVisible} colorHex={skill.gaugeColor} />
                  <div className="flex flex-col gap-2 text-xs">
                    <span className="text-textSecondary">Industry Importance</span>
                    <div className="flex items-center gap-2">
                      <span className="text-textSecondary w-28 shrink-0">Difficulty</span>
                      <span className={`font-bold ${diffColor[skill.difficulty] ?? "text-zinc-400"}`}>{skill.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-textSecondary w-28 shrink-0">Est. Learning Time</span>
                      <span className="font-bold text-white">{skill.estTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-textSecondary w-28 shrink-0">Salary Impact</span>
                      <Stars count={skill.salaryImpact} />
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/[0.05] pt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-textSecondary">Future Relevance</span>
                    <span className="font-bold text-white">{skill.futureRelevance}%</span>
                  </div>
                  <ProgressBar pct={skillIntelVisible ? skill.futureRelevance : 0} colorClass="bg-accent" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Recommendation Engine */}
        <section data-animate className="flex flex-col gap-5">
          <SectionHeader eyebrow="Interactive" title="⭐⭐⭐⭐⭐ Learning Recommendation Engine" subtitle="Tell Novique where you're starting from and it will lay out an 8-week plan." color="text-tealAccent" />
          <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">Current Role</span>
                <select value={recRole} onChange={(e) => setRecRole(e.target.value)} className="bg-secondaryBg/60 border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-accent/40">
                  {REC_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">Goal</span>
                <select value={recGoal} onChange={(e) => setRecGoal(e.target.value)} className="bg-secondaryBg/60 border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-accent/40">
                  {REC_GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">Available Time</span>
                <select value={recTime} onChange={(e) => setRecTime(e.target.value)} className="bg-secondaryBg/60 border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-accent/40">
                  {REC_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">Experience</span>
                <select value={recExperience} onChange={(e) => setRecExperience(e.target.value)} className="bg-secondaryBg/60 border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-accent/40">
                  {REC_EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
            </div>
            <button
              onClick={() => setPlanGenerated(true)}
              className="self-start px-5 py-2.5 bg-accent hover:bg-accent/90 rounded-xl text-xs font-bold text-white transition-all"
            >
              Generate Plan &rarr;
            </button>
            {planGenerated && (
              <div className="border-t border-white/[0.05] pt-6 flex flex-col gap-3">
                <p className="text-xs text-textSecondary">
                  Personalized for a <span className="text-white font-semibold">{recRole}</span> aiming to <span className="text-white font-semibold">{recGoal.toLowerCase()}</span>, at <span className="text-white font-semibold">{recTime}</span>, {recExperience.toLowerCase()} level.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REC_ENGINE_PLAN.map((wk) => (
                    <div key={wk.week} className="bg-secondaryBg/50 border border-white/[0.05] rounded-2xl px-4 py-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-tealAccent block mb-1">{wk.week}</span>
                      <span className="text-sm font-bold text-white block mb-1">{wk.topic}</span>
                      <span className="text-xs text-textSecondary leading-relaxed">{wk.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Skill Graph + Skill Health */}
        <section data-animate className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-5">
            <SectionHeader eyebrow="Dependency Map" title="⭐ Skill Graph" subtitle="What you need before you need it." color="text-accent" />
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 md:p-8 flex flex-col items-center">
              {SKILL_GRAPH.map((node, i) => (
                <div key={node} className="flex flex-col items-center">
                  <span className="px-4 py-2 rounded-xl bg-secondaryBg/60 border border-white/[0.06] text-sm font-bold text-white">{node}</span>
                  {i < SKILL_GRAPH.length - 1 && (
                    <span className="text-[10px] font-bold text-textSecondary/60 uppercase tracking-widest py-2">&darr; requires</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <SectionHeader eyebrow="Health Check" title="⭐ Skill Health" subtitle="Demand, future outlook, and growth at a glance." color="text-tealAccent" />
            <div className="flex flex-col gap-4">
              {SKILL_HEALTH.map((skill) => (
                <div key={skill.name} className="bg-panel border border-white/[0.05] rounded-3xl p-6 flex flex-col gap-3">
                  <h4 className="text-sm font-display font-extrabold text-white">{skill.name}</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-textSecondary text-[10px] uppercase tracking-wider">Demand</span>
                      <Stars count={skill.demand} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-textSecondary text-[10px] uppercase tracking-wider">Future</span>
                      <Stars count={skill.future} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-textSecondary text-[10px] uppercase tracking-wider">Growth</span>
                      <Stars count={skill.growth} />
                    </div>
                  </div>
                  <div className="bg-white/[0.01] border-l-2 border-tealAccent px-3 py-2 rounded-r-xl">
                    <span className="text-xs text-zinc-300 font-medium">{skill.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Career Intelligence + Project Builder */}
        <section data-animate className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-5">
            <SectionHeader eyebrow="Career Path" title="⭐⭐⭐⭐⭐ AI Career Intelligence" color="text-goldAccent" />
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 md:p-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-display font-extrabold text-white">{CAREER_INTEL.title}</h4>
                <Stars count={CAREER_INTEL.demand} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-textSecondary">Average Learning Time</span>
                <span className="font-bold text-white">{CAREER_INTEL.avgLearningTime}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-textSecondary block mb-2">Companies Hiring</span>
                <div className="flex flex-wrap gap-2">
                  {CAREER_INTEL.companies.map((c) => <Chip key={c}>{c}</Chip>)}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-textSecondary block mb-2">Top Skills</span>
                <div className="flex flex-wrap gap-2">
                  {CAREER_INTEL.topSkills.map((s) => <Chip key={s} tone="gold">{s}</Chip>)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <SectionHeader eyebrow="Build Something" title="⭐⭐⭐⭐⭐ Project Builder" color="text-accent" />
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 md:p-7 flex flex-col gap-4">
              <p className="text-xs text-textSecondary">Suggested projects for <span className="text-white font-bold">{PROJECT_BUILDER.skill}</span>:</p>
              <div className="flex flex-wrap gap-2">
                {PROJECT_BUILDER.projects.map((p) => <Chip key={p} tone="accent">{p}</Chip>)}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-tealAccent block">Resource Hub</span>
              <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 md:p-7">
                <div className="flex flex-wrap gap-2">
                  {RESOURCE_TYPES.map((r) => <Chip key={r}>{r}</Chip>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Mentor */}
        <section data-animate className="flex flex-col gap-5">
          <SectionHeader eyebrow="Ask" title="⭐⭐⭐⭐⭐ AI Mentor" subtitle="Pick a question close to your situation and see how Novique would answer it." color="text-tealAccent" />
          <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 md:p-8 flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              {MENTOR_QUESTIONS.map((mq, i) => (
                <button
                  key={mq.q}
                  onClick={() => setMentorIdx(i)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${mentorIdx === i ? "bg-accent/15 border-accent/40 text-white" : "bg-secondaryBg/60 border-white/[0.06] text-textSecondary hover:text-white hover:border-accent/25"}`}
                >
                  {mq.q}
                </button>
              ))}
            </div>
            <div className="bg-white/[0.01] border-l-2 border-accent px-4 py-3.5 rounded-r-xl min-h-[64px] flex items-center">
              <p className="text-sm text-zinc-200 leading-relaxed">
                {mentorIdx !== null ? MENTOR_QUESTIONS[mentorIdx].a : "Select a question above to see a tailored roadmap."}
              </p>
            </div>
          </div>
        </section>

        {/* Learning Challenges */}
        <section data-animate className="flex flex-col gap-5">
          <SectionHeader eyebrow="Gamification" title="Learning Challenges" subtitle="Structured sprints for people who learn best against a clock." color="text-goldAccent" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {CHALLENGES.map((c) => (
              <div key={c.title} className="bg-panel border border-white/[0.05] rounded-3xl p-5 hover:border-accent/30 transition-all flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-goldAccent">{c.duration}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${diffColor[c.difficulty] ?? "text-zinc-400"}`}>{c.difficulty}</span>
                </div>
                <h4 className="text-sm font-display font-extrabold text-white leading-snug">{c.title}</h4>
                <p className="text-xs text-textSecondary leading-relaxed">{c.blurb}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Progress Dashboard */}
        <section data-animate className="flex flex-col gap-5">
          <SectionHeader eyebrow="Your Progress" title="Progress Dashboard" subtitle="Derived live from your completed lessons and certificates." color="text-accent" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 flex flex-col gap-1.5">
              <span className="text-3xl font-display font-black text-tealAccent">{skillsCompletedCount}</span>
              <span className="text-xs text-textSecondary font-semibold">Skills Completed</span>
            </div>
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 flex flex-col gap-1.5">
              <span className="text-sm font-display font-extrabold text-white leading-snug">{currentLearning}</span>
              <span className="text-xs text-textSecondary font-semibold">Current Learning</span>
            </div>
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 flex flex-col gap-1.5">
              <span className="text-lg font-display font-extrabold text-goldAccent">{learningStreak}</span>
              <span className="text-xs text-textSecondary font-semibold">Learning Streak</span>
            </div>
            <div className="bg-panel border border-white/[0.05] rounded-3xl p-6 flex flex-col gap-1.5">
              <span className="text-3xl font-display font-black text-accent">{hoursInvested.toFixed(1)}</span>
              <span className="text-xs text-textSecondary font-semibold">Hours Invested</span>
            </div>
          </div>
        </section>

        {/* AI Skill Radar */}
        <section data-animate className="flex flex-col gap-5">
          <SectionHeader eyebrow="Radar" title="⭐⭐⭐⭐⭐ AI Skill Radar" subtitle="Every tracked skill, grouped by where it's headed." color="text-tealAccent" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SKILL_RADAR.map((group) => (
              <div key={group.label} className={`bg-panel border rounded-3xl p-6 flex flex-col gap-3 ${group.borderClass}`}>
                <span className={`text-sm font-display font-extrabold ${group.textClass}`}>{group.emoji} {group.label}</span>
                <div className="flex flex-col gap-2">
                  {group.skills.map((s) => (
                    <span key={s} className="text-xs text-zinc-200 font-semibold bg-white/[0.02] rounded-lg px-3 py-2">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning from the Rest of Novique */}
        <section data-animate className="flex flex-col gap-5">
          <SectionHeader eyebrow="Connected Intelligence" title="Learning from the Rest of Novique" subtitle="The Learning page should feel like having a personal AI career strategist, not another course marketplace." color="text-goldAccent" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CROSS_LINKS.map((link) => (
              <Link
                key={link.from}
                href={link.href}
                className="bg-panel border border-white/[0.05] rounded-2xl px-5 py-4 hover:border-accent/30 transition-all flex flex-col gap-1.5 group"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">From {link.from}</span>
                <span className="text-xs text-zinc-300 leading-relaxed group-hover:text-white transition-colors">{link.text}</span>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
