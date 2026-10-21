/**
 * Home "Live News" — TOI RSS headlines + matched ContentVerse briefings.
 */

import { unstable_cache } from "next/cache";
import { prisma, isDatabaseConfigured, safeDbQuery } from "@/lib/prisma";
import {
  fetchToiRssHeadlines,
  TOI_RSS_FEEDS,
  toiSourceKey,
  type ToiRssItem,
} from "@/lib/seo/toi-rss";
import { resolveNewsDisplayCover } from "@/lib/seo/toi-cover-url";

function newsCoverUrl(url: string | null | undefined): string | null {
  return resolveNewsDisplayCover(url);
}

export type LiveNewsCard = {
  id: string;
  title: string;
  href: string;
  excerpt: string;
  categoryLabel: string;
  feedLabel: string;
  /** Stable filter key: entertainment | india | business | cricket | … | briefing */
  feedKey: string;
  publishedAt: string;
  hasBriefing: boolean;
  /** Always false for home — we keep readers on ContentVerse */
  isExternal: boolean;
  imageUrl?: string | null;
};

export type NewsDeskPayload = {
  items: LiveNewsCard[];
  /** Top trending keywords derived from recent briefing titles */
  trendingKeywords: string[];
  filters: { key: string; label: string; count: number }[];
  total: number;
  sinceHours: number;
};

const FEED_LABELS: Record<string, string> = {
  entertainment: "Entertainment",
  latest: "Latest",
  top: "Top stories",
  india: "India",
  lifestyle: "Lifestyle",
  cricket: "Cricket",
  business: "Business",
  sports: "Sports",
  world: "World",
};

function feedLabel(key: string): string {
  return FEED_LABELS[key] ?? key;
}

function categoryLabelFromSlug(slug: string | null | undefined): string {
  if (!slug) return "India";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type ToiBlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  metaKeywords: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  category: { name: string; slug: string } | null;
};

async function loadToiBriefings(
  limit: number,
  options?: { sinceHours?: number }
): Promise<ToiBlogRow[]> {
  if (!isDatabaseConfigured()) return [];
  const since =
    options?.sinceHours && options.sinceHours > 0
      ? new Date(Date.now() - options.sinceHours * 3_600_000)
      : undefined;
  return safeDbQuery([] as ToiBlogRow[], () =>
    prisma.blog.findMany({
      where: {
        status: "PUBLISHED",
        metaKeywords: { contains: "toi-rewrite" },
        ...(since
          ? {
              OR: [
                { publishedAt: { gte: since } },
                { publishedAt: null, createdAt: { gte: since } },
              ],
            }
          : {}),
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        metaKeywords: true,
        publishedAt: true,
        createdAt: true,
        category: { select: { name: true, slug: true } },
      },
    }),
    "live-news"
  );
}

function sourceKeyFromKeywords(meta: string | null): string | null {
  if (!meta) return null;
  const m = meta.match(/\btoi:[a-f0-9]{16}\b/i);
  return m?.[0]?.toLowerCase() ?? null;
}

function feedKeyFromKeywords(meta: string | null): string | null {
  if (!meta) return null;
  const m = meta.match(/\btoi-feed:([a-z0-9_-]+)\b/i);
  return m?.[1]?.toLowerCase() ?? null;
}

/** Generic / calendar noise — never show as "trending". */
const TREND_NOISE = new Set([
  "october",
  "november",
  "december",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "today",
  "family",
  "film",
  "movie",
  "films",
  "movies",
  "video",
  "report",
  "update",
  "live",
  "news",
  "india",
  "indian",
  "delhi",
  "mumbai",
  "after",
  "before",
  "about",
  "with",
  "from",
  "says",
  "said",
  "year",
  "years",
  "days",
  "week",
  "weeks",
  "court",
  "case",
  "police",
]);

/**
 * Prefer full people / topic phrases (kept together), longest first.
 * Matched case-insensitively inside titles.
 */
const KNOWN_TREND_PHRASES = [
  "tiger shroff",
  "salman khan",
  "shahrukh khan",
  "shah rukh khan",
  "deepika padukone",
  "ranveer singh",
  "alia bhatt",
  "katrina kaif",
  "rashmika mandanna",
  "rajinikanth",
  "allu arjun",
  "rahul gandhi",
  "narendra modi",
  "amit shah",
  "virat kohli",
  "rohit sharma",
  "ms dhoni",
  "shreyas iyer",
  "lawrence bishnoi",
  "priyanka chopra",
  "nick jonas",
  "ajay devgn",
  "tabu",
  "vijay deverakonda",
  "jailer 2",
  "box office",
  "world cup",
  "asian para games",
  "jio ipo",
  "donald trump",
  "elon musk",
].sort((a, b) => b.length - a.length);

