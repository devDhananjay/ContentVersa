export type SarkariCategory =
  | "jobs"
  | "results"
  | "admissions"
  | "answer-keys"
  | "admit-cards"
  | "syllabus";

export type SarkariListing = {
  title: string;
  link: string;
  last_date?: string | null;
};

export type SarkariResponse = {
  success: boolean;
  message: string;
  count: number;
  data: SarkariListing[];
};

export type PrivateJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Part-time" | "Internship" | "Contract" | "Remote";
  experience: string;
  salary: string;
  posted: string;
  applyUrl: string;
  skills: string[];
};
