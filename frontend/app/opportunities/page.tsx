import type { Metadata } from "next";
import OpportunitiesClient from "./OpportunitiesClient";

export const metadata: Metadata = {
  title: "AI Opportunities",
  description: "Career and business opportunity signals driven by real AI market momentum.",
  alternates: { canonical: "/opportunities" },
  openGraph: { title: "AI Opportunities | Novique", description: "Career and business opportunity signals driven by real AI market momentum." },
};

export default function OpportunitiesPage() {
  return <OpportunitiesClient />;
}
