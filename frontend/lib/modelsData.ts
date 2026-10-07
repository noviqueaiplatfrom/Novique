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
  {
    slug: "gpt-5",
    name: "GPT-5",
    maker: "OpenAI",
    type: "Frontier Reasoning Model",
    version: "GPT-5 (2026)",
    latestReleaseDate: "2026-08-01",
    aiScore: 97,
    bestFor: "General-purpose frontier reasoning & agentic workflows",
    popularity: 98,
    license: "Commercial",
    tags: ["Coding", "Reasoning", "Agents", "Writing", "Research", "Enterprise", "Commercial", "API Available", "Multimodal", "Long Context"],
    scores: { coding: 95, reasoning: 97, creativity: 93, multimodal: 90, value: 70, speed: 78 },
    contextWindowTokens: 256000,
    logoLetter: "G5",
    logoColor: "teal",
    blurb: "OpenAI's current frontier model, unifying reasoning and fast response modes behind a single adaptive system.",
  },
  {
    slug: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    maker: "Anthropic",
    type: "Frontier Reasoning Model",
    version: "claude-opus-4-8",
    latestReleaseDate: "2026-09-01",
    aiScore: 98,
    bestFor: "Deep multi-step reasoning, coding & agentic orchestration",
    popularity: 95,
    license: "Commercial",
    tags: ["Coding", "Reasoning", "Agents", "Writing", "Research", "Enterprise", "Commercial", "API Available", "Multimodal", "Long Context"],
    scores: { coding: 98, reasoning: 98, creativity: 92, multimodal: 85, value: 68, speed: 74 },
    contextWindowTokens: 200000,
    logoLetter: "O4",
    logoColor: "accent",
    blurb: "Anthropic's top-tier model for sustained logic, agentic tool-use, and long-horizon coding tasks.",
  },
  {
    slug: "gemini-3-pro",
    name: "Gemini 3 Pro",
    maker: "Google DeepMind",
    type: "Long-Context Multimodal Model",
    version: "Gemini 3 Pro",
    latestReleaseDate: "2026-07-15",
    aiScore: 94,
    bestFor: "Massive context, deep multimodal reasoning",
    popularity: 90,
    license: "Commercial",
    tags: ["Vision", "Video", "Audio", "Long Context", "Multimodal", "Reasoning", "Enterprise", "Commercial", "API Available"],
    scores: { coding: 87, reasoning: 92, creativity: 86, multimodal: 97, value: 85, speed: 82 },
    contextWindowTokens: 2000000,
    logoLetter: "G3",
    logoColor: "gold",
    blurb: "Google's current flagship, pairing a 2M-token context window with native multimodal reasoning across text, image, video, and audio.",
  },
  {
    slug: "grok-4",
    name: "Grok 4",
    maker: "xAI",
    type: "Realtime Reasoning Model",
    version: "Grok 4",
    latestReleaseDate: "2026-06-20",
    aiScore: 91,
    bestFor: "Realtime knowledge, reasoning with live data access",
    popularity: 83,
    license: "Commercial",
    tags: ["Reasoning", "Research", "Writing", "Agents", "Commercial", "API Available", "Fast"],
    scores: { coding: 85, reasoning: 90, creativity: 84, multimodal: 70, value: 80, speed: 88 },
    contextWindowTokens: 256000,
    logoLetter: "Gr",
    logoColor: "accent",
    blurb: "xAI's frontier model, tuned for realtime reasoning with live access to current events and data.",
  },
  {
    slug: "qwen-3-max",
    name: "Qwen 3 Max",
    maker: "Alibaba",
    type: "Open-Weight Reasoning Model",
    version: "Qwen 3 Max",
    latestReleaseDate: "2026-05-10",
    aiScore: 88,
    bestFor: "Open-weight multilingual reasoning & coding at scale",
    popularity: 77,
    license: "Open Source",
    tags: ["Coding", "Reasoning", "Math", "Open Source", "Free", "Enterprise", "API Available"],
    scores: { coding: 89, reasoning: 88, creativity: 79, multimodal: 60, value: 97, speed: 85 },
    contextWindowTokens: 128000,
    logoLetter: "Qw",
    logoColor: "teal",
    blurb: "Alibaba's flagship open-weight model, strong on multilingual reasoning and coding with frontier-adjacent benchmark results.",
  },
];
