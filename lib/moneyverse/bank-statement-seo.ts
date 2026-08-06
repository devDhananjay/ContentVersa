export const BANK_STATEMENT_STEPS = [
  {
    step: 1,
    title: "Upload a statement PDF or clear image",
    body: "Use a recent HDFC, SBI, ICICI, Axis, or other Indian bank statement. Password-protected PDFs must be unlocked first.",
  },
  {
    step: 2,
    title: "Review extracted credits and debits",
    body: "Check categories, recurring payments, and bank charges. Fix any misreads before you export.",
  },
  {
    step: 3,
    title: "Download CSV for your records",
    body: "Export transactions for budgeting spreadsheets. Results are informational — not tax or financial advice.",
  },
] as const;

export const BANK_STATEMENT_FAQ = [
  {
    q: "Is my bank statement stored on ContentVerse India?",
    a: "Analyses run for your session under your account quota. Do not upload statements on a shared device. Prefer redacting account numbers when possible.",
  },
  {
    q: "Which banks work?",
    a: "Most Indian PDF/image statements work when text is readable. Scanned poor-quality photos may fail — try a sharper export from net banking.",
  },
  {
    q: "Is this official banking software?",
    a: "No. It is an independent MoneyVerse utility for personal expense awareness. Always rely on your bank for balances and disputes.",
  },
] as const;
