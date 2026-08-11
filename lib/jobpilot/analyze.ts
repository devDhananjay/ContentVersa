import { callGeminiJson, callGeminiText, isGeminiConfigured } from "@/lib/ai/gemini";
import type { JobMatchAnalysis, JobPilotCoverStyle, ShouldApplyResult } from "@/lib/jobpilot/types";

const ANALYZE_SCHEMA = {
  type: "object",
  properties: {
    matchScore: { type: "integer" },
    skillsMatched: { type: "array", items: { type: "string" } },
    skillsMissing: { type: "array", items: { type: "string" } },
    experienceMatch: { type: "integer" },
    atsScore: { type: "integer" },
    competition: { type: "string", enum: ["Low", "Medium", "High"] },
    summary: { type: "string" },
    suggestedImprovement: { type: "string" },
  },
  required: [
    "matchScore",
    "skillsMatched",
    "skillsMissing",
    "experienceMatch",
    "atsScore",
    "competition",
    "summary",
  ],
};

function clamp(n: number, min = 0, max = 100) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function buildShouldApply(
  matchScore: number,
  experienceMatch: number,
  skillsMatch: number,
  atsScore: number,
  competition: ShouldApplyResult["competition"],
  summary: string
): ShouldApplyResult {
  let verdict: ShouldApplyResult["verdict"] = "MAYBE";
  let label = "Maybe — review gaps first";
  if (matchScore >= 75) {
    verdict = "APPLY";
    label = `YES — ${matchScore}% Match`;
  } else if (matchScore < 50) {
    verdict = "SKIP";
    label = `SKIP — ${matchScore}% Match`;
  }

  return {
    verdict,
    label,
    summary:
      summary ||
      (verdict === "APPLY"
        ? "Your profile matches most requirements."
        : verdict === "SKIP"
          ? "This role looks like a weak fit based on your resume."
          : "Partial fit — tailor your application carefully."),
    competition,
    experienceMatch,
    skillsMatch,
    resumeAts: atsScore,
  };
}

function heuristicAnalyze(resumeText: string, jdText: string): JobMatchAnalysis {
  const resume = resumeText.toLowerCase();
  const jd = jdText.toLowerCase();
  const skillCandidates = [
    "react",
    "react native",
    "javascript",
    "typescript",
    "node",
    "python",
    "java",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "graphql",
    "rest",
    "sql",
    "mongodb",
    "firebase",
    "redux",
    "next.js",
    "ci/cd",
    "git",
    "figma",
    "swift",
    "kotlin",
    "android",
    "ios",
  ];

  const required = skillCandidates.filter((s) => jd.includes(s));
  const matched = required.filter((s) => resume.includes(s));
  const missing = required.filter((s) => !resume.includes(s));
  const skillsMatch =
    required.length === 0 ? 70 : Math.round((matched.length / required.length) * 100);
  const matchScore = clamp(skillsMatch * 0.7 + 20);
  const experienceMatch = clamp(skillsMatch * 0.85 + 10);
  const atsScore = clamp(skillsMatch * 0.8 + 15);

  return {
    matchScore,
    skillsMatched: matched.map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase())),
    skillsMissing: missing.map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase())),
    experienceMatch,
    atsScore,
    shouldApply: buildShouldApply(
      matchScore,
      experienceMatch,
      skillsMatch,
      atsScore,
      matchScore >= 80 ? "High" : matchScore >= 55 ? "Medium" : "Low",
      "Heuristic match based on keyword overlap in your resume."
    ),
    suggestedImprovement:
      missing[0]
        ? `Emphasize any real experience related to ${missing[0]} if you have it — do not invent.`
        : undefined,
  };
}

