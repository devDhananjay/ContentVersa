/**
 * Google indexing rules — keep the public index focused on original editorial content.
 *
 * Thin public widgets (live scores, stock tickers, reels, discover, leaderboard)
 * stay crawlable but use page-level `noIndex` so Google can see canonicals without
 * indexing them. Private surfaces (/dashboard, /admin, /api, /auth) are Disallow'd
 * in app/robots.ts.
 */

/** Minimum reading minutes for blog posts in sitemap / Google index */
export const MIN_INDEXABLE_READING_MINUTES = 4;

/** Minimum published articles before a creator profile is indexable */
export const MIN_PROFILE_ARTICLES = 2;

export function isDiscoverSyndicatedSlug(slug: string): boolean {
  return slug.startsWith("discover-");
}

/** Auto-generated daily cron articles (thin/generic titles). */
export function isAutoDailyCronSlug(slug: string): boolean {
  return /-daily-\d{4}-\d{2}-\d{2}-/.test(slug);
}

export function isIndexableArticle(input: {
  slug: string;
  readingTime: number;
}): boolean {
  if (isDiscoverSyndicatedSlug(input.slug)) return false;
  if (isAutoDailyCronSlug(input.slug)) return false;
  return input.readingTime >= MIN_INDEXABLE_READING_MINUTES;
}

export function isIndexableProfile(publishedArticleCount: number): boolean {
  return publishedArticleCount >= MIN_PROFILE_ARTICLES;
}
