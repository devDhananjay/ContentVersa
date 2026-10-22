/**
 * High-CPC cluster pack (Oct 2026) — insurance, personal loan, credit card, tax,
 * banking exam + salary, plus X vs Y comparison tables advertisers bid on.
 */
import type {
  GuideArticle,
  GuideBlock,
  GuideFaq,
  GuideSectionSlug,
  GuideSource,
  GuideTable,
} from "./registry";

function block(
  heading: string,
  paragraphs: string[],
  extras?: { bullets?: string[]; table?: GuideTable }
): GuideBlock {
  return {
    heading,
    paragraphs,
    ...(extras?.bullets?.length ? { bullets: extras.bullets } : {}),
    ...(extras?.table ? { table: extras.table } : {}),
  };
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

const IT_PORTAL: GuideSource = {
  href: "https://www.incometax.gov.in/",
  label: "Income Tax portal",
};
const IRDAI: GuideSource = {
  href: "https://www.irdai.gov.in/",
  label: "IRDAI",
};
const RBI: GuideSource = {
  href: "https://www.rbi.org.in/",
  label: "RBI",
};
const IBPS: GuideSource = {
  href: "https://www.ibps.in/",
  label: "IBPS",
};
const SSC: GuideSource = {
  href: "https://ssc.gov.in/",
  label: "SSC",
};

export const HIGH_CPC_PACK_OCT_2026: GuideArticle[] = [
  guide({
    slug: "health-insurance-india-beginners",
    section: "money",
    title: "Health Insurance in India — Cover, Waiting Periods & Buying Mistakes (2026)",
    shortTitle: "Health insurance basics",
    description:
      "Health insurance for Indian families: sum insured, waiting periods, cashless vs reimbursement, and mistakes that leave claims unpaid — educational, not a policy sale.",
    keywords: [
      "health insurance india beginners",
      "mediclaim waiting period",
      "cashless health insurance india",
      "family floater vs individual",
      "health insurance claim documents",
    ],
    readingMinutes: 13,
    clusterId: "salary-tax",
    relatedHref: "/tools/take-home-calculator",
    relatedLabel: "Estimate take-home first",
    sources: [
      IRDAI,
      { href: "https://www.policyholder.gov.in/", label: "Policyholder.gov.in" },
      IT_PORTAL,
    ],
    blocks: [
      block("What you are actually buying", [
        "A retail health policy reimburses or pays hospital costs up to a sum insured, subject to waiting periods, exclusions, and sub-limits. It is not a savings plan and it is not a substitute for an emergency fund. IRDAI-regulated insurers publish prospectuses — read exclusions before the brochure headline.",
        "Corporate group cover from an employer often has lower waiting periods but can stop when you leave the job. Many households keep a personal base policy and treat employer cover as extra, not the only layer.",
      ]),
      block("Cashless vs reimbursement (quick compare)", [
        "Cashless means the hospital network settles eligible bills with the insurer after pre-authorisation. Reimbursement means you pay first and claim later with bills and discharge summary. Network lists change — confirm the hospital before admission when possible.",
      ], {
        table: {
          caption: "Health claim path — India 2026 (illustrative)",
          headers: ["Dimension", "Cashless", "Reimbursement"],
          rows: [
            ["When you pay", "Mostly insurer → hospital (after approval)", "You pay, then claim"],
            ["Speed at admission", "Needs pre-auth; delays if docs incomplete", "Admission not blocked by insurer"],
            ["Paperwork", "Hospital + TPA / insurer portal", "You upload bills, reports, KYC"],
            ["Best for", "Planned / network hospitals", "Non-network or emergency elsewhere"],
          ],
        },
      }),
      block("Waiting periods and exclusions that surprise first-time buyers", [
        "Most plans impose waiting periods for pre-existing diseases and specific treatments (for example maternity or listed procedures). Day-one cover for everything is rare outside specialised products. Room-rent caps and disease-wise sub-limits can leave a large unpaid bill even when the sum insured looks big.",
      ], {
        bullets: [
          "Check PED waiting period in years, not marketing “day 1” ads",
          "Ask whether room rent is capped as a % of sum insured",
          "Confirm restoration benefit rules after a claim year",
          "Keep proposal disclosures honest — non-disclosure kills claims",
        ],
      }),
      block("How this pairs with salary and term cover", [
        "Health insurance protects medical cashflow; term insurance protects income if you die. Run take-home on our calculator so premium + EMI still leave a buffer. Tax treatment of premiums under current sections changes with budgets — verify on the Income Tax portal for the year you claim.",
      ]),
    ],
    faqs: [
      faq(
        "Is Ayushman Bharat the same as private mediclaim?",
        "No. PM-JAY is an eligibility-based public scheme. Private retail policies are purchased products with different rules. See our Ayushman guide under Schemes."
      ),
      faq(
        "Family floater or individual?",
        "Floaters share one sum insured across members — often cheaper, but one large claim can exhaust cover for everyone. Individual policies isolate risk. Not a recommendation."
      ),
      faq("Does ContentVerse sell policies?", "No. Compare on insurer sites or licensed intermediaries; confirm with IRDAI / insurer disclosures."),
    ],
  }),

  guide({
    slug: "personal-loan-eligibility-documents-india",
    section: "money",
    title: "Personal Loan in India — Eligibility, Documents & EMI Reality Check (2026)",
    shortTitle: "Personal loan checklist",
    description:
      "Personal loan eligibility in India: income proof, FOIR, CIBIL, documents banks ask for, and how to stress-test EMI before you apply — educational, not a lender offer.",
    keywords: [
      "personal loan eligibility india",
      "personal loan documents salaried",
      "personal loan cibil score",
      "foir personal loan",
      "personal loan emi calculator",
    ],
    readingMinutes: 12,
    clusterId: "emi-loans",
    relatedHref: "/tools/emi-calculator",
    relatedLabel: "Open EMI calculator",
    sources: [
      RBI,
      { href: "https://www.rbi.org.in/commonman/English/Scripts/Notification.aspx", label: "RBI notifications" },
    ],
    blocks: [
      block("Who usually qualifies (high level)", [
        "Lenders look at stable income, existing EMIs, bureau score, and employment type. Salaried applicants with salary credits in a bank statement often clear faster than thin-file freelancers — but “guaranteed approval” WhatsApp ads are a red flag. RBI-regulated lenders must disclose key facts; read the Key Fact Statement before you e-sign.",
      ], {
        bullets: [
          "Age and citizenship / residency rules as stated by the lender",
          "Minimum net income or salary credit history (often 3–6 months)",
          "Bureau score and recent enquiry volume",
          "Existing EMI + proposed EMI under FOIR / debt-burden caps",
        ],
      }),
      block("Document pack most salaried applicants prepare", [
        "Keep KYC (PAN, Aadhaar / passport / voter ID as accepted), salary slips, Form 16 or ITRs when asked, and bank statements showing salary credits. Name mismatches across PAN and bank account delay disbursal more than people expect.",
      ], {
        table: {
          caption: "Personal loan docs — typical salaried pack (verify with lender)",
          headers: ["Document", "Why they ask", "Common fail"],
          rows: [
            ["PAN + photo KYC", "Identity & tax ID", "Name spelling ≠ bank account"],
            ["3–6 month salary slips", "Income stability", "Edited PDFs / mismatched net"],
            ["Bank statement (salary A/c)", "Credit trail", "Cash deposits instead of salary"],
            ["Address proof", "Contactability", "Expired utility bill"],
            ["Employment proof", "Job continuity", "Offer letter without joining"],
          ],
        },
      }),
      block("EMI reality check before you apply", [
        "Run the EMI on our calculator at the rate and tenure the lender quotes — then add processing fee and insurance if bundled. Stress-test a 1–2% rate rise if the loan is floating. Prefer a gold loan only when you understand LTV and pledge risk (see our gold vs personal loan guide).",
      ]),
      block("After disbursal — protect your score", [
        "Autopay from the salary account, avoid stacking multiple personal loans in the same month, and do not ignore bounce charges. Multiple hard enquiries in a short window can suppress scores temporarily — apply when documents are ready, not “just to check”.",
      ]),
    ],
    faqs: [
      faq(
        "What FOIR means?",
        "Fixed Obligation to Income Ratio — how much of income already goes to EMIs/obligations. Lenders set their own caps. Not a public universal number."
      ),
      faq(
        "Prepayment allowed?",
        "Often yes after a lock-in, sometimes with a fee. Read the sanction letter; do not rely on sales chat screenshots."
      ),
      faq("Is this a loan offer?", "No. ContentVerse India is not a lender here."),
    ],
  }),

  guide({
    slug: "credit-card-vs-personal-loan-india-2026",
    section: "money",
    title: "Credit Card vs Personal Loan India 2026 — Which Borrowing Fits?",
    shortTitle: "Card vs personal loan",
    description:
      "Credit card vs personal loan in India (2026): interest, fees, tenure, and when revolving credit costs more than a term loan — educational comparison table included.",
    keywords: [
      "credit card vs personal loan india",
      "credit card interest vs personal loan",
      "when to use personal loan instead of credit card",
      "emi on credit card vs personal loan",
      "india borrowing comparison 2026",
    ],
    readingMinutes: 11,
    clusterId: "emi-loans",
    relatedHref: "/tools/emi-calculator",
    relatedLabel: "Compare EMIs",
    sources: [RBI, { href: "https://www.rbi.org.in/", label: "RBI consumer education" }],
    blocks: [
      block("Same problem, different cost engines", [
        "Both are unsecured borrowing for many borrowers, but pricing and behaviour differ. Cards are built for revolving short-term spend; personal loans amortise a fixed principal over months. Paying only the card minimum due is usually the expensive path — see our minimum-due guide.",
      ], {
        table: {
          caption: "Credit card vs personal loan — India 2026 (illustrative)",
          headers: ["Factor", "Credit card", "Personal loan"],
          rows: [
            ["Typical use", "Spend / short float", "Larger lump, fixed plan"],
            ["Interest style", "Revolving; high if unpaid", "Reducing / fixed schedule"],
            ["Tenure clarity", "Open-ended if revolving", "Fixed months in sanction"],
            ["Fees to watch", "Joining, late, over-limit, forex", "Processing, foreclosure, bounce"],
            ["Bureau impact", "Utilisation + payment history", "New loan + payment history"],
            ["Often cheaper when…", "Full pay by due date", "You need > a few months to clear"],
          ],
        },
      }),
      block("When a card usually wins", [
        "You can clear the statement in full every month, you want reward/cashback economics you actually use, or you need a short float until salary credit. Interest-free periods only help if you do not carry a balance.",
      ]),
      block("When a personal loan usually wins", [
        "You already carry card balances at revolving rates, you need a defined payoff date, or the amount is large enough that card EMI conversion still looks expensive after fees. Run both EMIs side by side on the calculator before you convert.",
      ]),
      block("Hybrid trap to avoid", [
        "Taking a personal loan and then maxing cards again doubles FOIR. Treat the loan as debt reduction, not a licence for new revolving spend.",
      ]),
    ],
    faqs: [
      faq(
        "Card EMI vs personal loan EMI?",
        "Card EMI is still a credit-card product with its own fee schedule. Compare total cost, not only monthly rupees."
      ),
      faq(
        "Does either improve CIBIL automatically?",
        "On-time payments help; high utilisation and new hard pulls can hurt short term. See our CIBIL guide."
      ),
    ],
  }),

  guide({
    slug: "credit-card-rewards-vs-cashback-india-2026",
    section: "money",
    title: "Credit Card Rewards vs Cashback India 2026 — Which Pays You Back?",
    shortTitle: "Rewards vs cashback",
    description:
      "Rewards vs cashback credit cards in India (2026): milestone traps, fuel surcharge, lounge maths, and when “points” lose to flat cashback — comparison table inside.",
    keywords: [
      "rewards vs cashback credit card india",
      "best cashback card india comparison",
      "credit card milestone fees",
      "fuel surcharge waiver india card",
      "lounge access worth it india",
    ],
    readingMinutes: 10,
    clusterId: "emi-loans",
    relatedHref: "/guides/money/credit-card-minimum-due-india",
    relatedLabel: "Credit card minimum due guide",
    sources: [RBI],
    blocks: [
      block("Two ways cards “pay” you", [
        "Cashback credits a % of eligible spend as statement credit or wallet cash. Rewards give points that convert to flights, vouchers, or catalogue items — often with caps, accelerated categories, and devaluation risk. Neither beats paying the bill in full.",
      ], {
        table: {
          caption: "Rewards vs cashback — India 2026 snapshot",
          headers: ["Lens", "Cashback", "Rewards / points"],
          rows: [
            ["Clarity", "Easy % maths", "Needs earn × burn rate"],
            ["Best spenders", "Predictable monthly categories", "Travel / partner ecosystems"],
            ["Hidden cost", "Caps, excluded categories", "Milestones, fuel, joining fee"],
            ["Devaluation risk", "Low", "Higher (partner changes)"],
            ["Tax / GST notes", "Follow card T&Cs + IT rules", "Same — rewards are not “free income” advice"],
          ],
        },
      }),
      block("Do the lounge / milestone maths", [
        "Annual fees only make sense if you clear milestones you would hit anyway — not spend you invent for points. Lounge visits have a cash value; if you fly twice a year, a high fee card can still lose to a simple cashback card plus UPI.",
      ]),
      block("Link back to borrowing behaviour", [
        "Rewards never justify revolving balances. If you carry dues, fix that with a payoff plan or personal loan comparison first — then pick a card product.",
      ]),
    ],
    faqs: [
      faq(
        "Are reward points taxable?",
        "Treatment can depend on facts and current law. Confirm with a CA / Income Tax guidance — we do not give tax advice."
      ),
      faq("Is this a card recommendation?", "No. Issuers change T&Cs; read the official MITC."),
    ],
  }),

  guide({
    slug: "old-vs-new-tax-regime-india-2026",
    section: "money",
    title: "Old vs New Tax Regime India 2026 — Side-by-Side Comparison",
    shortTitle: "Old vs new regime",
    description:
      "Old vs new tax regime India 2026: deductions, slabs mindset, and a comparison table to decide with numbers — verify on the Income Tax portal before you file.",
    keywords: [
      "old vs new tax regime 2026",
      "new tax regime vs old india",
      "which tax regime is better salaried",
      "80c new regime india",
      "salary tax regime comparison",
    ],
    readingMinutes: 12,
    clusterId: "salary-tax",
    relatedHref: "/tools/salary-tax-calculator",
    relatedLabel: "Compare on salary-tax calculator",
    sources: [IT_PORTAL, { href: "https://www.incometax.gov.in/iec/foportal/", label: "e-Filing portal" }],
    blocks: [
      block("What actually changes between regimes", [
        "The new regime generally uses revised slab structures with fewer common deductions; the old regime keeps many chapter-VIA style claims (when eligible) but can leave less room after those claims. Budgets change rates and rebates — treat any blog table as educational until you match the live utility on incometax.gov.in.",
      ], {
        table: {
          caption: "Old vs new tax regime — India 2026 planning lens",
          headers: ["Dimension", "Old regime (typical)", "New regime (typical)"],
          rows: [
            ["Common deductions (80C, etc.)", "Often available if eligible", "Many popular ones restricted / N.A."],
            ["HRA exemption", "Often relevant if claiming", "Usually not the planning lever"],
            ["Simplicity", "More proofs & declarations", "Fewer moving parts for many"],
            ["Who often compares carefully", "High 80C + HRA + home loan interest", "Few deductions, cleaner payslip"],
            ["How to decide", "Estimate both with Form 16 inputs", "Same — then confirm on portal"],
          ],
        },
      }),
      block("A practical decision sequence", [
        "Pull Form 16 / salary structure. List deductions you truly use (not aspirational SIPs you never started). Run both regimes on our salary-tax calculator. Pick the lower tax estimate, then re-check on the official portal utilities for the assessment year you will file.",
      ], {
        bullets: [
          "Include standard deduction as currently notified for your year",
          "Do not double-count employer NPS vs your 80CCD claims",
          "Switching rules mid-year can be constrained — read portal help",
          "ITR checklist: Form 16, AIS/TIS, 26AS before submit",
        ],
      }),
      block("Related money links", [
        "Use the ITR checklist guide for documents, HRA and 80C guides for deduction hygiene, and take-home calculator for monthly cashflow after TDS assumptions.",
      ]),
    ],
    faqs: [
      faq(
        "Can I switch every year?",
        "Rules differ for business income vs salaried-only profiles. Confirm the live FAQ on the Income Tax portal for your case."
      ),
      faq(
        "Is the calculator a filed return?",
        "No. It is a planning aid. File only on the official e-Filing portal."
      ),
    ],
  }),

  guide({
    slug: "term-vs-endowment-insurance-india-2026",
    section: "money",
    title: "Term vs Endowment Insurance India 2026 — Protection or Savings Mix?",
    shortTitle: "Term vs endowment",
    description:
      "Term vs endowment / traditional life plans in India (2026): cover per rupee of premium, returns opacity, and when “money-back” costs you protection — comparison table included.",
    keywords: [
      "term vs endowment insurance india",
      "term plan vs traditional plan",
      "money back policy vs term",
      "life insurance comparison india 2026",
      "pure term vs endowment",
    ],
    readingMinutes: 11,
    clusterId: "salary-tax",
    relatedHref: "/tools/term-cover-calculator",
    relatedLabel: "Estimate term cover need",
    sources: [IRDAI, { href: "https://www.policyholder.gov.in/", label: "Policyholder.gov.in" }],
    blocks: [
      block("Two products, two jobs", [
        "Term insurance buys a large death benefit for a relatively lower premium. Endowment / many traditional “money-back” plans mix protection with a savings-like maturity story — cover per premium rupee is often thinner. Beginners who need income replacement for dependants usually compare pure term first, then invest surplus separately (SIP, PPF, FD).",
      ], {
        table: {
          caption: "Term vs endowment — India 2026 comparison",
          headers: ["Factor", "Pure term", "Endowment / traditional mix"],
          rows: [
            ["Primary job", "Death cover", "Cover + maturity / money-back story"],
            ["Cover per ₹ premium", "Usually higher", "Often lower for same premium"],
            ["Returns clarity", "N/A (not an investment)", "Illustrations ≠ guarantees"],
            ["Flexibility", "Riders optional later", "Harder to unbundle"],
            ["Common fit", "Dependants + income risk", "Forced saving preference (debate)"],
          ],
        },
      }),
      block("How to compare without a sales pitch", [
        "Fix sum assured and policy term first. Compare premiums for that cover. Read what happens if you stop premiums early. Check claim settlement disclosures and exclusions. Use our term-cover calculator for a need estimate, then verify quotes on insurer sites.",
      ]),
      block("Tax and “80C selling”", [
        "Premium eligibility under tax sections changes with law and product type. Do not buy a weak-cover plan only because someone said “80C”. See Section 80C and salary-tax guides, then confirm on the Income Tax portal.",
      ]),
    ],
    faqs: [
      faq(
        "Is ULIP the same as endowment?",
        "No. ULIPs are market-linked with different charge structures. Read the product category on the benefit illustration."
      ),
      faq("Does ContentVerse sell insurance?", "No."),
    ],
  }),

  guide({
    slug: "sip-vs-fd-india-2026",
    section: "money",
    title: "SIP vs FD India 2026 — Growth Risk or Deposit Certainty?",
    shortTitle: "SIP vs FD",
    description:
      "SIP vs fixed deposit India 2026: volatility, liquidity, tax lenses, and a comparison table for goal matching — educational, not investment advice.",
    keywords: [
      "sip vs fd india 2026",
      "mutual fund sip vs fixed deposit",
      "fd or sip which is better",
      "sip vs bank fd comparison",
      "india investment comparison 2026",
    ],
    readingMinutes: 10,
    clusterId: "sip-investing",
    relatedHref: "/tools/sip-calculator",
    relatedLabel: "Open SIP calculator",
    sources: [
      { href: "https://www.sebi.gov.in/", label: "SEBI" },
      RBI,
      { href: "https://www.nseindia.com/", label: "NSE" },
    ],
    blocks: [
      block("Different jobs on the same household balance sheet", [
        "FDs aim for more predictable rupee outcomes with bank/NBFC credit risk and premature-break costs. SIPs in market funds aim for long-horizon growth with mark-to-market volatility. Many families use both: FD for near goals, SIP for long goals.",
      ], {
        table: {
          caption: "SIP vs FD — India 2026 comparison",
          headers: ["Lens", "Bank FD", "Equity/hybrid SIP (typical)"],
          rows: [
            ["Return path", "Contracted / notified rate style", "Market-linked, not promised"],
            ["Volatility", "Low day-to-day", "Can be high short term"],
            ["Liquidity", "Break rules + rate cut risk", "Redeem per scheme rules"],
            ["Horizon fit", "Months to a few years often", "Multi-year goals usually"],
            ["Tax lens", "Interest taxed as applicable", "Capital gains rules as applicable"],
            ["Tooling here", "FD calculator", "SIP calculator"],
          ],
        },
      }),
      block("A simple allocation heuristic (not advice)", [
        "Money you need within ~1–3 years often stays closer to deposits / liquid buffers. Money you will not touch for 7+ years is where people historically consider SIPs — after emergency funds and insurance basics. Run numbers on both calculators; do not chase last year’s fund return chart.",
      ]),
      block("Related reads", [
        "FD vs RD for deposit style cashflows, PPF for long notified-rate savings, and “when to pause a SIP” if cashflow breaks.",
      ]),
    ],
    faqs: [
      faq(
        "Is SIP safer than FD?",
        "No — different risk. SIP market value can fall. FD has credit and reinvestment considerations. Not personalised advice."
      ),
      faq("DICGC on FDs?", "Deposit insurance limits apply at entity level — read DICGC / bank disclosures."),
    ],
  }),

  guide({
    slug: "ibps-banking-exam-salary-structure-india",
    section: "jobs",
    title: "IBPS Banking Exam & Salary Structure India — Clerk, PO & What Payslips Show",
    shortTitle: "IBPS exam & salary",
    description:
      "IBPS banking exams in India: Clerk vs PO path, how to read salary / in-hand estimates, and document checks — confirm notifications only on ibps.in. Educational.",
    keywords: [
      "ibps salary structure",
      "ibps po salary in hand",
      "ibps clerk vs po",
      "banking exam salary india",
      "ibps notification checklist",
    ],
    readingMinutes: 12,
    clusterId: "jobs",
    relatedHref: "/tools/take-home-calculator",
    relatedLabel: "Estimate take-home",
    sources: [
      IBPS,
      SSC,
      { href: "https://www.sbi.co.in/web/careers", label: "SBI careers (example bank)" },
      IT_PORTAL,
    ],
    blocks: [
      block("IBPS is a process, not a single “bank job”", [
        "The Institute of Banking Personnel Selection runs common recruitment processes for participating public-sector banks (and related posts as notified). Your joining bank, posting, and exact pay depend on the CRP you clear and the bank that allots you — always read the current notification PDF on ibps.in, not Telegram forwards.",
      ]),
      block("Clerk vs PO — role and pay lens", [
        "Clerical cadres and Probationary Officer / Management Trainee paths differ in responsibility, exam stages, and pay scales. Gross pay includes basic + allowances that change with DA and location; in-hand is lower after PF/NPS, tax, and other deductions.",
      ], {
        table: {
          caption: "IBPS Clerk vs PO — planning comparison (illustrative)",
          headers: ["Lens", "Clerk (typical CRP)", "PO / MT (typical CRP)"],
          rows: [
            ["Exam intensity", "Still multi-stage; check notice", "Often tougher + interview"],
            ["Role flavour", "Branch operations focus", "Officer / supervisory track"],
            ["Pay expectation", "Lower band than PO", "Higher band; still not “CTC WhatsApp”"],
            ["What to verify", "Vacancies, dates, language papers", "Same + interview / GD rules"],
            ["Salary proof later", "Offer + payslips", "Offer + payslips"],
          ],
        },
      }),
      block("How to estimate in-hand without fake CTC images", [
        "Start from basic + DA + HRA/CCA as published in the joining bank’s wage revision / offer — then subtract statutory deductions. Our take-home and salary-tax calculators are planning aids; they are not IBPS or bank HR tools. For reading a government-style slip later, see the SSC salary-slip guide.",
      ], {
        bullets: [
          "Ignore “₹1 lakh in-hand guaranteed” creatives",
          "Confirm city of posting before HRA assumptions",
          "Probation rules can affect increments",
          "Keep every offer letter and first 6 slips for loans / ITR",
        ],
      }),
      block("Notification checklist (anti-scam)", [
        "Download only from ibps.in (or the bank’s career page for bank-specific drives). Check fees payment only on official gateways. Nobody from “IBPS HR” asks for money on WhatsApp to “confirm joining”.",
      ]),
    ],
    faqs: [
      faq(
        "Is SBI PO the same as IBPS PO?",
        "SBI often runs its own process. Read that bank’s careers page. IBPS CRPs cover participating banks as listed in each notice."
      ),
      faq(
        "Where do results come from?",
        "Only official IBPS / bank result links. See our sarkari result vs scorecard guide for PDF hygiene."
      ),
      faq("Does ContentVerse recruit for banks?", "No."),
    ],
  }),
];

/** Featured hub paths for this high-CPC pack. */
export const HIGH_CPC_PACK_PATHS: { href: string; label: string; intent: string }[] = [
  {
    href: "/guides/money/health-insurance-india-beginners",
    label: "Health insurance beginners",
    intent: "health insurance india beginners",
  },
  {
    href: "/guides/money/personal-loan-eligibility-documents-india",
    label: "Personal loan eligibility & documents",
    intent: "personal loan eligibility india",
  },
  {
    href: "/guides/money/credit-card-vs-personal-loan-india-2026",
    label: "Credit card vs personal loan 2026",
    intent: "credit card vs personal loan india",
  },
  {
    href: "/guides/money/credit-card-rewards-vs-cashback-india-2026",
    label: "Rewards vs cashback cards 2026",
    intent: "rewards vs cashback credit card",
  },
  {
    href: "/guides/money/old-vs-new-tax-regime-india-2026",
    label: "Old vs new tax regime 2026",
    intent: "old vs new tax regime 2026",
  },
  {
    href: "/guides/money/term-vs-endowment-insurance-india-2026",
    label: "Term vs endowment 2026",
    intent: "term vs endowment india",
  },
  {
    href: "/guides/money/sip-vs-fd-india-2026",
    label: "SIP vs FD 2026",
    intent: "sip vs fd india 2026",
  },
  {
    href: "/guides/jobs/ibps-banking-exam-salary-structure-india",
    label: "IBPS exam & salary structure",
    intent: "ibps salary structure",
  },
];
