import type { FeedItem } from "./types";

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseRssEntries(xml: string, limit: number): FeedItem[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  const items: FeedItem[] = [];

  for (const entry of entries) {
    const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
    const link =
      entry.match(/<link href="([^"]+)"/)?.[1] ||
      entry.match(/<link>([^<]+)<\/link>/)?.[1];
    if (!title || !link) continue;
    if (title.includes("Self-Promotion") || title.includes("Who's Hiring")) {
      continue;
    }

    items.push({
      id: link,
      title: decodeXml(title),
      externalUrl: link,
      subtitle: "Community discussion",
    });
    if (items.length >= limit) break;
  }

  return items;
}

export async function fetchRedditRssFeed(
  subreddit: string,
  limit = 5
): Promise<FeedItem[]> {
  const res = await fetch(
    `https://www.reddit.com/r/${subreddit}/hot.rss?limit=${limit + 4}`,
    {
      headers: {
        "User-Agent": "ContentVerse/1.0 (+https://contentverse.co.in)",
        Accept: "application/atom+xml",
      },
      next: { revalidate: 900 },
    }
  );
  if (!res.ok) return [];
  return parseRssEntries(await res.text(), limit);
}
