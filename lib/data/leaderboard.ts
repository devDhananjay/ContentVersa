import { cache } from "react";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { mapUserToAuthor } from "@/lib/data/blog-db";
import { AUTHORS } from "@/lib/data/blogs";

export type LeaderboardEntry = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  verified: boolean;
  followers: number;
  blogs: number;
  totalViews: number;
  totalLikes: number;
  score: number;
  growth: number;
  rank: number;
};

function mockLeaderboard(): LeaderboardEntry[] {
  return [...AUTHORS]
    .sort((a, b) => b.followers - a.followers)
    .map((a, i) => ({
      id: a.id,
      name: a.name,
      username: a.username,
      avatar: a.avatar,
      bio: a.bio,
      verified: a.verified,
      followers: a.followers,
      blogs: a.blogs,
      totalViews: a.blogs * 12_000,
      totalLikes: a.blogs * 800,
      score: a.followers * 10 + a.blogs * 50,
      growth: Math.max(3, 12 - i * 2),
      rank: i + 1,
    }));
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  if (!isDatabaseConfigured()) {
    return mockLeaderboard().slice(0, limit);
  }

  const weekAgo = new Date(Date.now() - 7 * 86400000);

  const users = await prisma.user.findMany({
    where: {
      banned: false,
      blogs: { some: { status: "PUBLISHED" } },
    },
    include: {
      profile: true,
      blogs: {
        where: { status: "PUBLISHED" },
        select: {
          views: true,
          likesCount: true,
          publishedAt: true,
        },
      },
      _count: {
        select: { followers: true },
      },
    },
    take: 100,
  });

  if (users.length === 0) {
    return mockLeaderboard().slice(0, limit);
  }

  const scored = users.map((user) => {
    const published = user.blogs;
    const totalViews = published.reduce((s, b) => s + b.views, 0);
    const totalLikes = published.reduce((s, b) => s + b.likesCount, 0);
    const recentViews = published
      .filter((b) => b.publishedAt && b.publishedAt >= weekAgo)
      .reduce((s, b) => s + b.views, 0);
    const olderViews = Math.max(1, totalViews - recentViews);
    const growth = Math.min(
      99,
      Math.round((recentViews / olderViews) * 100)
    );

    const followers = user._count.followers;
    const blogs = published.length;
    const score =
      totalViews + totalLikes * 8 + followers * 25 + blogs * 120;

    const author = mapUserToAuthor(user, blogs, followers);

    return {
      id: author.id,
      name: author.name,
      username: author.username,
      avatar: author.avatar,
      bio: author.bio,
      verified: author.verified,
      followers,
      blogs,
      totalViews,
      totalLikes,
      score,
      growth: growth || 5,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry, i) => ({
    ...entry,
    rank: i + 1,
  }));
}

export const getLeaderboardCached = cache(() => getLeaderboard(20));
