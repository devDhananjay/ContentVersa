export type JobPilotSource = "LINKEDIN" | "NAUKRI" | "OTHER";

export type JobPilotCoverStyle = "PROFESSIONAL" | "SHORT" | "STARTUP";

export type JobPilotAppStatus =
  | "SAVED"
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED";

export type ShouldApplyVerdict = "APPLY" | "MAYBE" | "SKIP";

export type ShouldApplyResult = {
  verdict: ShouldApplyVerdict;
  label: string;
  summary: string;
  competition: "Low" | "Medium" | "High";
  experienceMatch: number;
  skillsMatch: number;
  resumeAts: number;
};

export type JobMatchAnalysis = {
  matchScore: number;
  skillsMatched: string[];
  skillsMissing: string[];
  experienceMatch: number;
  atsScore: number;
  shouldApply: ShouldApplyResult;
  suggestedImprovement?: string;
};

export type JobPilotUsageSnapshot = {
  monthKey: string;
  analysisCount: number;
  coverLetterCount: number;
  answerCount: number;
  analysisLimit: number;
  coverLetterLimit: number;
  analysisRemaining: number;
  coverLetterRemaining: number;
  plan: "FREE" | "PRO";
};

export type JobPilotMeResponse = {
  user: {
    id: string;
    email: string;
    name: string | null;
    username: string;
  };
  hasResume: boolean;
  usage: JobPilotUsageSnapshot;
};