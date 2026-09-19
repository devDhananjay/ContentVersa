/**
 * Google indexing rules — keep the public index focused on original editorial content.
 *
 * Thin public widgets (live scores, stock tickers, reels, discover, leaderboard)
 * stay crawlable but use page-level `noIndex` with `follow: true` so Google can
 * still pass link equity to hub pages without indexing the thin URL.
 * Private surfaces (/dashboard, /admin, /api, /auth) are Disallow'd in app/robots.ts.
 *
 * P1 ops note: expand new articles only for queries with Search Console impressions/CTR —
 * do not mass-publish AI volume without that signal.
 *
 * P2 ops note: `/tools/locations/*` stays noindex until unique editorial depth exists.
 * Programmatic IFSC/pincode tools remain indexable hub utilities, not doorway matrices.
 */

/** Minimum reading minutes for blog posts in sitemap / Google index */
export const MIN_INDEXABLE_READING_MINUTES = 4;

/** Minimum published articles before a creator profile is indexable */
export const MIN_PROFILE_ARTICLES = 2;

export function isDiscoverSyndicatedSlug(slug: string): boolean {
  return slug.startsWith("discover-");
}

/** Legacy auto-generated daily cron articles (thin/generic titles). New AI drafts use title-based slugs. */
export function isAutoDailyCronSlug(slug: string): boolean {
  return /-daily-\d{4}-\d{2}-\d{2}-/.test(slug);
}

export function isAiVolumeArticle(input: {
  slug: string;
  metaKeywords?: string | null;
}): boolean {
  if (isAutoDailyCronSlug(input.slug)) return true;
  const keys = (input.metaKeywords || "").toLowerCase();
  return keys.includes("ai-daily");
}

import { MERGE_BLOG_SLUG_SET } from "@/lib/seo/content-redirects";

export function isIndexableArticle(input: {
  slug: string;
  readingTime: number;
  metaKeywords?: string | null;
}): boolean {
  if (isDiscoverSyndicatedSlug(input.slug)) return false;
  if (isAiVolumeArticle(input)) return false;
  if (MERGE_BLOG_SLUG_SET.has(input.slug)) return false;
  return input.readingTime >= MIN_INDEXABLE_READING_MINUTES;
}

/** Monetization gate — same quality bar as indexability for now. */
export function isAdEligibleByQuality(input: {
  slug: string;
  readingTime: number;
}): boolean {
  return isIndexableArticle(input);
}

/**
 * Tools with long-form how-to guides stay indexable.
 * Form-only utilities stay crawlable but noindex (AdSense thin-content risk).
 */
export const INDEXABLE_TOOL_SLUGS = new Set([
  "ifsc-finder",
  "pincode-finder",
  "emi-calculator",
  "sip-calculator",
  "salary-tax-calculator",
  "gst-calculator",
  "fuel-price",
  "rto-finder",
  "currency-converter",
  "fd-calculator",
  "ppf-calculator",
  "election-info",
]);

export function isIndexableTool(slug: string): boolean {
  return INDEXABLE_TOOL_SLUGS.has(slug);
}

export function isIndexableProfile(publishedArticleCount: number): boolean {
  return publishedArticleCount >= MIN_PROFILE_ARTICLES;
}
