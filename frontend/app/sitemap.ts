import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://novique.ai";

  const staticRoutes = [
    { url: base, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${base}/signals`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${base}/weekly-reports`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${base}/learning`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${base}/opportunities`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${base}/research`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${base}/companies`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${base}/models`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${base}/saved`, priority: 0.4, changeFrequency: "never" as const },
  ];

  const lessonSlugs = [
    "mcp-server-development",
    "local-llm-fine-tuning-unsloth",
    "kolmogorov-arnold-networks",
    "voice-ai-agent-pipeline",
    "agentic-rag-pipelines",
    "prompt-engineering-production",
  ];

  const reportSlugs = [
    "july-week-1-2026",
    "june-week-4-2026",
    "june-week-3-2026",
    "june-week-2-2026",
    "june-week-1-2026",
    "may-week-4-2026",
  ];

  const companySlugs = [
    "openai",
    "anthropic",
    "google-deepmind",
    "meta-ai",
    "mistral",
    "cursor",
    "perplexity",
  ];

  const lessonRoutes = lessonSlugs.map((slug) => ({
    url: `${base}/learning/${slug}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  const reportRoutes = reportSlugs.map((slug) => ({
    url: `${base}/weekly-reports/${slug}`,
    priority: 0.6,
    changeFrequency: "never" as const,
  }));

  const companyRoutes = companySlugs.map((slug) => ({
    url: `${base}/companies/${slug}`,
    priority: 0.6,
    changeFrequency: "weekly" as const,
  }));

  return [...staticRoutes, ...lessonRoutes, ...reportRoutes, ...companyRoutes];
}
