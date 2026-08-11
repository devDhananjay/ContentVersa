export const DEFAULT_API_BASE = "https://contentverse.co.in";

export type JobSource = "LINKEDIN" | "NAUKRI" | "OTHER";

export type ScrapedJob = {
  url: string;
  source: JobSource;
  title: string;
  company: string | null;
  jdText: string;
};

export type ShouldApply = {
  verdict: "APPLY" | "MAYBE" | "SKIP";
  label: string;
  summary: string;
  competition: "Low" | "Medium" | "High";
  experienceMatch: number;
  skillsMatch: number;
  resumeAts: number;
};

export type AnalysisResult = {
  id: string;
  jobTitle: string;
  company: string | null;
  matchScore: number;
  skillsMatched: string[];
  skillsMissing: string[];
  experienceMatch: number;
  atsScore: number | null;
  shouldApply: ShouldApply;
  suggestedImprovement?: string;
};

export type UsageSnapshot = {
  analysisRemaining: number;
  coverLetterRemaining: number;
  analysisLimit: number;
  coverLetterLimit: number;
  plan: string;
};

export type MeResponse = {
  user: { id: string; email: string; name: string | null; username: string };
  hasResume: boolean;
  usage: UsageSnapshot;
};
