import type { Metadata } from "next";
import LearningClient from "./LearningClient";

export const metadata: Metadata = {
  title: "Learn AI Skills",
  description: "Structured lessons, career roadmaps, and certified assessments for practical AI skills.",
  alternates: { canonical: "/learning" },
  openGraph: { title: "Learn AI Skills | Novique", description: "Structured lessons, career roadmaps, and certified assessments for practical AI skills." },
};

export default function LearningPage() {
  return <LearningClient />;
}
