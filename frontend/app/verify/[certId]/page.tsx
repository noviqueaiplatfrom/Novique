import type { Metadata } from "next";
import VerifyClient from "./VerifyClient";

export const metadata: Metadata = {
  title: "Verify Certificate",
  description: "Verify a Novique learning certificate.",
  robots: { index: false, follow: false },
};

export default function VerifyPage({ params }: { params: Promise<{ certId: string }> }) {
  return <VerifyClient params={params} />;
}
