/**
 * India evergreen pack (Oct 2026) — original money/jobs guides.
 * Wired into GUIDE_ARTICLES for AdSense-quality depth + tool linking.
 */
import type {
  GuideArticle,
  GuideBlock,
  GuideFaq,
  GuideSectionSlug,
  GuideSource,
} from "./registry";

function block(
  heading: string,
  paragraphs: string[],
  bullets?: string[]
): GuideBlock {
  return bullets?.length ? { heading, paragraphs, bullets } : { heading, paragraphs };
}

function faq(q: string, a: string): GuideFaq {
  return { q, a };
}

function guide(input: {
  slug: string;
  section: GuideSectionSlug;
  title: string;
  shortTitle: string;
  description: string;
  keywords: string[];
  readingMinutes: number;
  clusterId: string;
  relatedHref: string;
  relatedLabel: string;
  blocks: GuideBlock[];
  faqs: GuideFaq[];
  sources?: GuideSource[];
}): GuideArticle {
  return {
    ...input,
    updatedLabel: "Oct 2026",
  };
}

export const EVERGREEN_PACK_OCT_2026: GuideArticle[] = [
  guide({
    slug: "term-insurance-beginners-india",
    section: "money",
    title: "Term Insurance for Beginners in India — Cover, Premium & Mistakes",
    shortTitle: "Term insurance basics",
    description:
      "Term insurance for Indian beginners: how much cover to estimate, premium vs age, riders to skip first, and claim documents — educational, not a policy sale.",
    keywords: [
      "term insurance india beginners",
      "how much term cover india",
      "term insurance vs endowment",
      "term plan premium age",
      "term insurance claim documents",
    ],
    readingMinutes: 12,
    clusterId: "salary-tax",
    relatedHref: "/tools/term-cover-calculator",
    relatedLabel: "Open term cover calculator",
    sources: [
      { href: "https://www.irdai.gov.in/", label: "IRDAI" },
      { href: "https://www.policyholder.gov.in/", label: "Policyholder.gov.in" },
      { href: "https://www.incometax.gov.in/", label: "Income Tax portal" },
    ],
    blocks: [
      block("What term insurance actually is", [
        "Term insurance pays a lump sum to your nominees if you die during the policy term. There is usually no maturity “return of premium” story unless you buy a costly variant. You are buying income replacement for dependants — not a savings product.",
        "Endowment / traditional “money-back” plans mix insurance with savings and often deliver weaker cover for the same premium. Beginners who need protection first usually start with pure term, then invest surplus separately (SIP, PPF, FD). This is educational, not a recommendation to buy or cancel any product.",
      ]),
      block("A simple cover estimate (not a formula you must follow)", [
        "A common starting conversation is 10–15× annual take-home income, then adjust for outstanding home loans, young children, and existing EPF/gratuity. Someone with a large home loan and one income in the house often needs more cover than a dual-income household with no debt.",
        "Run your salary numbers on our salary-tax calculator so you know real take-home, not CTC. Do not buy cover based on a WhatsApp “₹1 crore for ₹500” ad without reading the prospectus.",
      ], [
        "List dependants and years of support they may need",
        "Subtract liquid assets you would already leave them",
        "Add large liabilities (home loan balance) you do not want them to inherit as stress",
      ]),
      block("Premium, age, and health — why waiting is expensive", [
        "Premiums rise with age and with health disclosures (smoking, BMI, existing conditions). Buying later is not “the same plan cheaper” — underwriting can load or reject. Online journeys still end in medicals for many tickets.",
        "Compare premium for the same sum assured, term, and payout option. Accidental-death riders and critical-illness add-ons raise cost; beginners can add later once the core cover is in place.",
      ]),
      block("Claim basics families should know", [
        "Keep the policy PDF, premium receipts, and nominee details where your family can find them. Typical claim packs include death certificate, KYC, bank details, and medical records if required. Contested claims often involve non-disclosure of health history — answer the proposal form honestly.",
      ]),
      block("Where this sits next to SIP and tax", [
        "Term cover protects income; SIP/PPF/FD build assets. Do not skip emergency savings to chase a huge sum assured. For tax treatment of premiums and proceeds, confirm current Income Tax rules for the year you file — use our salary-tax guide as a planning aid, then verify on the official portal.",
      ]),
    ],
    faqs: [
      faq(
        "Is term insurance the same as life insurance?",
        "Term is one type of life cover. “Life insurance” in sales talk often means savings-linked plans. Read whether the product pays only on death or also on survival."
      ),
      faq(
        "Can I change nominee later?",
        "Usually yes through a service request with the insurer. Keep acknowledgements."
      ),
      faq(
        "Is this a product offer?",
        "No. ContentVerse India does not sell policies here. Compare on insurer sites or with a licensed intermediary."
      ),
    ],
  }),

  guide({
    slug: "itr-filing-checklist-salaried-india",
    section: "money",
    title: "ITR Filing Checklist for Salaried Indians — Documents & Steps",
    shortTitle: "ITR checklist",
    description:
      "Salaried ITR checklist for India: Form 16, AIS/TIS, 26AS, deductions, and a pre-submit review — educational. Confirm deadlines and forms on the Income Tax portal.",
    keywords: [
      "itr filing checklist salaried",
      "itr documents india",
      "form 16 ais 26as",
      "how to file itr salaried",
      "itr checklist india",
    ],
    readingMinutes: 11,
    clusterId: "salary-tax",
    relatedHref: "/tools/salary-tax-calculator",
    relatedLabel: "Salary tax → then take-home / term tools",
    sources: [
      { href: "https://www.incometax.gov.in/", label: "Income Tax portal" },
      { href: "https://www.incometax.gov.in/iec/foportal/", label: "e-Filing portal" },
    ],
    blocks: [
      block("Before you open the portal", [
        "Collect Form 16 from your employer, Form 16A if you had TDS on interest or other income, bank interest certificates, rent receipts / landlord PAN if claiming HRA under the old regime, and investment proofs you already declared.",
        "Download AIS (Annual Information Statement) and Form 26AS from the Income Tax e-filing ecosystem and match them to your Form 16. Mismatches (missing interest, wrong employer TAN) are a common reason for notices.",
      ], [
        "PAN and Aadhaar linkage status",
        "Bank account for refund (pre-validate if required)",
        "Password-protected Form 16 PDF and salary slips for the year",
      ]),
      block("Pick the right ITR form (high level)", [
        "Most salaried individuals with simple income use ITR-1 (Sahaj) when eligible; capital gains, multiple house properties, or business income can force another form. The portal’s “help me choose” flow is safer than guessing from a blog screenshot.",
        "Old vs new regime: estimate both with our salary-tax calculator, then select the regime the portal allows for your year. Calculator output is not a filed return.",
      ]),
      block("Income lines people forget", [
        "Interest from savings / FD / RD, savings account interest above exemptions (if any under current law), freelance income, and previous employer salary if you switched jobs mid-year. AIS often surfaces these before you do.",
      ]),
      block("Deductions — only what you can prove", [
        "Under the old regime, Section 80C / 80D / HRA / home-loan interest need documents. Under the new regime many deductions are unavailable — do not paste last year’s schedule blindly. See our Section 80C and HRA guides for document lists, then confirm current-year law.",
      ]),
      block("Pre-submit checklist", [
        "Verify tax computed vs TDS + advance tax + self-assessment. Preview the JSON/XML, e-verify within the allowed window, and save the acknowledgement. Late fees and interest rules change — read the portal’s current-year messages, not a viral reel.",
      ], [
        "Name and address match PAN",
        "Employer TAN and salary totals match Form 16 Part B",
        "Interest income matches AIS / bank certificate",
      ]),
    ],
    faqs: [
      faq(
        "Do I need a CA?",
        "Simple salaried returns are often self-filed. Complex capital gains, foreign income, or notices are when professional help is worth it."
      ),
      faq(
        "What if AIS shows wrong interest?",
        "Use the feedback / correction flow on the portal and keep bank statements. Do not ignore it."
      ),
      faq(
        "Is this official advice?",
        "No. Always follow incometax.gov.in for forms, deadlines, and utilities."
      ),
    ],
  }),

  guide({
    slug: "ssc-salary-slip-how-to-read-india",
    section: "jobs",
    title: "How to Read an SSC / Central Govt Salary Slip in India",
    shortTitle: "SSC salary slip",
    description:
      "Read an SSC or central government salary slip: basic pay, allowances, deductions, net pay, and what to check before a loan or Form 16 — educational.",
    keywords: [
      "ssc salary slip explained",
      "how to read government salary slip",
      "basic pay da hra india",
      "central govt payslip components",
      "net salary vs gross govt job",
    ],
    readingMinutes: 10,
    clusterId: "jobs",
    relatedHref: "/tools/take-home-calculator",
    relatedLabel: "Open take-home calculator",
    sources: [
      { href: "https://ssc.gov.in/", label: "SSC" },
      { href: "https://www.incometax.gov.in/", label: "Income Tax portal" },
    ],
    blocks: [
      block("Gross is not what hits your account", [
        "A typical central / SSC-cadre slip shows earnings (basic pay, dearness allowance, HRA, transport, and other allowances) and deductions (PF/NPS, income tax, CGEGIS, professional tax where applicable). Net pay = earnings − deductions for that month.",
        "Offer letters quote Level / Pay Matrix cells; the slip shows the live month after DA revisions and recoveries. Always use the latest slip for loan applications, not the appointment letter CTC.",
      ]),
      block("Line items you should recognise", [
        "Basic pay is the Pay Matrix figure for your level and cell. DA is a percentage of basic (revised periodically). HRA depends on city class X/Y/Z rules in force. Transport allowance may have DA on TA in some structures.",
      ], [
        "Check employee code / PRAN / UAN if printed",
        "Confirm bank account last digits match your salary account",
        "Note “arrears” months separately — they inflate one slip",
      ]),
      block("Deductions that confuse first-timers", [
        "NPS or GPF contributions, income-tax TDS, and insurance schemes reduce net pay even when gross looks healthy. Mid-year DA hikes change both earnings and some deduction bases. Keep every slip for the financial year until Form 16 arrives.",
      ]),
      block("Using the slip for loans and ITR", [
        "Lenders often ask for 3–6 months of slips plus bank credit proof. For ITR, Form 16 should reconcile to the year’s slips; if you changed departments or cities, HRA and TDS can jump. Estimate tax on our salary-tax calculator using realistic taxable components — not the headline “Level 7” number from Telegram groups.",
      ]),
      block("Red flags", [
        "Cash salary without a slip, a PDF with mismatched name/PAN, or a slip that never credits the stated net amount in your bank statement. For recruitment scams, use our govt-jobs guides and only trust official SSC / department portals.",
      ]),
    ],
    faqs: [
      faq(
        "Why does net pay change every few months?",
        "DA revisions, arrears, one-time recoveries, and tax adjustments. Compare two slips side by side."
      ),
      faq(
        "Is HRA taxable?",
        "Rules depend on regime and rent paid. See our HRA documents guide and confirm with Form 16."
      ),
      faq(
        "Where are latest SSC notifications?",
        "Official SSC website and our /jobs/govt hub — not random job forwards."
      ),
    ],
  }),

  guide({
    slug: "epf-pf-withdrawal-rules-india",
    section: "money",
    title: "EPF / PF Withdrawal Rules in India — When You Can Take Money Out",
    shortTitle: "PF withdrawal",
    description:
      "EPF withdrawal in India explained: partial vs final settlement, common purpose codes, UAN steps, and tax cautions — verify live rules on the EPFO member portal.",
    keywords: [
      "epf withdrawal rules india",
      "pf withdrawal online uan",
      "partial pf withdrawal",
      "epf final settlement",
      "pf withdrawal tax",
    ],
    readingMinutes: 12,
    clusterId: "sip-investing",
    relatedHref: "/tools/epf-calculator",
    relatedLabel: "Open EPF calculator",
    sources: [
      { href: "https://unifiedportal-mem.epfindia.gov.in/", label: "EPFO member portal" },
      { href: "https://www.epfindia.gov.in/", label: "EPFO" },
      { href: "https://www.incometax.gov.in/", label: "Income Tax portal" },
    ],
    blocks: [
      block("Partial withdrawal vs final settlement", [
        "Partial withdrawals (advance) are allowed for notified purposes — medical, education, marriage, housing, etc. — with service and amount caps that EPFO updates over time. Final settlement is usually tied to leaving employment and waiting periods / conditions in force.",
        "Never treat EPF as a substitute emergency fund. Keep liquid savings first; use EPF only when the purpose fits and you accept the long-term retirement hit.",
      ]),
      block("What you need before you click claim", [
        "Activated UAN, Aadhaar-seeded and KYC-approved UAN, bank account seeded and verified, and correct employer exit date if you have left the job. Claim forms in the member portal vary by purpose code.",
      ], [
        "Download the passbook and note employee + employer shares",
        "Fix KYC mismatches before raising a claim",
        "Keep previous employment PF history linked under one UAN",
      ]),
      block("Tax and TDS — do not assume “PF is always tax-free”", [
        "Withdrawal tax treatment depends on years of continuous service, the type of withdrawal, and current Income Tax rules. Some early withdrawals attract TDS. Confirm on EPFO / Income Tax FAQs for the year you withdraw — this page is not a tax opinion.",
      ]),
      block("Common delays", [
        "Unverified bank account, Aadhaar name mismatch, employer not marking exit, and pending KYC. Track claim status in the portal; for unresolved cases use EPFO grievance channels with UAN and claim ID.",
      ]),
      block("After withdrawal — rebuild the habit", [
        "If you withdrew for a house or medical emergency, restart contributions via a new job’s EPF or consider whether NPS / PPF / SIP should rebuild the retirement bucket. Compare EPF vs NPS in our sister guide, and project monthly investing with the SIP calculator.",
      ]),
    ],
    faqs: [
      faq(
        "Can I withdraw 100% while still employed?",
        "Usually no for final settlement. Partial advances follow purpose rules. Check the live EPFO member portal."
      ),
      faq(
        "How long does online claim take?",
        "Varies by case quality and bank verification. Track in the portal rather than relying on social-media timelines."
      ),
      faq(
        "Is this EPFO official text?",
        "No. Rules change. Always follow unifiedportal-mem.epfindia.gov.in (or the current official URL)."
      ),
    ],
  }),
];

/** New URLs only (gold-loan already lives in TOP_30_GUIDE_PATHS). */
export const EVERGREEN_PACK_PATHS: { href: string; label: string; intent: string }[] = [
  {
    href: "/guides/money/term-insurance-beginners-india",
    label: "Term insurance for beginners",
    intent: "term insurance india beginners",
  },
  {
    href: "/guides/money/itr-filing-checklist-salaried-india",
    label: "ITR filing checklist (salaried)",
    intent: "itr checklist salaried",
  },
  {
    href: "/guides/jobs/ssc-salary-slip-how-to-read-india",
    label: "How to read SSC salary slip",
    intent: "ssc salary slip explained",
  },
  {
    href: "/guides/money/epf-pf-withdrawal-rules-india",
    label: "EPF / PF withdrawal rules",
    intent: "epf withdrawal india",
  },
];
