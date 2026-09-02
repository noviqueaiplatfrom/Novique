import type { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of Novique.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <TermsContent />;
}
