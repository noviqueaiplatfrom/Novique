"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

interface ModelDNA {
  reasoning: number;
  coding: number;
  creativity: number;
  vision: number;
  math: number;
  agents: number;
  toolUse: number;
}

interface Personality {
  creativity: number;
  precision: number;
  reasoning: number;
  conversation: number;
  codingStyle: number;
  riskTaking: number;
  humor: number;
}

interface SupportedFeatures {
  text: boolean;
  images: boolean;
  audio: boolean;
  video: boolean;
  pdfs: boolean;
  functionCalling: boolean;
  mcp: boolean;
  toolUse: boolean;
  webSearch: boolean;
  streaming: boolean;
  fineTuning: boolean;
  jsonMode: boolean;
  vision: boolean;
}

interface PricingDetail {
  freePlan: string;
  apiCost: string;
  subscription: string;
  enterprise: string;
}

interface BenchmarkStars {
  coding: number;
  math: number;
  reasoning: number;
  writing: number;
  vision: number;
  speed: number;
  accuracy: number;
}

interface EvolutionStep {
  label: string;
  date: string;
  note: string;
  current?: boolean;
}

interface Alternative {
  slug: string;
  name: string;
  reason: string;
}

interface SuitabilityScore {
  label: string;
  score: number;
}

interface ModelHealth {
  releaseFrequency: string;
  improvementVelocity: string;
  communityAdoption: string;
  enterpriseAdoption: string;
  ecosystemGrowth: string;
  apiStability: string;
  documentationQuality: string;
}

interface ModelDetail {
  slug: string;
  name: string;
  maker: string;
  version: string;
  family: string;
  releaseDate: string;
  license: "Open Source" | "Commercial";
  apiAvailable: boolean;
  contextWindow: string;
  contextWindowTokens: number;
  inputTypes: string;
  outputTypes: string;
  latency: string;
  pricing: string;
  latestUpdate: string;
  communityRating: number;
  aiScore: number;
  logoLetter: string;
  logoColor: "accent" | "teal" | "gold";
  capabilities: string;
  benchmarks: { name: string; score: string }[];
  updates: string[];
  timeline: { date: string; update: string }[];
  papers: string[];
  dna: ModelDNA;
  bestForTags: string[];
  limitations: string[];
  personality: Personality;
  features: SupportedFeatures;
  pricingDetail: PricingDetail;
  benchmarkStars: BenchmarkStars;
  useCases: string[];
  evolutionChain: EvolutionStep[];
  adoption: string[];
  integrations: string[];
  communitySentimentSummary: string;
  overallSentiment: number;
  alternatives: Alternative[];
  suitability: SuitabilityScore[];
  health: ModelHealth;
}

const LOGO_STYLES: Record<ModelDetail["logoColor"], string> = {
  accent: "bg-accent/10 border-accent/25 text-accent",
  teal: "bg-tealAccent/10 border-tealAccent/25 text-tealAccent",
  gold: "bg-goldAccent/10 border-goldAccent/25 text-goldAccent",
};

