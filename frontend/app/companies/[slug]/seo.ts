// Metadata-only lookup, kept separate from CompanyDetailClient.tsx (a "use
// client" module) because Next.js resolves client-module exports to opaque
// client references when imported from a Server Component's generateMetadata,
// not their real runtime values.
export const COMPANY_SEO: Record<string, { name: string; tagline: string }> = {
  openai: { name: "OpenAI", tagline: "Building general-purpose intelligence platforms that benefit all of humanity." },
  anthropic: { name: "Anthropic", tagline: "Building reliable, interpretable, and steerable AI systems, safely." },
  "google-deepmind": { name: "Google DeepMind", tagline: "Solving intelligence to advance science and benefit humanity." },
  "meta-ai": { name: "Meta AI", tagline: "Open-sourcing frontier AI to accelerate the whole ecosystem." },
  mistral: { name: "Mistral", tagline: "Efficient, high-density models for edge and enterprise deployment." },
  cursor: { name: "Cursor (Anysphere)", tagline: "The AI-native code editor built for pair-programming with agents." },
  perplexity: { name: "Perplexity", tagline: "A conversational answer engine that cites its sources." },
  "microsoft-ai": { name: "Microsoft AI", tagline: "Bringing agentic copilots to every Microsoft product surface." },
  xai: { name: "xAI", tagline: "Building maximally truth-seeking AI to understand the universe." },
  deepseek: { name: "DeepSeek", tagline: "Open, efficiently-trained frontier models at a fraction of the cost." },
  cohere: { name: "Cohere", tagline: "Enterprise-grade language models built for retrieval and security." },
  "hugging-face": { name: "Hugging Face", tagline: "The open platform where the AI community builds together." },
};
