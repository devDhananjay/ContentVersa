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

export type LiveNewsCard = {
  id: string;
  title: string;
  href: string;
  excerpt: string;
  categoryLabel: string;
  feedLabel: string;
  publishedAt: string;
  hasBriefing: boolean;
  /** Always false for home — we keep readers on ContentVerse */
  isExternal: boolean;
  imageUrl?: string | null;
};

const FEED_LABELS: Record<string, string> = {
  top: "Top stories",
  india: "India",
  business: "Business",
  sports: "Sports",
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

async function loadToiBriefings(limit: number): Promise<ToiBlogRow[]> {
  if (!isDatabaseConfigured()) return [];
  return safeDbQuery([] as ToiBlogRow[], () =>
    prisma.blog.findMany({
      where: {
        status: "PUBLISHED",
        metaKeywords: { contains: "toi-rewrite" },
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
    cards.push({
      id: brief.id,
      title: brief.title,
      href: `/blog/${brief.slug}`,
      excerpt: (brief.excerpt || "").slice(0, 140),
      categoryLabel: brief.category?.name ?? "India",
      feedLabel: "Briefing",
      publishedAt:
        brief.publishedAt?.toISOString() || brief.createdAt.toISOString(),
      hasBriefing: true,
      isExternal: false,
      imageUrl: brief.coverImage,
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
        publishedAt:
          brief.publishedAt?.toISOString() ||
          item.publishedAt ||
          brief.createdAt.toISOString(),
        hasBriefing: true,
        isExternal: false,
        imageUrl: brief.coverImage || item.imageUrl,
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
        publishedAt: item.publishedAt || new Date().toISOString(),
        hasBriefing: false,
        isExternal: false,
        imageUrl: item.imageUrl,
      });
    }
  }

  return cards.slice(0, limit);
}

async function fetchLiveNewsUncached(limit: number): Promise<LiveNewsCard[]> {
  const [rss, briefs] = await Promise.all([
    fetchToiRssHeadlines({ maxPerFeed: 4, maxTotal: Math.max(limit, 10) }).catch(
      () => [] as ToiRssItem[]
    ),
    loadToiBriefings(Math.max(limit, 12)),
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
    [`live-news-home-v2-${limit}`],
    { revalidate: 180, tags: ["live-news"] }
  );
  try {
    return await cached();
  } catch (err) {
    console.warn("[live-news] cache/fetch failed", err);
    return fetchLiveNewsUncached(limit).catch(() => []);
  }
}

/** Full news desk for /news page — more briefings + live RSS pending. */
export async function getNewsDesk(limit = 24): Promise<LiveNewsCard[]> {
  return fetchLiveNewsUncached(limit);
}

export function liveNewsFeedKeys(): string[] {
  return TOI_RSS_FEEDS.map((f) => f.key);
}
