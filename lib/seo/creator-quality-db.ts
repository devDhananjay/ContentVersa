import { prisma } from "@/lib/prisma";
import {
  computeCreatorQuality,
  type CreatorQualityResult,
  type CreatorQualityStats,
} from "@/lib/seo/creator-quality";

export async function getCreatorQualityForUser(
  userId: string
): Promise<CreatorQualityResult> {
  const [user, published, rejected, pending, readingAgg] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        banned: true,
        warnings: true,
        profile: { select: { isVerified: true } },
      },
    }),
    prisma.blog.count({ where: { authorId: userId, status: "PUBLISHED" } }),
    prisma.blog.count({ where: { authorId: userId, status: "REJECTED" } }),
    prisma.blog.count({ where: { authorId: userId, status: "PENDING" } }),
    prisma.blog.aggregate({
      where: { authorId: userId, status: "PUBLISHED" },
      _avg: { readingTime: true },
    }),
  ]);

  const stats: CreatorQualityStats = {
    publishedCount: published,
    rejectedCount: rejected,
    pendingCount: pending,
    avgReadingTime: Math.round(readingAgg._avg.readingTime ?? 0),
    isVerified: user?.profile?.isVerified ?? false,
    warnings: user?.warnings ?? 0,
    banned: user?.banned ?? false,
  };

  return computeCreatorQuality(stats);
}
