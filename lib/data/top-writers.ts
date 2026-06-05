import { cache } from "react";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { mapUserToAuthor } from "@/lib/data/blog-db";
import { AUTHORS } from "@/lib/data/blogs";
import type { Author } from "@/lib/data/blogs";

export type TopWriterRow = Author & { score: number };

export async function getTopWritersForCategory(
  categorySlug: string,
  limit = 5
): Promise<TopWriterRow[]> {
  if (!isDatabaseConfigured()) {
    return AUTHORS.slice(0, limit).map((a, i) => ({
      ...a,
      score: 100 - i * 10,
    }));
  }

  const blogs = await prisma.blog.findMany({
    where: {
      status: "PUBLISHED",
      category: { slug: categorySlug },
    },
    select: {
      views: true,
      likesCount: true,
      authorId: true,
      author: { include: { profile: true } },
    },
  });

  if (blogs.length === 0) return [];

  const byAuthor = new Map<
    string,
    { user: (typeof blogs)[0]["author"]; views: number; likes: number; posts: number }
  >();

  for (const b of blogs) {
    const cur = byAuthor.get(b.authorId);
    if (cur) {
      cur.views += b.views;
      cur.likes += b.likesCount;
      cur.posts += 1;
    } else {
      byAuthor.set(b.authorId, {
        user: b.author,
        views: b.views,
        likes: b.likesCount,
        posts: 1,
      });
    }
  }

  const authorIds = [...byAuthor.keys()];
  const followerCounts = await prisma.follower.groupBy({
    by: ["followingId"],
    where: { followingId: { in: authorIds } },
    _count: { followingId: true },
  });
  const followersMap = Object.fromEntries(
    followerCounts.map((r) => [r.followingId, r._count.followingId])
  );

  const scored = [...byAuthor.entries()].map(([id, data]) => {
    const followers = followersMap[id] ?? 0;
    const score =
      data.views + data.likes * 5 + data.posts * 50 + followers * 10;
    return {
      ...mapUserToAuthor(data.user, data.posts, followers),
      score,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export const getTopWritersForCategoryCached = cache(getTopWritersForCategory);
