import type { Metadata } from "next";
import ReportClient from "./ReportClient";
import { REPORT_SEO } from "./seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const report = REPORT_SEO[slug];
  if (!report) return { title: "Report Not Found", robots: { index: false, follow: false } };

  const title = report.title;
  const description = report.executiveSummary;
  return {
    title,
    description,
    alternates: { canonical: `/weekly-reports/${slug}` },
    openGraph: { title: `${title} | Novique`, description },
  };
}

export default function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ReportClient params={params} />;
}