export async function analyzeJobAgainstResume(input: {
  resumeText: string;
  jobTitle: string;
  company?: string | null;
  jdText: string;
}): Promise<JobMatchAnalysis> {
  const resumeText = input.resumeText.slice(0, 12000);
  const jdText = input.jdText.slice(0, 10000);

  if (!isGeminiConfigured()) {
    return heuristicAnalyze(resumeText, jdText);
  }

  const system = `You are JobPilot AI, a careful job-fit analyst.
Rules:
- Score ONLY using facts present in the candidate resume.
- NEVER invent employers, years of experience, or skills not in the resume.
- List missing skills honestly from the job description.
- matchScore, experienceMatch, atsScore are integers 0-100.
- skillsMatched / skillsMissing: short skill names (max 12 each).
- competition: Low|Medium|High based on how specialized the role is.
- summary: 1-2 sentences for "Should I Apply?"
- suggestedImprovement: one concrete rewording tip based on EXISTING experience only.`;

  const user = `Job title: ${input.jobTitle}
Company: ${input.company || "Unknown"}

JOB DESCRIPTION:
${jdText}

CANDIDATE RESUME:
${resumeText}`;

  const raw = await callGeminiJson<{
    matchScore: number;
    skillsMatched: string[];
    skillsMissing: string[];
    experienceMatch: number;
    atsScore: number;
    competition: "Low" | "Medium" | "High";
    summary: string;
    suggestedImprovement?: string;
  }>(system, user, ANALYZE_SCHEMA, 2048, { temperature: 0.3, maxInputChars: 20000 });

  if (!raw) return heuristicAnalyze(resumeText, jdText);

  const matchScore = clamp(raw.matchScore);
  const experienceMatch = clamp(raw.experienceMatch);
  const atsScore = clamp(raw.atsScore);
  const skillsMatched = (raw.skillsMatched || []).slice(0, 12);
  const skillsMissing = (raw.skillsMissing || []).slice(0, 12);
  const skillsMatch =
    skillsMatched.length + skillsMissing.length === 0
      ? matchScore
      : clamp(
          (skillsMatched.length /
            Math.max(1, skillsMatched.length + skillsMissing.length)) *
            100
        );

  return {
    matchScore,
    skillsMatched,
    skillsMissing,
    experienceMatch,
    atsScore,
    shouldApply: buildShouldApply(
      matchScore,
      experienceMatch,
      skillsMatch,
      atsScore,
      raw.competition === "Low" || raw.competition === "High"
        ? raw.competition
        : "Medium",
      raw.summary
    ),
    suggestedImprovement: raw.suggestedImprovement,
  };
}

export async function generateCoverLetter(input: {
  resumeText: string;
  jobTitle: string;
  company?: string | null;
  jdText: string;
  style: JobPilotCoverStyle;
}): Promise<string> {
  const styleHint =
    input.style === "SHORT"
      ? "Write a short & direct cover letter (120-180 words)."
      : input.style === "STARTUP"
        ? "Write a startup-style cover letter — energetic, concise, human (180-250 words)."
        : "Write a professional cover letter (220-320 words).";

  const system = `You write cover letters for JobPilot AI.
Rules:
- Use ONLY experience and skills present in the resume.
- Do not invent employers, metrics, or tools.
- Address the hiring team; mention the role and company if known.
- No placeholders like [Your Name] — use name from resume if present, else omit.
- Output plain text only.`;

  const user = `${styleHint}

Role: ${input.jobTitle}
Company: ${input.company || "the company"}

JOB DESCRIPTION (excerpt):
${input.jdText.slice(0, 6000)}

RESUME:
${input.resumeText.slice(0, 8000)}`;

  if (!isGeminiConfigured()) {
    return `Dear Hiring Team,

I am writing to express my interest in the ${input.jobTitle} role${
      input.company ? ` at ${input.company}` : ""
    }. Based on my background, I believe I can contribute meaningfully to your team.

My experience aligns with several requirements in the job description, and I would welcome the chance to discuss how I can help.

Thank you for your consideration.

Best regards`;
  }

  const text = await callGeminiText(system, user, 1024);
  return (
    text?.trim() ||
    `Dear Hiring Team,\n\nI am interested in the ${input.jobTitle} position and would love to discuss how my experience fits your needs.\n\nBest regards`
  );
}
