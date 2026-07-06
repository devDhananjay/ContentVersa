import { SITE } from "@/lib/seo";

export const HUID_VERIFICATION_PATH = "/huid-verification";

export const HUID_SEO_KEYWORDS = [
  "HUID verification",
  "HUID verification online",
  "BIS HUID check",
  "verify HUID gold",
  "hallmark unique ID verification",
  "gold HUID verify India",
  "BIS hallmark verification online",
  "check gold hallmark HUID",
  "HUID number check",
  "BIS gold verification",
] as const;

export const HUID_VERIFICATION_FAQ = [
  {
    q: "What is HUID in gold jewellery?",
    a: "HUID (Hallmark Unique ID) is a 6-character alphanumeric code laser-marked on BIS-hallmarked gold jewellery since 1 July 2021. Each piece gets a unique ID linked to purity, jeweller, weight and marking date in the official BIS database.",
  },
  {
    q: "How do I verify HUID online?",
    a: "Enter the 6-character HUID from your jewellery into the verification tool on this page, sign in with a free ContentVerse account, and submit. The system checks the official BIS HUID database and returns hallmark details if the record exists.",
  },
  {
    q: "Is HUID verification free?",
    a: "Yes. Every registered user gets 5 free HUID verification checks. Jewellery shops and businesses needing higher volume can contact ContentVerse for API access.",
  },
  {
    q: "Where is the HUID marked on gold jewellery?",
    a: "Look for a tiny laser engraving on the piece — often near the clasp, inner surface of a ring, or back of a pendant. It is a 6-character code (letters and numbers) alongside the BIS hallmark components.",
  },
  {
    q: "What if HUID verification fails?",
    a: "A failed check may mean the code was entered incorrectly, the piece predates mandatory HUID (before July 2021), or the jewellery is not registered in the BIS database. Do not pay hallmark prices without a valid verification.",
  },
  {
    q: "Can I verify HUID without signing in?",
    a: "Sign-in is required to prevent abuse and track your free verification quota. Creating a ContentVerse account is free and takes under a minute.",
  },
] as const;

export const HUID_VERIFICATION_STEPS = [
  {
    step: 1,
    title: "Locate the HUID on your jewellery",
    body: "Find the 6-character Hallmark Unique ID laser-marked on your gold ornament — usually near the clasp or on an inner surface.",
  },
  {
    step: 2,
    title: "Sign in to ContentVerse",
    body: "Create a free account or sign in. Each user receives 5 complimentary BIS HUID verification checks.",
  },
  {
    step: 3,
    title: "Enter the code and verify",
    body: "Type the 6-character HUID and tap Verify. Results show jeweller name, purity, weight, hallmark centre and marking date from the BIS database.",
  },
] as const;

export function huidVerificationPageUrl() {
  return `${SITE.url}${HUID_VERIFICATION_PATH}`;
}

export function huidVerificationWebAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${huidVerificationPageUrl()}#webapp`,
    name: "HUID Verification — BIS Gold Hallmark Check",
    description:
      "Verify BIS Hallmark Unique ID (HUID) on gold jewellery online. Check purity, jeweller and hallmark details against the official BIS database.",
    url: huidVerificationPageUrl(),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: "en-IN",
    isPartOf: { "@id": `${SITE.url}/#website` },
    provider: { "@id": `${SITE.url}/#organization` },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "5 free HUID verification checks per account",
    },
  };
}

export function huidVerificationFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${huidVerificationPageUrl()}#faq`,
    mainEntity: HUID_VERIFICATION_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function huidVerificationBreadcrumbJsonLd() {
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
        name: "GoldVerse",
        item: `${SITE.url}/goldverse`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "HUID Verification",
        item: huidVerificationPageUrl(),
      },
    ],
  };
}
