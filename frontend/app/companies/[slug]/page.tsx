"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

// Model slugs that resolve on /models/[slug] today. Company model chips only
// link out when the slug exists here, per spec ("linking where the slug exists").
const KNOWN_MODEL_SLUGS = new Set(["claude-3-5-sonnet", "gpt-4o", "llama-3-1-405b", "gemini-1-5-pro"]);

interface Signal {
  headline: string;
  impactScore: number;
  trendScore: number;
  summary: string;
  whyItMatters: string;
  timestamp: string;
}

interface ModelLink {
  name: string;
  slug?: string;
}

interface ResearchPaper {
  title: string;
  summary: string;
  citations: string;
  date: string;
}

interface TimelineStep {
  date: string;
  event: string;
}

interface Metric {
  label: string;
  value: number;
}

interface CompanyDetail {
  name: string;
  logoLetter: string;
  tagline: string;
  location: string;
  founded: number;
  website: string;
  momentumScore: number;
  quickStats: { models: number; signals: number; papers: number; employees: string };
  overview: string;
  latestSignals: Signal[];
  models: ModelLink[];
  research: ResearchPaper[];
  productEcosystem: string[];
  timeline: TimelineStep[];
  competitors: string[];
  aiInsight: {
    paragraph: string;
    whyItMatters: string;
    confidence: number;
    keyTakeaways: string[];
    recommendedFollowUp: string;
  };
  health: Metric[];
  aiDna: Metric[];
  strategicFocus: Metric[];
  relatedLearning: string[];
  relatedCompanies: string[];
}