function titleCasePhrase(phrase: string): string {
  return phrase
    .split(/\s+/)
    .map((w) => {
      if (/^[0-9]/.test(w)) return w.toUpperCase();
      if (w.length <= 2 && w === w.toLowerCase()) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function isNoisePhrase(phrase: string): boolean {
  const parts = phrase.toLowerCase().split(/\s+/).filter(Boolean);
  if (!parts.length) return true;
  if (parts.every((p) => TREND_NOISE.has(p))) return true;
  if (parts.length === 1 && TREND_NOISE.has(parts[0]!)) return true;
  return false;
}

/**
 * Top trending chips: multi-word names/topics first (e.g. "Tiger Shroff"),
 * not broken tokens like "Tiger" + "Shroff".
 */
export function extractTrendingKeywords(
  titles: string[],
  topN = 5
): string[] {
  const counts = new Map<string, number>();

  const bump = (raw: string, weight = 1) => {
    const key = raw.toLowerCase().replace(/\s+/g, " ").trim();
    if (key.length < 3 || isNoisePhrase(key)) return;
    counts.set(key, (counts.get(key) ?? 0) + weight);
  };

  for (const title of titles) {
    const lower = title.toLowerCase();
    const seenInTitle = new Set<string>();

    for (const phrase of KNOWN_TREND_PHRASES) {
      if (!lower.includes(phrase) || seenInTitle.has(phrase)) continue;
      seenInTitle.add(phrase);
      bump(phrase, 3);
    }

    // Proper-case runs: "Tiger Shroff", "James Dyson Award" (2–3 tokens)
    const properRuns = title.matchAll(
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/g
    );
    for (const m of properRuns) {
      const phrase = (m[1] || "").toLowerCase();
      if (seenInTitle.has(phrase) || isNoisePhrase(phrase)) continue;
      // Skip if already counted as part of a longer known phrase
      if (
        [...seenInTitle].some(
          (s) => s.includes(phrase) && s.length > phrase.length
        )
      ) {
        continue;
      }
      seenInTitle.add(phrase);
      bump(phrase, phrase.split(" ").length >= 2 ? 2 : 1);
    }
  }

  // Drop single-token entries when a multi-word phrase containing them ranks higher
  const ranked = [...counts.entries()].sort(
    (a, b) =>
      b[1] - a[1] ||
      b[0].split(" ").length - a[0].split(" ").length ||
      a[0].localeCompare(b[0])
  );

  const picked: string[] = [];
  for (const [phrase] of ranked) {
    if (picked.length >= topN) break;
    const tokens = phrase.split(" ");
    if (
      tokens.length === 1 &&
      picked.some((p) => p.toLowerCase().split(" ").includes(phrase))
    ) {
      continue;
    }
    if (
      tokens.length >= 2 &&
      picked.some((p) => phrase.includes(p.toLowerCase()) && p.includes(" "))
    ) {
      // Prefer already-picked longer/similar; skip near-duplicates
      continue;
    }
    picked.push(titleCasePhrase(phrase));
  }

  return picked;
}

function buildDeskFilters(items: LiveNewsCard[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = item.feedKey || "other";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const filters = [...counts.entries()]
    .map(([key, count]) => ({
      key,
      label: key === "briefing" ? "Briefing" : feedLabel(key),
      count,
    }))
    .sort((a, b) => b.count - a.count);
  return [{ key: "all", label: "All", count: items.length }, ...filters];
}

function buildCards(
  rss: ToiRssItem[],
  briefs: ToiBlogRow[],
  limit: number
): LiveNewsCard[] {
  const bySource = new Map<string, ToiBlogRow>();
  for (const b of briefs) {
    const key = sourceKeyFromKeywords(b.metaKeywords);
    if (key) bySource.set(key, b);
  }

  const usedBriefIds = new Set<string>();
  const cards: LiveNewsCard[] = [];

  // Prefer our published briefings first so home clicks stay on ContentVerse.
  for (const brief of briefs) {
    if (cards.length >= limit) break;
    usedBriefIds.add(brief.id);
    const fk =
      feedKeyFromKeywords(brief.metaKeywords) ||
      brief.category?.slug ||
      "briefing";
    cards.push({
      id: brief.id,
      title: brief.title,
      href: `/blog/${brief.slug}`,
      excerpt: (brief.excerpt || "").slice(0, 140),
      categoryLabel: brief.category?.name ?? "India",
      feedLabel: feedLabel(fk),
      feedKey: fk,
      publishedAt:
        brief.publishedAt?.toISOString() || brief.createdAt.toISOString(),
      hasBriefing: true,
      isExternal: false,
      imageUrl: newsCoverUrl(brief.coverImage),
    });
  }

  for (const item of rss) {
    if (cards.length >= limit) break;
    const key = toiSourceKey(item.link);
    const brief = bySource.get(key);
    if (brief) {
      if (usedBriefIds.has(brief.id)) continue;
      usedBriefIds.add(brief.id);
      cards.push({
        id: brief.id,
        title: brief.title,
        href: `/blog/${brief.slug}`,
        excerpt: (brief.excerpt || item.description || "").slice(0, 140),
        categoryLabel:
          brief.category?.name ?? categoryLabelFromSlug(brief.category?.slug),
        feedLabel: feedLabel(item.feedKey),
        feedKey: item.feedKey,
        publishedAt:
          brief.publishedAt?.toISOString() ||
          item.publishedAt ||
          brief.createdAt.toISOString(),
        hasBriefing: true,
        isExternal: false,
        imageUrl: newsCoverUrl(brief.coverImage || item.imageUrl),
      });
    } else {
      // No briefing yet — send to /news hub (never off-site TOI).
      cards.push({
        id: `rss-${key}`,
        title: item.title,
        href: "/news",
        excerpt: (
          item.description ||
          "Live headline — ContentVerse briefing updating shortly."
        ).slice(0, 140),
        categoryLabel: feedLabel(item.feedKey),
        feedLabel: feedLabel(item.feedKey),
        feedKey: item.feedKey,
        publishedAt: item.publishedAt || new Date().toISOString(),
        hasBriefing: false,
        isExternal: false,
        imageUrl: newsCoverUrl(item.imageUrl),
      });
    }
  }

  return cards
    .sort(
      (a, b) =>
        (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0)
    )
    .slice(0, limit);
}

async function fetchLiveNewsUncached(
  limit: number,
  options?: { briefLimit?: number; sinceHours?: number; maxRss?: number }
): Promise<LiveNewsCard[]> {
  const briefLimit = options?.briefLimit ?? Math.max(limit, 12);
  const maxRss = options?.maxRss ?? Math.max(limit, 10);
  const [rss, briefs] = await Promise.all([
    fetchToiRssHeadlines({
      maxPerFeed: 4,
      maxTotal: maxRss,
    }).catch(() => [] as ToiRssItem[]),
    loadToiBriefings(briefLimit, { sinceHours: options?.sinceHours }),
  ]);

  if (rss.length === 0 && briefs.length === 0) {
    return [];
  }

  return buildCards(rss, briefs, limit);
}

/** Cached ~3 min so home stays snappy while still feeling live. */
export async function getLiveNewsForHome(limit = 8): Promise<LiveNewsCard[]> {
  const cached = unstable_cache(
    () => fetchLiveNewsUncached(limit),
    [`live-news-home-v4-${limit}`],
    { revalidate: 120, tags: ["live-news"] }
  );
  try {
    return await cached();
  } catch (err) {
    console.warn("[live-news] cache/fetch failed", err);
    return fetchLiveNewsUncached(limit).catch(() => []);
  }
}

const NEWS_DESK_MONTH_HOURS = 24 * 30;

/**
 * Full news desk for /news — last ~30 days of TOI briefings + live RSS,
 * with trending keywords and category filter counts for the UI.
 */
export async function getNewsDesk(limit = 600): Promise<NewsDeskPayload> {
  const sinceHours = NEWS_DESK_MONTH_HOURS;
  const items = await fetchLiveNewsUncached(limit, {
    briefLimit: Math.max(limit, 600),
    sinceHours,
    maxRss: 24,
  });
  const trendingKeywords = extractTrendingKeywords(
    items.filter((i) => i.hasBriefing).map((i) => i.title),
    5
  );
  return {
    items,
    trendingKeywords,
    filters: buildDeskFilters(items),
    total: items.length,
    sinceHours,
  };
}

export function liveNewsFeedKeys(): string[] {
  return TOI_RSS_FEEDS.map((f) => f.key);
}
