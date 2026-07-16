"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

type AudienceKey = "student" | "developer" | "pm" | "founder" | "researcher" | "executive" | "investor";

const AUDIENCE_LABELS: Record<AudienceKey, string> = {
  student: "Student",
  developer: "Developer",
  pm: "Product Manager",
  founder: "Founder",
  researcher: "Researcher",
  executive: "Executive",
  investor: "Investor",
};

const AUDIENCE_ORDER: AudienceKey[] = ["student", "developer", "pm", "founder", "researcher", "executive", "investor"];

interface EntityLink { name: string; slug: string; }
interface StarItem { label: string; stars: number; }
interface LearningRec { label: string; slug?: string; }
interface RealityStage { label: string; value: string; }
interface AIPrediction { prediction: string; confidence: string; timeline: string; }

interface ResearchPaper {
  title: string;
  maker: string;
  explanation: string;
  citations: string;
  impact: string;
  confidence: string;
  url: string;
  categories: string[];
  keyContribution: string;
  practicalApplications: string[];
  industriesAffected: string[];
  relatedTechnologies: string[];
  researchImpactScore: number;
  futureImpactScore: number;
  likelyAdoption: string;
  potentialIndustries: string[];
  audiences: Partial<Record<AudienceKey, string>>;
  realWorldApplications: string[];
  companiesLikelyToAdopt: EntityLink[];
  modelsLikelyToBenefit: EntityLink[];
  timeline?: string[];
  buildsUpon: string[];
  inspired: string[];
  realityTracker?: RealityStage[];
  startupOpportunities: string[];
  productOpportunities: string[];
  industryImpact: StarItem[];
  learningRecommendations: LearningRec[];
  shouldYouRead: StarItem[];
  aiPrediction?: AIPrediction;
}

const RESEARCH_CATEGORIES = [
  "Large Language Models", "AI Agents", "Robotics", "Vision", "Audio", "Video",
  "Healthcare AI", "Biology", "Finance", "Cybersecurity", "Coding", "Education",
  "Autonomous Systems", "Reasoning", "Retrieval", "Reinforcement Learning",
  "Explainable AI", "AI Safety",
];

const EMERGING_TECH = [
  "AI Agents", "Long-Term Memory", "World Models", "Robotics",
  "Video Generation", "Self-Improving Models", "Multimodal AI", "Scientific AI",
];

const TRENDING_TECH = ["AI Agents", "Reasoning Models", "Memory Systems", "Robotics", "Video Generation"];

const SNAPSHOT_STATS = [
  { label: "Important Papers", value: 31 },
  { label: "Breakthroughs", value: 6 },
  { label: "Industry Collaborations", value: 9 },
  { label: "High Citation Papers", value: 14 },
  { label: "Benchmark Records", value: 5 },
];

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`w-3.5 h-3.5 ${i < value ? "text-goldAccent" : "text-white/10"}`}
          fill="currentColor"
        >
          <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
        </svg>
      ))}
    </div>
  );
}

function ScoreBar({ label, value, colorClass, textClass }: { label: string; value: number; colorClass: string; textClass: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
        <span className="text-zinc-500">{label}</span>
        <span className={`${textClass} font-extrabold`}>{value}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${colorClass} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ChipRow({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-5">
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="text-[11px] font-semibold text-zinc-300 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Chain({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item, i) => (
        <div key={item} className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-200 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full whitespace-nowrap">
            {item}
          </span>
          {i < items.length - 1 && <span className="text-zinc-600">&rarr;</span>}
        </div>
      ))}
    </div>
  );
}

