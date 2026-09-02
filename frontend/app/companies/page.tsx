import type { Metadata } from "next";
import CompaniesClient from "./CompaniesClient";

export const metadata: Metadata = {
  title: "AI Companies",
  description: "Track funding, product launches, and momentum across the AI industry's leading companies.",
  alternates: { canonical: "/companies" },
  openGraph: { title: "AI Companies | Novique", description: "Track funding, product launches, and momentum across the AI industry's leading companies." },
};

export default function CompaniesPage() {
  return <CompaniesClient />;
}
