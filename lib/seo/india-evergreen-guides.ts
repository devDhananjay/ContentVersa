/**
 * India evergreen guide pack — AdSense-safe money/tools/jobs topics.
 * Seeded as drafts via scripts/seed-india-evergreen.ts or admin.
 */
export type EvergreenGuide = {
  slug: string;
  title: string;
  categorySlug: string;
  searchIntent: string;
  relatedToolHref?: string;
  outline: string[];
};

export const INDIA_EVERGREEN_GUIDES: EvergreenGuide[] = [
  {
    slug: "sip-calculator-india-guide",
    title: "SIP Calculator India: How Systematic Investments Really Work",
    categorySlug: "finance",
    searchIntent: "SIP calculator India explained for beginners",
    relatedToolHref: "/tools/sip-calculator",
    outline: [
      "What is a SIP and why Indians use it",
      "How to use our SIP calculator",
      "Expected returns vs market reality",
      "Common mistakes to avoid",
    ],
  },
  {
    slug: "emi-calculator-home-loan-india",
    title: "Home Loan EMI Calculator India: Plan Before You Borrow",
    categorySlug: "finance",
    searchIntent: "home loan EMI calculator India guide",
    relatedToolHref: "/tools/emi-calculator",
    outline: [
      "EMI formula in plain English",
      "How tenure and rate change monthly cost",
      "Prepayment tips for Indian borrowers",
    ],
  },
  {
    slug: "itr-filing-deadlines-india",
    title: "ITR Filing Deadlines India: Dates, Forms, and Late Fee Basics",
    categorySlug: "finance",
    searchIntent: "ITR filing deadline India current year",
    outline: [
      "Who must file ITR",
      "Key deadlines for salaried vs business",
      "Late fees and revised return basics",
    ],
  },
  {
    slug: "gold-rate-india-how-to-read",
    title: "Gold Rate India: How to Read 22K vs 24K Prices by City",
    categorySlug: "finance",
    searchIntent: "gold rate India 22k 24k city wise",
    relatedToolHref: "/goldverse",
    outline: [
      "22K vs 24K vs making charges",
      "Why city rates differ",
      "HUID and hallmark checklist before buying",
    ],
  },
  {
    slug: "huid-verification-bis-gold-guide",
    title: "HUID Verification Guide: Check BIS Hallmark Gold Online",
    categorySlug: "technology",
    searchIntent: "HUID verification BIS gold India",
    relatedToolHref: "/huid-verification",
    outline: [
      "What HUID means on jewellery",
      "How to verify online on ContentVerse",
      "Red flags when buying gold",
    ],
  },
  {
    slug: "ifsc-code-finder-india-guide",
    title: "IFSC Code Finder India: Transfer Money Without Mistakes",
    categorySlug: "finance",
    searchIntent: "IFSC code finder India bank branch",
    relatedToolHref: "/tools/ifsc-finder",
    outline: [
      "What IFSC is used for",
      "How to find branch IFSC safely",
      "NEFT vs IMPS vs RTGS basics",
    ],
  },
  {
    slug: "pincode-finder-india-postal-guide",
    title: "Pincode Finder India: Locate Post Offices and Delivery Zones",
    categorySlug: "technology",
    searchIntent: "pincode finder India postal code",
    relatedToolHref: "/tools/pincode-finder",
    outline: [
      "How Indian pincodes are structured",
      "Using our pincode tool",
      "Tips for e-commerce addresses",
    ],
  },
  {
    slug: "rto-code-finder-india",
    title: "RTO Code Finder India: Decode Number Plates by City",
    categorySlug: "technology",
    searchIntent: "RTO code finder India vehicle registration",
    relatedToolHref: "/tools/rto-finder",
    outline: [
      "How RTO codes work",
      "Find office details by city",
      "When to use Vahan vs our guide",
    ],
  },
  {
    slug: "fuel-price-today-india-explained",
    title: "Petrol and Diesel Price Today India: Why City Rates Differ",
    categorySlug: "finance",
    searchIntent: "petrol diesel price today India city",
    relatedToolHref: "/tools/fuel-price",
    outline: [
      "Central vs state tax components",
      "How to check today's price",
      "Saving tips for daily commuters",
    ],
  },
  {
    slug: "sarkari-naukri-alert-guide",
    title: "Sarkari Naukri Alerts: How to Track Govt Jobs Without Missing Deadlines",
    categorySlug: "careers",
    searchIntent: "sarkari naukri latest jobs India alerts",
    relatedToolHref: "/jobs",
    outline: [
      "Where official notifications appear",
      "Using ContentVerse Jobs hub",
      "Admit card and result checklist",
    ],
  },
  {
    slug: "upi-expense-tracking-india",
    title: "UPI Expense Tracking India: Turn Screenshots into a Budget",
    categorySlug: "finance",
    searchIntent: "UPI expense tracker PhonePe GPay India",
    relatedToolHref: "/moneyverse/screenshot-scan",
    outline: [
      "Why UPI spends feel invisible",
      "OCR screenshot scan workflow",
      "Monthly budget habits that stick",
    ],
  },
  {
    slug: "bank-statement-analyzer-india",
    title: "Bank Statement Analyzer India: Read PDF Statements Like a Pro",
    categorySlug: "finance",
    searchIntent: "bank statement analyzer PDF India",
    relatedToolHref: "/moneyverse/bank-statement-analyzer",
    outline: [
      "What a good statement analysis shows",
      "Privacy tips before uploading PDFs",
      "Credits, debits, and category insights",
    ],
  },
];