const papers: ResearchPaper[] = [
  {
    title: "KAN: Kolmogorov-Arnold Networks",
    maker: "Ziming Liu, et al. (MIT, Caltech)",
    explanation:
      "An alternative neural network architecture replacing Multi-Layer Perceptrons (MLPs). KANs place learnable activation functions on edges (weights) rather than nodes, achieving superior accuracy and interpretability for scientific machine learning.",
    citations: "1,240 citations",
    impact: "High. Successor candidate for MLPs in scientific models and computing.",
    confidence: "98% Confidence",
    url: "https://arxiv.org/abs/2404.19756",
    categories: ["Explainable AI", "Reasoning"],
    keyContribution:
      "Moves learnable spline functions from nodes to edges, so trained networks can be read back as human-interpretable formulas while matching or beating MLPs on scientific tasks.",
    practicalApplications: ["Symbolic Regression", "Physics Simulation", "Interpretable Diagnostics", "Materials Discovery"],
    industriesAffected: ["Scientific Research", "Manufacturing", "Aerospace", "Pharma"],
    relatedTechnologies: ["Spline Networks", "Symbolic Regression", "Scientific AI", "Neural Architecture Search"],
    researchImpactScore: 88,
    futureImpactScore: 79,
    likelyAdoption: "18-36 Months",
    potentialIndustries: ["Scientific Computing", "Materials Science", "Physics Research", "Manufacturing"],
    audiences: {
      student:
        "Most neural networks put their learning knobs on the connections between neurons and keep simple fixed math inside each neuron. KANs flip that: the flexible math lives on the connections themselves, which makes the network both more accurate on certain science problems and easier for humans to interpret.",
      developer:
        "KANs replace fixed activation functions at nodes with learnable spline functions on edges, based on the Kolmogorov-Arnold representation theorem. In practice this can mean smaller networks matching or beating MLPs on scientific and symbolic tasks, with the added benefit that you can often read off a human-interpretable formula from the trained network.",
      founder:
        "If you're building tools for scientists or engineers in physics, materials, or chemistry, KANs are worth watching. They promise models that are both accurate and explainable, which matters in regulated or safety-critical domains where a black-box neural net is a hard sell.",
    },
    realWorldApplications: ["Physics Simulation Tools", "Symbolic Regression Engines", "Interpretable Diagnostics", "Materials Discovery"],
    companiesLikelyToAdopt: [{ name: "Google DeepMind", slug: "google-deepmind" }],
    modelsLikelyToBenefit: [],
    buildsUpon: ["Multi-Layer Perceptron theory (Kolmogorov-Arnold representation theorem)"],
    inspired: ["Spline-based vision transformer research previews", "Interpretable scientific ML toolkits"],
    startupOpportunities: [
      "Interpretable ML auditing platform for regulated industries",
      "Symbolic regression SaaS for materials science R&D",
      "KAN-based physics simulation engine for engineering teams",
    ],
    productOpportunities: [
      "Explainable model debugging plugin for ML platforms",
      "Scientific formula-discovery assistant for R&D teams",
    ],
    industryImpact: [
      { label: "Healthcare", stars: 3 },
      { label: "Finance", stars: 2 },
      { label: "Education", stars: 3 },
      { label: "Legal", stars: 1 },
      { label: "Manufacturing", stars: 4 },
    ],
    learningRecommendations: [{ label: "Neural Networks Fundamentals" }, { label: "Function Approximation" }, { label: "Spline Interpolation" }],
    shouldYouRead: [
      { label: "Developers", stars: 4 },
      { label: "Students", stars: 5 },
      { label: "Researchers", stars: 5 },
      { label: "Founders", stars: 2 },
      { label: "Product Managers", stars: 2 },
      { label: "Investors", stars: 2 },
    ],
    aiPrediction: {
      prediction:
        "KANs will likely become the default architecture for scientific and symbolic ML tasks within three years, though they are unlikely to replace transformers for language.",
      confidence: "74%",
      timeline: "24-36 months",
    },
  },
  {
    title: "Model Context Protocol (MCP) Specifications",
    maker: "Anthropic Engineering Group",
    explanation:
      "A standard client-server protocol enabling LLMs and workspace tools (like Cursor, Claude Desktop) to securely query local databases, inspect systems, and connect with third-party tools via uniform APIs.",
    citations: "128 citations",
    impact: "Critical. Standardizing the integration layer for agentic workspaces.",
    confidence: "96% Confidence",
    url: "https://github.com/modelcontextprotocol",
    categories: ["AI Agents", "Coding"],
    keyContribution:
      "Defines a universal client-server protocol so any LLM can discover and call external tools, files, and data sources through one standard interface instead of bespoke integrations.",
    practicalApplications: ["Local Codebase Search", "Database Querying Agents", "IDE Tool Integrations", "Secure Enterprise Data Access"],
    industriesAffected: ["Software Development", "Enterprise IT", "Data Infrastructure", "DevOps"],
    relatedTechnologies: ["AI Agents", "Tool-Calling APIs", "Agentic Workflows", "Function Calling"],
    researchImpactScore: 90,
    futureImpactScore: 95,
    likelyAdoption: "12-24 Months",
    potentialIndustries: ["Enterprise Software", "Developer Tooling", "Healthcare IT", "Robotics"],
    audiences: {
      student:
        "Imagine a super-smart assistant that can't open your files, check your calendar, or search your local database, it can only talk. MCP is like a universal power adapter that lets that assistant plug into all those tools using one standard plug shape instead of a different plug for every tool.",
      developer:
        "MCP defines a standard client-server protocol, JSON-RPC based, so any LLM host such as Claude Desktop, an IDE, or a custom agent can discover and call tools, read resources, and use prompts exposed by an MCP server, without writing a custom integration per tool. Write one MCP server for your internal API and any MCP-compatible client can use it immediately.",
      pm:
        "Right now every AI integration your team ships, a Slack bot, internal search, a CRM lookup, is a one-off. MCP means you can build one server for a data source once and every AI assistant your company adopts can use it, which cuts integration engineering time and vendor lock-in risk.",
      founder:
        "MCP turns AI integrations into a commodity layer, so the value shifts to who owns the data and the workflow, not who wrote the API wrapper. If you're building an AI product, expect customers to ask whether you support MCP the way they used to ask about REST APIs or Zapier.",
      researcher:
        "Specifies a transport-agnostic protocol, stdio and HTTP/SSE, with primitives for tools, resources, and prompts, enabling standardized context injection and tool invocation across heterogeneous LLM hosts. Positions itself as an interoperability layer analogous to the Language Server Protocol, but for AI-tool communication.",
      executive:
        "This is the emerging integration standard your engineering org will likely be asked to support within the next year, the same way REST and OAuth became baseline expectations. Early adoption reduces the cost of connecting internal systems to whichever AI assistant your teams standardize on.",
      investor:
        "MCP is becoming the HTTP moment for AI agents, a neutral protocol that unlocks an entire ecosystem of tool builders, server marketplaces, and integration middleware. Historically, protocol standardization moments such as TCP/IP, HTTP, and OAuth created large infrastructure and tooling markets around the core protocol itself.",
    },
    realWorldApplications: ["AI Coding Assistants", "Customer Support Agents", "Enterprise Data Copilots", "DevOps Automation Bots"],
    companiesLikelyToAdopt: [
      { name: "Anthropic", slug: "anthropic" },
      { name: "Cursor", slug: "cursor" },
      { name: "OpenAI", slug: "openai" },
      { name: "Perplexity", slug: "perplexity" },
    ],
    modelsLikelyToBenefit: [
      { name: "Claude 3.5 Sonnet", slug: "claude-3-5-sonnet" },
      { name: "GPT-4o", slug: "gpt-4o" },
    ],
    timeline: ["Function Calling (2023)", "Tool-Use APIs (2024)", "MCP (2024)", "Universal Agent Protocols (2025-26)"],
    buildsUpon: ["Function calling APIs (OpenAI, 2023)", "LangChain tool abstractions", "REST/RPC API standards"],
    inspired: ["Language Server Protocol-style ecosystems for AI agents", "Cross-vendor agent interoperability standards (in progress)"],
    realityTracker: [
      { label: "Research", value: "MCP Specification (2024)" },
      { label: "Used By Models", value: "Claude 3.5 Sonnet, GPT-4o (via connectors)" },
      { label: "Companies", value: "Anthropic, Cursor, OpenAI" },
      { label: "Products", value: "Claude Desktop, Cursor Agent Mode, ChatGPT Connectors" },
      { label: "Current Adoption", value: "High" },
    ],
    startupOpportunities: [
      "MCP server marketplace for internal enterprise tools",
      "Managed MCP hosting and security auditing platform",
      "Vertical MCP servers for healthcare and finance compliance data",
      "No-code MCP server builder for non-engineers",
    ],
    productOpportunities: [
      "One-click MCP server generator for SaaS APIs",
      "Enterprise MCP gateway with access control and audit logs",
      "IDE plugin marketplace built entirely on MCP",
    ],
    industryImpact: [
      { label: "Healthcare", stars: 3 },
      { label: "Finance", stars: 4 },
      { label: "Education", stars: 3 },
      { label: "Legal", stars: 3 },
      { label: "Manufacturing", stars: 3 },
    ],
    learningRecommendations: [
      { label: "AI Agents Fundamentals" },
      { label: "Tool-Calling & Function APIs" },
      { label: "Intro to MCP", slug: "mcp-server-development" },
    ],
    shouldYouRead: [
      { label: "Developers", stars: 5 },
      { label: "Students", stars: 3 },
      { label: "Researchers", stars: 4 },
      { label: "Founders", stars: 5 },
      { label: "Product Managers", stars: 4 },
      { label: "Investors", stars: 4 },
    ],
    aiPrediction: {
      prediction: "MCP or a directly compatible successor will become the de facto standard tool-integration layer for production AI agents within two years.",
      confidence: "88%",
      timeline: "12-24 months",
    },
  },
  {
    title: "Attention Is All You Need",
    maker: "Vaswani, et al. (Google Brain)",
    explanation:
      "The foundational paper introducing the Transformer architecture, replacing sequential recurrence models with parallel self-attention networks, forming the basis of all modern generative Large Language Models.",
    citations: "112,490 citations",
    impact: "Revolutionary. The baseline architecture of the generative AI revolution.",
    confidence: "100% Confidence",
    url: "https://arxiv.org/abs/1706.03762",
    categories: ["Large Language Models", "Reasoning"],
    keyContribution:
      "Introduces self-attention as a full replacement for recurrence, letting models process sequences in parallel and scale to billions of parameters, the architecture underlying nearly every modern LLM.",
    practicalApplications: ["Large Language Models", "Machine Translation", "Code Generation", "Multimodal Understanding"],
    industriesAffected: ["Software", "Media", "Healthcare", "Finance", "Education"],
    relatedTechnologies: ["Self-Attention", "Transformers", "Positional Encoding", "Multimodal AI"],
    researchImpactScore: 100,
    futureImpactScore: 97,
    likelyAdoption: "Already Ubiquitous",
    potentialIndustries: ["Every industry touched by generative AI"],
    audiences: {
      student:
        "Before this paper, AI models read text one word at a time, like reading a sentence with a flashlight in the dark. The Transformer lets a model look at every word in a sentence at once and decide which words matter most to each other. That trick is why chatbots like Claude and ChatGPT can hold a real conversation.",
      developer:
        "Introduces the self-attention mechanism: instead of processing tokens sequentially through recurrence, every token attends to every other token in parallel via query, key, and value projections. This makes training massively parallelizable on GPUs and TPUs and removes the vanishing-gradient issues of recurrent models. Nearly every LLM API you call today is a descendant of this architecture.",
      pm:
        "This is the technical foundation underneath every AI feature you might ship this year: chat, summarization, copilots, agents. Understanding it helps you reason about why context windows, latency, and cost scale the way they do, and why adding more attention capacity is usually the lever vendors pull for better models.",
      founder:
        "This 2017 paper is the reason a two-person team can now build a product on top of a frontier model instead of needing a research lab. Every foundation model API you build on inherits its scaling properties and its limits, including quadratic cost with context length. Knowing this helps you pick the right model tier and predict what gets cheaper next.",
      researcher:
        "Formalizes scaled dot-product multi-head self-attention with sinusoidal positional encodings, replacing recurrence and convolution entirely in a sequence transduction model. Its removal of sequential dependency enabled the compute-scaling curves that define the current era of large language models.",
      executive:
        "This is the architecture underpinning the entire generative AI market your company is evaluating. Every vendor comparison, cost model, and capability roadmap you'll see this year traces back to design decisions made in this paper.",
      investor:
        "The Transformer is the single architectural bet that created the current AI investment cycle, every foundation model company is building variations of it. Its scaling laws are the reason compute and data access became the dominant moat, which is why chips, cloud, and data deals are where the largest rounds have gone.",
    },
    realWorldApplications: ["AI Coding Assistants", "Customer Support Agents", "Medical Diagnostics", "Autonomous Vehicles", "Video Understanding"],
    companiesLikelyToAdopt: [
      { name: "OpenAI", slug: "openai" },
      { name: "Anthropic", slug: "anthropic" },
      { name: "Google DeepMind", slug: "google-deepmind" },
      { name: "Meta AI", slug: "meta-ai" },
      { name: "Mistral", slug: "mistral" },
    ],
    modelsLikelyToBenefit: [
      { name: "Claude 3.5 Sonnet", slug: "claude-3-5-sonnet" },
      { name: "GPT-4o", slug: "gpt-4o" },
      { name: "Llama 3.1 405B", slug: "llama-3-1-405b" },
      { name: "Gemini 1.5 Pro", slug: "gemini-1-5-pro" },
    ],
    timeline: ["Transformer (2017)", "BERT (2018)", "GPT-2 (2019)", "GPT-3 (2020)", "GPT-4 (2023)", "GPT-5 (2025)"],
    buildsUpon: ["Sequence-to-sequence learning with RNNs (Sutskever, et al.)", "Neural machine translation attention mechanisms (Bahdanau, et al.)"],
    inspired: ["BERT", "The GPT series", "Vision Transformer (ViT)", "AlphaFold's Evoformer"],
    startupOpportunities: [
      "Domain-specific transformer fine-tuning studio",
      "Efficient attention inference infrastructure for edge devices",
      "Transformer interpretability and audit tooling",
    ],
    productOpportunities: [
      "Vertical LLM copilots for regulated industries",
      "Real-time multimodal transformer assistants for hardware devices",
    ],
    industryImpact: [
      { label: "Healthcare", stars: 5 },
      { label: "Finance", stars: 5 },
      { label: "Education", stars: 5 },
      { label: "Legal", stars: 4 },
      { label: "Manufacturing", stars: 4 },
    ],
    learningRecommendations: [{ label: "Transformers" }, { label: "Attention Mechanisms" }, { label: "Sequence Modeling" }, { label: "RLHF" }],
    shouldYouRead: [
      { label: "Developers", stars: 5 },
      { label: "Students", stars: 5 },
      { label: "Researchers", stars: 5 },
      { label: "Founders", stars: 4 },
      { label: "Product Managers", stars: 4 },
      { label: "Investors", stars: 4 },
    ],
    aiPrediction: {
      prediction:
        "Attention-based architectures will remain the dominant substrate for general intelligence systems through at least the next generation of frontier models, even as efficiency variants like linear attention and state-space hybrids gain share.",
      confidence: "91%",
      timeline: "Ongoing through 2028",
    },
  },
  {
    title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
    maker: "Rafailov, et al. (Stanford)",
    explanation:
      "An elegant alternative to RLHF (Reinforcement Learning from Human Feedback) that optimizes language model alignment directly on preference data without training a separate reward model.",
    citations: "820 citations",
    impact: "Very High. Simplifies model alignment pipelines for open weights.",
    confidence: "94% Confidence",
    url: "https://arxiv.org/abs/2305.18290",
    categories: ["Large Language Models", "AI Safety"],
    keyContribution:
      "Shows model alignment can be optimized directly from human preference pairs using a closed-form loss, removing the need for a separate reward model and PPO reinforcement learning loop.",
    practicalApplications: ["Model Alignment", "Instruction Tuning", "Open-Weight Fine-Tuning", "Chatbot Personality Tuning"],
    industriesAffected: ["AI Research Labs", "Open Source Ecosystem", "Enterprise Fine-Tuning"],
    relatedTechnologies: ["RLHF", "Preference Optimization", "Self-Improving Models"],
    researchImpactScore: 84,
    futureImpactScore: 81,
    likelyAdoption: "Already Adopted (6-12 Months)",
    potentialIndustries: ["Open Source AI", "Enterprise Fine-Tuning", "Chatbot Platforms"],
    audiences: {
      student:
        "Teaching an AI to prefer better answers used to require training a separate judge model and a complicated trial-and-error loop. DPO found a shortcut: you can directly teach the main model from examples of one answer being better than another, without building the judge model at all.",
      developer:
        "DPO reformulates the RLHF objective into a simple classification-style loss computed directly on preference pairs, removing the need for a separate reward model and PPO rollouts. It's why fine-tuning an open-weight model for better instruction-following got dramatically simpler and cheaper over the last two years.",
      founder:
        "This is a big part of why small teams can now fine-tune open-weight models to feel as aligned as closed frontier models, at a fraction of the infrastructure cost. If your product depends on a fine-tuned open model, DPO or one of its descendants is probably already in your training pipeline.",
    },
    realWorldApplications: ["Chatbot Personality Tuning", "Open-Weight Model Alignment", "Enterprise Custom Assistants"],
    companiesLikelyToAdopt: [
      { name: "Mistral", slug: "mistral" },
      { name: "Meta AI", slug: "meta-ai" },
    ],
    modelsLikelyToBenefit: [{ name: "Llama 3.1 405B", slug: "llama-3-1-405b" }],
    buildsUpon: ["RLHF (Christiano, et al.; InstructGPT, Ouyang, et al.)"],
    inspired: ["ORPO", "KTO", "SimPO alignment variants"],
    startupOpportunities: [
      "Preference-data labeling marketplace for fine-tuning",
      "One-click DPO fine-tuning platform for open-weight models",
    ],
    productOpportunities: ["Managed alignment-as-a-service for enterprise chatbots"],
    industryImpact: [
      { label: "Healthcare", stars: 2 },
      { label: "Finance", stars: 3 },
      { label: "Education", stars: 3 },
      { label: "Legal", stars: 2 },
      { label: "Manufacturing", stars: 1 },
    ],
    learningRecommendations: [{ label: "RLHF" }, { label: "Preference Optimization" }, { label: "Fine-Tuning Fundamentals" }],
    shouldYouRead: [
      { label: "Developers", stars: 4 },
      { label: "Students", stars: 3 },
      { label: "Researchers", stars: 5 },
      { label: "Founders", stars: 3 },
      { label: "Product Managers", stars: 2 },
      { label: "Investors", stars: 2 },
    ],
    aiPrediction: {
      prediction: "DPO-family methods will fully replace classic PPO-based RLHF for the majority of open-weight model releases within a year.",
      confidence: "82%",
      timeline: "6-12 months",
    },
  },
];