const MODEL_DATABASE: Record<string, ModelDetail> = {
  "claude-3-5-sonnet": {
    slug: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    maker: "Anthropic",
    version: "v3.5 Sonnet (June 2026)",
    family: "Claude 3 Family",
    releaseDate: "June 2024",
    license: "Commercial",
    apiAvailable: true,
    contextWindow: "200,000 tokens (~150,000 words)",
    contextWindowTokens: 200000,
    inputTypes: "Text, Images, PDFs",
    outputTypes: "Text, Code",
    latency: "Fast (~700ms to first token)",
    pricing: "$3.00 / million input, $15.00 / million output tokens",
    latestUpdate: "June 2026",
    communityRating: 4.8,
    aiScore: 95,
    logoLetter: "CL",
    logoColor: "accent",
    capabilities: "Leading logical reasoning, complex code generation, multi-step instruction execution, and detailed visual data parsing.",
    benchmarks: [
      { name: "GPQA (Graduate-Level Reasoning)", score: "59.4%" },
      { name: "MMLU (Undergraduate Knowledge)", score: "88.7%" },
      { name: "SWE-bench Verified (Software Coding)", score: "49.0%" }
    ],
    updates: [
      "Released Computer Use API integration (Beta)",
      "Improved instruction formatting compliance",
      "Accelerated latency processing speeds by 2x"
    ],
    timeline: [
      { date: "June 2024", update: "Claude 3.5 Sonnet released, establishing new benchmarks in reasoning." },
      { date: "October 2024", update: "Claude 3.5 Sonnet upgraded with computer-use API and agent capabilities." }
    ],
    papers: ["Scaling Monosemanticity in Claude 3", "Constitutional AI Alignment Guidelines"],
    dna: { reasoning: 94, coding: 96, creativity: 90, vision: 82, math: 88, agents: 91, toolUse: 93 },
    bestForTags: ["Software Development", "AI Agents", "Research", "Enterprise", "Automation"],
    limitations: [
      "No native audio or video generation capabilities.",
      "Smaller context window than long-document specialists like Gemini.",
      "Rate limits tighten quickly on the free tier during peak hours."
    ],
    personality: { creativity: 4, precision: 5, reasoning: 5, conversation: 4, codingStyle: 5, riskTaking: 2, humor: 3 },
    features: { text: true, images: true, audio: false, video: false, pdfs: true, functionCalling: true, mcp: true, toolUse: true, webSearch: true, streaming: true, fineTuning: false, jsonMode: true, vision: true },
    pricingDetail: {
      freePlan: "Limited daily messages on claude.ai",
      apiCost: "$3.00 / million input, $15.00 / million output tokens",
      subscription: "Pro at $20/month, Team at $30/user/month",
      enterprise: "Custom volume pricing with SSO and audit logs"
    },
    benchmarkStars: { coding: 5, math: 4, reasoning: 5, writing: 4, vision: 3, speed: 4, accuracy: 5 },
    useCases: ["Pair programming and code review", "Autonomous coding agents", "Long-document research synthesis", "Enterprise workflow automation"],
    evolutionChain: [
      { label: "Claude 3 Opus", date: "Mar 2024", note: "First Claude 3 family flagship, strong reasoning but slower." },
      { label: "Claude 3.5 Sonnet", date: "Jun 2024", note: "Matched Opus-level reasoning at Sonnet-tier speed and cost." },
      { label: "Claude 3.5 Sonnet (New)", date: "Oct 2024", note: "Added the Computer Use API and sharper coding accuracy.", current: true }
    ],
    adoption: ["Cursor", "GitHub Copilot Workspace", "Notion AI", "Vercel", "Zapier"],
    integrations: ["AWS Bedrock", "Google Vertex AI", "OpenRouter", "LangChain", "Vercel AI SDK"],
    communitySentimentSummary: "Developers consistently describe Claude 3.5 Sonnet as the most reliable coding partner in the market, with praise for its careful reasoning and low hallucination rate on multi-step tasks.",
    overallSentiment: 91,
    alternatives: [
      { slug: "gpt-4o", name: "GPT-4o", reason: "Choose it instead when you need native voice and video multimodal features." },
      { slug: "deepseek-v3", name: "DeepSeek V3", reason: "Choose it instead when budget is the top constraint and you can self-host." }
    ],
    suitability: [
      { label: "Software Developers", score: 97 },
      { label: "Researchers", score: 88 },
      { label: "Students", score: 74 },
      { label: "Founders", score: 85 },
      { label: "Content Creators", score: 70 },
      { label: "Data Analysts", score: 82 },
      { label: "Product Managers", score: 80 },
      { label: "Enterprise Teams", score: 90 }
    ],
    health: { releaseFrequency: "Steady", improvementVelocity: "Fast", communityAdoption: "Very Strong", enterpriseAdoption: "Strong", ecosystemGrowth: "Expanding", apiStability: "Stable", documentationQuality: "Excellent" }
  },
  "gpt-4o": {
    slug: "gpt-4o",
    name: "GPT-4o",
    maker: "OpenAI",
    version: "gpt-4o-2024-05-13",
    family: "GPT-4 Family",
    releaseDate: "May 2024",
    license: "Commercial",
    apiAvailable: true,
    contextWindow: "128,000 tokens",
    contextWindowTokens: 128000,
    inputTypes: "Text, Images, Audio, Video frames",
    outputTypes: "Text, Audio, Images",
    latency: "Very Fast (~320ms voice response)",
    pricing: "$2.50 / million input, $10.00 / million output tokens",
    latestUpdate: "May 2026",
    communityRating: 4.7,
    aiScore: 93,
    logoLetter: "4o",
    logoColor: "teal",
    capabilities: "Real-time multimodal synthesis across text, vision, and low-latency voice, enabling conversational streams.",
    benchmarks: [
      { name: "GPQA (Graduate-Level Reasoning)", score: "53.6%" },
      { name: "MMLU (Undergraduate Knowledge)", score: "88.7%" },
      { name: "Math Reasoning (MATH)", score: "76.6%" }
    ],
    updates: [
      "Realtime WebSocket Voice API released",
      "Sora Video generator prompt endpoints integrated",
      "Advanced SearchGPT search features made default"
    ],
    timeline: [
      { date: "May 2024", update: "GPT-4o announced with native multimodal capabilities." },
      { date: "October 2024", update: "Realtime API released to public beta, decreasing voice latency." }
    ],
    papers: ["GPT-4o Multimodal Capabilities Report", "Direct Preference Optimization in Conversation"],
    dna: { reasoning: 87, coding: 88, creativity: 92, vision: 95, math: 84, agents: 80, toolUse: 85 },
    bestForTags: ["Content Creation", "Automation", "Software Development", "Education"],
    limitations: [
      "Context window is smaller than long-context specialists like Gemini.",
      "Reasoning trails top dedicated reasoning models on graduate-level logic.",
      "Voice mode availability varies by region and platform tier."
    ],
    personality: { creativity: 5, precision: 4, reasoning: 4, conversation: 5, codingStyle: 4, riskTaking: 3, humor: 4 },
    features: { text: true, images: true, audio: true, video: true, pdfs: true, functionCalling: true, mcp: false, toolUse: true, webSearch: true, streaming: true, fineTuning: true, jsonMode: true, vision: true },
    pricingDetail: {
      freePlan: "Limited access via the ChatGPT Free tier",
      apiCost: "$2.50 / million input, $10.00 / million output tokens",
      subscription: "ChatGPT Plus at $20/month, Team at $25/user/month",
      enterprise: "Custom Enterprise agreement with data controls"
    },
    benchmarkStars: { coding: 4, math: 4, reasoning: 4, writing: 5, vision: 5, speed: 5, accuracy: 4 },
    useCases: ["Realtime voice assistants", "Multimodal customer support", "Creative writing and ideation", "Visual data interpretation"],
    evolutionChain: [
      { label: "GPT-4", date: "Mar 2023", note: "First GPT-4 launch, strong reasoning, text-only." },
      { label: "GPT-4 Turbo", date: "Nov 2023", note: "Larger context window and lower pricing." },
      { label: "GPT-4o", date: "May 2024", note: "Native multimodal with realtime voice and vision.", current: true }
    ],
    adoption: ["Duolingo", "Shopify", "Salesforce", "Snap", "Khan Academy"],
    integrations: ["Azure AI", "AWS Bedrock", "OpenRouter", "LangChain", "Vercel AI SDK"],
    communitySentimentSummary: "Consumers and builders alike highlight GPT-4o's natural voice conversation and broad platform reach as its biggest strengths, with some noting reasoning depth lags newer specialist models.",
    overallSentiment: 87,
    alternatives: [
      { slug: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", reason: "Choose it instead when coding accuracy matters more than voice features." },
      { slug: "gemini-1-5-pro", name: "Gemini 1.5 Pro", reason: "Choose it instead when you need a much larger context window." }
    ],
    suitability: [
      { label: "Software Developers", score: 84 },
      { label: "Researchers", score: 78 },
      { label: "Students", score: 88 },
      { label: "Founders", score: 89 },
      { label: "Content Creators", score: 94 },
      { label: "Data Analysts", score: 76 },
      { label: "Product Managers", score: 86 },
      { label: "Enterprise Teams", score: 85 }
    ],
    health: { releaseFrequency: "Frequent", improvementVelocity: "Fast", communityAdoption: "Very Strong", enterpriseAdoption: "Very Strong", ecosystemGrowth: "Expanding", apiStability: "Stable", documentationQuality: "Excellent" }
  },
  "llama-3-1-405b": {
    slug: "llama-3-1-405b",
    name: "Llama 3.1 405B",
    maker: "Meta AI",
    version: "Llama-3.1-405B-Instruct",
    family: "Llama 3 Family",
    releaseDate: "July 2024",
    license: "Open Source",
    apiAvailable: true,
    contextWindow: "128,000 tokens",
    contextWindowTokens: 128000,
    inputTypes: "Text",
    outputTypes: "Text, Code",
    latency: "Moderate (hardware-dependent)",
    pricing: "Free open-weights download ($0/token local inference)",
    latestUpdate: "November 2025",
    communityRating: 4.5,
    aiScore: 87,
    logoLetter: "L3",
    logoColor: "gold",
    capabilities: "Superb synthetic data generation pipeline backing, multilingual translations, deep safety fine-tuning parameters.",
    benchmarks: [
      { name: "GPQA (Graduate-Level Reasoning)", score: "51.1%" },
      { name: "MMLU (Undergraduate Knowledge)", score: "88.6%" },
      { name: "GSM8k (Math Reasoning)", score: "96.8%" }
    ],
    updates: [
      "Released quantizations to fit model on consumer hardware",
      "Improved tools agent-loop capabilities",
      "Optimized context attention window heads"
    ],
    timeline: [
      { date: "July 2024", update: "Llama 3.1 405B released as first competitive open model weights." },
      { date: "November 2024", update: "Meta released Llama 3.2 edge models extending multimodality." }
    ],
    papers: ["Llama 3.1 Model Architecture Specifications", "PEFT Training Methods with LoRA"],
    dna: { reasoning: 85, coding: 84, creativity: 80, vision: 40, math: 90, agents: 78, toolUse: 76 },
    bestForTags: ["Enterprise", "Data Analysis", "Automation", "Research"],
    limitations: [
      "No native vision or multimodal support out of the box.",
      "Requires significant GPU infrastructure to self-host at full precision.",
      "Falls behind proprietary frontier models on nuanced instruction following."
    ],
    personality: { creativity: 3, precision: 4, reasoning: 4, conversation: 3, codingStyle: 4, riskTaking: 3, humor: 2 },
    features: { text: true, images: false, audio: false, video: false, pdfs: false, functionCalling: true, mcp: false, toolUse: true, webSearch: false, streaming: true, fineTuning: true, jsonMode: true, vision: false },
    pricingDetail: {
      freePlan: "Free open-weights download",
      apiCost: "$0/token local inference, roughly $0.90/million via hosted providers",
      subscription: "None, self-hosted or pay-per-token via third parties",
      enterprise: "Enterprise support available through Meta partners"
    },
    benchmarkStars: { coding: 4, math: 5, reasoning: 4, writing: 3, vision: 1, speed: 3, accuracy: 4 },
    useCases: ["Self-hosted enterprise deployments", "Custom fine-tuned domain models", "Synthetic data generation", "Cost-sensitive batch processing"],
    evolutionChain: [
      { label: "Llama 2", date: "Jul 2023", note: "First widely adopted open-weight chat model." },
      { label: "Llama 3", date: "Apr 2024", note: "Major quality jump, released in 8B and 70B sizes." },
      { label: "Llama 3.1 405B", date: "Jul 2024", note: "First open-weight model competitive with proprietary frontier models.", current: true }
    ],
    adoption: ["Scale AI", "Groq", "Databricks", "Together AI"],
    integrations: ["AWS Bedrock", "Azure AI", "OpenRouter", "LangChain"],
    communitySentimentSummary: "The open-source community treats Llama 3.1 405B as the reference point for self-hosted deployments, praising its fine-tuning flexibility while noting the steep hardware requirements.",
    overallSentiment: 84,
    alternatives: [
      { slug: "deepseek-v3", name: "DeepSeek V3", reason: "Choose it instead for stronger reasoning at a lower inference cost." },
      { slug: "gemini-1-5-pro", name: "Gemini 1.5 Pro", reason: "Choose it instead when you need a managed API with native vision support." }
    ],
    suitability: [
      { label: "Software Developers", score: 82 },
      { label: "Researchers", score: 85 },
      { label: "Students", score: 65 },
      { label: "Founders", score: 72 },
      { label: "Content Creators", score: 58 },
      { label: "Data Analysts", score: 88 },
      { label: "Product Managers", score: 68 },
      { label: "Enterprise Teams", score: 91 }
    ],
    health: { releaseFrequency: "Moderate", improvementVelocity: "Moderate", communityAdoption: "Exponential", enterpriseAdoption: "Growing", ecosystemGrowth: "Expanding", apiStability: "Stable", documentationQuality: "Good" }
  },
  "gemini-1-5-pro": {
    slug: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    maker: "Google",
    version: "Gemini 1.5 Pro-002",
    family: "Gemini Family",
    releaseDate: "February 2024",
    license: "Commercial",
    apiAvailable: true,
    contextWindow: "2,000,000 tokens",
    contextWindowTokens: 2000000,
    inputTypes: "Text, Images, Audio, Video, Files",
    outputTypes: "Text, Code",
    latency: "Moderate (~900ms to first token on long context)",
    pricing: "$1.25 / million input, $5.00 / million output tokens",
    latestUpdate: "September 2025",
    communityRating: 4.6,
    aiScore: 90,
    logoLetter: "Ge",
    logoColor: "accent",
    capabilities: "Massive context window loading entire codebases, audio documents, or hours of video natively in a single query.",
    benchmarks: [
      { name: "GPQA (Graduate-Level Reasoning)", score: "54.0%" },
      { name: "MMLU (Undergraduate Knowledge)", score: "86.5%" },
      { name: "Needle In A Haystack Retrieval", score: "99.9%" }
    ],
    updates: [
      "Context caching API released, reducing token pricing by 50%",
      "Faster audio reasoning models integrated",
      "Integrated into Workspace sidebar defaults"
    ],
    timeline: [
      { date: "February 2024", update: "Gemini 1.5 Pro announced with 1-Million token context." },
      { date: "May 2024", update: "Google I/O doubled context window to 2-Million tokens." }
    ],
    papers: ["Gemini: A Family of Highly Capable Multimodal Models", "Context Caching for Autoregressive Generation"],
    dna: { reasoning: 86, coding: 82, creativity: 83, vision: 93, math: 85, agents: 74, toolUse: 79 },
    bestForTags: ["Research", "Data Analysis", "Enterprise", "Education"],
    limitations: [
      "Latency increases noticeably as context length approaches the 2M ceiling.",
      "Coding accuracy trails specialist coding models on hard benchmarks.",
      "Pricing at full context length can get expensive for high-volume use."
    ],
    personality: { creativity: 4, precision: 4, reasoning: 4, conversation: 4, codingStyle: 3, riskTaking: 2, humor: 3 },
    features: { text: true, images: true, audio: true, video: true, pdfs: true, functionCalling: true, mcp: false, toolUse: true, webSearch: true, streaming: true, fineTuning: true, jsonMode: true, vision: true },
    pricingDetail: {
      freePlan: "Free tier via Google AI Studio",
      apiCost: "$1.25 / million input, $5.00 / million output tokens",
      subscription: "Gemini Advanced at $19.99/month",
      enterprise: "Vertex AI enterprise pricing with committed-use discounts"
    },
    benchmarkStars: { coding: 3, math: 4, reasoning: 4, writing: 4, vision: 5, speed: 3, accuracy: 4 },
    useCases: ["Whole-codebase analysis", "Long video and audio transcription", "Multi-document legal or research review", "Enterprise knowledge search"],
    evolutionChain: [
      { label: "Gemini 1.0 Pro", date: "Dec 2023", note: "Initial Gemini launch across Ultra, Pro and Nano tiers." },
      { label: "Gemini 1.5 Pro", date: "Feb 2024", note: "Introduced a 1-million token context window." },
      { label: "Gemini 1.5 Pro-002", date: "May 2024", note: "Context window doubled to 2-million tokens.", current: true }
    ],
    adoption: ["Snap", "Deutsche Bank", "Wendy's", "Moody's"],
    integrations: ["Google Vertex AI", "OpenRouter", "LangChain", "Vercel AI SDK"],
    communitySentimentSummary: "Enterprises adopting Gemini 1.5 Pro point to its context window as a genuine differentiator, allowing entire codebases and document sets to be analyzed in a single pass.",
    overallSentiment: 86,
    alternatives: [
      { slug: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", reason: "Choose it instead for tighter coding accuracy at a smaller context size." },
      { slug: "gpt-4o", name: "GPT-4o", reason: "Choose it instead for faster, more natural realtime voice interaction." }
    ],
    suitability: [
      { label: "Software Developers", score: 78 },
      { label: "Researchers", score: 93 },
      { label: "Students", score: 80 },
      { label: "Founders", score: 76 },
      { label: "Content Creators", score: 72 },
      { label: "Data Analysts", score: 92 },
      { label: "Product Managers", score: 79 },
      { label: "Enterprise Teams", score: 88 }
    ],
    health: { releaseFrequency: "Steady", improvementVelocity: "Fast", communityAdoption: "Strong", enterpriseAdoption: "Strong", ecosystemGrowth: "Expanding", apiStability: "Stable", documentationQuality: "Good" }
  },
  "deepseek-v3": {
    slug: "deepseek-v3",
    name: "DeepSeek V3",
    maker: "DeepSeek AI",
    version: "DeepSeek-V3-0628",
    family: "DeepSeek Family",
    releaseDate: "December 2024",
    license: "Open Source",
    apiAvailable: true,
    contextWindow: "128,000 tokens",
    contextWindowTokens: 128000,
    inputTypes: "Text",
    outputTypes: "Text, Code",
    latency: "Very Fast",
    pricing: "$0.27 / million input, $1.10 / million output tokens",
    latestUpdate: "July 2026",
    communityRating: 4.6,
    aiScore: 89,
    logoLetter: "DS",
    logoColor: "teal",
    capabilities: "Mixture-of-experts open weights delivering frontier-level math and coding scores at a fraction of the typical inference cost.",
    benchmarks: [
      { name: "GPQA (Graduate-Level Reasoning)", score: "57.2%" },
      { name: "MMLU (Undergraduate Knowledge)", score: "87.1%" },
      { name: "SWE-bench Verified (Software Coding)", score: "45.8%" }
    ],
    updates: [
      "Refined tool-use loop for agentic workflows",
      "Reduced average inference latency by 30%",
      "Expanded hosted provider availability via OpenRouter"
    ],
    timeline: [
      { date: "May 2024", update: "DeepSeek V2 released, gaining wide attention as an efficient MoE model." },
      { date: "December 2024", update: "DeepSeek V3 released, matching frontier reasoning and coding scores." }
    ],
    papers: ["DeepSeek-V3 Technical Report", "Mixture-of-Experts Scaling Laws"],
    dna: { reasoning: 91, coding: 90, creativity: 78, vision: 20, math: 95, agents: 72, toolUse: 70 },
    bestForTags: ["Software Development", "Data Analysis", "Research", "Automation"],
    limitations: [
      "No native vision, audio, or video capabilities.",
      "Smaller ecosystem of managed integrations than the largest labs.",
      "Documentation and tooling lag behind more established providers."
    ],
    personality: { creativity: 3, precision: 5, reasoning: 5, conversation: 3, codingStyle: 4, riskTaking: 3, humor: 2 },
    features: { text: true, images: false, audio: false, video: false, pdfs: false, functionCalling: true, mcp: false, toolUse: true, webSearch: false, streaming: true, fineTuning: true, jsonMode: true, vision: false },
    pricingDetail: {
      freePlan: "Free open-weights download",
      apiCost: "$0.27 / million input, $1.10 / million output tokens",
      subscription: "None, self-hosted or pay-per-token via API",
      enterprise: "Custom hosting agreements via cloud partners"
    },
    benchmarkStars: { coding: 5, math: 5, reasoning: 5, writing: 3, vision: 1, speed: 5, accuracy: 5 },
    useCases: ["High-volume coding assistants", "Mathematical and scientific computing", "Cost-sensitive batch inference", "Self-hosted reasoning agents"],
    evolutionChain: [
      { label: "DeepSeek V2", date: "May 2024", note: "First mixture-of-experts release to gain wide attention." },
      { label: "DeepSeek V3", date: "Dec 2024", note: "Matched frontier reasoning and coding scores at a fraction of the cost." },
      { label: "DeepSeek V3-0628", date: "Jul 2026", note: "Refined tool-use and reduced latency further.", current: true }
    ],
    adoption: ["Perplexity", "Together AI", "Groq", "OpenRouter community developers"],
    integrations: ["OpenRouter", "AWS Bedrock", "LangChain", "Vercel AI SDK"],
    communitySentimentSummary: "Developers frequently cite DeepSeek V3 as the best price-to-performance ratio in the market, with especially strong praise for its math and coding accuracy relative to cost.",
    overallSentiment: 89,
    alternatives: [
      { slug: "llama-3-1-405b", name: "Llama 3.1 405B", reason: "Choose it instead when you need a larger, more battle-tested open ecosystem." },
      { slug: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", reason: "Choose it instead when you need managed infrastructure and agentic tool use." }
    ],
    suitability: [
      { label: "Software Developers", score: 92 },
      { label: "Researchers", score: 87 },
      { label: "Students", score: 80 },
      { label: "Founders", score: 83 },
      { label: "Content Creators", score: 55 },
      { label: "Data Analysts", score: 90 },
      { label: "Product Managers", score: 70 },
      { label: "Enterprise Teams", score: 78 }
    ],
    health: { releaseFrequency: "Fast", improvementVelocity: "Very Fast", communityAdoption: "Exponential", enterpriseAdoption: "Growing", ecosystemGrowth: "Expanding", apiStability: "Improving", documentationQuality: "Fair" }
  },
  "perplexity-sonar": {
    slug: "perplexity-sonar",
    name: "Perplexity Sonar Large",
    maker: "Perplexity AI",
    version: "Sonar Large Online",
    family: "Sonar Family",
    releaseDate: "January 2025",
    license: "Commercial",
    apiAvailable: true,
    contextWindow: "127,000 tokens",
    contextWindowTokens: 127000,
    inputTypes: "Text",
    outputTypes: "Text with citations",
    latency: "Very Fast",
    pricing: "$1.00 / million input, $1.00 / million output tokens plus per-request search fee",
    latestUpdate: "June 2026",
    communityRating: 4.4,
    aiScore: 84,
    logoLetter: "Px",
    logoColor: "gold",
    capabilities: "Retrieval-grounded answers with live citations, tuned for research workflows and fast turnaround.",
    benchmarks: [
      { name: "GPQA (Graduate-Level Reasoning)", score: "48.5%" },
      { name: "MMLU (Undergraduate Knowledge)", score: "81.2%" },
      { name: "Live Citation Accuracy", score: "93.0%" }
    ],
    updates: [
      "Expanded live source coverage to more publishers",
      "Improved citation accuracy on ambiguous queries",
      "Added enterprise admin controls"
    ],
    timeline: [
      { date: "November 2024", update: "Sonar Small released as the first search-grounded model." },
      { date: "January 2025", update: "Sonar Large released with a larger base model and better citations." }
    ],
    papers: ["Retrieval-Augmented Generation at Scale", "Evaluating Citation Faithfulness in LLMs"],
    dna: { reasoning: 82, coding: 70, creativity: 74, vision: 60, math: 68, agents: 60, toolUse: 65 },
    bestForTags: ["Research", "Content Creation", "Education", "Data Analysis"],
    limitations: [
      "Coding ability lags dedicated coding-first models.",
      "Answer quality depends heavily on live search result quality.",
      "Smaller context window limits very large document workflows."
    ],
    personality: { creativity: 3, precision: 4, reasoning: 3, conversation: 4, codingStyle: 2, riskTaking: 2, humor: 3 },
    features: { text: true, images: true, audio: false, video: false, pdfs: true, functionCalling: true, mcp: false, toolUse: true, webSearch: true, streaming: true, fineTuning: false, jsonMode: true, vision: true },
    pricingDetail: {
      freePlan: "Free tier with limited daily searches",
      apiCost: "$1.00 / million input, $1.00 / million output tokens plus per-request search fee",
      subscription: "Perplexity Pro at $20/month",
      enterprise: "Enterprise Pro with SSO and admin controls"
    },
    benchmarkStars: { coding: 2, math: 3, reasoning: 3, writing: 4, vision: 3, speed: 5, accuracy: 4 },
    useCases: ["Live market and news research", "Fact-checked content drafting", "Academic literature review", "Competitive intelligence gathering"],
    evolutionChain: [
      { label: "Sonar Small", date: "Nov 2024", note: "First search-grounded Sonar model." },
      { label: "Sonar Large", date: "Jan 2025", note: "Larger base model with improved citation accuracy." },
      { label: "Sonar Large Online", date: "Jun 2026", note: "Faster live retrieval and expanded source coverage.", current: true }
    ],
    adoption: ["Zoom", "SoundHound", "Deutsche Telekom"],
    integrations: ["OpenRouter", "LangChain", "Vercel AI SDK"],
    communitySentimentSummary: "Researchers and analysts value Sonar Large for answers that come pre-cited with live sources, though some note its reasoning depth is lighter than general-purpose frontier models.",
    overallSentiment: 82,
    alternatives: [
      { slug: "gemini-1-5-pro", name: "Gemini 1.5 Pro", reason: "Choose it instead when you need to analyze large private documents rather than the live web." },
      { slug: "gpt-4o", name: "GPT-4o", reason: "Choose it instead for stronger general reasoning and creative writing." }
    ],
    suitability: [
      { label: "Software Developers", score: 55 },
      { label: "Researchers", score: 94 },
      { label: "Students", score: 86 },
      { label: "Founders", score: 78 },
      { label: "Content Creators", score: 82 },
      { label: "Data Analysts", score: 80 },
      { label: "Product Managers", score: 75 },
      { label: "Enterprise Teams", score: 70 }
    ],
    health: { releaseFrequency: "Frequent", improvementVelocity: "Fast", communityAdoption: "Growing", enterpriseAdoption: "Emerging", ecosystemGrowth: "Growing", apiStability: "Stable", documentationQuality: "Good" }
  }
};

const RECOMMENDATION_SCENARIOS: {
  id: string;
  label: string;
  metric: (m: ModelDetail) => number;
  reason: (m: ModelDetail) => string;
}[] = [
  {
    id: "coding",
    label: "Writing & debugging code",
    metric: (m) => m.dna.coding,
    reason: (m) => `Coding DNA score of ${m.dna.coding}/100, backed by a ${m.benchmarkStars.coding}-star coding benchmark rating.`
  },
  {
    id: "reasoning",
    label: "Deep multi-step reasoning",
    metric: (m) => m.dna.reasoning,
    reason: (m) => `Reasoning DNA score of ${m.dna.reasoning}/100, well suited to complex chains of logic.`
  },
  {
    id: "free",
    label: "Free & self-hosted",
    metric: (m) => (m.license === "Open Source" ? m.dna.reasoning + 25 : m.dna.reasoning),
    reason: (m) => `${m.license === "Open Source" ? "Open-weight license, free to self-host" : "Commercial license"} with strong all-round capability.`
  },
  {
    id: "context",
    label: "Processing huge documents",
    metric: (m) => m.contextWindowTokens,
    reason: (m) => `Context window of ${m.contextWindow}, built for large document ingestion.`
  },
  {
    id: "multimodal",
    label: "Realtime voice & multimodal",
    metric: (m) => m.dna.vision,
    reason: (m) => `Vision DNA score of ${m.dna.vision}/100 with native multimodal support.`
  }
];

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
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
      <span className="absolute font-display font-extrabold text-white" style={{ fontSize: size * 0.28 }}>{score}</span>
    </div>
  );
}

function Bar({ label, value, colorClass = "bg-accent" }: { label: string; value: number; colorClass?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-zinc-400 font-semibold">{label}</span>
        <span className="text-white font-bold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`w-3.5 h-3.5 ${i < value ? "text-goldAccent" : "text-white/10"}`}
          fill="currentColor"
        >
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6z" />
        </svg>
      ))}
    </div>
  );
}

