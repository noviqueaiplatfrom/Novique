import type { Metadata } from "next";
import WeeklyReportsClient from "./WeeklyReportsClient";

export const metadata: Metadata = {
  title: "Weekly AI Reports",
  description: "Weekly synthesis reports covering the biggest shifts across the AI landscape.",
  alternates: { canonical: "/weekly-reports" },
  openGraph: { title: "Weekly AI Reports | Novique", description: "Weekly synthesis reports covering the biggest shifts across the AI landscape." },
};

export default function WeeklyReportsPage() {
  return <WeeklyReportsClient />;
}