export default function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTech, setActiveTech] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [audienceTab, setAudienceTab] = useState<Record<string, AudienceKey>>({});

  const [savedPapers, setSavedPapers] = useState<Record<string, boolean>>({});
  const [followedAuthors, setFollowedAuthors] = useState<Record<string, boolean>>({});
  const [followedTopics, setFollowedTopics] = useState<Record<string, boolean>>({});

  // Animated Research Snapshot counters
  const snapshotRef = useRef<HTMLDivElement>(null);
  const [snapCounts, setSnapCounts] = useState<number[]>(SNAPSHOT_STATS.map(() => 0));

  useEffect(() => {
    if (!snapshotRef.current) return;
    const targets = SNAPSHOT_STATS.map((s) => s.value);
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
          setSnapCounts(targets.map((t) => Math.round(t * ease)));
          if (step >= steps) clearInterval(timer);
        }, duration / steps);
      },
      { threshold: 0.3 }
    );
    obs.observe(snapshotRef.current);
    return () => obs.disconnect();
  }, []);

  // Load Save & Follow state from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("novique_saved_research") || "{}");
      const savedMap: Record<string, boolean> = {};
      Object.keys(saved).forEach((k) => { savedMap[k] = true; });
      setSavedPapers(savedMap);
    } catch {}
    try { setFollowedAuthors(JSON.parse(localStorage.getItem("novique_followed_authors") || "{}")); } catch {}
    try { setFollowedTopics(JSON.parse(localStorage.getItem("novique_followed_topics") || "{}")); } catch {}
  }, []);

  const toggleSavePaper = (paper: ResearchPaper) => {
    const key = slugify(paper.title);
    try {
      const store = JSON.parse(localStorage.getItem("novique_saved_research") || "{}");
      if (store[key]) delete store[key];
      else store[key] = { title: paper.title, maker: paper.maker, url: paper.url, savedAt: new Date().toISOString() };
      localStorage.setItem("novique_saved_research", JSON.stringify(store));
      const savedMap: Record<string, boolean> = {};
      Object.keys(store).forEach((k) => { savedMap[k] = true; });
      setSavedPapers(savedMap);
    } catch {}
  };

  const toggleFollowAuthor = (maker: string) => {
    try {
      const store = JSON.parse(localStorage.getItem("novique_followed_authors") || "{}");
      if (store[maker]) delete store[maker]; else store[maker] = true;
      localStorage.setItem("novique_followed_authors", JSON.stringify(store));
      setFollowedAuthors({ ...store });
    } catch {}
  };

  const toggleFollowTopic = (topic: string) => {
    try {
      const store = JSON.parse(localStorage.getItem("novique_followed_topics") || "{}");
      if (store[topic]) delete store[topic]; else store[topic] = true;
      localStorage.setItem("novique_followed_topics", JSON.stringify(store));
      setFollowedTopics({ ...store });
    } catch {}
  };

  const toggleExpand = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const filteredPapers = papers.filter((p) => {
    const q = searchQuery.toLowerCase();
    const searchable = `${p.title} ${p.maker} ${p.explanation} ${p.keyContribution} ${p.relatedTechnologies.join(" ")}`.toLowerCase();
    const matchesSearch = !q || searchable.includes(q);
    const matchesCategory = !activeCategory || p.categories.includes(activeCategory);
    const matchesTech = !activeTech || searchable.includes(activeTech.toLowerCase());
    return matchesSearch && matchesCategory && matchesTech;
  });

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        {/* Hero */}
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-tealAccent mb-1.5 block">Academic Index</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Research Intelligence</h1>
          <p className="text-sm text-textSecondary mt-1">Discover tomorrow's AI before it becomes today's headlines.</p>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-2xl">Understand breakthroughs. Explore possibilities. Stay ahead. Not an academic archive, an Innovation Intelligence Platform.</p>
        </div>

        {/* Research Snapshot */}
        <div ref={snapshotRef} className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-textSecondary">Today's Research Snapshot</h3>
            <div className="h-[1px] bg-white/[0.06] flex-1 ml-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {SNAPSHOT_STATS.map((s, idx) => (
              <div key={s.label} className="bg-panel border border-white/[0.05] p-5 rounded-2xl hover:border-accent/30 hover:-translate-y-1 transition-all">
                <span className="block text-3xl font-display font-black tabular-nums text-white">{snapCounts[idx]}</span>
                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mt-1 block">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="bg-panel border border-white/[0.05] rounded-2xl p-4 flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-tealAccent shrink-0 mr-1">Trending Technologies:</span>
            {TRENDING_TECH.map((t) => (
              <button
                key={t}
                onClick={() => setSearchQuery(t)}
                className="text-[11px] font-bold text-zinc-300 bg-white/[0.04] border border-white/[0.08] hover:border-tealAccent/40 hover:text-tealAccent px-2.5 py-1 rounded-full transition-all"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Emerging Technologies */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-textSecondary">Emerging Technologies</h3>
            {activeTech && (
              <button onClick={() => setActiveTech(null)} className="text-[10px] text-zinc-500 hover:text-white font-bold transition-colors">
                Clear filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {EMERGING_TECH.map((tech) => (
              <button
                key={tech}
                onClick={() => setActiveTech(activeTech === tech ? null : tech)}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold border transition-all ${
                  activeTech === tech
                    ? "bg-accent/20 border-accent/60 text-white"
                    : "bg-panel border-white/[0.05] text-zinc-400 hover:border-accent/30 hover:text-white"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Research Categories */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-textSecondary">Research Categories</h3>
            {activeCategory && (
              <button onClick={() => setActiveCategory(null)} className="text-[10px] text-zinc-500 hover:text-white font-bold transition-colors">
                Clear filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {RESEARCH_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold border transition-all ${
                  activeCategory === cat
                    ? "bg-[#6C63FF]/20 border-[#6C63FF]/60 text-[#a8a3ff]"
                    : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Research Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPapers.map((paper) => {
            const key = paper.title;
            const isExpanded = !!expanded[key];
            const audienceKeys = AUDIENCE_ORDER.filter((a) => paper.audiences[a]);
            const activeAudience = audienceTab[key] && paper.audiences[audienceTab[key]] ? audienceTab[key] : audienceKeys[0];
            const savedKey = slugify(paper.title);
            const primaryTopic = paper.categories[0];

            return (
              <div
                key={key}
                className={`bg-panel border border-white/[0.05] p-7 md:p-8 rounded-3xl hover:border-accent/30 hover:shadow-[0_12px_36px_rgba(109,93,246,0.06)] transition-all flex flex-col justify-between group ${
                  isExpanded ? "md:col-span-2" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-tealAccent uppercase tracking-widest mb-3">
                    <span>{paper.confidence}</span>
                    <span className="text-zinc-500 font-semibold">{paper.citations}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {paper.categories.map((c) => (
                      <span key={c} className="text-[9px] font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>

                  <h4 className="text-xl font-display font-extrabold text-white mb-1 group-hover:text-accent transition-colors leading-snug">{paper.title}</h4>
                  <span className="text-xs text-zinc-500 font-medium block mb-4">Authors: {paper.maker}</span>
                  <p className="text-sm text-textSecondary leading-relaxed mb-5 font-normal">{paper.explanation}</p>

                  <div className="bg-secondaryBg/50 border border-white/[0.05] rounded-xl p-4 mb-5">
                    <span className="text-[10px] font-bold text-goldAccent uppercase tracking-wider block mb-1">Key Contribution</span>
                    <p className="text-xs text-zinc-300 leading-relaxed font-semibold">{paper.keyContribution}</p>
                  </div>

                  <div className={`grid gap-4 mb-5 ${isExpanded ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
                    <ScoreBar label="Research Impact" value={paper.researchImpactScore} colorClass="bg-accent" textClass="text-accent" />
                    <ScoreBar label="Future Impact ⭐" value={paper.futureImpactScore} colorClass="bg-goldAccent" textClass="text-goldAccent" />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] mb-5">
                    <span className="text-zinc-500 font-semibold">
                      Likely Adoption: <span className="text-white font-bold">{paper.likelyAdoption}</span>
                    </span>
                  </div>

                  <ChipRow label="Potential Industries" items={paper.potentialIndustries} />
                  <ChipRow label="Practical Applications" items={paper.practicalApplications} />
                  <ChipRow label="Industries Affected" items={paper.industriesAffected} />
                  <ChipRow label="Related Technologies" items={paper.relatedTechnologies} />
                  <ChipRow label="Real-World Applications" items={paper.realWorldApplications} />

                  {paper.companiesLikelyToAdopt.length > 0 && (
                    <div className="mb-5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Companies Likely To Adopt This</span>
                      <div className="flex flex-wrap gap-1.5">
                        {paper.companiesLikelyToAdopt.map((c) => (
                          <Link
                            key={c.slug}
                            href={`/companies/${c.slug}`}
                            className="text-[11px] font-bold text-zinc-300 bg-white/[0.04] border border-white/[0.08] hover:border-accent/40 hover:text-accent px-2.5 py-1 rounded-full transition-all"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {paper.modelsLikelyToBenefit.length > 0 && (
                    <div className="mb-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Models Likely To Benefit</span>
                      <div className="flex flex-wrap gap-1.5">
                        {paper.modelsLikelyToBenefit.map((m) => (
                          <Link
                            key={m.slug}
                            href={`/models/${m.slug}`}
                            className="text-[11px] font-bold text-zinc-300 bg-white/[0.04] border border-white/[0.08] hover:border-tealAccent/40 hover:text-tealAccent px-2.5 py-1 rounded-full transition-all"
                          >
                            {m.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => toggleExpand(key)}
                  className="w-full text-center py-2.5 mt-5 bg-secondaryBg/60 hover:bg-secondaryBg border border-white/[0.05] hover:border-accent/30 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all"
                >
                  {isExpanded ? "Collapse Intelligence Report ▴" : "View Full Intelligence Report ▾"}
                </button>

                {isExpanded && (
                  <div className="border-t border-white/[0.05] mt-6 pt-6 flex flex-col gap-7">
                    {/* Explain For Different Audiences */}
                    <div>
                      <span className="text-[10px] font-bold text-tealAccent uppercase tracking-widest block mb-2.5">Explain For Different Audiences ⭐</span>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {audienceKeys.map((a) => (
                          <button
                            key={a}
                            onClick={() => setAudienceTab((prev) => ({ ...prev, [key]: a }))}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              activeAudience === a
                                ? "bg-accent/20 border-accent/50 text-white"
                                : "bg-white/[0.02] border-white/[0.08] text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {AUDIENCE_LABELS[a]}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed bg-secondaryBg/50 border border-white/[0.05] rounded-xl p-4">
                        {activeAudience ? paper.audiences[activeAudience] : ""}
                      </p>
                    </div>

                    {paper.timeline && (
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2.5">Research Timeline</span>
                        <Chain items={paper.timeline} />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Research Lineage: Builds Upon</span>
                        <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1.5 leading-relaxed">
                          {paper.buildsUpon.map((b) => <li key={b}>{b}</li>)}
                        </ul>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Research Lineage: Papers It Inspired</span>
                        <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1.5 leading-relaxed">
                          {paper.inspired.map((b) => <li key={b}>{b}</li>)}
                        </ul>
                      </div>
                    </div>

                    {paper.realityTracker && (
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2.5">Research &rarr; Reality Tracker ⭐</span>
                        <div className="flex flex-col gap-2.5">
                          {paper.realityTracker.map((stage, i) => (
                            <div key={stage.label} className="flex items-center gap-3 text-xs">
                              <span className="w-36 shrink-0 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{stage.label}</span>
                              <span className="font-semibold text-zinc-200">{stage.value}</span>
                              {i < paper.realityTracker!.length - 1 && <span className="sr-only">then</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Startup Opportunities ⭐</span>
                      <div className="flex flex-wrap gap-1.5">
                        {paper.startupOpportunities.map((s) => (
                          <span key={s} className="text-[11px] font-semibold text-zinc-300 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Product Opportunities</span>
                      <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1.5 leading-relaxed">
                        {paper.productOpportunities.map((p) => <li key={p}>{p}</li>)}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2.5">Industry Impact</span>
                        <div className="flex flex-col gap-2">
                          {paper.industryImpact.map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-xs">
                              <span className="text-zinc-400 font-medium">{item.label}</span>
                              <StarRating value={item.stars} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2.5">Should You Read This? ⭐</span>
                        <div className="flex flex-col gap-2">
                          {paper.shouldYouRead.map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-xs">
                              <span className="text-zinc-400 font-medium">{item.label}</span>
                              <StarRating value={item.stars} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Learning Recommendations</span>
                      <div className="flex flex-wrap gap-1.5">
                        {paper.learningRecommendations.map((rec) => (
                          <Link
                            key={rec.label}
                            href={rec.slug ? `/learning/${rec.slug}` : "/learning"}
                            className="text-[11px] font-bold text-zinc-300 bg-white/[0.04] border border-white/[0.08] hover:border-tealAccent/40 hover:text-tealAccent px-2.5 py-1 rounded-full transition-all"
                          >
                            {rec.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {paper.aiPrediction && (
                      <div className="bg-goldAccent/5 border border-goldAccent/30 rounded-2xl p-5 flex flex-col gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-goldAccent flex items-center gap-1.5">⭐ AI Prediction</span>
                        <p className="text-sm text-white font-semibold leading-relaxed">{paper.aiPrediction.prediction}</p>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-zinc-400 font-semibold mt-1">
                          <span>Confidence: <span className="text-goldAccent">{paper.aiPrediction.confidence}</span></span>
                          <span>Timeline: <span className="text-white">{paper.aiPrediction.timeline}</span></span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 border-t border-white/[0.05] pt-5">
                      <button
                        onClick={() => toggleSavePaper(paper)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          savedPapers[savedKey]
                            ? "bg-accent/20 border-accent/50 text-white"
                            : "bg-white/[0.02] border-white/[0.08] text-zinc-400 hover:border-accent/30 hover:text-white"
                        }`}
                      >
                        {savedPapers[savedKey] ? "✓ Saved" : "Save Paper"}
                      </button>
                      <button
                        onClick={() => toggleFollowAuthor(paper.maker)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          followedAuthors[paper.maker]
                            ? "bg-tealAccent/20 border-tealAccent/50 text-white"
                            : "bg-white/[0.02] border-white/[0.08] text-zinc-400 hover:border-tealAccent/30 hover:text-white"
                        }`}
                      >
                        {followedAuthors[paper.maker] ? "✓ Following Author" : "Follow Author"}
                      </button>
                      <button
                        onClick={() => toggleFollowTopic(primaryTopic)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          followedTopics[primaryTopic]
                            ? "bg-goldAccent/20 border-goldAccent/50 text-white"
                            : "bg-white/[0.02] border-white/[0.08] text-zinc-400 hover:border-goldAccent/30 hover:text-white"
                        }`}
                      >
                        {followedTopics[primaryTopic] ? `✓ Following ${primaryTopic}` : `Follow ${primaryTopic}`}
                      </button>
                    </div>
                  </div>
                )}

                <div className="border-t border-white/[0.04] pt-5 mt-6">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Industry Impact Summary:</div>
                  <div className="text-xs text-zinc-200 font-semibold mb-6 leading-relaxed">{paper.impact}</div>
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2.5 bg-secondaryBg/60 hover:bg-secondaryBg border border-white/[0.05] hover:border-accent/30 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all block"
                  >
                    Read Paper &rarr;
                  </a>
                </div>
              </div>
            );
          })}

          {filteredPapers.length === 0 && (
            <div className="md:col-span-2 bg-panel border border-white/[0.05] p-10 rounded-3xl text-center text-zinc-500 text-sm">
              No papers match the current filters.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
