import { SITE } from "@/lib/seo";

export const MONEYVERSE_SCREENSHOT_SCAN_PATH = "/moneyverse/screenshot-scan";

export const SCREENSHOT_SCAN_OCR_KEYWORDS = [
  "UPI screenshot OCR",
  "payment screenshot scanner",
  "expense OCR India",
  "UPI receipt scan",
  "PhonePe screenshot to expense",
  "Google Pay screenshot OCR",
  "Paytm payment screenshot scan",
  "automatic expense entry from screenshot",
  "OCR expense tracker India",
  "MoneyVerse screenshot scan",
] as const;

/** Long-form intro — indexable editorial layer above the upload tool. */
export const SCREENSHOT_SCAN_EDITORIAL = {
  lead: "Most Indians pay with UPI several times a day — chai, cab, kirana, rent. Logging each payment by hand is the reason expense trackers get abandoned. Screenshot Scan (OCR) turns a payment success screen into a draft expense so your MoneyVerse month stays honest without typing every rupee.",
  paragraphs: [
    "When you upload a clear PhonePe, Google Pay, Paytm, BHIM or bank-app success screenshot, on-device OCR plus AI vision reads the amount, payee or merchant name, and payment method. MoneyVerse suggests a category (food, travel, bills, shopping, and so on). You still confirm every field before anything is saved — the tool drafts; you decide.",
    "Use OCR when you have a single payment proof and want it in this month’s tracker in under a minute. Prefer manual entry when the screen is cropped, blurred, or shows a pending/failed payment. Prefer the Bank Statement Analyzer when you need a whole month of credits and debits from a PDF, not one UPI ping.",
    "This page is an educational MoneyVerse utility from ContentVerse India. It is not a bank, UPI app, or payment gateway. Extracted text can misread merchants or amounts — always review before saving. Do not upload screenshots that show full account numbers, OTPs, or cards on a shared computer.",
  ],
  whenToUse: [
    {
      title: "Use screenshot OCR when…",
      items: [
        "You just paid on PhonePe / GPay / Paytm and want that spend in MoneyVerse today",
        "You have one clear success screen (amount + payee visible)",
        "You are catching up a few receipts, not a full bank month",
      ],
    },
    {
      title: "Enter manually or use bank PDF when…",
      items: [
        "The image is dark, cropped, or shows “processing / failed”",
        "You need every debit/credit for salary, EMI and cash-flow (use Bank Statement Analyzer)",
        "You are logging cash or a payment with no digital screenshot",
      ],
    },
  ],
  privacy: [
    "Sign in with your ContentVerse India account before uploading.",
    "The image is processed for one-time text extraction; only the expense fields you confirm are stored in your tracker.",
    "We recommend cropping out account numbers, UPI PIN pads, and OTPs before upload.",
    "Avoid public / shared devices. Clear browser downloads if you saved the screenshot locally.",
  ],
  related: [
    { href: "/moneyverse", label: "MoneyVerse expense tracker" },
    {
      href: "/moneyverse/bank-statement-analyzer",
      label: "Bank Statement Analyzer",
    },
    {
      href: "/guides/money/bank-statement-analysis-loan-india",
      label: "Guide: reading bank statements for loans",
    },
    { href: "/guides/money", label: "Money guides India" },
  ],
} as const;

export const SCREENSHOT_SCAN_OCR_FAQ = [
  {
    q: "What is Screenshot Scan (OCR) in MoneyVerse?",
    a: "Screenshot Scan uses OCR and AI vision to read your UPI or bank payment screenshot — amount, payee name, payment method and category — and pre-fills your expense form so you do not have to type manually. You review and save only what looks correct.",
  },
  {
    q: "Which payment apps work with screenshot OCR?",
    a: "Clear success screens from PhonePe, Google Pay, Paytm, BHIM, Amazon Pay, bank apps and card payment confirmations work best. Upload a JPG, PNG or WebP image up to 5 MB. Failed or pending payment screens usually do not extract well.",
  },
  {
    q: "Is screenshot OCR free?",
    a: "Yes. Sign in to your free ContentVerse India account, upload a payment screenshot, review the extracted fields and save the expense to your MoneyVerse tracker.",
  },
  {
    q: "How accurate is OCR on UPI screenshots?",
    a: "Accuracy is high on standard payment success screens with a visible amount and payee. Always review amount, merchant and category before saving — you can edit any field before confirming. Blurry or cropped images need a retake.",
  },
  {
    q: "Does OCR store my screenshot?",
    a: "The image is sent securely for one-time text extraction. Only the expense details you confirm are saved to your account — not the raw screenshot file as a permanent gallery.",
  },
  {
    q: "When should I use Bank Statement Analyzer instead?",
    a: "Use Bank Statement Analyzer for a full PDF or image of your bank statement — monthly cash flow, recurring EMIs, salary credits and CSV export. Use Screenshot Scan for one UPI or payment proof at a time.",
  },
  {
    q: "Is this a PhonePe, Google Pay or bank product?",
    a: "No. MoneyVerse Screenshot Scan is an independent ContentVerse India tool for personal expense logging. For payment disputes, refunds or balances, use your UPI app or bank only.",
  },
  {
    q: "What about privacy and shared phones?",
    a: "Crop sensitive details before upload, sign out on shared devices, and do not upload OTPs or card photos. Treat every screenshot as financial data.",
  },
] as const;

export const SCREENSHOT_SCAN_OCR_STEPS = [
  {
    step: 1,
    title: "Capture a clear success screen",
    body: "Open the payment success page in PhonePe, GPay, Paytm or your bank app. Amount and payee should be fully visible — avoid dark mode glare and cropped edges.",
  },
  {
    step: 2,
    title: "Crop sensitive details (optional but smart)",
    body: "Hide full account numbers, UPI PIN pads and OTPs. Keep amount, merchant name and date/time if shown.",
  },
  {
    step: 3,
    title: "Upload for OCR scan",
    body: "Sign in, open Screenshot Scan, upload JPG/PNG/WebP (up to 5 MB) and wait a few seconds while AI reads amount, merchant and payment type.",
  },
  {
    step: 4,
    title: "Review every pre-filled field",
    body: "Check amount, payee, category and payment method. Fix misreads before you save — OCR drafts; you confirm.",
  },
  {
    step: 5,
    title: "Save to MoneyVerse",
    body: "Confirm to add the expense to your monthly MoneyVerse report. Repeat for other receipts or open the tracker to adjust budgets.",
  },
] as const;

export function screenshotScanPageUrl() {
  return `${SITE.url}${MONEYVERSE_SCREENSHOT_SCAN_PATH}`;
}

export function screenshotScanWebAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${screenshotScanPageUrl()}#webapp`,
    name: "MoneyVerse Screenshot Scan (OCR)",
    description:
      "Upload UPI or payment screenshots — OCR reads amount, merchant and category to auto-fill your expense tracker. Built for Indian digital payments.",
    url: screenshotScanPageUrl(),
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
      description: "Free OCR screenshot scan for signed-in users",
    },
    featureList: [
      "UPI screenshot OCR",
      "Automatic amount extraction",
      "Merchant / payee detection",
      "Expense category suggestion",
      "Payment method detection",
    ],
  };
}

export function screenshotScanFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${screenshotScanPageUrl()}#faq`,
    mainEntity: SCREENSHOT_SCAN_OCR_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function screenshotScanBreadcrumbJsonLd() {
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
        name: "Screenshot Scan (OCR)",
        item: screenshotScanPageUrl(),
      },
    ],
  };
}
