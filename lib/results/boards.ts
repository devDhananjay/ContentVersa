export type ResultBoard = {
  id: string;
  name: string;
  shortName: string;
  category: "central" | "board" | "state" | "banking" | "railway" | "defence";
  description: string;
  officialUrl: string;
  resultUrl?: string;
  keywords: string[];
};

/** Curated official result portals — we never invent marks/results. */
export const RESULT_BOARDS: ResultBoard[] = [
  {
    id: "ssc",
    name: "Staff Selection Commission",
    shortName: "SSC",
    category: "central",
    description: "CGL, CHSL, MTS, GD and other SSC exam results.",
    officialUrl: "https://ssc.gov.in",
    resultUrl: "https://ssc.gov.in/portal/results",
    keywords: ["ssc result", "ssc cgl result", "ssc chsl result"],
  },
  {
    id: "upsc",
    name: "Union Public Service Commission",
    shortName: "UPSC",
    category: "central",
    description: "Civil Services, NDA, CDS, CAPF and other UPSC results.",
    officialUrl: "https://www.upsc.gov.in",
    resultUrl: "https://www.upsc.gov.in/examinations/results",
    keywords: ["upsc result", "upsc cse result", "nda result"],
  },
  {
    id: "ibps",
    name: "IBPS — Bank Exams",
    shortName: "IBPS",
    category: "banking",
    description: "PO, Clerk, RRB and specialist officer results.",
    officialUrl: "https://www.ibps.in",
    keywords: ["ibps result", "ibps po result", "ibps clerk result"],
  },
  {
    id: "sbi",
    name: "State Bank of India Careers",
    shortName: "SBI",
    category: "banking",
    description: "SBI PO, Clerk and specialist recruitment results.",
    officialUrl: "https://sbi.co.in/web/careers",
    keywords: ["sbi po result", "sbi clerk result"],
  },
  {
    id: "rrb",
    name: "Railway Recruitment Boards",
    shortName: "RRB",
    category: "railway",
    description: "NTPC, Group D, ALP and other railway results via RRB portals.",
    officialUrl: "https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,7,1281",
    keywords: ["rrb result", "rrb ntpc result", "railway group d result"],
  },
  {
    id: "cbse",
    name: "CBSE Board Results",
    shortName: "CBSE",
    category: "board",
    description: "Class 10 and Class 12 board exam results.",
    officialUrl: "https://www.cbse.gov.in",
    resultUrl: "https://results.cbse.nic.in",
    keywords: ["cbse result", "cbse 12th result", "cbse 10th result"],
  },
  {
    id: "nios",
    name: "NIOS Results",
    shortName: "NIOS",
    category: "board",
    description: "National Institute of Open Schooling exam results.",
    officialUrl: "https://www.nios.ac.in",
    resultUrl: "https://results.nios.ac.in",
    keywords: ["nios result", "nios 12th result"],
  },
  {
    id: "nta",
    name: "National Testing Agency",
    shortName: "NTA",
    category: "central",
    description: "JEE Main, NEET UG, CUET and other NTA results.",
    officialUrl: "https://nta.ac.in",
    resultUrl: "https://nta.ac.in/Downloads",
    keywords: ["nta result", "jee main result", "neet result", "cuet result"],
  },
  {
    id: "ctet",
    name: "CTET",
    shortName: "CTET",
    category: "central",
    description: "Central Teacher Eligibility Test results.",
    officialUrl: "https://ctet.nic.in",
    keywords: ["ctet result"],
  },
  {
    id: "gate",
    name: "GATE",
    shortName: "GATE",
    category: "central",
    description: "Graduate Aptitude Test in Engineering results (IIT organising).",
    officialUrl: "https://gate.iitk.ac.in",
    keywords: ["gate result"],
  },
  {
    id: "police",
    name: "State Police Recruitments",
    shortName: "Police",
    category: "state",
    description: "Check your state police recruitment board for constable/SI results.",
    officialUrl: "https://www.india.gov.in",
    keywords: ["police result", "constable result"],
  },
  {
    id: "defence",
    name: "Defence Exams",
    shortName: "Defence",
    category: "defence",
    description: "Agniveer, Army, Navy, Air Force recruitment result portals.",
    officialUrl: "https://joinindianarmy.nic.in",
    keywords: ["agniveer result", "army result", "navy result"],
  },
];

export const RESULT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "central", label: "Central" },
  { id: "board", label: "Board" },
  { id: "banking", label: "Banking" },
  { id: "railway", label: "Railway" },
  { id: "state", label: "State" },
  { id: "defence", label: "Defence" },
] as const;

export function filterBoards(category: string, query: string): ResultBoard[] {
  const q = query.trim().toLowerCase();
  return RESULT_BOARDS.filter((b) => {
    if (category !== "all" && b.category !== category) return false;
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) ||
      b.shortName.toLowerCase().includes(q) ||
      b.keywords.some((k) => k.includes(q)) ||
      b.description.toLowerCase().includes(q)
    );
  });
}
