/**
 * AdSense overlap cleanup — one indexable explainer per intent.
 * Keep the guide (or tool) as the pillar; 301 weaker blogs / thin finance twins.
 *
 * Wired into next.config.ts. Archive scripts must set Blog.canonicalUrl to the
 * destination before flipping status to ARCHIVED so leftover DB slugs 301 too.
 */

export type ContentRedirect = {
  source: string;
  destination: string;
};

const SIP_GUIDE = "/guides/money/sip-calculator-india-beginners-guide";
const CIBIL_GUIDE = "/guides/money/credit-score-cibil-india-guide";
const HUID_GUIDE = "/guides/money/huid-hallmark-gold-buying-india";
const EMI_GUIDE = "/guides/money/emi-calculator-india-guide";
const IFSC_GUIDE = "/guides/money/ifsc-code-finder-india-guide";
const TAX_GUIDE = "/guides/money/salary-tax-calculator-india-guide";
const GST_GUIDE = "/guides/money/gst-calculator-india-freelancers-guide";
const SECTION_80C_GUIDE = "/guides/money/section-80c-elss-ppf-lic-india";
const PPF_GUIDE = "/guides/money/ppf-account-india-guide";
const FD_RD_GUIDE = "/guides/money/fd-vs-rd-india-guide";
const UPI_GUIDE = "/guides/money/track-upi-expenses-phonepe-gpay";
const BANK_PDF_GUIDE = "/guides/money/bank-statement-analysis-loan-india";
const FUEL_GUIDE = "/guides/money/highway-fuel-fastag-trip-planner";
const RTO_GUIDE = "/guides/money/used-car-rc-rto-vahan-india";
const JOBS_GUIDE = "/guides/jobs/how-to-read-sarkari-job-notification";
const SILVER_GUIDE = "/guides/money/silver-rate-today-india-cities";
const CARD_MIN_DUE = "/guides/money/credit-card-minimum-due-india";
const CREATOR_GST = "/guides/money/content-creator-tax-gst-india";
const EMERGENCY_KEEPER = "/blog/emergency-fund-india-how-much-to-save-2026";
const LINKEDIN_KEEPER = "/blog/linkedin-profile-india-job-seekers-2026-checklist";

/** Static 301s — losers only. Do not list keepers here. */
export const CONTENT_REDIRECTS: ContentRedirect[] = [
  // SIP cluster
  { source: "/blog/sip-calculator-india-guide", destination: SIP_GUIDE },
  { source: "/blog/how-to-start-sip-investing-india-2026", destination: SIP_GUIDE },
  { source: "/blog/sip-vs-lumpsum-mutual-funds-india-guide", destination: SIP_GUIDE },
  { source: "/finance/sip", destination: SIP_GUIDE },
  { source: "/finance/mutual-funds", destination: SIP_GUIDE },

  // CIBIL
  {
    source: "/blog/credit-score-improve-india-practical-30-day-plan",
    destination: CIBIL_GUIDE,
  },
  { source: "/finance/credit-score", destination: CIBIL_GUIDE },

  // HUID / gold
  { source: "/blog/huid-verification-bis-gold-guide", destination: HUID_GUIDE },
  { source: "/blog/gold-rate-india-how-to-read", destination: "/goldverse" },
  { source: "/finance/gold-price-today", destination: "/goldverse" },
  { source: "/finance/silver-price-today", destination: SILVER_GUIDE },

  // 80C / PPF / tax
  {
    source: "/blog/tax-saving-investments-80c-guide-india-2026",
    destination: SECTION_80C_GUIDE,
  },
  {
    source: "/blog/section-80c-checklist-salaried-india-fy",
    destination: SECTION_80C_GUIDE,
  },
  {
    source: "/blog/nps-vs-ppf-vs-elss-tax-saving-india-comparison",
    destination: PPF_GUIDE,
  },
  {
    source: "/blog/ppf-vs-nps-vs-mutual-funds-comparison",
    destination: PPF_GUIDE,
  },
  { source: "/blog/itr-filing-deadlines-india", destination: TAX_GUIDE },
  { source: "/blog/freelancer-income-tax-guide-india", destination: CREATOR_GST },
  { source: "/finance/tax", destination: TAX_GUIDE },

  // Emergency fund — keep the longer 2026 boost article
  {
    source: "/blog/emergency-fund-how-much-save-india",
    destination: EMERGENCY_KEEPER,
  },

  // EMI / loans
  { source: "/blog/emi-calculator-home-loan-india", destination: EMI_GUIDE },
  {
    source: "/blog/first-home-loan-checklist-india-salaried",
    destination: EMI_GUIDE,
  },
  { source: "/finance/loans", destination: EMI_GUIDE },
  { source: "/finance/fd", destination: FD_RD_GUIDE },
  { source: "/finance/rd", destination: FD_RD_GUIDE },

  // IFSC (same slug on blog vs guide)
  { source: "/blog/ifsc-code-finder-india-guide", destination: IFSC_GUIDE },

  // GST
  {
    source: "/blog/gst-basics-freelancers-sole-proprietors-india",
    destination: GST_GUIDE,
  },

  // Tool-twin evergreen blogs
  { source: "/blog/pincode-finder-india-postal-guide", destination: "/tools/pincode-finder" },
  { source: "/blog/rto-code-finder-india", destination: RTO_GUIDE },
  { source: "/blog/fuel-price-today-india-explained", destination: FUEL_GUIDE },
  { source: "/blog/upi-expense-tracking-india", destination: UPI_GUIDE },
  { source: "/blog/bank-statement-analyzer-india", destination: BANK_PDF_GUIDE },
  { source: "/blog/sarkari-naukri-alert-guide", destination: JOBS_GUIDE },

  // Career overlap
  {
    source: "/blog/linkedin-profile-optimization-job-seekers-india",
    destination: LINKEDIN_KEEPER,
  },

  // Credit cards thin hub
  { source: "/finance/credit-cards", destination: CARD_MIN_DUE },
];

