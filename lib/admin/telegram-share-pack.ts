/**
 * Admin Telegram share pack — copy-ready tips + deep links + related interlinks.
 * Used by /admin/telegram-share (no bot required).
 */
import { SITE } from "@/lib/seo";

const BASE = SITE.url.replace(/\/$/, "");

export type TelegramShareLink = {
  id: string;
  label: string;
  path: string;
  tip?: string;
  /** Related paths for internal linking in the same paste */
  related?: { label: string; path: string }[];
};

export type TelegramDayPack = {
  day: number;
  money: TelegramShareLink;
  job: TelegramShareLink;
};

function abs(path: string) {
  return path.startsWith("http") ? path : `${BASE}${path}`;
}

export function absoluteShareUrl(path: string) {
  return abs(path);
}

/** High-CPC / high-intent money links with interlinks */
export const TELEGRAM_MONEY_LINKS: TelegramShareLink[] = [
  {
    id: "old-new-tax",
    label: "Old vs new tax regime 2026",
    path: "/guides/money/old-vs-new-tax-regime-india-2026",
    tip: "Old vs new regime — Form 16 se dono estimate, phir portal pe confirm.",
    related: [
      { label: "ITR checklist", path: "/guides/money/itr-filing-checklist-salaried-india" },
      { label: "Salary tax calculator", path: "/tools/salary-tax-calculator" },
    ],
  },
  {
    id: "personal-loan",
    label: "Personal loan eligibility",
    path: "/guides/money/personal-loan-eligibility-documents-india",
    tip: "Personal loan se pehle EMI + FOIR + docs check — guaranteed-approval ads ignore.",
    related: [
      { label: "EMI calculator", path: "/tools/emi-calculator" },
      { label: "Card vs PL", path: "/guides/money/credit-card-vs-personal-loan-india-2026" },
    ],
  },
  {
    id: "card-vs-pl",
    label: "Credit card vs personal loan",
    path: "/guides/money/credit-card-vs-personal-loan-india-2026",
    tip: "Revolving card dues mehengi? PL se clear karne ka total cost compare karo.",
    related: [
      { label: "Minimum due trap", path: "/guides/money/credit-card-minimum-due-india" },
      { label: "CIBIL guide", path: "/guides/money/credit-score-cibil-india-guide" },
    ],
  },
  {
    id: "rewards-cashback",
    label: "Rewards vs cashback cards",
    path: "/guides/money/credit-card-rewards-vs-cashback-india-2026",
    tip: "Points ka best-case nahi — caps, fee, excluded categories math karo.",
    related: [
      { label: "Minimum due", path: "/guides/money/credit-card-minimum-due-india" },
      { label: "Card vs PL", path: "/guides/money/credit-card-vs-personal-loan-india-2026" },
    ],
  },
  {
    id: "term-endowment",
    label: "Term vs endowment",
    path: "/guides/money/term-vs-endowment-insurance-india-2026",
    tip: "Term = cover; endowment aksar savings mix — pehle need size karo.",
    related: [
      { label: "Term beginners", path: "/guides/money/term-insurance-beginners-india" },
      { label: "Term cover calc", path: "/tools/term-cover-calculator" },
    ],
  },
  {
    id: "health-ins",
    label: "Health insurance beginners",
    path: "/guides/money/health-insurance-india-beginners",
    tip: "Waiting period + room rent cap padho. Cashless ≠ har hospital.",
    related: [
      { label: "Term insurance", path: "/guides/money/term-insurance-beginners-india" },
      { label: "Take-home calc", path: "/tools/take-home-calculator" },
    ],
  },
  {
    id: "sip-fd",
    label: "SIP vs FD 2026",
    path: "/guides/money/sip-vs-fd-india-2026",
    tip: "Near goal → FD style; long goal → SIP (risk). Dono calculators chalao.",
    related: [
      { label: "SIP guide", path: "/guides/money/sip-calculator-india-beginners-guide" },
      { label: "FD vs RD", path: "/guides/money/fd-vs-rd-india-guide" },
    ],
  },
  {
    id: "gold-pl",
    label: "Gold loan vs personal loan",
    path: "/guides/money/gold-loan-vs-personal-loan-india",
    tip: "LTV + auction risk vs unsecured rate — same tenure pe EMI do baar.",
    related: [
      { label: "EMI calculator", path: "/tools/emi-calculator" },
      { label: "HUID gold", path: "/guides/money/huid-hallmark-gold-buying-india" },
    ],
  },
  {
    id: "min-due",
    label: "Credit card minimum due",
    path: "/guides/money/credit-card-minimum-due-india",
    tip: "Sirf minimum due = interest trap. Full statement clear karne ka plan.",
    related: [
      { label: "Card vs PL", path: "/guides/money/credit-card-vs-personal-loan-india-2026" },
      { label: "CIBIL", path: "/guides/money/credit-score-cibil-india-guide" },
    ],
  },
  {
    id: "itr",
    label: "ITR checklist salaried",
    path: "/guides/money/itr-filing-checklist-salaried-india",
    tip: "Form 16 + AIS + 26AS pehle match. Calculator ≠ filed return.",
    related: [
      { label: "Old vs new regime", path: "/guides/money/old-vs-new-tax-regime-india-2026" },
      { label: "Salary tax tool", path: "/tools/salary-tax-calculator" },
    ],
  },
  {
    id: "epf",
    label: "EPF / PF withdrawal",
    path: "/guides/money/epf-pf-withdrawal-rules-india",
    tip: "Partial vs final alag. PF ko ATM mat banao — portal pe rule check.",
    related: [
      { label: "EPF calculator", path: "/tools/epf-calculator" },
      { label: "EPF vs NPS", path: "/guides/money/epf-vs-nps-india-salaried-guide" },
    ],
  },
  {
    id: "emi",
    label: "EMI guide",
    path: "/guides/money/emi-calculator-india-guide",
    tip: "Tenure vs interest trade-off + floating stress-test before you sign.",
    related: [
      { label: "EMI calculator", path: "/tools/emi-calculator" },
      { label: "Personal loan docs", path: "/guides/money/personal-loan-eligibility-documents-india" },
    ],
  },
  {
    id: "cibil",
    label: "CIBIL / credit score",
    path: "/guides/money/credit-score-cibil-india-guide",
    tip: "Late EMI + high utilisation score dabati hai. Hard enquiry burst avoid.",
    related: [
      { label: "Personal loan", path: "/guides/money/personal-loan-eligibility-documents-india" },
      { label: "Minimum due", path: "/guides/money/credit-card-minimum-due-india" },
    ],
  },
  {
    id: "salary-tax",
    label: "Salary tax guide",
    path: "/guides/money/salary-tax-calculator-india-guide",
    tip: "Regime compare planning aid — live slabs portal pe verify.",
    related: [
      { label: "Old vs new 2026", path: "/guides/money/old-vs-new-tax-regime-india-2026" },
      { label: "Calculator", path: "/tools/salary-tax-calculator" },
    ],
  },
];