const COMPANY_DATABASE: Record<string, CompanyDetail> = {
  openai: {
    name: "OpenAI",
    logoLetter: "O",
    tagline: "Building general-purpose intelligence platforms that benefit all of humanity.",
    location: "San Francisco, California, USA",
    founded: 2015,
    website: "openai.com",
    momentumScore: 96,
    quickStats: { models: 6, signals: 128, papers: 340, employees: "~3,200" },
    overview:
      "OpenAI's mission is to ensure artificial general intelligence benefits all of humanity. Its core products span ChatGPT, the GPT API platform, Sora video generation, and the Codex coding agent, serving both consumers and enterprise developers. Current focus has shifted from pure scale to reasoning-heavy models and autonomous agent workflows that can plan, browse, and execute multi-step tasks. OpenAI holds the largest consumer mindshare of any AI lab and the deepest enterprise distribution through its Microsoft partnership. Its key strengths are rapid model iteration, an enormous developer ecosystem, and first-mover brand recognition, though it faces mounting pressure on cost efficiency and safety scrutiny as it races toward more capable systems.",
    latestSignals: [
      {
        headline: "GPT-5 rolls out expanded agentic tool-use to all API tiers",
        impactScore: 94,
        trendScore: 88,
        summary: "OpenAI opened multi-step tool orchestration in GPT-5 to every paid API tier, not just enterprise.",
        whyItMatters: "Lowers the barrier for smaller teams to build production agents, intensifying competition with Anthropic's Claude agent tooling.",
        timestamp: "2 hours ago",
      },
      {
        headline: "Sora 2 adds synchronized audio generation",
        impactScore: 81,
        trendScore: 90,
        summary: "The video model now generates matched dialogue and sound effects in a single pass.",
        whyItMatters: "Signals OpenAI's push into full multimedia generation, a market Meta and Google are also targeting.",
        timestamp: "1 day ago",
      },
      {
        headline: "OpenAI expands enterprise data residency options to the EU",
        impactScore: 72,
        trendScore: 65,
        summary: "New regional hosting addresses long-standing compliance concerns from European enterprise buyers.",
        whyItMatters: "Removes a major procurement blocker for regulated industries in the EU market.",
        timestamp: "3 days ago",
      },
      {
        headline: "Hiring surge for applied safety and evaluations roles",
        impactScore: 60,
        trendScore: 55,
        summary: "Job postings for safety evaluation and red-teaming roles rose sharply this month.",
        whyItMatters: "Suggests internal investment ahead of anticipated regulatory requirements for frontier model releases.",
        timestamp: "5 days ago",
      },
    ],
    models: [
      { name: "GPT-5" },
      { name: "GPT-4o", slug: "gpt-4o" },
      { name: "o1 Reasoning Series" },
      { name: "Sora 2" },
    ],
    research: [
      {
        title: "GPT-4 Technical Report",
        summary: "Documents architecture, training methodology, and safety evaluation for GPT-4.",
        citations: "4,800 citations",
        date: "Mar 2023",
      },
      {
        title: "Scaling Laws for Autoregressive Generative Models",
        summary: "Establishes predictable relationships between compute, data, and model performance.",
        citations: "2,150 citations",
        date: "Nov 2022",
      },
      {
        title: "Introducing Superalignment: Scalable Oversight for Superhuman Models",
        summary: "Proposes research directions for aligning models that exceed human-level capability.",
        citations: "610 citations",
        date: "Jul 2023",
      },
    ],
    productEcosystem: ["ChatGPT", "API Platform", "Sora", "OpenAI Codex", "Operator Agent", "ChatGPT Enterprise"],
    timeline: [
      { date: "2020", event: "GPT-3 released, demonstrating few-shot learning at unprecedented scale." },
      { date: "2022", event: "ChatGPT launches, igniting the global generative AI wave." },
      { date: "2023", event: "GPT-4 released with multimodal input and stronger reasoning." },
      { date: "2024", event: "GPT-4o ships with native real-time voice and vision." },
      { date: "2026", event: "GPT-5 launches with expanded agentic tool-use across the API." },
    ],
    competitors: ["anthropic", "google-deepmind", "xai"],
    aiInsight: {
      paragraph:
        "OpenAI's shift toward agentic tool-use in GPT-5 marks a strategic pivot from raw benchmark leadership to owning the workflow layer where AI actually gets work done. By opening this to all API tiers rather than gating it to enterprise, OpenAI is betting on developer volume over per-seat margin, mirroring the platform land-grab playbook it ran with the original ChatGPT launch.",
      whyItMatters: "Whoever owns the default agent runtime for developers effectively owns the distribution layer for the next wave of AI-native software, not just the model underneath it.",
      confidence: 91,
      keyTakeaways: [
        "Agent tool-use is now a core API feature, not an enterprise add-on.",
        "Sora 2's audio synchronization pushes OpenAI further into multimedia, competing with Meta and Google.",
        "EU data residency removes a key blocker for regulated enterprise buyers.",
      ],
      recommendedFollowUp: "Track how Anthropic and Google respond on agent tooling pricing over the next quarter.",
    },
    health: [
      { label: "AI Momentum", value: 96 },
      { label: "Research Activity", value: 88 },
      { label: "Hiring Momentum", value: 90 },
      { label: "Community Buzz", value: 95 },
      { label: "Enterprise Adoption", value: 92 },
      { label: "Open Source Activity", value: 35 },
      { label: "Overall Rating", value: 91 },
    ],
    aiDna: [
      { label: "LLMs", value: 45 },
      { label: "AI Agents", value: 22 },
      { label: "Coding AI", value: 15 },
      { label: "Vision", value: 10 },
      { label: "Audio", value: 6 },
      { label: "Robotics", value: 2 },
    ],
    strategicFocus: [
      { label: "Enterprise AI", value: 35 },
      { label: "Consumer AI", value: 38 },
      { label: "Developer APIs", value: 20 },
      { label: "Research", value: 7 },
    ],
    relatedLearning: ["Intro to Large Language Models", "Prompt Engineering Fundamentals", "Understanding Reasoning Models"],
    relatedCompanies: ["microsoft-ai", "perplexity", "hugging-face"],
  },

  anthropic: {
    name: "Anthropic",
    logoLetter: "A",
    tagline: "Building reliable, interpretable, and steerable AI systems, safely.",
    location: "San Francisco, California, USA",
    founded: 2021,
    website: "anthropic.com",
    momentumScore: 97,
    quickStats: { models: 6, signals: 141, papers: 210, employees: "~1,600" },
    overview:
      "Anthropic's mission is to ensure the world safely transitions through transformative AI. Its Claude model family and the Model Context Protocol (MCP) have made it the reference point for agentic developer tooling and constitutional AI alignment research. Current focus centers on extending long-horizon agent reliability and standardizing how models connect to external tools and data. Anthropic holds a strong position among technical developers and enterprises that prioritize safety guarantees and controllability over raw scale. Its key strengths are alignment research depth, developer trust, and a fast-growing agentic ecosystem, though it operates with a smaller compute footprint than OpenAI or Google.",
    latestSignals: [
      {
        headline: "Claude 5 sets new state-of-the-art on long-horizon agent benchmarks",
        impactScore: 95,
        trendScore: 92,
        summary: "Claude 5 completes multi-hour agentic coding tasks with materially fewer human interventions.",
        whyItMatters: "Strengthens Anthropic's position as the preferred model for autonomous coding and operations agents.",
        timestamp: "4 hours ago",
      },
      {
        headline: "MCP adoption crosses 10,000 public server integrations",
        impactScore: 84,
        trendScore: 89,
        summary: "The Model Context Protocol, originally an Anthropic standard, is now used across most major AI tooling vendors.",
        whyItMatters: "Anthropic effectively set the interoperability standard for the agentic tooling ecosystem.",
        timestamp: "1 day ago",
      },
      {
        headline: "Amazon deepens Trainium compute commitment",
        impactScore: 78,
        trendScore: 70,
        summary: "Extended custom-silicon partnership secures long-term training capacity for future Claude generations.",
        whyItMatters: "Reduces Anthropic's dependence on Nvidia GPU supply constraints relative to smaller competitors.",
        timestamp: "3 days ago",
      },
    ],
    models: [
      { name: "Claude 5" },
      { name: "Claude 3.5 Sonnet", slug: "claude-3-5-sonnet" },
      { name: "Claude 3 Opus" },
      { name: "Claude 3.5 Haiku" },
    ],
    research: [
      {
        title: "Constitutional AI: Harmlessness from AI Feedback",
        summary: "Introduces training models to follow a set of principles instead of relying solely on human labels.",
        citations: "1,900 citations",
        date: "Dec 2022",
      },
      {
        title: "Scaling Monosemanticity in Claude 3",
        summary: "Extracts millions of interpretable features from a production-scale language model.",
        citations: "740 citations",
        date: "May 2024",
      },
      {
        title: "Toy Models of Superposition",
        summary: "Explains how neural networks represent more features than they have dimensions.",
        citations: "980 citations",
        date: "Sep 2022",
      },
    ],
    productEcosystem: ["Claude.ai", "Claude API", "Claude Code", "Model Context Protocol", "Claude for Enterprise"],
    timeline: [
      { date: "2021", event: "Founded by former OpenAI researchers to focus on AI safety." },
      { date: "2023", event: "Claude chatbot launches publicly alongside an AWS partnership." },
      { date: "2024", event: "Claude 3.5 Sonnet and the Computer Use API set new agent benchmarks." },
      { date: "2025", event: "Model Context Protocol becomes an industry-wide standard." },
      { date: "2026", event: "Claude 5 ships with materially stronger long-horizon agent reliability." },
    ],
    competitors: ["openai", "google-deepmind", "meta-ai"],
    aiInsight: {
      paragraph:
        "Anthropic's decision to open-source the Model Context Protocol rather than keep it proprietary has paid off strategically: it is now the de facto interoperability layer for agentic tools industry-wide, giving Anthropic outsized influence over ecosystem direction despite a smaller compute base than OpenAI or Google.",
      whyItMatters: "Owning a widely adopted open standard is a durable moat that scales independently of raw model capability.",
      confidence: 90,
      keyTakeaways: [
        "MCP adoption at 10,000+ integrations makes Anthropic the ecosystem standard-setter.",
        "Claude 5's long-horizon agent reliability is a genuine differentiator, not just a benchmark win.",
        "Custom silicon partnerships with Amazon reduce Anthropic's GPU supply risk.",
      ],
      recommendedFollowUp: "Watch whether competitors adopt or fork MCP as their own agent standard consolidates.",
    },
    health: [
      { label: "AI Momentum", value: 97 },
      { label: "Research Activity", value: 90 },
      { label: "Hiring Momentum", value: 88 },
      { label: "Community Buzz", value: 93 },
      { label: "Enterprise Adoption", value: 89 },
      { label: "Open Source Activity", value: 55 },
      { label: "Overall Rating", value: 92 },
    ],
    aiDna: [
      { label: "LLMs", value: 40 },
      { label: "AI Agents", value: 28 },
      { label: "Coding AI", value: 20 },
      { label: "Vision", value: 8 },
      { label: "Audio", value: 3 },
      { label: "Robotics", value: 1 },
    ],
    strategicFocus: [
      { label: "Enterprise AI", value: 42 },
      { label: "Consumer AI", value: 20 },
      { label: "Developer APIs", value: 26 },
      { label: "Research", value: 12 },
    ],
    relatedLearning: ["Constitutional AI Explained", "Building Agents with MCP", "Understanding AI Alignment"],
    relatedCompanies: ["openai", "cursor", "hugging-face"],
  },

  "google-deepmind": {
    name: "Google DeepMind",
    logoLetter: "G",
    tagline: "Solving intelligence to advance science and benefit humanity.",
    location: "London, UK",
    founded: 2010,
    website: "deepmind.google",
    momentumScore: 93,
    quickStats: { models: 5, signals: 102, papers: 520, employees: "~2,600" },
    overview:
      "Google DeepMind combines deep reinforcement learning, foundational research, and Google's distribution to tackle intelligence and scientific challenges, from protein folding to mathematics. Its Gemini model family now underpins Search, Workspace, and Android, giving it the broadest default consumer surface area of any lab. Current focus spans multimodal reasoning at massive context lengths and applying models to real scientific discovery, such as materials science and drug design. Its key strengths are unmatched research depth, direct integration into billions of Google devices, and world-class scientific credibility, though shipping velocity has historically trailed OpenAI and Anthropic on developer-facing agent tooling.",
    latestSignals: [
      {
        headline: "Gemini 3 launches with 5-million token context window",
        impactScore: 90,
        trendScore: 84,
        summary: "The new context ceiling lets Gemini 3 ingest entire codebases or hours of video in a single prompt.",
        whyItMatters: "Widens Google DeepMind's lead in long-context retrieval use cases like legal and codebase analysis.",
        timestamp: "6 hours ago",
      },
      {
        headline: "AlphaFold successor predicts protein-drug binding dynamics",
        impactScore: 88,
        trendScore: 75,
        summary: "New model extends beyond static structure prediction into dynamic molecular interaction modeling.",
        whyItMatters: "Deepens DeepMind's position as the leading AI-for-science lab, ahead of pure commercial labs.",
        timestamp: "2 days ago",
      },
      {
        headline: "Gemini integrated into Chrome's native agent sidebar",
        impactScore: 74,
        trendScore: 80,
        summary: "Chrome now ships a built-in Gemini agent for page summarization and task automation.",
        whyItMatters: "Gives Google the single largest default distribution channel for AI agents of any company.",
        timestamp: "4 days ago",
      },
    ],
    models: [
      { name: "Gemini 3" },
      { name: "Gemini 1.5 Pro", slug: "gemini-1-5-pro" },
      { name: "Gemini 1.5 Flash" },
      { name: "Gemma 2" },
    ],
    research: [
      {
        title: "AlphaFold 3: Predicting Molecular Structure in Nature",
        summary: "Extends structure prediction beyond proteins to nucleic acids, ligands, and complexes.",
        citations: "3,100 citations",
        date: "May 2024",
      },
      {
        title: "Gemini: A Family of Highly Capable Multimodal Models",
        summary: "Details the architecture and training approach behind the Gemini model family.",
        citations: "1,750 citations",
        date: "Dec 2023",
      },
      {
        title: "Mastering Chess and Go without Human Knowledge",
        summary: "The foundational AlphaZero paper showing self-play reinforcement learning at superhuman level.",
        citations: "8,200 citations",
        date: "Oct 2017",
      },
    ],
    productEcosystem: ["Gemini App", "Gemini API", "AlphaFold Server", "Google Workspace AI", "Chrome Agent Sidebar"],
    timeline: [
      { date: "2014", event: "DeepMind is acquired by Google and integrated into core research." },
      { date: "2020", event: "AlphaFold solves the 50-year protein folding challenge." },
      { date: "2023", event: "Google Brain and DeepMind merge into Google DeepMind." },
      { date: "2024", event: "Gemini 1.5 Pro ships with a 2-million token context window." },
      { date: "2026", event: "Gemini 3 launches with a 5-million token context window and native agent tooling." },
    ],
    competitors: ["openai", "anthropic", "meta-ai"],
    aiInsight: {
      paragraph:
        "Google DeepMind's built-in Chrome and Workspace distribution means it does not need to win on developer mindshare the way OpenAI or Anthropic do. Its strategy resembles a distribution play more than a pure capability race: the goal is to make Gemini the invisible default rather than the deliberately chosen tool.",
      whyItMatters: "Default distribution at Google's scale can outcompete a technically superior but less-integrated model over the long run.",
      confidence: 87,
      keyTakeaways: [
        "5-million token context in Gemini 3 extends DeepMind's long-context research lead.",
        "AI-for-science work keeps DeepMind's scientific credibility ahead of purely commercial labs.",
        "Chrome's native Gemini sidebar is the widest default agent distribution channel available today.",
      ],
      recommendedFollowUp: "Track developer-facing agent tooling parity as Google closes the gap with OpenAI and Anthropic.",
    },
    health: [
      { label: "AI Momentum", value: 93 },
      { label: "Research Activity", value: 95 },
      { label: "Hiring Momentum", value: 74 },
      { label: "Community Buzz", value: 80 },
      { label: "Enterprise Adoption", value: 88 },
      { label: "Open Source Activity", value: 48 },
      { label: "Overall Rating", value: 88 },
    ],
    aiDna: [
      { label: "LLMs", value: 35 },
      { label: "AI Agents", value: 15 },
      { label: "Coding AI", value: 10 },
      { label: "Vision", value: 18 },
      { label: "Audio", value: 8 },
      { label: "Robotics", value: 14 },
    ],
    strategicFocus: [
      { label: "Enterprise AI", value: 30 },
      { label: "Consumer AI", value: 40 },
      { label: "Developer APIs", value: 15 },
      { label: "Research", value: 15 },
    ],
    relatedLearning: ["Foundations of Reinforcement Learning", "Multimodal Models Explained", "AI for Scientific Discovery"],
    relatedCompanies: ["openai", "meta-ai", "microsoft-ai"],
  },

  "meta-ai": {
    name: "Meta AI",
    logoLetter: "M",
    tagline: "Open-sourcing frontier AI to accelerate the whole ecosystem.",
    location: "Menlo Park, California, USA",
    founded: 2013,
    website: "ai.meta.com",
    momentumScore: 91,
    quickStats: { models: 5, signals: 96, papers: 410, employees: "~2,900" },
    overview:
      "Meta AI, rooted in the original FAIR research group, believes open model weights accelerate innovation and safety scrutiny faster than closed development. Its Llama family is the most widely self-hosted open model line in the industry, powering everything from research labs to enterprise on-premise deployments. Current focus is extending open multimodal models into AR and wearable devices, aligning with Meta's broader Reality Labs strategy. Its key strengths are the largest open-source developer community of any major lab and deep integration into WhatsApp, Instagram, and Facebook's billions of users, though it lacks a dedicated high-margin API business the way closed labs do.",
    latestSignals: [
      {
        headline: "Llama 4 open-weights release matches closed-model coding benchmarks",
        impactScore: 89,
        trendScore: 86,
        summary: "The new open-weights flagship closes most of the performance gap with proprietary frontier models.",
        whyItMatters: "Undercuts pricing power for closed labs by giving enterprises a free, self-hostable alternative.",
        timestamp: "8 hours ago",
      },
      {
        headline: "Meta AI assistant crosses 800 million monthly users",
        impactScore: 82,
        trendScore: 70,
        summary: "Integration across WhatsApp, Instagram, and Messenger drives massive default usage.",
        whyItMatters: "Meta now has more default AI assistant reach than any single competitor's consumer app.",
        timestamp: "2 days ago",
      },
      {
        headline: "Ray-Ban Meta smart glasses ship on-device vision model",
        impactScore: 76,
        trendScore: 82,
        summary: "New glasses run a compact vision-language model directly on the device for real-time scene understanding.",
        whyItMatters: "Positions Meta ahead in the race to make AI-native wearables mainstream hardware.",
        timestamp: "5 days ago",
      },
    ],
    models: [
      { name: "Llama 4" },
      { name: "Llama 3.1 405B", slug: "llama-3-1-405b" },
      { name: "Llama 3 70B" },
      { name: "Segment Anything Model v2" },
    ],
    research: [
      {
        title: "Llama 3.1 Model Architecture Report",
        summary: "Details the training data, architecture, and safety tuning behind the Llama 3.1 series.",
        citations: "1,320 citations",
        date: "Jul 2024",
      },
      {
        title: "Segment Anything Technical Whitepaper",
        summary: "Introduces a promptable segmentation model generalizing across arbitrary visual objects.",
        citations: "2,600 citations",
        date: "Apr 2023",
      },
      {
        title: "Self-Supervised Learning with DINOv2",
        summary: "Presents a self-supervised vision model trained without any labeled data.",
        citations: "1,050 citations",
        date: "Apr 2023",
      },
    ],
    productEcosystem: ["Meta AI Assistant", "Llama Models", "Ray-Ban Meta Glasses", "Segment Anything", "AI Studio"],
    timeline: [
      { date: "2013", event: "FAIR founded by Yann LeCun to pursue open AI research." },
      { date: "2023", event: "Original Llama weights leak, catalyzing the open-source LLM community." },
      { date: "2024", event: "Llama 3.1 405B ships, rivaling proprietary frontier models." },
      { date: "2025", event: "Ray-Ban Meta glasses add on-device vision-language capability." },
      { date: "2026", event: "Llama 4 closes most of the coding benchmark gap with closed models." },
    ],
    competitors: ["openai", "anthropic", "google-deepmind"],
    aiInsight: {
      paragraph:
        "Meta's open-weights strategy functions as a pricing weapon against closed labs: every Llama release that approaches frontier performance erodes the premium OpenAI and Anthropic can charge for equivalent capability, since enterprises can self-host Llama instead. The wearables push adds a second front, betting AI-native hardware becomes the next default surface.",
      whyItMatters: "A credible free alternative caps how much the rest of the industry can charge for comparable model capability.",
      confidence: 85,
      keyTakeaways: [
        "Llama 4 narrows the gap with closed frontier models on coding benchmarks.",
        "800 million monthly Meta AI users gives Meta the largest default assistant footprint.",
        "On-device vision models in smart glasses put Meta ahead in AI-native wearables.",
      ],
      recommendedFollowUp: "Monitor enterprise self-hosting adoption rates as Llama 4 closes the capability gap.",
    },
    health: [
      { label: "AI Momentum", value: 91 },
      { label: "Research Activity", value: 87 },
      { label: "Hiring Momentum", value: 76 },
      { label: "Community Buzz", value: 90 },
      { label: "Enterprise Adoption", value: 78 },
      { label: "Open Source Activity", value: 96 },
      { label: "Overall Rating", value: 87 },
    ],
    aiDna: [
      { label: "LLMs", value: 38 },
      { label: "AI Agents", value: 10 },
      { label: "Coding AI", value: 12 },
      { label: "Vision", value: 24 },
      { label: "Audio", value: 8 },
      { label: "Robotics", value: 8 },
    ],
    strategicFocus: [
      { label: "Enterprise AI", value: 18 },
      { label: "Consumer AI", value: 48 },
      { label: "Developer APIs", value: 12 },
      { label: "Research", value: 22 },
    ],
    relatedLearning: ["Open Source LLMs 101", "Fine-tuning Llama Models", "Vision-Language Models Explained"],
    relatedCompanies: ["hugging-face", "mistral", "deepseek"],
  },

  mistral: {
    name: "Mistral",
    logoLetter: "M",
    tagline: "Efficient, high-density models for edge and enterprise deployment.",
    location: "Paris, France",
    founded: 2023,
    website: "mistral.ai",
    momentumScore: 84,
    quickStats: { models: 5, signals: 58, papers: 45, employees: "~350" },
    overview:
      "Mistral AI builds high-performance, compute-efficient language models that prioritize open-weights releases alongside a commercial API. Its mission is to give European enterprises and developers sovereign, cost-effective access to frontier-adjacent capability. Current focus is on parameter-dense architectures that run well on modest hardware and deepening partnerships with European public sector and telecom customers. Its key strengths are efficiency-per-parameter, strong EU data sovereignty positioning, and a lean, fast-moving research team, though it operates with a fraction of the compute budget of the largest US labs.",
    latestSignals: [
      {
        headline: "Mistral Large 3 released with improved multilingual reasoning",
        impactScore: 74,
        trendScore: 68,
        summary: "The new flagship model shows notable gains on European-language benchmarks.",
        whyItMatters: "Reinforces Mistral's positioning as the default sovereign AI option for EU enterprises.",
        timestamp: "1 day ago",
      },
      {
        headline: "Microsoft Azure expands Mistral hosting to new regions",
        impactScore: 65,
        trendScore: 60,
        summary: "Azure now offers Mistral models as a managed service across additional EU data centers.",
        whyItMatters: "Widens Mistral's enterprise distribution without needing to build its own hyperscale infrastructure.",
        timestamp: "4 days ago",
      },
      {
        headline: "Codestral update improves multi-file refactoring accuracy",
        impactScore: 58,
        trendScore: 55,
        summary: "The coding model shows measurable gains on cross-file dependency reasoning.",
        whyItMatters: "Keeps Mistral competitive in the crowded AI coding assistant space against Cursor and GitHub Copilot.",
        timestamp: "6 days ago",
      },
    ],
    models: [
      { name: "Mistral Large 3" },
      { name: "Codestral 22B" },
      { name: "Mistral 7B" },
      { name: "Pixtral 12B" },
    ],
    research: [
      {
        title: "Mixture-of-Experts with Mixtral 8x7B",
        summary: "Shows a sparse mixture-of-experts model matching much larger dense models at lower inference cost.",
        citations: "890 citations",
        date: "Jan 2024",
      },
      {
        title: "Mistral 7B Architecture Specifications",
        summary: "Documents the attention and grouped-query design choices behind the efficient Mistral 7B model.",
        citations: "620 citations",
        date: "Oct 2023",
      },
    ],
    productEcosystem: ["Le Chat", "La Plateforme API", "Codestral", "Mistral Compute Partnerships"],
    timeline: [
      { date: "2023", event: "Founded in Paris by researchers from Meta and Google DeepMind." },
      { date: "2023", event: "Mixtral 8x7B proves mixture-of-experts efficiency on commodity GPUs." },
      { date: "2024", event: "Microsoft Azure partnership brings Mistral Large 2 to enterprise customers." },
      { date: "2026", event: "Mistral Large 3 ships with stronger multilingual reasoning." },
    ],
    competitors: ["meta-ai", "openai", "cohere"],
    aiInsight: {
      paragraph:
        "Mistral's bet on efficiency and EU data sovereignty is less about beating OpenAI on raw capability and more about owning a regulatory and geopolitical niche that US labs structurally cannot address as credibly. That niche is durable as long as EU AI regulation continues to favor sovereign hosting options.",
      whyItMatters: "Regulatory and sovereignty advantages can be as durable a moat as raw model capability in regulated markets.",
      confidence: 78,
      keyTakeaways: [
        "Mistral Large 3's multilingual gains reinforce its EU sovereign-AI positioning.",
        "Azure distribution lets Mistral scale reach without hyperscale infrastructure spend.",
        "Codestral improvements keep Mistral relevant in the AI coding assistant market.",
      ],
      recommendedFollowUp: "Watch EU AI Act enforcement timelines for effects on Mistral's sovereign-hosting advantage.",
    },
    health: [
      { label: "AI Momentum", value: 84 },
      { label: "Research Activity", value: 62 },
      { label: "Hiring Momentum", value: 58 },
      { label: "Community Buzz", value: 66 },
      { label: "Enterprise Adoption", value: 64 },
      { label: "Open Source Activity", value: 80 },
      { label: "Overall Rating", value: 71 },
    ],
    aiDna: [
      { label: "LLMs", value: 55 },
      { label: "AI Agents", value: 10 },
      { label: "Coding AI", value: 20 },
      { label: "Vision", value: 10 },
      { label: "Audio", value: 3 },
      { label: "Robotics", value: 2 },
    ],
    strategicFocus: [
      { label: "Enterprise AI", value: 45 },
      { label: "Consumer AI", value: 15 },
      { label: "Developer APIs", value: 30 },
      { label: "Research", value: 10 },
    ],
    relatedLearning: ["Mixture-of-Experts Explained", "Efficient Model Architectures", "AI Sovereignty & Regulation"],
    relatedCompanies: ["cohere", "hugging-face", "deepseek"],
  },

  cursor: {
    name: "Cursor (Anysphere)",
    logoLetter: "C",
    tagline: "The AI-native code editor built for pair-programming with agents.",
    location: "San Francisco, California, USA",
    founded: 2022,
    website: "cursor.com",
    momentumScore: 92,
    quickStats: { models: 2, signals: 74, papers: 12, employees: "~120" },
    overview:
      "Anysphere builds Cursor, a fork of VS Code purpose-built for deep AI pair-programming. Its mission is to make software development an order of magnitude faster by letting agents handle large, multi-file changes while developers stay in control of intent and review. Current focus is extending its Composer agent mode to handle longer autonomous coding sessions with less supervision. Its key strengths are best-in-class tab-completion latency and the fastest-growing developer user base of any AI coding tool, though it depends on third-party foundation models like Claude rather than owning its own frontier model.",
    latestSignals: [
      {
        headline: "Composer 2 completes autonomous multi-file refactors with fewer reviews",
        impactScore: 85,
        trendScore: 91,
        summary: "The latest agent engine handles longer coding sessions with materially fewer human checkpoints.",
        whyItMatters: "Pushes Cursor further ahead of GitHub Copilot in autonomous coding capability.",
        timestamp: "5 hours ago",
      },
      {
        headline: "Cursor surpasses 1 million paying developer seats",
        impactScore: 80,
        trendScore: 85,
        summary: "Paid seat growth accelerates as enterprises adopt Cursor as a default IDE.",
        whyItMatters: "Validates the AI-native editor category as more than a novelty for individual developers.",
        timestamp: "2 days ago",
      },
      {
        headline: "Local MCP server support added for private codebases",
        impactScore: 68,
        trendScore: 72,
        summary: "Developers can now connect Cursor's agents to internal tools without exposing code externally.",
        whyItMatters: "Removes a key enterprise security objection to adopting AI coding agents at scale.",
        timestamp: "6 days ago",
      },
    ],
    models: [
      { name: "Cursor Tab Engine" },
      { name: "Composer 2 Agent Engine" },
    ],
    research: [
      {
        title: "Speculative Decoding for Code Completion",
        summary: "Describes techniques for sub-100ms code suggestion latency using speculative decoding.",
        citations: "180 citations",
        date: "Feb 2024",
      },
      {
        title: "User Intent Modeling in IDE Agent Loops",
        summary: "Studies how developer edit history can predict next-action intent for coding agents.",
        citations: "95 citations",
        date: "Sep 2024",
      },
    ],
    productEcosystem: ["Cursor Editor", "Composer Agent Mode", "Cursor Tab", "Cursor for Teams"],
    timeline: [
      { date: "2022", event: "Founded by MIT graduates focused on IDE-level AI integration." },
      { date: "2023", event: "Cursor editor launches, gaining rapid traction with developers." },
      { date: "2024", event: "Composer mode ships alongside a Series A from Andreessen Horowitz." },
      { date: "2026", event: "Composer 2 enables longer autonomous coding sessions with less supervision." },
    ],
    competitors: ["hugging-face", "openai", "anthropic"],
    aiInsight: {
      paragraph:
        "Cursor's advantage is not model capability, it licenses that from Anthropic and OpenAI, but interaction design: owning the editor surface where developers actually spend their day lets it capture value regardless of which foundation model wins the underlying capability race.",
      whyItMatters: "Owning the workflow surface can be more durable than owning the underlying model when the model layer is commoditizing.",
      confidence: 83,
      keyTakeaways: [
        "Composer 2 narrows the autonomy gap between AI coding agents and full software engineers.",
        "1 million paid seats confirms AI-native editors are a durable category, not a fad.",
        "Local MCP support addresses the primary enterprise security objection to AI coding tools.",
      ],
      recommendedFollowUp: "Watch whether foundation model providers launch competing first-party IDEs that bypass Cursor.",
    },
    health: [
      { label: "AI Momentum", value: 92 },
      { label: "Research Activity", value: 54 },
      { label: "Hiring Momentum", value: 88 },
      { label: "Community Buzz", value: 94 },
      { label: "Enterprise Adoption", value: 76 },
      { label: "Open Source Activity", value: 20 },
      { label: "Overall Rating", value: 85 },
    ],
    aiDna: [
      { label: "LLMs", value: 15 },
      { label: "AI Agents", value: 35 },
      { label: "Coding AI", value: 42 },
      { label: "Vision", value: 5 },
      { label: "Audio", value: 2 },
      { label: "Robotics", value: 1 },
    ],
    strategicFocus: [
      { label: "Enterprise AI", value: 30 },
      { label: "Consumer AI", value: 10 },
      { label: "Developer APIs", value: 50 },
      { label: "Research", value: 10 },
    ],
    relatedLearning: ["AI Pair Programming Basics", "Understanding Coding Agents", "Model Context Protocol for IDEs"],
    relatedCompanies: ["anthropic", "hugging-face", "microsoft-ai"],
  },

  perplexity: {
    name: "Perplexity",
    logoLetter: "P",
    tagline: "A conversational answer engine that cites its sources.",
    location: "San Francisco, California, USA",
    founded: 2022,
    website: "perplexity.ai",
    momentumScore: 88,
    quickStats: { models: 2, signals: 63, papers: 20, employees: "~450" },
    overview:
      "Perplexity builds a conversational search engine that answers queries directly, citing sources rather than returning a list of links. Its mission is to replace the traditional ten-blue-links search experience with a trustworthy, cited answer layer. Current focus is deepening financial and shopping verticals while expanding its publisher revenue-share program. Its key strengths are answer trustworthiness through citations and a rapidly growing consumer base pulling share from traditional search, though it remains dependent on underlying foundation models it does not fully own.",
    latestSignals: [
      {
        headline: "Sonar 2 search model improves citation precision by double digits",
        impactScore: 79,
        trendScore: 75,
        summary: "The updated retrieval-augmented model reduces citation mismatches in complex multi-source queries.",
        whyItMatters: "Directly targets Perplexity's core trust differentiator against general chatbots.",
        timestamp: "1 day ago",
      },
      {
        headline: "Perplexity Finance expands to real-time earnings call summaries",
        impactScore: 70,
        trendScore: 68,
        summary: "New feature auto-summarizes earnings calls minutes after they conclude.",
        whyItMatters: "Pushes Perplexity into a high-value vertical dominated by Bloomberg terminals.",
        timestamp: "3 days ago",
      },
      {
        headline: "Publisher revenue-share program adds 40 new outlets",
        impactScore: 62,
        trendScore: 58,
        summary: "More publishers join Perplexity's program compensating them when their content is cited.",
        whyItMatters: "Addresses ongoing publisher friction that has dogged AI search products industry-wide.",
        timestamp: "5 days ago",
      },
    ],
    models: [
      { name: "Sonar 2 Search Model" },
      { name: "Sonar Medium" },
    ],
    research: [
      {
        title: "Evaluating Citation Accuracy in LLM Search Queries",
        summary: "Proposes a benchmark for measuring how faithfully AI search answers cite source material.",
        citations: "140 citations",
        date: "Jan 2024",
      },
      {
        title: "Low-Latency Web Retrieval Pipelines for Conversational Search",
        summary: "Describes infrastructure for sub-second retrieval across live web indexes.",
        citations: "85 citations",
        date: "Jun 2024",
      },
    ],
    productEcosystem: ["Perplexity Search", "Pro Search", "Perplexity Finance", "Publisher Program", "Comet Browser"],
    timeline: [
      { date: "2022", event: "Founded by researchers from OpenAI and UC Berkeley." },
      { date: "2023", event: "Core cited-answer search product launches publicly." },
      { date: "2024", event: "Publisher revenue-share program launches alongside a $9B valuation round." },
      { date: "2026", event: "Sonar 2 ships with materially improved citation precision." },
    ],
    competitors: ["openai", "google-deepmind", "xai"],
    aiInsight: {
      paragraph:
        "Perplexity is running a direct wedge strategy against Google Search by making citation trust, not answer speed, its core differentiator. This matters most in high-stakes verticals like finance, where being wrong is costly and being able to check the source is the actual product.",
      whyItMatters: "Trust-first positioning is a viable wedge into search even without owning a frontier foundation model.",
      confidence: 76,
      keyTakeaways: [
        "Sonar 2's citation precision gains reinforce Perplexity's core trust differentiator.",
        "Perplexity Finance is a credible early wedge into Bloomberg-style professional verticals.",
        "Publisher revenue-share reduces a major source of industry friction with content owners.",
      ],
      recommendedFollowUp: "Track publisher program growth as a leading indicator of long-term content access risk.",
    },
    health: [
      { label: "AI Momentum", value: 88 },
      { label: "Research Activity", value: 58 },
      { label: "Hiring Momentum", value: 68 },
      { label: "Community Buzz", value: 82 },
      { label: "Enterprise Adoption", value: 55 },
      { label: "Open Source Activity", value: 15 },
      { label: "Overall Rating", value: 74 },
    ],
    aiDna: [
      { label: "LLMs", value: 30 },
      { label: "AI Agents", value: 25 },
      { label: "Coding AI", value: 5 },
      { label: "Vision", value: 10 },
      { label: "Audio", value: 5 },
      { label: "Robotics", value: 0 },
    ],
    strategicFocus: [
      { label: "Enterprise AI", value: 20 },
      { label: "Consumer AI", value: 55 },
      { label: "Developer APIs", value: 15 },
      { label: "Research", value: 10 },
    ],
    relatedLearning: ["Retrieval-Augmented Generation Basics", "How AI Search Engines Rank Sources", "Building Cited Answer Systems"],
    relatedCompanies: ["xai", "google-deepmind", "hugging-face"],
  },

  "microsoft-ai": {
    name: "Microsoft AI",
    logoLetter: "M",
    tagline: "Bringing agentic copilots to every Microsoft product surface.",
    location: "Redmond, Washington, USA",
    founded: 2023,
    website: "microsoft.com/ai",
    momentumScore: 90,
    quickStats: { models: 3, signals: 88, papers: 65, employees: "~1,800" },
    overview:
      "Microsoft AI drives the company's AI strategy across Copilot, Azure AI, and Windows, combining its own research with a deep commercial partnership and equity stake in OpenAI. Its mission is to embed agentic assistance into every layer of the productivity stack, from Word and Excel to GitHub and Windows itself. Current focus is on Copilot Actions, letting agents complete multi-app tasks autonomously across the Microsoft 365 suite. Its key strengths are unmatched enterprise distribution through Microsoft 365 and Azure, and the largest exclusive access to OpenAI's frontier models of any company, though it must balance its own research identity against dependence on that partnership.",
    latestSignals: [
      {
        headline: "Copilot Actions now completes cross-app workflows autonomously",
        impactScore: 87,
        trendScore: 83,
        summary: "Copilot can now execute tasks spanning Outlook, Excel, and Teams without manual handoffs.",
        whyItMatters: "Extends Microsoft's agentic reach across its entire productivity suite in a way no competitor can match.",
        timestamp: "10 hours ago",
      },
      {
        headline: "Azure AI Foundry adds native multi-model orchestration",
        impactScore: 75,
        trendScore: 71,
        summary: "Enterprises can now route between OpenAI, Meta, and Mistral models in a single Azure pipeline.",
        whyItMatters: "Positions Azure as the neutral enterprise AI marketplace rather than a single-model bet.",
        timestamp: "3 days ago",
      },
      {
        headline: "GitHub Copilot workspace adds full repository-level agent mode",
        impactScore: 70,
        trendScore: 76,
        summary: "Copilot can now reason across an entire repository rather than single files.",
        whyItMatters: "Directly challenges Cursor's core value proposition inside the dominant developer platform.",
        timestamp: "5 days ago",
      },
    ],
    models: [
      { name: "Copilot Actions Agent Suite" },
      { name: "Phi Small Language Models" },
      { name: "MAI Voice Models" },
    ],
    research: [
      {
        title: "Phi-3 Technical Report: Highly Capable Small Language Models",
        summary: "Shows small models trained on curated data can match much larger models on reasoning tasks.",
        citations: "1,100 citations",
        date: "Apr 2024",
      },
      {
        title: "Orchestrating Multi-Model Enterprise AI Pipelines",
        summary: "Describes routing and fallback strategies for enterprises using multiple foundation model vendors.",
        citations: "210 citations",
        date: "Feb 2025",
      },
    ],
    productEcosystem: ["Microsoft 365 Copilot", "GitHub Copilot", "Azure AI Foundry", "Windows Copilot", "Copilot Actions"],
    timeline: [
      { date: "2019", event: "Initial $1B investment in OpenAI begins the strategic partnership." },
      { date: "2023", event: "Microsoft 365 Copilot launches across Word, Excel, and Teams." },
      { date: "2024", event: "GitHub Copilot Workspace adds agentic multi-file editing." },
      { date: "2026", event: "Copilot Actions enables autonomous cross-app task completion." },
    ],
    competitors: ["google-deepmind", "openai", "cursor"],
    aiInsight: {
      paragraph:
        "Microsoft's strategy is distribution arbitrage: rather than racing to build the single best frontier model, it multi-sources models through Azure AI Foundry while embedding agentic copilots into the software billions of knowledge workers already use daily, capturing value at the application layer regardless of which model underneath wins.",
      whyItMatters: "Owning the application layer where AI gets consumed can be more valuable than owning the model layer itself.",
      confidence: 84,
      keyTakeaways: [
        "Copilot Actions gives Microsoft the broadest cross-application agent reach of any company.",
        "Azure AI Foundry's multi-model routing hedges Microsoft's dependence on any single AI lab.",
        "GitHub Copilot's repository-level agent mode directly challenges Cursor's core differentiator.",
      ],
      recommendedFollowUp: "Watch Microsoft's OpenAI equity terms as OpenAI's own product ambitions expand into Microsoft's territory.",
    },
    health: [
      { label: "AI Momentum", value: 90 },
      { label: "Research Activity", value: 72 },
      { label: "Hiring Momentum", value: 70 },
      { label: "Community Buzz", value: 72 },
      { label: "Enterprise Adoption", value: 96 },
      { label: "Open Source Activity", value: 40 },
      { label: "Overall Rating", value: 84 },
    ],
    aiDna: [
      { label: "LLMs", value: 25 },
      { label: "AI Agents", value: 35 },
      { label: "Coding AI", value: 22 },
      { label: "Vision", value: 8 },
      { label: "Audio", value: 8 },
      { label: "Robotics", value: 2 },
    ],
    strategicFocus: [
      { label: "Enterprise AI", value: 58 },
      { label: "Consumer AI", value: 12 },
      { label: "Developer APIs", value: 22 },
      { label: "Research", value: 8 },
    ],
    relatedLearning: ["Enterprise Copilots 101", "Multi-Model Orchestration Patterns", "Small Language Models Explained"],
    relatedCompanies: ["openai", "google-deepmind", "cursor"],
  },

  xai: {
    name: "xAI",
    logoLetter: "X",
    tagline: "Building maximally truth-seeking AI to understand the universe.",
    location: "San Francisco, California, USA",
    founded: 2023,
    website: "x.ai",
    momentumScore: 89,
    quickStats: { models: 5, signals: 79, papers: 18, employees: "~900" },
    overview:
      "xAI's stated mission is to build AI that pursues truth and understanding, with a stated aim of accelerating human scientific discovery. Its Grok model family is tightly integrated into X (formerly Twitter), giving it uniquely fresh real-time data access no other lab has by default. Current focus is scaling training compute at its Colossus supercomputer cluster and expanding Grok's reasoning capability. Its key strengths are real-time data access through X and Elon Musk's ability to raise capital and compute at unusual speed, though it has a shorter research track record than its rivals and a smaller enterprise footprint.",
    latestSignals: [
      {
        headline: "Grok 5 launches with real-time X data grounding by default",
        impactScore: 82,
        trendScore: 88,
        summary: "Grok 5 answers are grounded in live X posts and trends without needing a separate search step.",
        whyItMatters: "Gives xAI a data-freshness advantage that closed-off labs cannot easily replicate.",
        timestamp: "7 hours ago",
      },
      {
        headline: "Colossus supercomputer cluster doubles in GPU count",
        impactScore: 80,
        trendScore: 79,
        summary: "The Memphis training cluster expands to support significantly larger pretraining runs.",
        whyItMatters: "Signals xAI can now compete on raw compute scale with the largest US labs.",
        timestamp: "2 days ago",
      },
      {
        headline: "xAI closes $12B funding round at elevated valuation",
        impactScore: 77,
        trendScore: 74,
        summary: "New capital funds further compute buildout and aggressive researcher hiring.",
        whyItMatters: "Cements xAI's ability to compete for scarce compute and research talent against better-funded rivals.",
        timestamp: "6 days ago",
      },
    ],
    models: [
      { name: "Grok 5" },
      { name: "Grok 4" },
      { name: "Grok Vision" },
      { name: "Grok Voice Mode" },
    ],
    research: [
      {
        title: "Grounding Language Models in Real-Time Social Data",
        summary: "Describes techniques for incorporating live social media signals into model responses.",
        citations: "70 citations",
        date: "Mar 2025",
      },
      {
        title: "Scaling Pretraining Across Distributed GPU Clusters",
        summary: "Documents infrastructure choices behind the Colossus training supercomputer.",
        citations: "55 citations",
        date: "Sep 2024",
      },
    ],
    productEcosystem: ["Grok App", "Grok on X", "Grok API", "Colossus Compute Cluster"],
    timeline: [
      { date: "2023", event: "xAI founded with a mission focused on truth-seeking AI." },
      { date: "2023", event: "Grok launches exclusively to X Premium subscribers." },
      { date: "2024", event: "Colossus supercomputer cluster comes online in Memphis." },
      { date: "2026", event: "Grok 5 ships with default real-time X data grounding." },
    ],
    competitors: ["openai", "perplexity", "google-deepmind"],
    aiInsight: {
      paragraph:
        "xAI's structural advantage is data, not algorithms: default access to X's real-time firehose gives Grok a freshness edge that labs without a social platform cannot match without expensive licensing deals. Its rapid capital raises suggest it is racing to convert that data advantage into raw compute scale before the freshness edge becomes commoditized.",
      whyItMatters: "A proprietary, continuously refreshed data source can be as strategically valuable as compute scale.",
      confidence: 74,
      keyTakeaways: [
        "Default real-time X grounding is a genuine, hard-to-replicate data advantage.",
        "Colossus's rapid scale-up signals xAI is racing to compute parity with top US labs.",
        "The $12B raise buys runway to compete for scarce research talent and GPU supply.",
      ],
      recommendedFollowUp: "Track whether xAI converts its data advantage into enterprise or developer API adoption, not just consumer reach.",
    },
    health: [
      { label: "AI Momentum", value: 89 },
      { label: "Research Activity", value: 58 },
      { label: "Hiring Momentum", value: 85 },
      { label: "Community Buzz", value: 86 },
      { label: "Enterprise Adoption", value: 42 },
      { label: "Open Source Activity", value: 25 },
      { label: "Overall Rating", value: 74 },
    ],
    aiDna: [
      { label: "LLMs", value: 50 },
      { label: "AI Agents", value: 15 },
      { label: "Coding AI", value: 10 },
      { label: "Vision", value: 15 },
      { label: "Audio", value: 8 },
      { label: "Robotics", value: 2 },
    ],
    strategicFocus: [
      { label: "Enterprise AI", value: 15 },
      { label: "Consumer AI", value: 55 },
      { label: "Developer APIs", value: 20 },
      { label: "Research", value: 10 },
    ],
    relatedLearning: ["Real-Time Data Grounding for LLMs", "Understanding Large-Scale GPU Training", "AI Truthfulness & Bias"],
    relatedCompanies: ["perplexity", "openai", "deepseek"],
  },

  deepseek: {
    name: "DeepSeek",
    logoLetter: "D",
    tagline: "Open, efficiently-trained frontier models at a fraction of the cost.",
    location: "Hangzhou, China",
    founded: 2023,
    website: "deepseek.com",
    momentumScore: 86,
    quickStats: { models: 4, signals: 66, papers: 30, employees: "~200" },
    overview:
      "DeepSeek, backed by quantitative fund High-Flyer Capital, builds open-weight frontier models with a research focus on training efficiency rather than sheer compute spend. Its mission is to prove that near-frontier capability does not require the massive training budgets of the largest US labs. Current focus is refining mixture-of-experts architectures and reinforcement-learning-based reasoning training to squeeze more capability out of fewer GPU-hours. Its key strengths are exceptional cost-per-capability efficiency and a fully open-weights release model that has made it a favorite among researchers and cost-conscious enterprises, though it faces geopolitical scrutiny around data handling and export controls.",
    latestSignals: [
      {
        headline: "DeepSeek V4 matches frontier coding benchmarks at a fraction of training cost",
        impactScore: 88,
        trendScore: 93,
        summary: "Independent evaluations show DeepSeek V4 competitive with top closed models on coding tasks.",
        whyItMatters: "Challenges the assumption that frontier capability requires the largest compute budgets.",
        timestamp: "9 hours ago",
      },
      {
        headline: "New reinforcement-learning reasoning recipe published in full detail",
        impactScore: 76,
        trendScore: 81,
        summary: "DeepSeek open-sources its full reasoning-training methodology, unusual among frontier labs.",
        whyItMatters: "Accelerates the entire open-source ecosystem's reasoning-model capability.",
        timestamp: "2 days ago",
      },
      {
        headline: "Enterprise self-hosting adoption grows amid cost-cutting push",
        impactScore: 65,
        trendScore: 70,
        summary: "Cost-sensitive enterprises increasingly self-host DeepSeek models instead of paying API fees.",
        whyItMatters: "Puts pricing pressure on both US closed labs and other open-weights providers.",
        timestamp: "5 days ago",
      },
    ],
    models: [
      { name: "DeepSeek V4" },
      { name: "DeepSeek Coder V3" },
      { name: "DeepSeek R2 Reasoning" },
      { name: "DeepSeek VL" },
    ],
    research: [
      {
        title: "DeepSeek-V3 Technical Report: Efficient Mixture-of-Experts at Scale",
        summary: "Details training techniques achieving frontier-adjacent capability at a fraction of typical compute cost.",
        citations: "980 citations",
        date: "Dec 2024",
      },
      {
        title: "Reinforcement Learning for Reasoning Without Human Feedback",
        summary: "Presents a reasoning-training pipeline that reduces reliance on costly human-labeled data.",
        citations: "610 citations",
        date: "Jan 2025",
      },
    ],
    productEcosystem: ["DeepSeek Chat", "DeepSeek API", "DeepSeek Coder", "Open Weights Releases"],
    timeline: [
      { date: "2023", event: "Founded as a research offshoot of quantitative fund High-Flyer Capital." },
      { date: "2024", event: "DeepSeek-V3 release proves efficient training can approach frontier capability." },
      { date: "2025", event: "Reasoning model release triggers global attention on training efficiency." },
      { date: "2026", event: "DeepSeek V4 matches frontier coding benchmarks at dramatically lower training cost." },
    ],
    competitors: ["meta-ai", "mistral", "hugging-face"],
    aiInsight: {
      paragraph:
        "DeepSeek's significance is not any single model release but the recurring proof point it provides: frontier-adjacent capability is achievable well below the compute budgets assumed necessary by US labs. Each release resets the market's expectations about the true cost floor of building competitive models, pressuring margins across the entire industry.",
      whyItMatters: "Efficient training breakthroughs can compress the cost advantage that compute-rich incumbents rely on.",
      confidence: 80,
      keyTakeaways: [
        "DeepSeek V4 matches frontier coding benchmarks at a fraction of typical training cost.",
        "Full publication of its RL reasoning recipe accelerates capability gains industry-wide.",
        "Enterprise self-hosting adoption is rising specifically as a cost-cutting measure.",
      ],
      recommendedFollowUp: "Track export control and data-governance developments that could affect DeepSeek's global enterprise adoption.",
    },
    health: [
      { label: "AI Momentum", value: 86 },
      { label: "Research Activity", value: 84 },
      { label: "Hiring Momentum", value: 66 },
      { label: "Community Buzz", value: 88 },
      { label: "Enterprise Adoption", value: 60 },
      { label: "Open Source Activity", value: 92 },
      { label: "Overall Rating", value: 79 },
    ],
    aiDna: [
      { label: "LLMs", value: 42 },
      { label: "AI Agents", value: 12 },
      { label: "Coding AI", value: 28 },
      { label: "Vision", value: 10 },
      { label: "Audio", value: 4 },
      { label: "Robotics", value: 4 },
    ],
    strategicFocus: [
      { label: "Enterprise AI", value: 25 },
      { label: "Consumer AI", value: 20 },
      { label: "Developer APIs", value: 25 },
      { label: "Research", value: 30 },
    ],
    relatedLearning: ["Efficient Training Techniques", "Reinforcement Learning for Reasoning Models", "Open Weights vs Closed Models"],
    relatedCompanies: ["hugging-face", "mistral", "meta-ai"],
  },

  cohere: {
    name: "Cohere",
    logoLetter: "C",
    tagline: "Enterprise-grade language models built for retrieval and security.",
    location: "Toronto, Canada",
    founded: 2019,
    website: "cohere.com",
    momentumScore: 78,
    quickStats: { models: 4, signals: 41, papers: 38, employees: "~500" },
    overview:
      "Cohere builds language and retrieval models specifically for enterprise deployment, prioritizing data privacy, on-premise options, and retrieval-augmented generation over consumer-facing products. Its mission is to make generative AI practical and trustworthy for regulated industries like finance, healthcare, and government. Current focus is deepening its Command model family's retrieval accuracy and expanding private-cloud deployment options. Its key strengths are enterprise security credentials and deployment flexibility across any cloud, though it lacks the consumer brand recognition and compute scale of frontier labs.",
    latestSignals: [
      {
        headline: "Command R3 improves retrieval-augmented accuracy on enterprise document sets",
        impactScore: 62,
        trendScore: 56,
        summary: "The updated model reduces hallucination rates on internal enterprise knowledge base queries.",
        whyItMatters: "Reinforces Cohere's position as a trusted option for regulated-industry document search.",
        timestamp: "2 days ago",
      },
      {
        headline: "New private-cloud deployment option ships for financial services",
        impactScore: 58,
        trendScore: 50,
        summary: "Cohere adds a fully air-gapped deployment mode targeting banks and insurers.",
        whyItMatters: "Addresses the strictest data-residency requirements in the most regulated industries.",
        timestamp: "5 days ago",
      },
    ],
    models: [
      { name: "Command R3" },
      { name: "Command R+" },
      { name: "Embed 4" },
      { name: "Rerank 3" },
    ],
    research: [
      {
        title: "Command R: Retrieval-Augmented Generation for Enterprise Scale",
        summary: "Describes architecture choices optimizing for retrieval accuracy over general chat performance.",
        citations: "310 citations",
        date: "Mar 2024",
      },
      {
        title: "Multilingual Embeddings for Cross-Lingual Enterprise Search",
        summary: "Presents an embedding model tuned for accurate retrieval across over 100 languages.",
        citations: "240 citations",
        date: "Nov 2023",
      },
    ],
    productEcosystem: ["Command Models", "Cohere North", "Embed", "Rerank", "Private Cloud Deployment"],
    timeline: [
      { date: "2019", event: "Founded by a former Google Brain researcher and co-authors of the Transformer paper." },
      { date: "2023", event: "Command model family launches, targeting enterprise retrieval use cases." },
      { date: "2024", event: "Cohere North agent platform launches for enterprise workflow automation." },
      { date: "2026", event: "Command R3 ships with improved retrieval accuracy for regulated industries." },
    ],
    competitors: ["mistral", "hugging-face", "microsoft-ai"],
    aiInsight: {
      paragraph:
        "Cohere has deliberately avoided the consumer AI race entirely, instead building a defensible niche around the specific technical requirements, retrieval accuracy, deployment flexibility, air-gapped hosting, that regulated enterprises actually need but frontier consumer labs rarely prioritize.",
      whyItMatters: "A narrow, technically deep enterprise niche can be more defensible than competing head-on for consumer mindshare.",
      confidence: 70,
      keyTakeaways: [
        "Command R3's retrieval accuracy gains target a specific enterprise pain point directly.",
        "Air-gapped private-cloud deployment addresses the strictest regulated-industry requirements.",
        "Cohere's lack of a consumer product is a deliberate focus choice, not a capability gap.",
      ],
      recommendedFollowUp: "Watch whether larger labs launch competing enterprise-only retrieval products that erode this niche.",
    },
    health: [
      { label: "AI Momentum", value: 78 },
      { label: "Research Activity", value: 56 },
      { label: "Hiring Momentum", value: 44 },
      { label: "Community Buzz", value: 50 },
      { label: "Enterprise Adoption", value: 74 },
      { label: "Open Source Activity", value: 30 },
      { label: "Overall Rating", value: 62 },
    ],
    aiDna: [
      { label: "LLMs", value: 40 },
      { label: "AI Agents", value: 15 },
      { label: "Coding AI", value: 5 },
      { label: "Vision", value: 5 },
      { label: "Audio", value: 0 },
      { label: "Robotics", value: 0 },
    ],
    strategicFocus: [
      { label: "Enterprise AI", value: 70 },
      { label: "Consumer AI", value: 2 },
      { label: "Developer APIs", value: 20 },
      { label: "Research", value: 8 },
    ],
    relatedLearning: ["Retrieval-Augmented Generation for Enterprise", "Embeddings & Reranking Explained", "AI Data Residency Basics"],
    relatedCompanies: ["mistral", "hugging-face", "microsoft-ai"],
  },

  "hugging-face": {
    name: "Hugging Face",
    logoLetter: "H",
    tagline: "The open platform where the AI community builds together.",
    location: "New York, USA / Paris, France",
    founded: 2016,
    website: "huggingface.co",
    momentumScore: 85,
    quickStats: { models: 3, signals: 70, papers: 55, employees: "~450" },
    overview:
      "Hugging Face operates the largest open hub for machine learning models, datasets, and tooling, effectively serving as the default distribution and discovery layer for open-source AI. Its mission is to democratize good machine learning by making state-of-the-art models accessible to everyone, not just well-resourced labs. Current focus is scaling its managed Inference Endpoints product so developers can deploy any open model without managing infrastructure themselves. Its key strengths are unmatched community trust and the largest neutral model catalog in the industry, though its direct revenue model is smaller than labs that own frontier proprietary models.",
    latestSignals: [
      {
        headline: "Inference Endpoints 2.0 cuts open-model deployment time to minutes",
        impactScore: 71,
        trendScore: 78,
        summary: "The updated managed hosting product streamlines deploying any hub model to production.",
        whyItMatters: "Lowers the operational barrier that previously made open models harder to deploy than closed APIs.",
        timestamp: "1 day ago",
      },
      {
        headline: "Model Hub surpasses 2 million public models and datasets",
        impactScore: 68,
        trendScore: 72,
        summary: "Community contributions continue accelerating across every model category and modality.",
        whyItMatters: "Reinforces Hugging Face's position as the default discovery layer for open AI, regardless of which lab wins the capability race.",
        timestamp: "4 days ago",
      },
      {
        headline: "New evaluation leaderboard standardizes open-model benchmarking",
        impactScore: 60,
        trendScore: 64,
        summary: "A unified leaderboard reduces inconsistent, self-reported benchmark claims across releases.",
        whyItMatters: "Gives enterprises and researchers a trusted, neutral reference point when comparing open models.",
        timestamp: "6 days ago",
      },
    ],
    models: [
      { name: "Inference Endpoints 2.0" },
      { name: "SmolLM" },
      { name: "StarCoder2" },
    ],
    research: [
      {
        title: "The Hugging Face Model Hub: Infrastructure for Open Machine Learning",
        summary: "Describes the architecture behind hosting and versioning millions of public models and datasets.",
        citations: "420 citations",
        date: "Jun 2023",
      },
      {
        title: "StarCoder2: Open Code Models Trained on Permissively Licensed Data",
        summary: "Documents a fully open code-generation model trained exclusively on permissively licensed source.",
        citations: "260 citations",
        date: "Feb 2024",
      },
    ],
    productEcosystem: ["Model Hub", "Datasets Hub", "Inference Endpoints", "Spaces", "Transformers Library"],
    timeline: [
      { date: "2016", event: "Founded initially as a consumer chatbot app before pivoting to open ML tooling." },
      { date: "2018", event: "Transformers library launches, becoming the standard for NLP model access." },
      { date: "2022", event: "Model Hub crosses 100,000 public models amid the open-source LLM boom." },
      { date: "2026", event: "Model Hub surpasses 2 million public models and datasets." },
    ],
    competitors: ["meta-ai", "mistral", "deepseek"],
    aiInsight: {
      paragraph:
        "Hugging Face's strategic position is unusual: it does not need to win the frontier model race at all, it profits from being the neutral ground where every other lab's open releases get distributed, discovered, and deployed, making it structurally aligned with the entire open-source ecosystem's success rather than any single model's win.",
      whyItMatters: "A neutral infrastructure layer can capture durable value even without competing directly on model capability.",
      confidence: 82,
      keyTakeaways: [
        "Inference Endpoints 2.0 materially lowers the operational barrier to deploying open models.",
        "2 million hosted models cements Hugging Face as the default open-AI discovery layer.",
        "Standardized leaderboards give Hugging Face outsized influence over how open models get compared.",
      ],
      recommendedFollowUp: "Watch whether major labs build competing first-party hosting hubs that bypass Hugging Face's distribution role.",
    },
    health: [
      { label: "AI Momentum", value: 85 },
      { label: "Research Activity", value: 74 },
      { label: "Hiring Momentum", value: 62 },
      { label: "Community Buzz", value: 90 },
      { label: "Enterprise Adoption", value: 66 },
      { label: "Open Source Activity", value: 98 },
      { label: "Overall Rating", value: 80 },
    ],
    aiDna: [
      { label: "LLMs", value: 40 },
      { label: "AI Agents", value: 10 },
      { label: "Coding AI", value: 20 },
      { label: "Vision", value: 18 },
      { label: "Audio", value: 8 },
      { label: "Robotics", value: 4 },
    ],
    strategicFocus: [
      { label: "Enterprise AI", value: 25 },
      { label: "Consumer AI", value: 5 },
      { label: "Developer APIs", value: 55 },
      { label: "Research", value: 15 },
    ],
    relatedLearning: ["Open Source ML Tooling", "Deploying Models with Inference Endpoints", "Benchmarking Open Models"],
    relatedCompanies: ["deepseek", "meta-ai", "mistral"],
  },
};

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

