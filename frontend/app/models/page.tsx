import type { Metadata } from "next";
import ModelsClient from "./ModelsClient";

export const metadata: Metadata = {
  title: "Compare AI Models",
  description: "Discover, compare, and get a personalized recommendation across every major AI model.",
  alternates: { canonical: "/models" },
  openGraph: { title: "Compare AI Models | Novique", description: "Discover, compare, and get a personalized recommendation across every major AI model." },
};

export default function ModelsPage() {
  return <ModelsClient />;
}
