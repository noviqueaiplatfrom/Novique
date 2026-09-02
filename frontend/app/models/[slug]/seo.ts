// See app/companies/[slug]/seo.ts for why this is a separate plain module.
export const MODEL_SEO: Record<string, { name: string; maker: string; capabilities: string }> = {
  "claude-3-5-sonnet": { name: "Claude 3.5 Sonnet", maker: "Anthropic", capabilities: "Leading logical reasoning, complex code generation, multi-step instruction execution, and detailed visual data parsing." },
  "gpt-4o": { name: "GPT-4o", maker: "OpenAI", capabilities: "Real-time multimodal synthesis across text, vision, and low-latency voice, enabling conversational streams." },
  "llama-3-1-405b": { name: "Llama 3.1 405B", maker: "Meta AI", capabilities: "Superb synthetic data generation pipeline backing, multilingual translations, deep safety fine-tuning parameters." },
  "gemini-1-5-pro": { name: "Gemini 1.5 Pro", maker: "Google", capabilities: "Massive context window loading entire codebases, audio documents, or hours of video natively in a single query." },
  "deepseek-v3": { name: "DeepSeek V3", maker: "DeepSeek AI", capabilities: "Mixture-of-experts open weights delivering frontier-level math and coding scores at a fraction of the typical inference cost." },
  "perplexity-sonar": { name: "Perplexity Sonar Large", maker: "Perplexity AI", capabilities: "Retrieval-grounded answers with live citations, tuned for research workflows and fast turnaround." },
};
