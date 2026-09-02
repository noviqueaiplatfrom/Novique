import type { Metadata } from "next";
import ResearchClient from "./ResearchClient";

export const metadata: Metadata = {
  title: "AI Research",
  description: "Plain-English explainers of the AI research papers that matter, ranked by impact.",
  alternates: { canonical: "/research" },
  openGraph: { title: "AI Research | Novique", description: "Plain-English explainers of the AI research papers that matter, ranked by impact." },
};

export default function ResearchPage() {
  return <ResearchClient />;
}
