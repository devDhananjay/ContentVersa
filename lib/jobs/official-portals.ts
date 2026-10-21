import type { SarkariCategory, SarkariListing } from "@/lib/jobs/types";

/** Always-on official desks when the live feed is unavailable. */
export const OFFICIAL_JOB_PORTALS: SarkariListing[] = [
  {
    title: "SSC — Staff Selection Commission (official)",
    link: "https://ssc.gov.in/",
  },
  {
    title: "UPSC — Union Public Service Commission (official)",
    link: "https://www.upsc.gov.in/",
  },
  {
    title: "Railway Recruitment Board — RRB / RRC portals",
    link: "https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,7,1281",
  },
  {
    title: "IBPS — Institute of Banking Personnel Selection",
    link: "https://www.ibps.in/",
  },
  {
    title: "National Career Service — Government of India",
    link: "https://www.ncs.gov.in/",
  },
  {
    title: "Employment News — weekly central vacancies",
    link: "https://www.employmentnews.gov.in/",
  },
];

export const OFFICIAL_RESULT_PORTALS: SarkariListing[] = [
  { title: "SSC Results", link: "https://ssc.gov.in/portal/results" },
  { title: "UPSC Results", link: "https://www.upsc.gov.in/" },
  { title: "NTA — National Testing Agency", link: "https://nta.ac.in/" },
  { title: "CBSE Results", link: "https://www.cbseresults.nic.in/" },
];

export const OFFICIAL_ADMIT_PORTALS: SarkariListing[] = [
  { title: "SSC Admit Card / Application status", link: "https://ssc.gov.in/" },
  { title: "UPSC Admit Card", link: "https://www.upsc.gov.in/" },
  { title: "IBPS Admit Card", link: "https://www.ibps.in/" },
];

export function officialPortalsForCategory(
  category: SarkariCategory
): SarkariListing[] {
  switch (category) {
    case "results":
      return OFFICIAL_RESULT_PORTALS;
    case "admit-cards":
      return OFFICIAL_ADMIT_PORTALS;
    case "answer-keys":
    case "admissions":
    case "syllabus":
      return [
        ...OFFICIAL_JOB_PORTALS.slice(0, 3),
        { title: "NTA — exams & notices", link: "https://nta.ac.in/" },
      ];
    case "jobs":
    default:
      return OFFICIAL_JOB_PORTALS;
  }
}

export function isQuotaOrRateLimitError(message: string): boolean {
  return /quota|rate limit|exceeded|too many requests|429/i.test(message);
}
