/**
 * Google indexing rules — keep the public index focused on original editorial content.
 * Thin API/widget pages (live scores, stock tickers, auth, reels) are noindex.
 */

/** Minimum reading minutes for blog posts in sitemap / Google index */
export const MIN_INDEXABLE_READING_MINUTES = 4;

/** Minimum published articles before a creator profile is indexable */
export const MIN_PROFILE_ARTICLES = 2;

export function isDiscoverSyndicatedSlug(slug: string): boolean {
  return slug.startsWith("discover-");
}

export function isIndexableArticle(input: {
  slug: string;
  readingTime: number;
}): boolean {
  if (isDiscoverSyndicatedSlug(input.slug)) return false;
  return input.readingTime >= MIN_INDEXABLE_READING_MINUTES;
}

export function isIndexableProfile(publishedArticleCount: number): boolean {
  return publishedArticleCount >= MIN_PROFILE_ARTICLES;
}
