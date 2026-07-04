export type PipelineStepId =
  | "research"
  | "writer"
  | "seo"
  | "image"
  | "reviewer"
  | "publisher";

export type PipelineStepStatus = "pending" | "running" | "done" | "failed" | "skipped";

export type PipelineStepResult = {
  id: PipelineStepId;
  label: string;
  status: PipelineStepStatus;
  summary?: string;
  detail?: Record<string, unknown>;
  error?: string;
  ms?: number;
};

export type ResearchTopic = {
  title: string;
  searchIntent: string;
  whyTrending: string;
  competition: "low" | "medium" | "high";
  seoScore: number;
  keywords: string[];
  sources: string[];
};

export type PipelineArticle = {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  coverKeywords: string[];
  coverImagePrompt: string;
  coverImage?: string | null;
  readingTime: number;
  wordCount: number;
};

export type ReviewReport = {
  passed: boolean;
  readability: "easy" | "moderate" | "dense";
  grammarNotes: string[];
  duplicationRisk: "low" | "medium" | "high";
  suggestions: string[];
  score: number;
};

export type PipelineRunResult = {
  ok: boolean;
  category: string;
  topic: ResearchTopic;
  steps: PipelineStepResult[];
  article?: PipelineArticle;
  review?: ReviewReport;
  blog?: {
    id: string;
    slug: string;
    status: string;
    previewUrl: string;
    editUrl: string;
  };
  error?: string;
};
