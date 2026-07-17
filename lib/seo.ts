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
  { name: "Finance", path: "/finance", description: "Nifty, Sensex, stocks and market updates" },
  { name: "CineVerse", path: "/cineverse", description: "Movies, OTT and watchlist India" },
  { name: "GoldVerse", path: "/goldverse", description: "HUID verify, gold rates and BIS hallmark tools" },
  { name: "MoneyVerse", path: "/moneyverse", description: "Expense tracker, budget planner, UPI spending & screenshot OCR scan India" },
  { name: "Screenshot Scan (OCR)", path: "/moneyverse/screenshot-scan", description: "UPI payment screenshot OCR — auto-fill expenses from PhonePe, GPay, Paytm" },
  { name: "HUID Verification", path: "/huid-verification", description: "Verify BIS gold hallmark HUID online India" },
  { name: "India Tools", path: "/tools", description: "Free IFSC, pincode, RTO, EMI, SIP, fuel price and vehicle tools India" },
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
  description:
    "ContentVerse India — read blogs, watch reels, follow live sports scores, track Nifty & Sensex, and find government & private jobs. India's creator platform for bold writers.",
  get url() {
    return siteUrl();
  },
  twitter: "@contentverse",
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
  const title = input.title ? `${input.title} · ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
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
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    icons: SITE.icons,
    ...(verification ? { verification: { google: verification } } : {}),
    openGraph: {
      title,
      description: input.description || SITE.description,
      url,
      siteName: SITE.name,
      type: input.type || "website",
      publishedTime: input.publishedTime,
      images: [{ url: image, width: 1200, height: 1200, alt: SITE.name }],
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
    name: SITE.name,
    legalName: SITE.legalName,
    alternateName: ["ContentVerse India", "contentverse.co.in"],
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}${SITE_LOGO_URL}`,
      width: 192,
      height: 192,
    },
    image: `${SITE.url}${SITE.ogImage}`,
    description: SITE.description,
    sameAs: [] as string[],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    alternateName: ["ContentVerse India", "contentverse.co.in"],
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
