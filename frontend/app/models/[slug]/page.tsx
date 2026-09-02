import type { Metadata } from "next";
import ModelDetailClient from "./ModelDetailClient";
import { MODEL_SEO } from "./seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const model = MODEL_SEO[slug.toLowerCase()];
  if (!model) return { title: "Model Not Found", robots: { index: false, follow: false } };

  const title = `${model.name} - AI Model Profile`;
  const description = `${model.name} by ${model.maker}: ${model.capabilities}`;
  return {
    title,
    description,
    alternates: { canonical: `/models/${slug}` },
    openGraph: { title, description },
  };
}

export default function ModelDetailPage() {
  return <ModelDetailClient />;
}
