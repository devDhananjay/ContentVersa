import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BookOpenText,
  Calculator,
  FileText,
  GitCompareArrows,
  Languages,
  MessageCircleQuestion,
  ScanLine,
  UserRound,
} from "lucide-react";

export const CV_AI_PATH = "/ai";

export type CvAiModeId =
  | "ask"
  | "summarize"
  | "explain"
  | "compare"
  | "resume"
  | "finance"
  | "pdf"
  | "bank-statement"
  | "screenshot";

export type CvAiMode = {
  id: CvAiModeId;
  title: string;
  shortTitle: string;
  description: string;
  placeholder: string;
  /** Chat uses Gemini with mode-specific prompts */
  kind: "chat" | "tool";
  /** Deep-link for tool modes (or secondary CTA for chat modes) */
  toolHref?: string;
  toolLabel?: string;
  icon: LucideIcon;
  keywords: string[];
  examples: string[];
};

export const CV_AI_MODES: CvAiMode[] = [
  {
    id: "ask",
    title: "Ask Anything",
    shortTitle: "Ask",
    description: "Questions about India life, ContentVerse India, careers, money, movies and more.",
    placeholder: "Ask anything — e.g. How do SIPs work for beginners?",
    kind: "chat",
    icon: MessageCircleQuestion,
    keywords: ["ask anything", "AI assistant India", "ContentVerse India AI"],
    examples: [
      "What is HUID on gold jewellery?",
      "Best free tools on ContentVerse India?",
      "How to track UPI expenses?",
    ],
  },
  {
    id: "summarize",
    title: "Summarize Article",
    shortTitle: "Summarize",
    description: "Paste long text or an article — get a clear short summary in seconds.",
    placeholder: "Paste the article or notes you want summarised…",
    kind: "chat",
    icon: BookOpenText,
    keywords: ["summarize article", "AI summary India", "short summary"],
    examples: [
      "Paste a news article and ask for 3 key takeaways",
      "Summarise this blog for WhatsApp",
    ],
  },
  {
    id: "explain",
    title: "Explain in Simple Language",
    shortTitle: "Explain",
    description: "Hard topic? Get a plain-English (or Hindi) explanation anyone can follow.",
    placeholder: "Paste text or name a topic to explain simply…",
    kind: "chat",
    icon: Languages,
    keywords: ["explain simply", "ELI5 India", "simple language AI"],
    examples: ["Explain GST like I'm 15", "What is credit utilisation in simple words?"],
  },
  {
    id: "compare",
    title: "Compare Two Things",
    shortTitle: "Compare",
    description: "SIP vs FD, New vs Old tax regime, Netflix vs Prime — clear side-by-side.",
    placeholder: "Compare A vs B — e.g. SIP vs FD for 5 years…",
    kind: "chat",
    icon: GitCompareArrows,
    keywords: ["compare SIP vs FD", "compare two things AI"],
    examples: ["SIP vs FD", "Personal loan vs credit card EMI", "New vs Old tax regime"],
  },
  {
    id: "resume",
    title: "Generate Job Resume",
    shortTitle: "Resume",
    description: "Paste your experience — get a clean India-ready resume draft to edit.",
    placeholder:
      "Name, role target, education, skills, experience bullets, city… (paste details)",
    kind: "chat",
    toolHref: "/jobs",
    toolLabel: "Browse jobs",
    icon: UserRound,
    keywords: ["AI resume India", "job resume generator", "CV maker"],
    examples: [
      "Fresher B.Tech — frontend developer, Hyderabad",
      "5 years sales — switch to business analyst",
    ],
  },
  {
    id: "finance",
    title: "Calculate Finance",
    shortTitle: "Finance",
    description: "EMI, SIP, FD, RD, tax questions — AI guidance plus free calculators.",
    placeholder: "e.g. EMI on ₹40 lakh home loan at 8.5% for 20 years…",
    kind: "chat",
    toolHref: "/tools/emi-calculator",
    toolLabel: "Open EMI calculator",
    icon: Calculator,
    keywords: ["AI finance calculator", "EMI SIP FD help"],
    examples: ["SIP ₹5,000/mo for 10 years at 12%", "In-hand salary on 12 LPA new regime"],
  },
  {
    id: "pdf",
    title: "Analyze PDF",
    shortTitle: "PDF",
    description: "Paste text from a PDF — or use Bank Statement Analyzer for bank PDFs.",
    placeholder: "Paste extracted PDF text to analyse (income, clauses, summary)…",
    kind: "chat",
    toolHref: "/moneyverse/bank-statement-analyzer",
    toolLabel: "Bank PDF analyzer",
    icon: FileText,
    keywords: ["analyze PDF AI", "PDF summary India"],
    examples: ["Paste policy PDF text and ask for key clauses", "Summarise this circular"],
  },
  {
    id: "bank-statement",
    title: "Analyze Bank Statement",
    shortTitle: "Bank PDF",
    description:
      "Upload a bank statement PDF — total income, expense, top category, monthly average & subscriptions.",
    placeholder: "",
    kind: "tool",
    toolHref: "/moneyverse/bank-statement-analyzer",
    toolLabel: "Open Bank Statement Analyzer",
    icon: Banknote,
    keywords: [
      "bank statement analyzer",
      "AI bank PDF",
      "total income expense",
      "subscription detection",
    ],
    examples: [
      "Total Income & Total Expense",
      "Top Spending Category",
      "Monthly Average + Subscription Detection",
    ],
  },
  {
    id: "screenshot",
    title: "Read Screenshot",
    shortTitle: "OCR",
    description: "Upload UPI / payment screenshots — OCR fills amount, merchant & category.",
    placeholder: "",
    kind: "tool",
    toolHref: "/moneyverse/screenshot-scan",
    toolLabel: "Open Screenshot Scan",
    icon: ScanLine,
    keywords: ["screenshot OCR", "UPI screenshot AI", "PhonePe GPay scan"],
    examples: ["PhonePe payment screenshot → expense", "GPay confirmation → amount & payee"],
  },
];

export function getCvAiMode(id: string | null | undefined): CvAiMode {
  return CV_AI_MODES.find((m) => m.id === id) ?? CV_AI_MODES[0]!;
}

export function cvAiModePath(id: CvAiModeId) {
  return `${CV_AI_PATH}?mode=${id}`;
}

export const CV_AI_KEYWORDS = [
  "ContentVerse India AI",
  "AI assistant India",
  "summarize article",
  "bank statement analyzer AI",
  "screenshot OCR",
  "AI resume India",
  "compare SIP vs FD",
  "explain in simple language",
  ...CV_AI_MODES.flatMap((m) => m.keywords),
];

export const CV_AI_FAQS = [
  {
    question: "What is ContentVerse India AI?",
    answer:
      "ContentVerse India AI is ContentVerse India's AI product — ask anything, summarise articles, explain topics simply, compare options, draft resumes, get finance help, analyse PDF text, and jump into Bank Statement Analyzer or Screenshot OCR.",
  },
  {
    question: "Can ContentVerse India AI analyse my bank statement PDF?",
    answer:
      "Yes. Use Analyze Bank Statement to open MoneyVerse Bank Statement Analyzer. Upload a PDF to see total income, total expense, top spending category, monthly average and subscription-style detections. Sign-in and free quota apply.",
  },
  {
    question: "Is ContentVerse India AI free?",
    answer:
      "Ask, summarise, explain, compare, resume and finance chat modes are free to try. Screenshot OCR and bank statement analysis need a signed-in account; bank PDF analysis has a free per-user quota.",
  },
];
