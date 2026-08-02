export type PurposeTag =
  | "Coding"
  | "Reasoning"
  | "Vision"
  | "Video"
  | "Audio"
  | "Agents"
  | "Writing"
  | "Research"
  | "Math"
  | "Enterprise"
  | "Open Source"
  | "Commercial"
  | "API Available"
  | "Free"
  | "Multimodal"
  | "Long Context"
  | "Fast"
  | "Cheap";

export interface ModelSummary {
  slug: string;
  name: string;
  maker: string;
  type: string;
  version: string;
  latestReleaseDate: string;
  aiScore: number;
  bestFor: string;
  popularity: number;
  license: "Open Source" | "Commercial";
  tags: PurposeTag[];
  scores: {
    coding: number;
    reasoning: number;
    creativity: number;
    multimodal: number;
    value: number;
    speed: number;
  };
  contextWindowTokens: number;
  logoLetter: string;
  logoColor: "accent" | "teal" | "gold";
  blurb: string;
}

export const MODELS: ModelSummary[] = [
  {
    slug: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    maker: "Anthropic",
    type: "Frontier Reasoning Model",
    version: "v3.5 Sonnet (June 2026)",
    latestReleaseDate: "2026-06-01",
    aiScore: 95,
    bestFor: "Coding, agents & long-form reasoning",
    popularity: 93,
    license: "Commercial",
    tags: ["Coding", "Reasoning", "Agents", "Writing", "Research", "Enterprise", "Commercial", "API Available", "Multimodal", "Long Context"],
    scores: { coding: 96, reasoning: 94, creativity: 90, multimodal: 82, value: 72, speed: 76 },
    contextWindowTokens: 200000,
    logoLetter: "CL",
    logoColor: "accent",
    blurb: "State-of-the-art coding, logical reasoning, multi-step instruction compliance, visual analysis.",
  },
  {
    slug: "gpt-4o",
    name: "GPT-4o",
    maker: "OpenAI",
    type: "Multimodal Realtime Model",
    version: "gpt-4o-realtime (May 2026)",
    latestReleaseDate: "2026-05-01",
    aiScore: 93,
    bestFor: "Realtime multimodal & voice apps",
    popularity: 97,
    license: "Commercial",
    tags: ["Vision", "Video", "Audio", "Multimodal", "Writing", "Commercial", "API Available", "Fast"],
    scores: { coding: 88, reasoning: 87, creativity: 92, multimodal: 96, value: 78, speed: 90 },
    contextWindowTokens: 128000,
    logoLetter: "4o",
    logoColor: "teal",
    blurb: "Low-latency voice/audio processing, real-time multimodal token streams, visual reasoning.",
  },
  {
    slug: "llama-3-1-405b",
    name: "Llama 3.1 405B",
    maker: "Meta AI",
    type: "Open-Weight Foundation Model",
    version: "3.1-405B-Instruct",
    latestReleaseDate: "2025-11-01",
    aiScore: 87,
    bestFor: "Self-hosting & fine-tuning at scale",
    popularity: 85,
    license: "Open Source",
    tags: ["Coding", "Reasoning", "Math", "Open Source", "Free", "Enterprise", "API Available"],
    scores: { coding: 84, reasoning: 85, creativity: 80, multimodal: 55, value: 96, speed: 70 },
    contextWindowTokens: 128000,
    logoLetter: "L3",
    logoColor: "gold",
    blurb: "Local fine-tuning, synthetic data generation pipelines, self-hosting, multilingual weights.",
  },
  {
    slug: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    maker: "Google",
    type: "Long-Context Multimodal Model",
    version: "Gemini 1.5 Pro-002",
    latestReleaseDate: "2025-09-01",
    aiScore: 90,
    bestFor: "Massive context & document analysis",
    popularity: 88,
    license: "Commercial",
    tags: ["Vision", "Video", "Long Context", "Multimodal", "Enterprise", "Commercial", "API Available"],
    scores: { coding: 82, reasoning: 86, creativity: 83, multimodal: 93, value: 88, speed: 80 },
    contextWindowTokens: 2000000,
    logoLetter: "Ge",
    logoColor: "accent",
    blurb: "2-Million token context window, deep multimodal understanding across video/audio/files.",
  },
  {
    slug: "deepseek-v3",
    name: "DeepSeek V3",
    maker: "DeepSeek AI",
    type: "Open-Weight Reasoning Model",
    version: "DeepSeek-V3-0628",
    latestReleaseDate: "2026-07-01",
    aiScore: 89,
    bestFor: "Budget-friendly math & coding",
    popularity: 81,
    license: "Open Source",
    tags: ["Coding", "Reasoning", "Math", "Open Source", "Free", "Cheap", "Fast", "API Available"],
    scores: { coding: 90, reasoning: 91, creativity: 78, multimodal: 45, value: 99, speed: 92 },
    contextWindowTokens: 128000,
    logoLetter: "DS",
    logoColor: "teal",
    blurb: "Mixture-of-experts open weights delivering frontier-level math and coding scores at a fraction of the cost.",
  },
  {
    slug: "perplexity-sonar",
    name: "Perplexity Sonar Large",
    maker: "Perplexity AI",
    type: "Search-Augmented Language Model",
    version: "Sonar Large Online",
    latestReleaseDate: "2026-06-15",
    aiScore: 84,
    bestFor: "Live web research & citations",
    popularity: 76,
    license: "Commercial",
    tags: ["Research", "Writing", "Fast", "Commercial", "API Available", "Cheap"],
    scores: { coding: 70, reasoning: 82, creativity: 74, multimodal: 60, value: 85, speed: 95 },
    contextWindowTokens: 127000,
    logoLetter: "Px",
    logoColor: "gold",
    blurb: "Retrieval-grounded answers with live citations, tuned for research workflows and fast turnaround.",
  },
];
