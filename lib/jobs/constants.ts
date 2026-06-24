import type { SarkariCategory } from "@/lib/jobs/types";

export const SARKARI_HOST =
  process.env.RAPIDAPI_SARKARI_HOST?.trim() || "sarkari-result.p.rapidapi.com";

export const GOVT_CATEGORIES: {
  id: SarkariCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "jobs",
    label: "Latest Jobs",
    description: "New government job notifications and online forms",
  },
  {
    id: "results",
    label: "Results",
    description: "Exam results and merit lists",
  },
  {
    id: "admit-cards",
    label: "Admit Cards",
    description: "Hall tickets and exam admit cards",
  },
  {
    id: "answer-keys",
    label: "Answer Keys",
    description: "Official answer keys and objections",
  },
  {
    id: "admissions",
    label: "Admissions",
    description: "College and university admission notices",
  },
  {
    id: "syllabus",
    label: "Syllabus",
    description: "Exam syllabus and pattern updates",
  },
];

/** Cache Sarkari listings — updates are daily, not real-time. */
export const SARKARI_CACHE_SECONDS = 30 * 60;
