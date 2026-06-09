export const FEED_CACHE_TTL = 900; // 15 minutes

export const FEED_CATEGORY_SLUGS = new Set([
  "technology",
  "ai",
  "programming",
  "finance",
  "movies",
  "gaming",
  "startups",
]);

export function hasCategoryFeed(slug: string): boolean {
  return FEED_CATEGORY_SLUGS.has(slug);
}
