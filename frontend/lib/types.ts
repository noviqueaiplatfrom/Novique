export interface Article {
  id: number;
  title: string;
  url: string;
  source: string;
  kind: string;
  domain: string;
  author: string | null;
  published_at: string;
  points: number;
  num_comments: number;
  citation_count: number;

  summary_30s: string | null;
  why_it_matters: string | null;
  who_is_impacted: string | null;
  what_changed: string | null;
  what_to_watch: string | null;
  key_takeaways: string[] | null;
  topics: string[] | null;
  sentiment: string | null;
  summarized_by: string | null;

  impact_score: number;
  trend_score: number;
}

export type Sort = "impact" | "trend" | "recent";
export type Kind = "all" | "news" | "paper";
