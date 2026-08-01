import type { Metadata } from "next";
import { getAppUrl } from "@/lib/app-url";
import { PRODUCTION_SITE_URL } from "@/lib/site-config";
import { DEFAULT_FAVICON_ICONS } from "@/lib/branding/favicon";

function siteUrl() {
  try {
    return getAppUrl();
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

/** Square logo for Google Organization / Knowledge Graph (min ~112px). */
export const SITE_LOGO_URL = "/icon-192.png";

/** Main hub modules — prioritized for sitelinks & internal linking. */
export const SITE_NAV_HUBS = [
  { name: "Sports", path: "/sports", description: "Live cricket scores, fixtures and sports news" },
  { name: "Finance", path: "/finance", description: "Nifty, Sensex, MoneyVerse guides — gold, SIP, FD, loans & tax" },
  { name: "CineVerse", path: "/cineverse", description: "Movies — OTT release, cast, where to watch & watchlist India" },
  { name: "GoldVerse", path: "/goldverse", description: "HUID verify, gold & silver rates and BIS hallmark tools" },
  { name: "MoneyVerse", path: "/moneyverse", description: "Expense tracker, budget planner, UPI spending & screenshot OCR scan India" },
  { name: "Gold Price Today", path: "/finance/gold-price-today", description: "Gold price today India 22K 24K rates and HUID tips" },
  { name: "SIP India", path: "/finance/sip", description: "SIP mutual fund investing explained with free calculator" },
  { name: "Silver Rate", path: "/tools/silver-rate", description: "Silver rate today India per gram and kg" },
  { name: "Screenshot Scan (OCR)", path: "/moneyverse/screenshot-scan", description: "UPI payment screenshot OCR — auto-fill expenses from PhonePe, GPay, Paytm" },
  { name: "Bank Statement Analyzer", path: "/moneyverse/bank-statement-analyzer", description: "AI bank statement PDF analysis — credits, debits, expenses and CSV India" },
  { name: "HUID Verification", path: "/huid-verification", description: "Verify BIS gold hallmark HUID online India" },
  { name: "Sarkari Result", path: "/results", description: "Official exam and board result portals India" },
  { name: "India Tools", path: "/tools", description: "Free PNR, translator, weather, salary tax, PDF, IFSC, EMI, FD, GST tools India" },
  { name: "PNR Status", path: "/tools/pnr-status", description: "Indian Railways PNR status check" },
  { name: "EN ↔ HI Translator", path: "/tools/english-hindi-translator", description: "English to Hindi and Hindi to English translator free" },
  { name: "Merge PDF", path: "/tools/merge-pdf", description: "Combine PDF files free in browser India" },
  { name: "Compress PDF", path: "/tools/compress-pdf", description: "Reduce PDF size free online India" },
  { name: "Weather India", path: "/tools/weather", description: "Free weather forecast by city India" },
  { name: "Nearby Places", path: "/tools/nearby-places", description: "Find hotels, restaurants, hospitals, schools, ATMs near you India" },
  { name: "IFSC Finder", path: "/tools/ifsc-finder", description: "Find Indian bank IFSC branch details free" },
  { name: "RTO Finder", path: "/tools/rto-finder", description: "Find RTO code and office address by city India" },
  { name: "Fuel Price", path: "/tools/fuel-price", description: "Petrol and diesel price by city India today" },
  { name: "EMI Calculator", path: "/tools/emi-calculator", description: "Home and car loan EMI calculator India" },
  { name: "FD Calculator", path: "/tools/fd-calculator", description: "Fixed deposit maturity calculator India" },
  { name: "GST Calculator", path: "/tools/gst-calculator", description: "Add or remove GST calculator India" },
  {
    name: "Salary Tax Calculator",
    path: "/tools/salary-tax-calculator",
    description: "Income tax and in-hand salary calculator India new vs old regime",
  },
  {
    name: "India Guides",
    path: "/guides",
    description:
      "Trending explainers, govt schemes, job notifications, cricket, AI tools and OTT guides India",
  },
  {
    name: "Trending India",
    path: "/trending",
    description: "Google Trends India topics with on-site briefings and chat",
  },
  {
    name: "Govt Schemes Guides",
    path: "/guides/schemes",
    description: "Government scheme eligibility and how to apply India",
  },
  { name: "Reels", path: "/reels", description: "Short-form videos from Indian creators" },
  { name: "Blogs", path: "/blogs", description: "Read articles and stories from creators" },
] as const;

/** Main site sections — helps Google understand navigation (sitelinks). */
export const SITE_NAV_SECTIONS = [
  ...SITE_NAV_HUBS,
  { name: "Categories", path: "/categories", description: "Browse topics" },
  { name: "About", path: "/about", description: "About ContentVerse India" },
  { name: "Contact", path: "/contact", description: "Get in touch" },
  { name: "Creator Program", path: "/creator-program", description: "Monetize your writing" },
] as const;

export const SITE = {
  name: "ContentVerse",
  legalName: "ContentVerse India",
  tagline: "Read. Create. Grow.",
  /**
   * Preferred Google Search site name (line above the URL).
   * Plain "ContentVerse" clashes with other brands, so Google often
   * falls back to the domain — keep this unique and consistent on-page.
   */
  searchName: "ContentVerse — Read. Create. Grow.",
  description:
    "ContentVerse India — read blogs, watch reels, follow live sports scores, track Nifty & Sensex, and find government & private jobs. India's creator platform for bold writers.",
  get url() {
    return siteUrl();
  },
  twitter: "@contentverse",
  /** Public social profiles for Organization sameAs (Knowledge Graph). */
  sameAs: [
    "https://twitter.com/contentverse",
    "https://www.instagram.com/contentverse",
    "https://www.youtube.com/@contentverse",
    "https://github.com/devDhananjay/ContentVersa",
  ] as string[],
  ogImage: "/og-default.png",
  logo: SITE_LOGO_URL,
  logoIcon: "/logo-mark.svg",
  icons: {
    icon: [
      { url: DEFAULT_FAVICON_ICONS.primary, sizes: "48x48", type: "image/png" },
      { url: DEFAULT_FAVICON_ICONS.large, sizes: "192x192", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: DEFAULT_FAVICON_ICONS.fallback, sizes: "48x48", type: "image/x-icon" },
    ],
    apple: [{ url: DEFAULT_FAVICON_ICONS.apple, sizes: "180x180", type: "image/png" }],
    shortcut: DEFAULT_FAVICON_ICONS.primary,
  },
};

/** Fallbacks if Google won't use SITE.searchName (ordered by preference). */
export function siteNameAlternates(): string[] {
  return [SITE.legalName, SITE.name, "contentverse.co.in"];
}

export function buildMetadata(input: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
}): Metadata {
  const title = input.title
    ? input.title.includes(SITE.name)
      ? input.title
      : `${input.title} · ${SITE.name}`
    : SITE.searchName;
  const url = input.path ? `${SITE.url}${input.path}` : SITE.url;
  const image = input.image || SITE.ogImage;
  const verification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

  return {
    metadataBase: new URL(SITE.url),
    title,
    description: input.description || SITE.description,
    keywords:
      input.keywords ??
      [
        "ContentVerse",
        "ContentVerse India",
        "blog platform India",
        "creator platform",
        "write blogs",
        "content creators",
      ],
    authors: input.authors?.map((name) => ({ name })),
    alternates: { canonical: url },
    robots: input.noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    icons: SITE.icons,
    ...(verification ? { verification: { google: verification } } : {}),
    openGraph: {
      title,
      description: input.description || SITE.description,
      url,
      siteName: SITE.searchName,
      type: input.type || "website",
      publishedTime: input.publishedTime,
      images: [{ url: image, width: 1200, height: 630, alt: SITE.searchName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description || SITE.description,
      creator: SITE.twitter,
      images: [image],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.searchName,
    legalName: SITE.legalName,
    alternateName: siteNameAlternates(),
    slogan: SITE.tagline,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}${SITE_LOGO_URL}`,
      width: 192,
      height: 192,
    },
    image: `${SITE.url}${SITE.ogImage}`,
    description: SITE.description,
    sameAs: [
      ...SITE.sameAs,
      ...(process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL?.trim()
        ? [process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL.trim()]
        : []),
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.searchName,
    alternateName: siteNameAlternates(),
    url: SITE.url,
    description: SITE.description,
    publisher: { "@id": `${SITE.url}/#organization` },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/blogs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    hasPart: SITE_NAV_SECTIONS.map((section, index) => ({
      "@type": "WebPage",
      "@id": `${SITE.url}${section.path}`,
      name: section.name,
      description: section.description,
      url: `${SITE.url}${section.path}`,
      position: index + 1,
      isPartOf: { "@id": `${SITE.url}/#website` },
    })),
  };
}

/** SiteNavigationElement — signals primary modules for Google sitelinks. */
export function siteNavigationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": SITE_NAV_HUBS.map((hub, index) => ({
      "@type": "SiteNavigationElement",
      "@id": `${SITE.url}/#nav-${hub.path.slice(1)}`,
      name: hub.name,
      description: hub.description,
      url: `${SITE.url}${hub.path}`,
      position: index + 1,
    })),
  };
}

/** ItemList of hub pages for homepage discovery. */
export function platformModulesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ContentVerse platform modules",
    itemListElement: SITE_NAV_HUBS.map((hub, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: hub.name,
      description: hub.description,
      url: `${SITE.url}${hub.path}`,
    })),
  };
}

export function articleJsonLd(args: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description,
    image: args.image ? [args.image] : undefined,
    datePublished: args.datePublished,
    dateModified: args.dateModified || args.datePublished,
    author: { "@type": "Person", name: args.authorName },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: `${SITE.url}${SITE_LOGO_URL}` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": args.url },
  };
}
