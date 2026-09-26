import type { Metadata } from "next";
import { getAppUrl } from "@/lib/app-url";
import { PRODUCTION_SITE_URL } from "@/lib/site-config";
import { DEFAULT_FAVICON_ICONS } from "@/lib/branding/favicon";
import { SHOW_THIRD_PARTY_CREDITS } from "@/lib/site/third-party-credits";

function siteUrl() {
  try {
    return getAppUrl();
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

/** Square logo for Google Organization / Knowledge Graph (min ~112px). */
export const SITE_LOGO_URL = "/icon-192.png";

/** Main hub modules — prioritized for sitelinks & internal linking (editorial-first for AdSense). */
export const SITE_NAV_HUBS = [
  { name: "India Guides", path: "/guides", description: "Original explainers — schemes, money, jobs, cricket, AI tools, OTT" },
  { name: "Blogs", path: "/blogs", description: "Long-form articles and stories from Indian writers" },
  {
    name: "Govt Schemes Guides",
    path: "/guides/schemes",
    description: "Government scheme eligibility and how to apply India",
  },
  { name: "SIP India", path: "/guides/money/sip-calculator-india-beginners-guide", description: "SIP mutual fund investing explained with free calculator" },
  { name: "Sports", path: "/sports", description: "Live cricket scores, fixtures and sports news" },
  { name: "Finance", path: "/finance", description: "Nifty, Sensex, and links to money guides" },
  { name: "Jobs", path: "/jobs", description: "Sarkari naukri, government jobs and private careers India" },
  { name: "Exam Results", path: "/results", description: "Official exam and board result portals India" },
  { name: "CineVerse", path: "/cineverse", description: "Movies — OTT release, cast, where to watch & watchlist India" },
  { name: "GoldVerse", path: "/goldverse", description: "Gold & silver rates and BIS hallmark tips" },
  { name: "MoneyVerse", path: "/moneyverse", description: "Expense tracker and budget planner India" },
  { name: "India Tools", path: "/tools", description: "Free calculators and utility tools India" },
  { name: "PNR Status", path: "/tools/pnr-status", description: "Indian Railways PNR status check" },
  {
    name: "Salary Tax Calculator",
    path: "/tools/salary-tax-calculator",
    description: "Income tax and in-hand salary calculator India new vs old regime",
  },
  {
    name: "Trending India",
    path: "/trending",
    description: SHOW_THIRD_PARTY_CREDITS
      ? "Google Trends India topics with on-site briefings and chat"
      : "Trending India topics with on-site briefings and chat",
  },
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
  /** Short brand — used in page title suffixes (`· ContentVerse India`). */
  name: "ContentVerse India",
  legalName: "ContentVerse India",
  tagline: "Read. Create. Grow.",
  /**
   * Google site name (favicon line above the URL).
   * Keep short & unique — slogans here make Google fall back to the domain.
   */
  searchName: "ContentVerse India",
  /**
   * Homepage `<title>` / SERP purple link.
   * Brand + tagline for the clickable result title.
   */
  homeTitle: "ContentVerse India — original Indian guides, explainers and stories",
  description:
    "ContentVerse India publishes original Indian guides, explainers and stories — plus free calculators, cricket scores, and jobs as supporting tools. Educational content, human review, India-first.",
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
  return [
    SITE.homeTitle,
    "ContentVerse",
    "contentverse.co.in",
  ];
}

export function buildMetadata(input: {
  title?: string;
  description?: string;
  path?: string;
  /** Absolute URL override for canonical (external or preferred URL). */
  canonicalUrl?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}): Metadata {
  const title = input.title
    ? input.title.includes(SITE.name) || input.title.includes("ContentVerse India")
      ? input.title
      : `${input.title} · ${SITE.name}`
    : SITE.homeTitle;
  const url = input.canonicalUrl?.trim()
    || (input.path ? `${SITE.url}${input.path}` : SITE.url);
  const image = input.image || SITE.ogImage;
  const verification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

  return {
    metadataBase: new URL(SITE.url),
    title,
    applicationName: SITE.searchName,
    description: input.description || SITE.description,
    keywords:
      input.keywords ??
      [
        "ContentVerse India",
        "live cricket score India",
        "Nifty Sensex live",
        "sarkari naukri",
        "HUID verification",
        "free India tools",
        "expense tracker India",
        "OTT release date India",
        "gold price today",
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
      modifiedTime: input.modifiedTime || input.publishedTime,
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
    name: "ContentVerse India platform modules",
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
