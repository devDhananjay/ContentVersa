import { callGeminiText, isGeminiConfigured } from "@/lib/ai/gemini";

export type TrendNewsItem = {
  title: string;
  url: string;
  source: string;
};

export type TrendItem = {
  title: string;
  traffic: string;
  slug: string;
  href: string;
  picture?: string;
  pictureSource?: string;
  newsItems: TrendNewsItem[];
  publishedAt?: string;
};

let memoryCache: { data: TrendItem[]; ts: number } | null = null;
const TTL_MS = 30 * 60 * 1000;

function decodeXml(s: string): string {
  return s
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * Keep letters, numbers, AND marks (Indic matras/virama/anusvara).
 * Previous `[^\p{L}\p{N}]+` turned "बांकीपुर" → "ब-क-प-र" and
 * titleFromSlug then showed "ब क प र" / "एकन थ श द"-style garbage.
 */
export function trendSlug(title: string): string {
  const slug = title
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return slug || "topic";
}

export function trendPath(slug: string): string {
  return `/trending/${slug}`;
}

function safeDecodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/** Letters+digits only — recovers lookups for legacy broken Indic slugs. */
function lettersOnly(s: string): string {
  return s.normalize("NFC").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
}

export function titleFromSlug(slug: string): string {
  return safeDecodeSlug(slug).replace(/-/g, " ").trim();
}

function parseRss(xml: string): TrendItem[] {
  const items: TrendItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const rawTitle =
      block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ??
      block.match(/<title>(.*?)<\/title>/)?.[1] ??
      "";
    const title = decodeXml(rawTitle);
    if (!title) continue;

    const traffic =
      block.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/)?.[1] ?? "";
    const picture = block.match(/<ht:picture>(.*?)<\/ht:picture>/)?.[1];
    const pictureSource =
      block.match(/<ht:picture_source>(.*?)<\/ht:picture_source>/)?.[1];
    const publishedAt = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

    const newsItems: TrendNewsItem[] = [];
    const newsRegex = /<ht:news_item>([\s\S]*?)<\/ht:news_item>/g;
    let nm: RegExpExecArray | null;
    while ((nm = newsRegex.exec(block)) !== null) {
      const nb = nm[1];
      const nTitle = decodeXml(
        nb.match(
          /<ht:news_item_title><!\[CDATA\[(.*?)\]\]><\/ht:news_item_title>/
        )?.[1] ??
          nb.match(/<ht:news_item_title>(.*?)<\/ht:news_item_title>/)?.[1] ??
          ""
      );
      const nUrl =
        nb.match(
          /<ht:news_item_url><!\[CDATA\[(.*?)\]\]><\/ht:news_item_url>/
        )?.[1] ??
        nb.match(/<ht:news_item_url>(.*?)<\/ht:news_item_url>/)?.[1] ??
        "";
      const nSource =
        nb.match(/<ht:news_item_source>(.*?)<\/ht:news_item_source>/)?.[1] ??
        "";
      if (nTitle && nUrl) {
        newsItems.push({ title: nTitle, url: nUrl, source: nSource });
      }
    }

    const slug = trendSlug(title);
    items.push({
      title,
      traffic,
      slug,
      href: trendPath(slug),
      picture: picture || undefined,
      pictureSource: pictureSource || undefined,
      newsItems: newsItems.slice(0, 5),
      publishedAt: publishedAt || undefined,
    });
  }

  return items;
}

export async function fetchIndiaTrends(): Promise<TrendItem[]> {
  if (memoryCache && Date.now() - memoryCache.ts < TTL_MS) {
    return memoryCache.data;
  }

  try {
    const res = await fetch(
      "https://trends.google.com/trending/rss?geo=IN",
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return memoryCache?.data ?? [];
    const xml = await res.text();
    const items = parseRss(xml);
    memoryCache = { data: items, ts: Date.now() };
    return items;
  } catch {
    return memoryCache?.data ?? [];
  }
}

export async function getTrendBySlug(
  slug: string
): Promise<TrendItem | null> {
  const trends = await fetchIndiaTrends();
  const decoded = safeDecodeSlug(slug).normalize("NFC");

  const exact = trends.find(
    (t) => t.slug === decoded || t.slug === slug
  );
  if (exact) return exact;

  // Soft match: ignore hyphens (legacy) and Indic marks so old
  // broken URLs like /trending/ब-क-प-र still resolve to बांकीपुर.
  const key = lettersOnly(decoded);
  if (!key) return null;

  return (
    trends.find(
      (t) => lettersOnly(t.slug) === key || lettersOnly(t.title) === key
    ) ?? null
  );
}

export async function summarizeTrend(trend: {
  title: string;
  traffic?: string;
  newsItems?: TrendNewsItem[];
}): Promise<{ summary: string; source: "gemini" | "local" }> {
  const headlines =
    trend.newsItems
      ?.slice(0, 5)
      .map((n, i) => `${i + 1}. ${n.title} (${n.source || "news"})`)
      .join("\n") || "No headlines available.";

  const local = [
    `"${trend.title}" is currently among India's Google Trends searches${
      trend.traffic ? ` (~${trend.traffic} searches)` : ""
    }.`,
    trend.newsItems?.length
      ? `Related coverage includes: ${trend.newsItems
          .slice(0, 3)
          .map((n) => n.title)
          .join("; ")}.`
      : "News coverage is still developing — check back soon or ask our chat for a plain-language explainer.",
    "This page keeps you on ContentVerse so you can read a short briefing and ask follow-up questions without leaving the site.",
  ].join("\n\n");

  if (!isGeminiConfigured()) {
    return { summary: local, source: "local" };
  }

  const system = `You are ContentVerse Trends editor for India.
Write a clear, neutral briefing (3 short paragraphs, max 180 words) about why a topic is trending.
Use ONLY the topic title, traffic estimate, and headlines provided — do not invent facts, scores, or quotes.
Mention that figures come from Google Trends (India) and headlines are from public news sources.
Write mostly in simple English; if the topic is clearly Hindi/regional India news, add one Hindi sentence at the end.
No markdown headings. You may use **bold** sparingly.`;

  const user = `Topic: ${trend.title}
Traffic estimate: ${trend.traffic || "n/a"}
Headlines:
${headlines}`;

  const ai = await callGeminiText(system, user, 450);
  if (ai && ai.length > 80) {
    return { summary: ai, source: "gemini" };
  }
  return { summary: local, source: "local" };
}

export function trendingSitemapEntries(
  trends: TrendItem[]
): Array<{ path: string; changeFrequency: "hourly"; priority: number }> {
  return [
    { path: "/trending", changeFrequency: "hourly", priority: 0.86 },
    ...trends.slice(0, 20).map((t) => ({
      path: trendPath(t.slug),
      changeFrequency: "hourly" as const,
      priority: 0.72,
    })),
  ];
}
