import type { Metadata } from "next";
import IntelligenceClient from "./IntelligenceClient";

export const metadata: Metadata = {
  title: "AI Intelligence Feed",
  description: "Live AI market pulse, breaking news, trend radar, and opportunity signals, ranked and explained.",
  alternates: { canonical: "/intelligence" },
  openGraph: { title: "AI Intelligence Feed | Novique", description: "Live AI market pulse, breaking news, trend radar, and opportunity signals, ranked and explained." },
};

export default function IntelligencePage() {
  return <IntelligenceClient />;
}
