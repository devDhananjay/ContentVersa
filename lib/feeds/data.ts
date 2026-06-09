import { cache } from "@/lib/redis";
import { FEED_CACHE_TTL, hasCategoryFeed } from "./constants";
import { cacheFeedItems } from "./detail";
import { fetchFreeToGameFeed } from "./freetogame";
import { fetchGitHubTrendingFeed } from "./github";
import { fetchHackerNewsFeed } from "./hackernews";
import { fetchHuggingFaceFeed } from "./huggingface";
import { fetchProductHuntFeed } from "./producthunt";
import { fetchRedditRssFeed } from "./reddit";
import { fetchTmdbFeed } from "./tmdb";
import type { CategoryFeed, FeedItem } from "./types";

async function buildFeed(slug: string): Promise<CategoryFeed | null> {
  let items: FeedItem[] = [];

  switch (slug) {
    case "technology":
      items = await fetchHackerNewsFeed(8);
      return await wrap(slug, items, {
        title: "Tech headlines",
        subtitle: "What's trending in technology right now",
      });

    case "ai": {
      const [hf, reddit] = await Promise.all([
        fetchHuggingFaceFeed(5),
        fetchRedditRssFeed("MachineLearning", 4),
      ]);
      items = [...hf, ...reddit];
      return await wrap(slug, items, {
        title: "AI pulse",
        subtitle: "Models, research and community picks",
      });
    }

    case "programming":
      items = await fetchGitHubTrendingFeed(8);
      return await wrap(slug, items, {
        title: "Trending repos",
        subtitle: "Popular new code projects this week",
      });

    case "movies":
      items = await fetchTmdbFeed(8);
      return await wrap(slug, items, {
        title: "Trending movies",
        subtitle: "What everyone is watching right now",
      });

    case "gaming":
      items = await fetchFreeToGameFeed(8);
      return await wrap(slug, items, {
        title: "Popular free games",
        subtitle: "Top free-to-play titles to try now",
      });

    case "startups":
      items = await fetchProductHuntFeed(8);
      return await wrap(slug, items, {
        title: "Today's launches",
        subtitle: "Fresh products and ideas from founders",
      });

    default:
      return null;
  }
}

async function wrap(
  slug: string,
  items: FeedItem[],
  meta: { title: string; subtitle: string }
): Promise<CategoryFeed | null> {
  if (!items.length) return null;
  const feed = {
    slug,
    title: meta.title,
    subtitle: meta.subtitle,
    items,
    updatedAt: new Date().toISOString(),
  };
  await cacheFeedItems(slug, items);
  return feed;
}

export async function getCategoryFeed(
  slug: string
): Promise<CategoryFeed | null> {
  if (!hasCategoryFeed(slug) || slug === "finance") return null;

  return cache.wrap(`feeds:category:v2:${slug}`, FEED_CACHE_TTL, () =>
    buildFeed(slug)
  );
}
