import type { Metadata } from "next";
import CompanyDetailClient from "./CompanyDetailClient";
import { COMPANY_SEO } from "./seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const company = COMPANY_SEO[slug.toLowerCase()];
  if (!company) return { title: "Company Not Found", robots: { index: false, follow: false } };

  const title = `${company.name} - AI Company Profile`;
  const description = `${company.name}: ${company.tagline}`;
  return {
    title,
    description,
    alternates: { canonical: `/companies/${slug}` },
    openGraph: { title, description },
  };
}

export default function CompanyDetailPage() {
  return <CompanyDetailClient />;
}
