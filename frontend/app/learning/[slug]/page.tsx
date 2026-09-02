import type { Metadata } from "next";
import LessonClient from "./LessonClient";
import { LESSON_SEO } from "./seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = LESSON_SEO[slug];
  if (!lesson) return { title: "Lesson Not Found", robots: { index: false, follow: false } };

  const title = lesson.title;
  const description = lesson.tagline;
  return {
    title,
    description,
    alternates: { canonical: `/learning/${slug}` },
    openGraph: { title: `${title} | Novique`, description },
  };
}

export default function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  return <LessonClient params={params} />;
}
