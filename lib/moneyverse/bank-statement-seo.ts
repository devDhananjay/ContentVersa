import { SITE } from "@/lib/seo";

export const MONEYVERSE_BANK_STATEMENT_PATH = "/moneyverse/bank-statement-analyzer";

export const BANK_STATEMENT_KEYWORDS = [
  "bank statement analyzer india",
  "bank statement analysis online",
  "AI bank statement analyzer",
  "bank statement expense analyzer",
  "PDF bank statement to CSV",
  "HDFC statement analyzer",
  "SBI bank statement PDF",
  "cash flow analysis India",
  "recurring payment detector",
] as const;

/** Long-form intro — indexable editorial layer above the upload tool. */
export const BANK_STATEMENT_EDITORIAL = {
  lead: "A bank statement is the most honest picture of your month — salary credits, UPI debits, EMIs, cash withdrawals and bank charges. Reading every line by hand is slow. MoneyVerse Bank Statement Analyzer helps you turn an Indian bank PDF or clear statement image into categorised credits and debits, recurring payments, charge highlights and a CSV you can keep for budgeting.",
  paragraphs: [
    "Upload an unlocked PDF or a sharp image of your statement. The tool extracts transaction text, groups spending into practical categories, flags likely recurring payments (rent, SIPs, subscriptions) and surfaces common bank charges where detectable. You can review the table and download CSV for Excel or Google Sheets.",
    "This is personal cash-flow awareness — not tax filing software, not a loan underwriting product, and not your bank. Figures can misread on poor scans or unusual formats. Always match totals with your net banking balance before you make money decisions. ContentVerse India does not sell your statement to lenders or advertisers.",
    "Use Bank Statement Analyzer when you want a full period overview. For a single UPI success screen, use Screenshot Scan (OCR) instead — it is faster for one receipt. For SIP, CIBIL and tax concepts, read our Money guides; this tool does not replace a CA or your bank’s dispute desk.",
  ],
  whenToUse: [
    {
      title: "Use the analyzer when…",
      items: [
        "You downloaded a monthly/quarterly statement PDF from SBI, HDFC, ICICI, Axis or similar",
        "You want category totals, recurring EMIs/SIPs and a CSV export",
        "You are preparing a personal budget or checking surprise charges",
      ],
    },
    {
      title: "Do not rely on it for…",
      items: [
        "Official loan, visa or tax submissions (use bank-stamped statements only)",
        "Password-locked PDFs (unlock in your bank app first)",
        "Blurry phone photos of paper statements — export PDF from net banking instead",
      ],
    },
  ],
  privacy: [
    "Sign in before upload. Analyses count toward your free quota (admins unlimited).",
    "Prefer statements with account numbers partially masked when your bank allows it.",
    "Do not upload on a shared PC; clear local PDF downloads after use.",
    "Results are informational for your session — not stored as a public document and not financial, tax or investment advice.",
    "ContentVerse India is not affiliated with RBI or any bank. For balance disputes contact your bank only.",
  ],
  related: [
    { href: "/moneyverse", label: "MoneyVerse expense tracker" },
    { href: "/moneyverse/screenshot-scan", label: "Screenshot Scan (OCR)" },
    {
      href: "/guides/money/bank-statement-analysis-loan-india",
      label: "Guide: bank statements and loans",
    },
    {
      href: "/guides/money/sip-calculator-india-beginners-guide",
      label: "SIP beginners guide",
    },
    { href: "/guides/money", label: "All money guides" },
  ],
} as const;

export const BANK_STATEMENT_STEPS = [
  {
    step: 1,
    title: "Export an unlocked statement",
    body: "From net banking or your bank app, download a recent PDF. Remove any password lock first. Clear scans of statement pages also work if text is readable.",
  },
  {
    step: 2,
    title: "Upload in MoneyVerse",
    body: "Sign in, open Bank Statement Analyzer, and upload the PDF or image. Wait while AI extracts credits, debits and merchant-like descriptions.",
  },
  {
    step: 3,
    title: "Review categories and recurring items",
    body: "Check suggested categories, recurring payments and bank charges. Fix obvious misreads before you trust the totals.",
  },
  {
    step: 4,
    title: "Compare with your bank balance",
    body: "Sanity-check opening/closing feel against net banking. This tool assists awareness — your bank remains the source of truth.",
  },
  {
    step: 5,
    title: "Download CSV for your records",
    body: "Export transactions for spreadsheets or personal archives. Do not submit MoneyVerse output as an official bank document.",
  },
] as const;

export const BANK_STATEMENT_FAQ = [
  {
    q: "Is my bank statement stored permanently on ContentVerse India?",
    a: "Analyses run under your signed-in account and free quota. Treat uploads as sensitive: avoid shared devices and redact account numbers when possible. Do not use this tool for documents you must keep only inside your bank’s portal.",
  },
  {
    q: "Which banks work?",
    a: "Most Indian PDF or image statements work when text is readable — including common formats from SBI, HDFC, ICICI, Axis and others. Poor phone photos of folded paper often fail; use a sharp PDF export from net banking.",
  },
  {
    q: "Is this official banking software?",
    a: "No. It is an independent MoneyVerse utility for personal expense and cash-flow awareness. Always rely on your bank for balances, disputes, loans and KYC.",
  },
  {
    q: "How many free analyses do I get?",
    a: "Signed-in users typically get a small free monthly quota (shown on the tool). Admin accounts are unlimited. Quota resets per the product rules on the page.",
  },
  {
    q: "Can I use the CSV for a loan or visa application?",
    a: "No. Lenders and embassies need official bank statements. MoneyVerse CSV is for your own budgeting and review only.",
  },
  {
    q: "Password-protected PDFs?",
    a: "Unlock the PDF in your bank app or PDF reader first, then upload. The analyzer cannot bypass bank encryption.",
  },
  {
    q: "Screenshot Scan vs Bank Statement Analyzer?",
    a: "Screenshot Scan reads one UPI or payment success image into a single expense. Bank Statement Analyzer processes a full statement period for credits, debits, recurring items and CSV export.",
  },
  {
    q: "Is this financial advice?",
    a: "No. Output is informational. For tax, investment or debt decisions consult a qualified professional and your bank.",
  },
] as const;

export function bankStatementPageUrl() {
  return `${SITE.url}${MONEYVERSE_BANK_STATEMENT_PATH}`;
}

export function bankStatementWebAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${bankStatementPageUrl()}#webapp`,
    name: "MoneyVerse Bank Statement Analyzer",
    description:
      "Upload an Indian bank statement PDF or image. AI extracts credits, debits, categories, recurring payments and CSV export for personal cash-flow awareness.",
    url: bankStatementPageUrl(),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: "en-IN",
    isPartOf: { "@id": `${SITE.url}/#website` },
    provider: { "@id": `${SITE.url}/#organization` },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "Free analyses within signed-in user quota",
    },
    featureList: [
      "Bank statement PDF analysis",
      "Credit and debit categorisation",
      "Recurring payment detection",
      "Bank charge highlights",
      "CSV export",
    ],
  };
}

export function bankStatementFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${bankStatementPageUrl()}#faq`,
    mainEntity: BANK_STATEMENT_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function bankStatementBreadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "MoneyVerse",
        item: `${SITE.url}/moneyverse`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Bank Statement Analyzer",
        item: bankStatementPageUrl(),
      },
    ],
  };
}
