import { NextResponse } from "next/server";

interface TrendItem {
  title: string;
  traffic: string;
  url: string;
  picture?: string;
  newsItems?: { title: string; url: string; source: string }[];
}

let cache: { data: TrendItem[]; ts: number } | null = null;
const TTL = 30 * 60 * 1000; // 30 min

async function fetchTrends(): Promise<TrendItem[]> {
  if (cache && Date.now() - cache.ts < TTL) return cache.data;

  const res = await fetch(
    "https://trends.google.com/trending/rss?geo=IN",
    { next: { revalidate: 1800 } }
  );
  if (!res.ok) return cache?.data ?? [];

  const xml = await res.text();

  const items: TrendItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1]
      ?? "";
    const traffic = block.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/)?.[1] ?? "";
    const rawLink = block.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
    const link = rawLink.includes("/trending/rss")
      ? `https://www.google.com/search?q=${encodeURIComponent(title)}`
      : rawLink;
    const picture = block.match(/<ht:picture>(.*?)<\/ht:picture>/)?.[1];

    const newsArr: TrendItem["newsItems"] = [];
    const newsRegex = /<ht:news_item>([\s\S]*?)<\/ht:news_item>/g;
    let nm: RegExpExecArray | null;
    while ((nm = newsRegex.exec(block)) !== null) {
      const nb = nm[1];
      newsArr.push({
        title: nb.match(/<ht:news_item_title><!\[CDATA\[(.*?)\]\]><\/ht:news_item_title>/)?.[1]
          ?? nb.match(/<ht:news_item_title>(.*?)<\/ht:news_item_title>/)?.[1] ?? "",
        url: nb.match(/<ht:news_item_url><!\[CDATA\[(.*?)\]\]><\/ht:news_item_url>/)?.[1]
          ?? nb.match(/<ht:news_item_url>(.*?)<\/ht:news_item_url>/)?.[1] ?? "",
        source: nb.match(/<ht:news_item_source>(.*?)<\/ht:news_item_source>/)?.[1] ?? "",
      });
    }

    if (title) {
      items.push({
        title,
        traffic,
        url: link,
        picture: picture || undefined,
        newsItems: newsArr.length ? newsArr.slice(0, 2) : undefined,
      });
    }
  }

  cache = { data: items, ts: Date.now() };
  return items;
}

export async function GET() {
  const trends = await fetchTrends();
  return NextResponse.json(trends, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