function MeterBar({ value, colorClass = "bg-accent" }: { value: number; colorClass?: string }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWidth(value);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-[1100ms] ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function CompanyLogo({ letter }: { letter: string }) {
  return (
    <div className="w-16 h-16 shrink-0 rounded-3xl bg-gradient-to-br from-accent/25 to-tealAccent/15 border border-white/[0.08] flex items-center justify-center font-display font-extrabold text-white text-2xl">
      {letter}
    </div>
  );
}

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function CompanyDetailPage() {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  const companyKey = String(slug || "").toLowerCase();
  const company = COMPANY_DATABASE[companyKey];

  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => reveal.observe(el));
    return () => reveal.disconnect();
  }, [companyKey]);

  if (!company) {
    return (
      <div className="min-h-screen bg-ink text-textPrimary relative flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold mb-4">Company Profile Not Found</h1>
          <p className="text-textSecondary mb-6">The requested index target could not be verified.</p>
          <Link href="/companies" className="px-6 py-2.5 bg-accent rounded-xl text-xs font-bold text-white">
            Return to Companies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">

        {/* Header Back Link */}
        <Link href="/companies" className="text-xs text-textSecondary hover:text-accent font-bold flex items-center gap-1">
          &larr; Back to Companies Intelligence
        </Link>

        {/* Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.05]" data-animate>
          <div className="flex items-center gap-5">
            <CompanyLogo letter={company.logoLetter} />
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">{company.name}</h1>
              <p className="text-sm text-textSecondary mt-1.5 max-w-md">{company.tagline}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[11px] text-zinc-500 font-semibold">
                <span>{company.location}</span>
                <span>Founded {company.founded}</span>
                <span className="text-accent">{company.website}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="flex gap-2">
              <button className="px-3.5 py-1.5 rounded-xl border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white hover:border-accent/30 transition-all">
                Follow
              </button>
              <button className="px-3.5 py-1.5 rounded-xl border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white hover:border-accent/30 transition-all">
                Share
              </button>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-textSecondary uppercase tracking-wider font-bold block">AI Momentum Score</span>
              <span className="text-2xl font-display font-extrabold text-goldAccent">
                <AnimatedNumber value={company.momentumScore} />/100
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div data-animate className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Models", value: company.quickStats.models },
            { label: "Signals", value: company.quickStats.signals },
            { label: "Research Papers", value: company.quickStats.papers },
          ].map((stat) => (
            <div key={stat.label} className="bg-panel border border-white/[0.05] rounded-2xl p-5 text-center">
              <p className="text-2xl font-display font-extrabold text-white">
                <AnimatedNumber value={stat.value} />
              </p>
              <p className="text-[10px] text-textSecondary uppercase tracking-wider font-bold mt-1">{stat.label}</p>
            </div>
          ))}
          <div className="bg-panel border border-white/[0.05] rounded-2xl p-5 text-center">
            <p className="text-2xl font-display font-extrabold text-white">{company.quickStats.employees}</p>
            <p className="text-[10px] text-textSecondary uppercase tracking-wider font-bold mt-1">Employees</p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Main Info Columns */}
          <div className="md:col-span-2 flex flex-col gap-8">

            {/* Company Overview */}
            <div data-animate className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-3">Company Overview</h3>
              <p className="text-sm text-textSecondary leading-relaxed font-normal">{company.overview}</p>
            </div>

            {/* Latest Signals */}
            <div data-animate className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Latest Signals</h3>
              <div className="flex flex-col gap-4">
                {company.latestSignals.map((sig, idx) => (
                  <div key={idx} className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-white leading-snug">{sig.headline}</p>
                      <span className="text-[9px] text-zinc-500 font-semibold shrink-0 whitespace-nowrap mt-0.5">{sig.timestamp}</span>
                    </div>
                    <p className="text-xs text-textSecondary leading-relaxed">{sig.summary}</p>
                    <p className="text-xs text-zinc-300 leading-relaxed"><span className="font-bold text-tealAccent">Why it matters:</span> {sig.whyItMatters}</p>
                    <div className="flex gap-4 mt-1 text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-accent">Impact {sig.impactScore}</span>
                      <span className="text-goldAccent">Trend {sig.trendScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Release Timeline */}
            <div data-animate className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-6">Interactive Release Timeline</h3>
              <div className="relative border-l border-white/[0.08] ml-2 pl-6 flex flex-col gap-6">
                {company.timeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <span className="absolute -left-9 top-1 w-2.5 h-2.5 rounded-full bg-accent border border-ink group-hover:scale-125 transition-transform"></span>
                    <strong className="text-xs text-accent block">{step.date}</strong>
                    <p className="text-xs text-textSecondary mt-0.5 leading-relaxed">{step.event}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Research Section */}
            <div data-animate className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Research</h3>
              <div className="flex flex-col gap-4">
                {company.research.map((paper, idx) => (
                  <div key={idx} className="pb-4 border-b border-white/[0.04] last:border-0 last:pb-0">
                    <span className="font-bold text-white block leading-snug text-sm">{paper.title}</span>
                    <p className="text-xs text-textSecondary mt-1.5 leading-relaxed">{paper.summary}</p>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-[10px] text-zinc-500 font-semibold">{paper.citations} &middot; {paper.date}</span>
                      <Link href="/research" className="text-[10px] text-accent font-bold hover:underline">Read Paper &rarr;</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div data-animate className="bg-gradient-to-br from-accent/10 to-tealAccent/5 border border-accent/20 p-6 rounded-3xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent">AI Insight &middot; Novique Exclusive</h3>
                <span className="text-[10px] font-extrabold text-tealAccent bg-tealAccent/10 border border-tealAccent/20 px-2.5 py-0.5 rounded-full">
                  {company.aiInsight.confidence}% Confidence
                </span>
              </div>
              <p className="text-sm text-textSecondary leading-relaxed">{company.aiInsight.paragraph}</p>
              <p className="text-xs text-zinc-300 leading-relaxed"><span className="font-bold text-white">Why it matters:</span> {company.aiInsight.whyItMatters}</p>
              <div>
                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-2">Key Takeaways</span>
                <ul className="flex flex-col gap-1.5">
                  {company.aiInsight.keyTakeaways.map((kt, idx) => (
                    <li key={idx} className="text-xs text-textSecondary leading-relaxed flex gap-2">
                      <span className="text-accent shrink-0">&bull;</span>
                      <span>{kt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-3 border-t border-white/[0.06]">
                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Recommended Follow-up</span>
                <p className="text-xs text-zinc-300 leading-relaxed">{company.aiInsight.recommendedFollowUp}</p>
              </div>
            </div>

          </div>

          {/* Sidebar Columns */}
          <div className="flex flex-col gap-6">

            {/* Models */}
            <div data-animate className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Models</h3>
              <div className="flex flex-wrap gap-2">
                {company.models.map((mod) => {
                  const derivedSlug = mod.slug ?? slugify(mod.name);
                  const hasSlug = KNOWN_MODEL_SLUGS.has(derivedSlug);
                  return (
                    <Link
                      key={mod.name}
                      href={hasSlug ? `/models/${derivedSlug}` : "/models"}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-accent hover:text-white bg-white/[0.02] transition-all"
                    >
                      {mod.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Product Ecosystem */}
            <div data-animate className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Product Ecosystem</h3>
              <div className="flex flex-wrap gap-2">
                {company.productEcosystem.map((prod) => (
                  <span key={prod} className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-zinc-300">
                    {prod}
                  </span>
                ))}
              </div>
            </div>

            {/* Competitors */}
            <div data-animate className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Competitors</h3>
              <div className="flex flex-col gap-2">
                {company.competitors.map((slug) => {
                  const comp = COMPANY_DATABASE[slug];
                  if (!comp) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/companies/${slug}`}
                      className="text-xs font-semibold p-2.5 rounded-xl border border-white/[0.06] hover:border-tealAccent bg-white/[0.02] transition-all flex items-center justify-between"
                    >
                      <span>{comp.name}</span>
                      <span className="text-[9px] text-[#9AA8BD]">&rarr;</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Company Health Dashboard */}
            <div data-animate className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Company Health Dashboard</h3>
              <div className="flex flex-col gap-3.5">
                {company.health.map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-zinc-400">{m.label}</span>
                      <span className="text-white"><AnimatedNumber value={m.value} /></span>
                    </div>
                    <MeterBar value={m.value} colorClass={m.label === "Overall Rating" ? "bg-goldAccent" : "bg-accent"} />
                  </div>
                ))}
              </div>
            </div>

            {/* AI DNA */}
            <div data-animate className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-1">AI DNA &middot; Novique Exclusive</h3>
              <p className="text-[11px] text-textSecondary mb-4">Technology focus split across the company&apos;s model portfolio.</p>
              <div className="flex flex-col gap-3.5">
                {company.aiDna.map((d) => (
                  <div key={d.label}>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-zinc-400">{d.label}</span>
                      <span className="text-white">{d.value}%</span>
                    </div>
                    <MeterBar value={d.value} colorClass="bg-tealAccent" />
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Focus */}
            <div data-animate className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Strategic Focus</h3>
              <div className="flex flex-col gap-3.5">
                {company.strategicFocus.map((d) => (
                  <div key={d.label}>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-zinc-400">{d.label}</span>
                      <span className="text-white">{d.value}%</span>
                    </div>
                    <MeterBar value={d.value} colorClass="bg-goldAccent" />
                  </div>
                ))}
              </div>
            </div>

            {/* Related Learning */}
            <div data-animate className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Related Learning</h3>
              <div className="flex flex-wrap gap-2">
                {company.relatedLearning.map((topic) => (
                  <Link
                    key={topic}
                    href="/learning"
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-accent hover:text-white bg-white/[0.02] transition-all"
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Companies */}
            <div data-animate className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Related Companies</h3>
              <div className="flex flex-col gap-2">
                {company.relatedCompanies.map((slug) => {
                  const rel = COMPANY_DATABASE[slug];
                  if (!rel) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/companies/${slug}`}
                      className="text-xs font-semibold p-2.5 rounded-xl border border-white/[0.06] hover:border-accent bg-white/[0.02] transition-all flex items-center justify-between"
                    >
                      <span>{rel.name}</span>
                      <span className="text-[9px] text-[#9AA8BD]">&rarr;</span>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