export const TELEGRAM_JOB_LINKS: TelegramShareLink[] = [
  {
    id: "ibps",
    label: "IBPS exam & salary",
    path: "/guides/jobs/ibps-banking-exam-salary-structure-india",
    tip: "IBPS = process. Clerk vs PO alag. Notice sirf ibps.in — fake CTC ignore.",
    related: [
      { label: "SSC salary slip", path: "/guides/jobs/ssc-salary-slip-how-to-read-india" },
      { label: "Take-home calc", path: "/tools/take-home-calculator" },
    ],
  },
  {
    id: "ssc-slip",
    label: "SSC salary slip",
    path: "/guides/jobs/ssc-salary-slip-how-to-read-india",
    tip: "Gross ≠ net. Basic+DA+HRA vs PF/NPS/TDS — loan/ITR pe sahi slip use.",
    related: [
      { label: "IBPS salary", path: "/guides/jobs/ibps-banking-exam-salary-structure-india" },
      { label: "Salary tax", path: "/guides/money/salary-tax-calculator-india-guide" },
    ],
  },
  {
    id: "result-score",
    label: "Result vs scorecard",
    path: "/guides/jobs/sarkari-result-vs-scorecard",
    tip: "Result PDF ≠ scorecard. Roll no + provisional vs final carefully.",
    related: [
      { label: "Read notification", path: "/guides/jobs/how-to-read-sarkari-job-notification" },
      { label: "Govt jobs hub", path: "/jobs/govt" },
    ],
  },
  {
    id: "read-notif",
    label: "Read job notification",
    path: "/guides/jobs/how-to-read-sarkari-job-notification",
    tip: "Age, fee, photo size, language — coaching summary pe mat jao.",
    related: [
      { label: "SSC checklist", path: "/guides/jobs/ssc-style-exam-notification-checklist" },
      { label: "RRB checklist", path: "/guides/jobs/rrb-railway-job-notification-checklist-india" },
    ],
  },
  {
    id: "ssc-check",
    label: "SSC notification checklist",
    path: "/guides/jobs/ssc-style-exam-notification-checklist",
    tip: "Photo KB ≠ PDF size — dono limits alag padho.",
    related: [
      { label: "Read notification", path: "/guides/jobs/how-to-read-sarkari-job-notification" },
      { label: "Govt jobs", path: "/jobs/govt" },
    ],
  },
  {
    id: "rrb",
    label: "RRB railway checklist",
    path: "/guides/jobs/rrb-railway-job-notification-checklist-india",
    tip: "OTR + docs pehle ready — last date rush avoid.",
    related: [
      { label: "Result vs scorecard", path: "/guides/jobs/sarkari-result-vs-scorecard" },
      { label: "Govt jobs", path: "/jobs/govt" },
    ],
  },
];

