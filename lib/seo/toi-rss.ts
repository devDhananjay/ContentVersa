/**
 * Times of India official RSS — headlines + short description + source link.
 * We do NOT scrape full TOI article HTML; rewrite from RSS fields only.
 */

import { createHash } from "node:crypto";

export type ToiRssItem = {
  title: string;
  link: string;
  description?: string;
  publishedAt?: string;
  feedKey: string;
};

const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT =
  "ContentVerseIndiaBot/1.0 (+https://contentverse.co.in; news-briefing rewrite)";

/** Official TOI section feeds (https). */
export const TOI_RSS_FEEDS: { key: string; url: string; categoryHint: string }[] = [
  {
    key: "top",
    url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    categoryHint: "business",
  },
  {
    key: "india",
    url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
    categoryHint: "career",
  },
  {
    key: "business",
    url: "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms",
    categoryHint: "business",
  },
  {
    key: "sports",
    url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",
    categoryHint: "sports",
  },
];

function decodeXmlEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractTag(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  if (!m?.[1]) return undefined;
  // Decode CDATA before stripping tags — otherwise `<![CDATA[...]]>` wipes the text.
  const decoded = decodeXmlEntities(m[1]);
  return decoded.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || undefined;
}

function extractLink(block: string): string | undefined {
  const guid = extractTag(block, "guid");
  if (guid?.startsWith("http")) return guid;
  return extractTag(block, "link");
}

function parseRssItems(
  xml: string,
  feedKey: string,
  max: number
): ToiRssItem[] {
  const items: ToiRssItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractLink(block);
    if (!title || title.length < 12 || !link?.startsWith("http")) continue;
    const description = extractTag(block, "description");
    items.push({
      title: title.slice(0, 200),
      link: link.split("?")[0]!,
      description: description?.slice(0, 800),
      publishedAt: extractTag(block, "pubDate"),
      feedKey,
    });
    if (items.length >= max) break;
  }
  return items;
}

async function fetchFeedXml(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** Fetch + merge TOI feeds; newest-looking items first; dedupe by link. */
export async function fetchToiRssHeadlines(options?: {
  maxPerFeed?: number;
  maxTotal?: number;
  feedKeys?: string[];
}): Promise<ToiRssItem[]> {
  const maxPerFeed = options?.maxPerFeed ?? 8;
  const maxTotal = options?.maxTotal ?? 20;
  const allow = options?.feedKeys
    ? new Set(options.feedKeys)
    : null;

  const feeds = TOI_RSS_FEEDS.filter((f) => !allow || allow.has(f.key));
  const merged: ToiRssItem[] = [];
  const seen = new Set<string>();

  await Promise.all(
    feeds.map(async (feed) => {
      const xml = await fetchFeedXml(feed.url);
      if (!xml) {
        console.warn(`[toi-rss] fetch failed: ${feed.key}`);
        return;
      }
      for (const item of parseRssItems(xml, feed.key, maxPerFeed)) {
        const key = item.link.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(item);
      }
    })
  );

  return merged.slice(0, maxTotal);
}

/** Stable dedupe key stored in Blog.metaKeywords as `toi:<16 hex>`. */
export function toiSourceKey(link: string): string {
  const hash = createHash("sha256")
    .update(link.toLowerCase())
    .digest("hex")
    .slice(0, 16);
  return `toi:${hash}`;
}

export function categoryHintForToiItem(item: ToiRssItem): string {
  const feed = TOI_RSS_FEEDS.find((f) => f.key === item.feedKey);
  const text = `${item.title} ${item.description ?? ""}`.toLowerCase();
  if (/\b(cricket|ipl|football|hockey|olympics|tennis|kabaddi)\b/.test(text)) {
    return "sports";
  }
  if (/\b(stock|sensex|nifty|rupee|ipo|gdp|inflation)\b/.test(text)) {
    return "finance";
  }
  if (
    /\b(chatgpt|gemini|smartphone|cyber|software|startup|ai)\b|\btech\b/.test(
      text
    )
  ) {
    return "technology";
  }
  if (/\b(movie|bollywood|film|ott|netflix|actor)\b/.test(text)) return "movies";
  if (/\b(health|hospital|vaccine|doctor|covid)\b/.test(text)) return "health";
  if (
    /\b(election|minister|parliament|bjp|congress|policy|govt|government)\b/.test(
      text
    )
  ) {
    return "business";
  }
  return feed?.categoryHint ?? "business";
}
