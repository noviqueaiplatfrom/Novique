import type { Metadata } from "next";
import SavedClient from "./SavedClient";

export const metadata: Metadata = {
  title: "Saved Articles",
  description: "Your bookmarked AI intelligence articles.",
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return <SavedClient />;
}
