/**
 * Times of India official RSS — headlines + short description + source link.
 * Full article text is fetched separately (JSON-LD articleBody) for light rewrite.
 * Priority: latest + trending/entertainment (traffic) ahead of quieter desks.
 */

import { createHash } from "node:crypto";

export type ToiRssItem = {
  title: string;
  link: string;
  description?: string;
  publishedAt?: string;
  feedKey: string;
  /** Optional enclosure / media thumbnail from RSS */
  imageUrl?: string;
  /** Full TOI news body (from page JSON-LD) — same facts, then lightly rewritten */
  articleBody?: string;
};

const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT =
  "ContentVerseIndiaBot/1.0 (+https://contentverse.co.in; news-briefing rewrite)";

/**
 * Official TOI section feeds.
 * Order matters for tie-breaks: entertainment / latest first for traffic.
 */
export const TOI_RSS_FEEDS: {
  key: string;
  url: string;
  categoryHint: string;
  /** Higher = prefer when sorting for ingest */
  weight: number;
}[] = [
  {
    key: "entertainment",
    url: "https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms",
    categoryHint: "movies",
    weight: 100,
  },
  {
    key: "latest",
    url: "https://timesofindia.indiatimes.com/rssfeedmostrecent.cms",
    categoryHint: "lifestyle",
    weight: 95,
  },
  {
    key: "top",
    url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    categoryHint: "lifestyle",
    weight: 90,
  },
  {
    key: "india",
    url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
    categoryHint: "lifestyle",
    weight: 80,
  },
  {
    key: "lifestyle",
    url: "https://timesofindia.indiatimes.com/rssfeeds/2886704.cms",
    categoryHint: "lifestyle",
    weight: 70,
  },
  {
    key: "cricket",
    url: "https://timesofindia.indiatimes.com/rssfeeds/54829575.cms",
    categoryHint: "sports",
    weight: 75,
  },
  {
    key: "sports",
    url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",
    categoryHint: "sports",
    weight: 65,
  },
  {
    key: "business",
    url: "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms",
    categoryHint: "business",
    weight: 55,
  },
  {
    key: "world",
    url: "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms",
    categoryHint: "lifestyle",
    weight: 50,
  },
];

/** Celebrity / viral / breaking signals → higher pick priority (search traffic). */
const TRENDING_TITLE_RE =
  /\b(tiger shroff|salman|shahrukh|srk|deepika|ranveer|alia|katrina|rashmika|vijay|rajinikanth|allu arjun|modi|rahul gandhi|kohli|rohit|dhoni|viral|breaking|firing|shot|arrest|stampede|earthquake|crash|attack|controversy|divorced?|wedding|box office|ipl|world cup)\b/i;

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
  const decoded = decodeXmlEntities(m[1]);
  return decoded.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || undefined;
}

function extractLink(block: string): string | undefined {
  const guid = extractTag(block, "guid");
  if (guid?.startsWith("http")) return guid;
  return extractTag(block, "link");
}

function extractImageUrl(block: string): string | undefined {
  const enc = block.match(
    /<enclosure[^>]*url=["']([^"']+)["'][^>]*(?:type=["']image\/[^"']*["'])?/i
  );
  if (enc?.[1]?.startsWith("http")) return enc[1];
  const enc2 = block.match(
    /<enclosure[^>]*type=["']image\/[^"']*["'][^>]*url=["']([^"']+)["']/i
  );
  if (enc2?.[1]?.startsWith("http")) return enc2[1];
  const media = block.match(/<media:content[^>]*url=["']([^"']+)["']/i);
  if (media?.[1]?.startsWith("http")) return media[1];
  const img = block.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (img?.[1]?.startsWith("http")) return img[1];
  return undefined;
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
      description: description?.slice(0, 2000),
      publishedAt: extractTag(block, "pubDate"),
      feedKey,
      imageUrl: extractImageUrl(block),
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

function feedWeight(feedKey: string): number {
  return TOI_RSS_FEEDS.find((f) => f.key === feedKey)?.weight ?? 40;
}

function publishedMs(item: ToiRssItem): number {
  if (!item.publishedAt) return 0;
  const t = Date.parse(item.publishedAt);
  return Number.isFinite(t) ? t : 0;
}

/** Score for ingest order: trending keywords + feed weight + freshness. */
export function toiTrendingScore(item: ToiRssItem): number {
  let score = feedWeight(item.feedKey);
  if (TRENDING_TITLE_RE.test(item.title)) score += 40;
  if (TRENDING_TITLE_RE.test(item.description || "")) score += 10;
  // Freshness: up to +30 for items in last 24h
  const ageH = (Date.now() - publishedMs(item)) / 3_600_000;
  if (publishedMs(item) > 0 && ageH >= 0 && ageH < 24) {
    score += Math.round(30 * (1 - ageH / 24));
  } else if (publishedMs(item) > 0 && ageH < 72) {
    score += 8;
  }
  return score;
}

/** Fetch + merge TOI feeds; trending + latest first; dedupe by link. */
export async function fetchToiRssHeadlines(options?: {
  maxPerFeed?: number;
  maxTotal?: number;
  feedKeys?: string[];
}): Promise<ToiRssItem[]> {
  const maxPerFeed = options?.maxPerFeed ?? 10;
  const maxTotal = options?.maxTotal ?? 48;
  const allow = options?.feedKeys ? new Set(options.feedKeys) : null;

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
      // latest feed is noisier — take more rows so we don't miss breakers
      const take =
        feed.key === "latest" || feed.key === "entertainment"
          ? Math.max(maxPerFeed, 12)
          : maxPerFeed;
      for (const item of parseRssItems(xml, feed.key, take)) {
        const key = item.link.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(item);
      }
    })
  );

  merged.sort((a, b) => {
    const ds = toiTrendingScore(b) - toiTrendingScore(a);
    if (ds !== 0) return ds;
    return publishedMs(b) - publishedMs(a);
  });

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
  if (item.feedKey === "entertainment" || item.feedKey === "lifestyle") {
    if (/\b(cricket|ipl|football)\b/.test(text)) return "sports";
  }
  if (
    /\b(tiger shroff|salman|shahrukh|srk|deepika|ranveer|bollywood|actor|actress|film|movie|box office|ott)\b/.test(
      text
    )
  ) {
    return "movies";
  }
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
    /\b(election|minister|parliament|bjp|congress|policy|govt|government|modi|pm\b)\b/.test(
      text
    )
  ) {
    return "lifestyle";
  }
  return feed?.categoryHint ?? "lifestyle";
}
