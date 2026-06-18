import { cache } from "react";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getPublishedBlogsLiteHybrid } from "@/lib/data/blog-db";
import type { Blog } from "@/lib/data/blogs";

function scoreBlog(
  blog: Blog,
  followedCategories: Set<string>,
  tagWeights: Map<string, number>,
  categoryWeights: Map<string, number>,
  readBlogIds: Set<string>
): number {
  if (readBlogIds.has(blog.id)) return -1;

  let score = blog.likes * 0.3 + blog.views * 0.01;
  if (followedCategories.has(blog.category)) score += 50;
  const catW = categoryWeights.get(blog.category) ?? 0;
  score += catW * 8;
  for (const t of blog.tags) {
    score += (tagWeights.get(t) ?? 0) * 5;
  }
  if (blog.editorPick) score += 15;
  if (blog.featured) score += 10;
  return score;
}

export const getForYouFeed = cache(async (userId: string, limit = 8): Promise<Blog[]> => {
  const fallback = (await getPublishedBlogsLiteHybrid()).slice(0, limit);

  if (!isDatabaseConfigured() || !userId) return fallback;

  const [subs, history] = await Promise.all([
    prisma.categorySubscription.findMany({
      where: { userId },
      include: { category: { select: { slug: true } } },
    }),
    prisma.readingHistory.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 80,
      select: { blogId: true, category: true, tags: true, progress: true },
    }),
  ]);

  const followedCategories = new Set(
    subs.map((s) => s.category.slug).filter(Boolean)
  );
  const tagWeights = new Map<string, number>();
  const categoryWeights = new Map<string, number>();
  const readBlogIds = new Set<string>();

  for (const row of history) {
    if (row.progress >= 80) readBlogIds.add(row.blogId);
    if (row.category) {
      categoryWeights.set(
        row.category,
        (categoryWeights.get(row.category) ?? 0) + 1
      );
    }
    const tags = Array.isArray(row.tags) ? (row.tags as string[]) : [];
    for (const t of tags) {
      tagWeights.set(t, (tagWeights.get(t) ?? 0) + 1);
    }
  }

  const all = await getPublishedBlogsLiteHybrid();
  const ranked = all
    .map((b) => ({ blog: b, score: scoreBlog(b, followedCategories, tagWeights, categoryWeights, readBlogIds) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.blog);

  return ranked.length > 0 ? ranked : fallback;
});
