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

export const SCREENSHOT_SCAN_OCR_FAQ = [
  {
    q: "What is Screenshot Scan (OCR) in MoneyVerse?",
    a: "Screenshot Scan uses OCR and AI vision to read your UPI or bank payment screenshot — amount, payee name, payment method and category — and pre-fills your expense form so you do not have to type manually.",
  },
  {
    q: "Which payment apps work with screenshot OCR?",
    a: "Clear success screens from PhonePe, Google Pay, Paytm, BHIM, Amazon Pay, bank apps and card payment confirmations work best. Upload a JPG, PNG or WebP image up to 5 MB.",
  },
  {
    q: "Is screenshot OCR free?",
    a: "Yes. Sign in to your free ContentVerse account, upload a payment screenshot, review the extracted fields and save the expense to your MoneyVerse tracker.",
  },
  {
    q: "How accurate is OCR on UPI screenshots?",
    a: "Accuracy is high on standard payment success screens with visible amount and payee. Always review amount, merchant and category before saving — you can edit any field before confirming.",
  },
  {
    q: "Does OCR store my screenshot?",
    a: "The image is sent securely for one-time text extraction. Only the expense details you confirm are saved to your account — not the raw screenshot.",
  },
] as const;

export const SCREENSHOT_SCAN_OCR_STEPS = [
  {
    step: 1,
    title: "Take a payment screenshot",
    body: "Capture the UPI or bank payment success screen from PhonePe, GPay, Paytm or your banking app.",
  },
  {
    step: 2,
    title: "Upload for OCR scan",
    body: "Open Screenshot Scan (OCR), upload the image and wait a few seconds while AI reads amount, merchant and payment type.",
  },
  {
    step: 3,
    title: "Review and save expense",
    body: "Check the pre-filled fields, adjust category if needed, and save to your monthly MoneyVerse expense report.",
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