/** 14-day rotation: money + job pair with interlinks baked into copy */
export const TELEGRAM_DAY_PACKS: TelegramDayPack[] = [
  { day: 1, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "min-due")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "result-score")! },
  { day: 2, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "old-new-tax")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "ibps")! },
  { day: 3, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "personal-loan")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "ssc-slip")! },
  { day: 4, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "card-vs-pl")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "read-notif")! },
  { day: 5, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "sip-fd")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "rrb")! },
  { day: 6, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "term-endowment")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "ssc-check")! },
  { day: 7, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "health-ins")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "ibps")! },
  { day: 8, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "rewards-cashback")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "result-score")! },
  { day: 9, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "gold-pl")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "ssc-slip")! },
  { day: 10, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "itr")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "ibps")! },
  { day: 11, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "cibil")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "read-notif")! },
  { day: 12, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "emi")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "ssc-check")! },
  { day: 13, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "epf")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "rrb")! },
  { day: 14, money: TELEGRAM_MONEY_LINKS.find((l) => l.id === "salary-tax")!, job: TELEGRAM_JOB_LINKS.find((l) => l.id === "ibps")! },
];

export function buildDayMessage(pack: TelegramDayPack): string {
  const m = pack.money;
  const j = pack.job;
  const mRelated = (m.related ?? [])
    .slice(0, 2)
    .map((r) => `   🔗 ${r.label}: ${abs(r.path)}`)
    .join("\n");
  const jRelated = (j.related ?? [])
    .slice(0, 2)
    .map((r) => `   🔗 ${r.label}: ${abs(r.path)}`)
    .join("\n");

  return [
    `💰 Money tip`,
    m.tip || m.label,
    ``,
    `👉 ${abs(m.path)}`,
    mRelated,
    ``,
    `💼 Job tip`,
    j.tip || j.label,
    ``,
    `👉 ${abs(j.path)}`,
    jRelated,
    ``,
    `📚 https://contentverse.co.in/guides/money`,
    `Educational only — ContentVerse India`,
    `Confirm on official portals.`,
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");
}

export function buildSingleLinkMessage(item: TelegramShareLink, kind: "money" | "job" | "news"): string {
  const emoji = kind === "job" ? "💼" : kind === "news" ? "📰" : "💰";
  const related = (item.related ?? [])
    .slice(0, 2)
    .map((r) => `🔗 ${r.label}: ${abs(r.path)}`)
    .join("\n");
  return [
    `${emoji} ${item.label}`,
    item.tip || "",
    ``,
    `👉 ${abs(item.path)}`,
    related,
    ``,
    `Educational only — ContentVerse India`,
  ]
    .filter((l, i, a) => l !== "" || (a[i - 1] !== "" && a[i + 1] !== undefined))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Suggested related guide for a news/blog URL (simple keyword → guide) */
export function relatedGuidesForNewsTitle(title: string): { label: string; path: string }[] {
  const t = title.toLowerCase();
  const out: { label: string; path: string }[] = [];
  if (/tax|itr|budget|gst|income/.test(t)) {
    out.push({ label: "Old vs new tax", path: "/guides/money/old-vs-new-tax-regime-india-2026" });
  }
  if (/loan|emi|rbi|bank|credit/.test(t)) {
    out.push({ label: "Personal loan guide", path: "/guides/money/personal-loan-eligibility-documents-india" });
  }
  if (/job|ssc|ibps|railway|sarkari|recruit/.test(t)) {
    out.push({ label: "IBPS / salary", path: "/guides/jobs/ibps-banking-exam-salary-structure-india" });
  }
  if (/gold|silver|metal/.test(t)) {
    out.push({ label: "Gold vs PL", path: "/guides/money/gold-loan-vs-personal-loan-india" });
  }
  if (/sip|mutual|nifty|sensex|market|share/.test(t)) {
    out.push({ label: "SIP vs FD", path: "/guides/money/sip-vs-fd-india-2026" });
  }
  if (/insurance|health|term|claim/.test(t)) {
    out.push({ label: "Health insurance", path: "/guides/money/health-insurance-india-beginners" });
  }
  if (out.length === 0) {
    out.push({ label: "Money guides", path: "/guides/money" });
    out.push({ label: "Govt jobs", path: "/jobs/govt" });
  }
  return out.slice(0, 2);
}