function FeatureCheck({ label, on }: { label: string; on: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold ${
        on ? "bg-tealAccent/5 border-tealAccent/20 text-white" : "bg-white/[0.01] border-white/[0.04] text-zinc-600"
      }`}
    >
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 ${on ? "bg-tealAccent text-ink" : "bg-white/5 text-zinc-600"}`}>
        {on ? "✓" : "✕"}
      </span>
      {label}
    </div>
  );
}

function EvolutionChain({ steps }: { steps: EvolutionStep[] }) {
  const defaultIdx = Math.max(steps.findIndex((s) => s.current), 0);
  const [activeIdx, setActiveIdx] = useState(defaultIdx);
  const active = steps[activeIdx];

  return (
    <div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveIdx(idx)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all text-left ${
                idx === activeIdx
                  ? "bg-accent border-accent text-white"
                  : "bg-white/[0.02] border-white/[0.08] text-zinc-300 hover:border-accent/40"
              }`}
            >
              <span className="block">{step.label}</span>
              <span className="block text-[10px] font-semibold opacity-70">{step.date}</span>
            </button>
            {idx < steps.length - 1 && <span className="text-zinc-600">&rarr;</span>}
          </div>
        ))}
      </div>
      {active && (
        <p className="text-xs text-textSecondary leading-relaxed mt-3 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3.5">
          <strong className="text-white">{active.label}</strong> ({active.date}): {active.note}
        </p>
      )}
    </div>
  );
}

function RecommendationEngine({ database }: { database: ModelDetail[] }) {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const scenario = RECOMMENDATION_SCENARIOS.find((s) => s.id === activeScenario) ?? null;
  const ranked = scenario ? database.slice().sort((a, b) => scenario.metric(b) - scenario.metric(a)).slice(0, 3) : [];
  const medals = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];

  return (
    <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-1">AI Recommendation Engine</h3>
      <p className="text-xs text-textSecondary mb-4">Tell us what you need. We will rank the best model for it across the full Novique index.</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {RECOMMENDATION_SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveScenario(s.id)}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all ${
              activeScenario === s.id
                ? "bg-accent border-accent text-white"
                : "bg-white/[0.02] border-white/[0.08] text-textSecondary hover:border-accent/40 hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {scenario ? (
        <div className="flex flex-col gap-3">
          {ranked.map((m, idx) => (
            <Link
              key={m.slug}
              href={`/models/${m.slug}`}
              className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-accent/30 transition-all"
            >
              <span className="text-xl leading-none">{medals[idx]}</span>
              <div>
                <span className="text-sm font-bold text-white block">{m.name}</span>
                <span className="text-xs text-textSecondary">{scenario.reason(m)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 italic">Pick a scenario above to see a ranked recommendation.</p>
      )}
    </div>
  );
}

export default function ModelDetailPage() {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarked, setBookmarked] = useState(false);

  const modelKey = String(slug || "").toLowerCase();
  const model = MODEL_DATABASE[modelKey];

  if (!model) {
    return (
      <div className="min-h-screen bg-ink text-textPrimary relative flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold mb-4">Model Specification Not Found</h1>
          <p className="text-textSecondary mb-6">The requested index target could not be verified.</p>
          <Link href="/models" className="px-6 py-2.5 bg-accent rounded-xl text-xs font-bold text-white">
            Return to Models list
          </Link>
        </div>
      </div>
    );
  }

  const allModels = Object.values(MODEL_DATABASE);
  const makerSlug = model.maker.toLowerCase().replace(/\s+/g, "-");

  const quickStats = [
    { label: "Context Window", value: model.contextWindow },
    { label: "Input Types", value: model.inputTypes },
    { label: "Output Types", value: model.outputTypes },
    { label: "Latency", value: model.latency },
    { label: "Pricing", value: model.pricing },
    { label: "Latest Update", value: model.latestUpdate },
    { label: "Community Rating", value: `${model.communityRating.toFixed(1)} / 5.0` }
  ];

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">

        {/* Header Back Link */}
        <Link href="/models" className="text-xs text-textSecondary hover:text-accent font-bold flex items-center gap-1">
          &larr; Back to Model Intelligence
        </Link>

        {/* Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.05]">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-sm font-extrabold shrink-0 ${LOGO_STYLES[model.logoColor]}`}>
              {model.logoLetter}
            </div>
            <div>
              <div className="flex items-center gap-3.5 flex-wrap">
                <h1 className="text-4xl font-display font-extrabold text-white">{model.name}</h1>
                <span className="text-xs font-semibold text-zinc-500">v: {model.version}</span>
              </div>
              <p className="text-sm text-textSecondary mt-2">
                Developed by: <Link href={`/companies/${makerSlug}`} className="text-accent hover:underline font-bold">{model.maker}</Link>
                <span className="text-zinc-600 mx-2">&middot;</span>
                Released {model.releaseDate}
                <span className="text-zinc-600 mx-2">&middot;</span>
                {model.family}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${
                    model.license === "Open Source"
                      ? "bg-tealAccent/10 border-tealAccent/20 text-tealAccent"
                      : "bg-white/[0.04] border-white/[0.06] text-zinc-300"
                  }`}
                >
                  {model.license}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-300">
                  {model.apiAvailable ? "API Available" : "No Public API"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4">
            <ScoreRing score={model.aiScore} size={72} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBookmarked((v) => !v)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                  bookmarked ? "bg-accent border-accent text-white" : "bg-panel border-white/[0.08] text-zinc-300 hover:text-white"
                }`}
              >
                {bookmarked ? "Bookmarked" : "Bookmark"}
              </button>
              <button className="px-3.5 py-2 rounded-xl border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white transition-all">
                Compare
              </button>
              <button className="px-3.5 py-2 rounded-xl border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white transition-all">
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickStats.map((stat) => (
            <div key={stat.label} className="bg-panel border border-white/[0.05] rounded-2xl p-3.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">{stat.label}</span>
              <span className="text-xs font-bold text-white leading-snug block">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Main Info Columns */}
          <div className="md:col-span-2 flex flex-col gap-8">

            {/* AI Summary */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-3">AI Summary</h3>
              <p className="text-sm text-textSecondary leading-relaxed font-normal">{model.capabilities}</p>
            </div>

            {/* Model DNA */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-1">Model DNA</h3>
              <p className="text-xs text-textSecondary mb-4">Novique-exclusive strength profile, scored 0-100 across core capability dimensions.</p>
              <div className="flex flex-col gap-3.5">
                <Bar label="Reasoning" value={model.dna.reasoning} />
                <Bar label="Coding" value={model.dna.coding} />
                <Bar label="Creativity" value={model.dna.creativity} />
                <Bar label="Vision" value={model.dna.vision} colorClass="bg-tealAccent" />
                <Bar label="Math" value={model.dna.math} />
                <Bar label="Agents" value={model.dna.agents} colorClass="bg-goldAccent" />
                <Bar label="Tool Use" value={model.dna.toolUse} colorClass="bg-goldAccent" />
              </div>
            </div>

            {/* Best For / Limitations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Best For</h3>
                <div className="flex flex-wrap gap-1.5">
                  {model.bestForTags.map((tag) => (
                    <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Limitations</h3>
                <ul className="flex flex-col gap-2">
                  {model.limitations.map((l, idx) => (
                    <li key={idx} className="text-xs text-textSecondary leading-relaxed flex gap-2">
                      <span className="text-negative shrink-0">&bull;</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Supported Features */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Supported Features</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <FeatureCheck label="Text" on={model.features.text} />
                <FeatureCheck label="Images" on={model.features.images} />
                <FeatureCheck label="Audio" on={model.features.audio} />
                <FeatureCheck label="Video" on={model.features.video} />
                <FeatureCheck label="PDFs" on={model.features.pdfs} />
                <FeatureCheck label="Function Calling" on={model.features.functionCalling} />
                <FeatureCheck label="MCP" on={model.features.mcp} />
                <FeatureCheck label="Tool Use" on={model.features.toolUse} />
                <FeatureCheck label="Web Search" on={model.features.webSearch} />
                <FeatureCheck label="Streaming" on={model.features.streaming} />
                <FeatureCheck label="Fine-Tuning" on={model.features.fineTuning} />
                <FeatureCheck label="JSON Mode" on={model.features.jsonMode} />
                <FeatureCheck label="Vision" on={model.features.vision} />
              </div>
            </div>

            {/* Benchmark Summary (stars) */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Benchmark Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-semibold">Coding</span><Stars value={model.benchmarkStars.coding} /></div>
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-semibold">Math</span><Stars value={model.benchmarkStars.math} /></div>
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-semibold">Reasoning</span><Stars value={model.benchmarkStars.reasoning} /></div>
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-semibold">Writing</span><Stars value={model.benchmarkStars.writing} /></div>
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-semibold">Vision</span><Stars value={model.benchmarkStars.vision} /></div>
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-semibold">Speed</span><Stars value={model.benchmarkStars.speed} /></div>
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-semibold">Accuracy</span><Stars value={model.benchmarkStars.accuracy} /></div>
              </div>
            </div>

            {/* Use Cases */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Use Cases</h3>
              <div className="flex flex-wrap gap-1.5">
                {model.useCases.map((uc) => (
                  <span key={uc} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-300">
                    {uc}
                  </span>
                ))}
              </div>
            </div>

            {/* Model Evolution Timeline (chain) */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Model Evolution</h3>
              <EvolutionChain steps={model.evolutionChain} />
            </div>

            {/* Existing detailed launch timeline, preserved */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-6">Model Launch Timeline</h3>
              <div className="relative border-l border-white/[0.08] ml-2 pl-6 flex flex-col gap-6">
                {model.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-9 top-1 w-2.5 h-2.5 rounded-full bg-tealAccent border border-ink"></span>
                    <strong className="text-xs text-tealAccent block">{step.date}</strong>
                    <p className="text-xs text-textSecondary mt-0.5 leading-relaxed">{step.update}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Updates list */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Latest Updates</h3>
              <div className="flex flex-col gap-3">
                {model.updates.map((update, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    <span>{update}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Adoption */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Adoption</h3>
              <div className="flex flex-wrap gap-1.5">
                {model.adoption.map((a) => (
                  <span key={a} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-300">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Integrations */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Integrations</h3>
              <div className="flex flex-wrap gap-1.5">
                {model.integrations.map((i) => (
                  <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-goldAccent/10 border border-goldAccent/20 text-goldAccent">
                    {i}
                  </span>
                ))}
              </div>
            </div>

            {/* Community Intelligence */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-3">Community Intelligence</h3>
              <p className="text-sm text-textSecondary leading-relaxed mb-4">{model.communitySentimentSummary}</p>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400 font-semibold">Overall Sentiment</span>
                <span className="text-positive font-bold">{model.overallSentiment}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-positive" style={{ width: `${model.overallSentiment}%` }} />
              </div>
            </div>

            {/* AI Recommendation Engine */}
            <RecommendationEngine database={allModels} />

            {/* AI Suitability Score */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-1">AI Suitability Score</h3>
              <p className="text-xs text-textSecondary mb-4">How well this model fits different kinds of users.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
                {model.suitability.map((s) => (
                  <Bar key={s.label} label={s.label} value={s.score} colorClass="bg-tealAccent" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Columns */}
          <div className="flex flex-col gap-6">

            {/* Pricing */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Pricing</h3>
              <div className="flex flex-col gap-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 block mb-0.5">Free Plan</span>
                  <span className="text-xs text-white font-semibold">{model.pricingDetail.freePlan}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 block mb-0.5">API Cost</span>
                  <span className="text-xs text-white font-semibold">{model.pricingDetail.apiCost}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 block mb-0.5">Subscription</span>
                  <span className="text-xs text-white font-semibold">{model.pricingDetail.subscription}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 block mb-0.5">Enterprise Pricing</span>
                  <span className="text-xs text-white font-semibold">{model.pricingDetail.enterprise}</span>
                </div>
              </div>
            </div>

            {/* Model Personality */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Model Personality</h3>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-medium">Creativity</span><Stars value={model.personality.creativity} /></div>
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-medium">Precision</span><Stars value={model.personality.precision} /></div>
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-medium">Reasoning</span><Stars value={model.personality.reasoning} /></div>
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-medium">Conversation</span><Stars value={model.personality.conversation} /></div>
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-medium">Coding Style</span><Stars value={model.personality.codingStyle} /></div>
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-medium">Risk Taking</span><Stars value={model.personality.riskTaking} /></div>
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400 font-medium">Humor</span><Stars value={model.personality.humor} /></div>
              </div>
            </div>

            {/* Model Health */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Model Health</h3>
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between"><span className="text-zinc-500 font-medium">Release Frequency</span><span className="font-bold text-white">{model.health.releaseFrequency}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 font-medium">Improvement Velocity</span><span className="font-bold text-white">{model.health.improvementVelocity}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 font-medium">Community Adoption</span><span className="font-bold text-white">{model.health.communityAdoption}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 font-medium">Enterprise Adoption</span><span className="font-bold text-white">{model.health.enterpriseAdoption}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 font-medium">Ecosystem Growth</span><span className="font-bold text-white">{model.health.ecosystemGrowth}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 font-medium">API Stability</span><span className="font-bold text-white">{model.health.apiStability}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 font-medium">Documentation Quality</span><span className="font-bold text-white">{model.health.documentationQuality}</span></div>
              </div>
            </div>

            {/* Alternatives */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Alternatives</h3>
              <div className="flex flex-col gap-3.5">
                {model.alternatives.map((alt) => (
                  <Link key={alt.slug} href={`/models/${alt.slug}`} className="block p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-accent/30 transition-all">
                    <span className="text-xs font-bold text-white block mb-1">{alt.name}</span>
                    <span className="text-[11px] text-textSecondary leading-relaxed">{alt.reason}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Key Benchmarks (raw scores, preserved) */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Key Benchmarks</h3>
              <div className="flex flex-col gap-4">
                {model.benchmarks.map((bench) => (
                  <div key={bench.name} className="flex justify-between items-center text-xs pb-3 border-b border-white/[0.04] last:border-0 last:pb-0">
                    <span className="text-zinc-500 font-medium">{bench.name}</span>
                    <span className="font-bold text-white bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded">{bench.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Research Papers */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Related Research</h3>
              <div className="flex flex-col gap-3.5">
                {model.papers.map((paper, idx) => (
                  <div key={idx} className="text-xs pb-3 border-b border-white/[0.04] last:border-0 last:pb-0">
                    <span className="font-bold text-zinc-300 block leading-tight">{paper}</span>
                    <Link href="/research" className="text-[10px] text-accent font-semibold hover:underline block mt-1">Read Review &rarr;</Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Developer Company Card */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-1">Developer Firm</h3>
              <span className="text-sm font-bold text-white">{model.maker}</span>
              <Link
                href={`/companies/${makerSlug}`}
                className="text-center py-2 bg-secondaryBg/60 hover:bg-secondaryBg border border-white/[0.05] rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all block mt-2"
              >
                Inspect Firm &rarr;
              </Link>
            </div>

          </div>

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