const SOURCE_SET = new Set(CONTENT_REDIRECTS.map((r) => r.source));

export function isRedirectedPath(path: string): boolean {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return SOURCE_SET.has(normalized.replace(/\/$/, "") || "/");
}

export function resolvedPublicHref(path: string): string {
  const hit = CONTENT_REDIRECTS.find((r) => r.source === path);
  return hit?.destination ?? path;
}

export function blogSlugFromPath(path: string): string | null {
  const m = path.match(/^\/blog\/([^/]+)$/);
  return m?.[1] ?? null;
}

/** Loser blog slugs that must be archived after the 301 exists. */
export const MERGE_BLOG_SLUGS: string[] = CONTENT_REDIRECTS.map((r) =>
  blogSlugFromPath(r.source)
).filter((s): s is string => Boolean(s));

export const MERGE_BLOG_SLUG_SET = new Set(MERGE_BLOG_SLUGS);

export function destinationForBlogSlug(slug: string): string | undefined {
  return CONTENT_REDIRECTS.find((r) => r.source === `/blog/${slug}`)?.destination;
}

/** P2 plan rows that duplicate an existing guide pillar — do not seed as blogs. */
export const P2_SKIP_SEED_IDS = new Set([
  "p2-sip-beginners",
  "p2-home-loan-emi",
  "p2-new-tax-regime",
  "p2-credit-score-india",
  "p2-huid-buy-gold",
  "p2-section-80c",
  "p2-gst-freelancer",
  "p2-ifsc-wrong-transfer",
  "p2-fd-vs-rd",
  "p2-ppf-guide",
  "p2-mutual-fund-exit",
  "p2-credit-card-minimum",
  "p2-content-creator-tax",
  "p2-hra-tax",
  "p2-fuel-highway",
  "p2-pincode-ecommerce",
  "p2-rto-used-car",
  "p2-silver-rate",
  "p2-bank-statement-pdf",
  "p2-phonepe-budget",
  "p2-upi-fraud",
]);

export function shouldSkipBlogSeed(slug: string): boolean {
  return MERGE_BLOG_SLUG_SET.has(slug);
}

export function nextContentRedirects() {
  return CONTENT_REDIRECTS.map((r) => ({
    source: r.source,
    destination: r.destination,
    permanent: true as const,
  }));
}

/** Thin finance hubs that stay live as utilities but must not be indexed. */
export const FINANCE_NOINDEX_TOPICS = ["stocks", "ipo"] as const;

export function isNoindexFinanceTopic(slug: string): boolean {
  return (FINANCE_NOINDEX_TOPICS as readonly string[]).includes(slug);
}

export function categoryFallbackPath(categorySlug: string): string {
  if (categorySlug === "finance") return "/finance";
  if (categorySlug === "sports") return "/sports";
  if (categorySlug === "career" || categorySlug === "careers") return "/jobs";
  return `/category/${categorySlug}`;
}

/**
 * Absolute canonical for archived posts. Always production — local .env
 * APP_URL/NEXT_PUBLIC_APP_URL must never be written into the live DB.
 */
export function publicCanonicalUrl(pathOrUrl: string): string {
  const origin = "https://contentverse.co.in";
  if (/^https?:\/\//i.test(pathOrUrl)) {
    try {
      const u = new URL(pathOrUrl);
      const host = u.hostname.toLowerCase();
      if (host === "localhost" || host === "127.0.0.1") {
        return `${origin}${u.pathname}${u.search}`;
      }
      return `${u.origin}${u.pathname}${u.search}`.replace(/\/$/, "") || origin;
    } catch {
      return origin;
    }
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${path}`;
}

/** Next.js redirect target — never send crawlers to localhost. */
export function redirectTargetFromCanonical(canonicalUrl: string): string {
  const raw = canonicalUrl.trim();
  try {
    const u = new URL(raw, "https://contentverse.co.in");
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "contentverse.co.in" ||
      host === "www.contentverse.co.in"
    ) {
      return `${u.pathname}${u.search}` || "/";
    }
    return u.toString();
  } catch {
    return raw.startsWith("/") ? raw : `/${raw}`;
  }
}
