import { cache } from "react";
import type { ReelMediaType, ReelStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured, safeDbQuery } from "@/lib/prisma";
import type { ReelDashboardRow, ReelItem } from "@/lib/reels/types";

const EMPTY_STATS = {
  totalViews: 0,
  totalReels: 0,
  publishedReels: 0,
  views30d: 0,
};

function safeReelQuery<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  return safeDbQuery(fallback, fn, "reels");
}

type ReelWithAuthor = {
  id: string;
  caption: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaType: ReelMediaType;
  durationSec: number | null;
  views: number;
  likesCount: number;
  commentsCount: number;
  status: ReelStatus;
  publishedAt: Date | null;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
    profile: { isVerified: boolean } | null;
  };
  category: { slug: string } | null;
  relatedBlog: { slug: string; title: string } | null;
};

function mapReel(row: ReelWithAuthor): ReelItem {
  return {
    id: row.id,
    caption: row.caption,
    mediaUrl: row.mediaUrl,
    thumbnailUrl: row.thumbnailUrl,
    mediaType: row.mediaType,
    durationSec: row.durationSec,
    views: row.views,
    likesCount: row.likesCount,
    commentsCount: row.commentsCount ?? 0,
    status: row.status,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    author: {
      id: row.author.id,
      name: row.author.name || row.author.username,
      username: row.author.username,
      image: row.author.image,
      isVerified: row.author.profile?.isVerified ?? false,
    },
    categorySlug: row.category?.slug ?? null,
    relatedBlog: row.relatedBlog
      ? { slug: row.relatedBlog.slug, title: row.relatedBlog.title }
      : null,
  };
}

function mapDashboardRow(row: {
  id: string;
  caption: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaType: ReelMediaType;
  views: number;
  likesCount: number;
  status: ReelStatus;
  publishedAt: Date | null;
  createdAt: Date;
}): ReelDashboardRow {
  return {
    id: row.id,
    caption: row.caption,
    mediaUrl: row.mediaUrl,
    thumbnailUrl: row.thumbnailUrl,
    mediaType: row.mediaType,
    views: row.views,
    likesCount: row.likesCount,
    status: row.status,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

const authorSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
  profile: { select: { isVerified: true } },
} as const;

export async function getPublishedReels(opts?: {
  limit?: number;
  cursor?: string;
  authorId?: string;
}): Promise<{ reels: ReelItem[]; nextCursor: string | null }> {
  if (!isDatabaseConfigured()) return { reels: [], nextCursor: null };

  return safeReelQuery({ reels: [], nextCursor: null }, async () => {
    const limit = Math.min(opts?.limit ?? 20, 50);
    const rows = await prisma.reel.findMany({
      where: {
        status: "PUBLISHED",
        ...(opts?.authorId ? { authorId: opts.authorId } : {}),
        ...(opts?.cursor ? { createdAt: { lt: new Date(opts.cursor) } } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: limit + 1,
      include: {
        author: { select: authorSelect },
        category: { select: { slug: true } },
        relatedBlog: { select: { slug: true, title: true } },
      },
    });

    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? slice[slice.length - 1]!.createdAt.toISOString() : null;

    return { reels: slice.map(mapReel), nextCursor };
  });
}

export async function getReelById(id: string): Promise<ReelItem | null> {
  if (!isDatabaseConfigured()) return null;

  return safeReelQuery(null, async () => {
    const row = await prisma.reel.findUnique({
      where: { id },
      include: {
        author: { select: authorSelect },
        category: { select: { slug: true } },
        relatedBlog: { select: { slug: true, title: true } },
      },
    });
    if (!row) return null;
    if (row.status !== "PUBLISHED") return null;
    return mapReel(row);
  });
}

/** Dedupes metadata + page fetches within one request. */
export const getReelByIdCached = cache(getReelById);

/** Header strip — cached per request (shared with pages that use the same limit). */
export const getPublishedReelsStripCached = cache(() => getPublishedReels({ limit: 16 }));

/** Full reels feed page — cached per request. */
export const getPublishedReelsFeedCached = cache(() => getPublishedReels({ limit: 30 }));

export async function getUserReelById(
  reelId: string,
  authorId: string
): Promise<ReelDashboardRow | null> {
  if (!isDatabaseConfigured()) return null;

  return safeReelQuery(null, async () => {
    const row = await prisma.reel.findFirst({
      where: { id: reelId, authorId },
      select: {
        id: true,
        caption: true,
        mediaUrl: true,
        thumbnailUrl: true,
        mediaType: true,
        views: true,
        likesCount: true,
        status: true,
        publishedAt: true,
        createdAt: true,
      },
    });
    return row ? mapDashboardRow(row) : null;
  });
}

export async function getUserReels(authorId: string): Promise<ReelDashboardRow[]> {
  if (!isDatabaseConfigured()) return [];

  return safeReelQuery([], async () => {
    const rows = await prisma.reel.findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        caption: true,
        mediaUrl: true,
        thumbnailUrl: true,
        mediaType: true,
        views: true,
        likesCount: true,
        status: true,
        publishedAt: true,
        createdAt: true,
      },
    });
    return rows.map(mapDashboardRow);
  });
}

export async function getUserReelStats(authorId: string) {
  if (!isDatabaseConfigured()) {
    return { totalViews: 0, totalReels: 0, publishedReels: 0, views30d: 0 };
  }

  return safeReelQuery(EMPTY_STATS, async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [reels, views30d] = await Promise.all([
      prisma.reel.findMany({
        where: { authorId },
        select: { views: true, status: true },
      }),
      prisma.reelView.count({
        where: {
          reel: { authorId },
          viewedAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    return {
      totalViews: reels.reduce((s, r) => s + r.views, 0),
      totalReels: reels.length,
      publishedReels: reels.filter((r) => r.status === "PUBLISHED").length,
      views30d,
    };
  });
}

export async function getViewedReelIds(
  reelIds: string[],
  opts: { userId?: string; visitorKey?: string }
): Promise<string[]> {
  if (!isDatabaseConfigured() || reelIds.length === 0) return [];
  if (!opts.userId && !opts.visitorKey) return [];

  return safeReelQuery([], async () => {
    const rows = await prisma.reelView.findMany({
      where: {
        reelId: { in: reelIds },
        ...(opts.userId ? { userId: opts.userId } : { visitorKey: opts.visitorKey }),
      },
      select: { reelId: true },
    });
    return rows.map((r) => r.reelId);
  });
}

export async function incrementReelView(
  reelId: string,
  opts: { userId?: string; visitorKey?: string }
) {
  if (!isDatabaseConfigured()) return false;
  if (!opts.userId && !opts.visitorKey) return false;

  const where = opts.userId
    ? { userId_reelId: { userId: opts.userId, reelId } }
    : { visitorKey_reelId: { visitorKey: opts.visitorKey!, reelId } };

  return safeReelQuery(false, async () => {
    const existing = await prisma.reelView.findUnique({ where });
    if (existing) return false;

    await prisma.$transaction([
      prisma.reelView.create({
        data: {
          reelId,
          userId: opts.userId,
          visitorKey: opts.visitorKey,
        },
      }),
      prisma.reel.update({
        where: { id: reelId },
        data: { views: { increment: 1 } },
      }),
    ]);

    return true;
  });
}
