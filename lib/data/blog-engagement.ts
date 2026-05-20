import type { ReactionType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export const REACTION_TYPES = ["LIKE", "LOVE", "FIRE", "CLAP", "INSIGHTFUL"] as const;
export type ReactionTypeKey = (typeof REACTION_TYPES)[number];

export type BlogEngagement = {
  totalReactions: number;
  counts: Record<ReactionTypeKey, number>;
  userReaction: ReactionTypeKey | null;
  bookmarked: boolean;
};

const emptyCounts = (): Record<ReactionTypeKey, number> => ({
  LIKE: 0,
  LOVE: 0,
  FIRE: 0,
  CLAP: 0,
  INSIGHTFUL: 0,
});

export async function syncBlogLikesCount(blogId: string): Promise<number> {
  const total = await prisma.reaction.count({ where: { blogId } });
  await prisma.blog.update({
    where: { id: blogId },
    data: { likesCount: total },
  });
  return total;
}

export async function getBlogEngagement(
  blogId: string,
  userId?: string | null
): Promise<BlogEngagement | null> {
  if (!isDatabaseConfigured()) return null;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { likesCount: true },
  });
  if (!blog) return null;

  const grouped = await prisma.reaction.groupBy({
    by: ["type"],
    where: { blogId },
    _count: { type: true },
  });

  const counts = emptyCounts();
  let totalReactions = 0;
  for (const row of grouped) {
    const key = row.type as ReactionTypeKey;
    if (REACTION_TYPES.includes(key)) {
      counts[key] = row._count.type;
      totalReactions += row._count.type;
    }
  }

  let userReaction: ReactionTypeKey | null = null;
  let bookmarked = false;

  if (userId) {
    const userReactions = await prisma.reaction.findMany({
      where: { blogId, userId },
      select: { type: true },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    if (userReactions[0]) {
      userReaction = userReactions[0].type as ReactionTypeKey;
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: { blogId_userId: { blogId, userId } },
    });
    bookmarked = !!bookmark;
  }

  return {
    totalReactions: totalReactions || blog.likesCount,
    counts,
    userReaction,
    bookmarked,
  };
}

export async function toggleReaction(
  blogId: string,
  userId: string,
  type: ReactionType
): Promise<BlogEngagement> {
  const existing = await prisma.reaction.findUnique({
    where: { blogId_userId_type: { blogId, userId, type } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.deleteMany({ where: { blogId, userId } });
    await prisma.reaction.create({
      data: { blogId, userId, type },
    });
  }

  await syncBlogLikesCount(blogId);
  const engagement = await getBlogEngagement(blogId, userId);
  return engagement!;
}

export async function toggleBookmark(
  blogId: string,
  userId: string
): Promise<{ bookmarked: boolean }> {
  const existing = await prisma.bookmark.findUnique({
    where: { blogId_userId: { blogId, userId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  }

  await prisma.bookmark.create({
    data: { blogId, userId },
  });
  return { bookmarked: true };
}
