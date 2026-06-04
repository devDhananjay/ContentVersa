import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import type { Blog } from "@/lib/data/blogs";
import { BLOGS } from "@/lib/data/blogs";
import { getPublishedBlogsLiteHybrid } from "@/lib/data/blog-db";

const MAX_SECONDS_PER_REQUEST = 120;

export async function recordReadingProgress(input: {
  blogId: string;
  category: string;
  tags: string[];
  userId?: string | null;
  visitorKey?: string | null;
  seconds?: number;
  progress?: number;
}) {
  if (!isDatabaseConfigured()) return null;
  if (!input.userId && !input.visitorKey) return null;

  const addSeconds = Math.min(
    MAX_SECONDS_PER_REQUEST,
    Math.max(0, Math.floor(input.seconds ?? 0))
  );
  const progress = Math.min(
    100,
    Math.max(0, Math.floor(input.progress ?? 0))
  );
  const tagsJson = input.tags;

  const where = input.userId
    ? { userId_blogId: { userId: input.userId, blogId: input.blogId } }
    : { visitorKey_blogId: { visitorKey: input.visitorKey!, blogId: input.blogId } };

  const existing = await prisma.readingHistory.findUnique({ where });

  if (existing) {
    const nextProgress = Math.max(existing.progress, progress);
    const nextSeconds = existing.secondsRead + addSeconds;
    const row = await prisma.readingHistory.update({
      where: { id: existing.id },
      data: {
        category: input.category,
        tags: tagsJson,
        progress: nextProgress,
        secondsRead: nextSeconds,
        readAt: new Date(),
      },
    });
    if (input.userId) {
      void prisma.profile.updateMany({
        where: { userId: input.userId },
        data: { lastActiveAt: new Date() },
      });
    }
    return row;
  }

  const row = await prisma.readingHistory.create({
    data: {
      userId: input.userId ?? undefined,
      visitorKey: input.visitorKey ?? undefined,
      blogId: input.blogId,
      category: input.category,
      tags: tagsJson,
      progress,
      secondsRead: addSeconds,
    },
  });
  if (input.userId) {
    void prisma.profile.updateMany({
      where: { userId: input.userId },
      data: { lastActiveAt: new Date() },
    });
  }
  return row;
}

/** @deprecated Use recordReadingProgress */
export async function recordBlogRead(input: {
  blogId: string;
  category: string;
  tags: string[];
  userId?: string | null;
  visitorKey?: string | null;
}) {
  return recordReadingProgress({ ...input, seconds: 0, progress: 5 });
}

export async function getUserReadingStats(userId: string) {
  if (!isDatabaseConfigured()) {
    return {
      totalSeconds: 0,
      articlesRead: 0,
      recent: [] as {
        blogId: string;
        slug: string;
        title: string;
        secondsRead: number;
        progress: number;
      }[],
    };
  }

  const rows = await prisma.readingHistory.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      secondsRead: true,
      progress: true,
      blog: { select: { id: true, slug: true, title: true } },
    },
  });

  const totalSeconds = rows.reduce((s, r) => s + r.secondsRead, 0);

  return {
    totalSeconds,
    articlesRead: rows.length,
    recent: rows.slice(0, 10).map((r) => ({
      blogId: r.blog.id,
      slug: r.blog.slug,
      title: r.blog.title,
      secondsRead: r.secondsRead,
      progress: r.progress,
    })),
  };
}

export async function getBlogReadingForReader(
  blogId: string,
  reader: { userId?: string | null; visitorKey?: string | null }
) {
  if (!isDatabaseConfigured()) return null;
  if (!reader.userId && !reader.visitorKey) return null;

  const where = reader.userId
    ? { userId_blogId: { userId: reader.userId, blogId } }
    : { visitorKey_blogId: { visitorKey: reader.visitorKey!, blogId } };

  return prisma.readingHistory.findUnique({
    where,
    select: { secondsRead: true, progress: true, updatedAt: true },
  });
}

function scoreBlog(
  blog: Blog,
  prefs: { categories: Map<string, number>; tags: Map<string, number> },
  excludeSlug: string
) {
  if (blog.slug === excludeSlug) return -1;
  let score = 0;
  score += (prefs.categories.get(blog.category) || 0) * 3;
  for (const tag of blog.tags) {
    score += (prefs.tags.get(tag.toLowerCase()) || 0) * 2;
  }
  if (blog.trending) score += 1;
  if (blog.editorPick) score += 1;
  return score;
}

export async function getPersonalizedRecommendations(
  currentSlug: string,
  limit = 3,
  reader?: { userId?: string | null; visitorKey?: string | null }
): Promise<Blog[]> {
  const all = await getPublishedBlogsLiteHybrid(40);
  const categories = new Map<string, number>();
  const tags = new Map<string, number>();

  if (isDatabaseConfigured() && (reader?.userId || reader?.visitorKey)) {
    const history = await prisma.readingHistory.findMany({
      where: reader.userId
        ? { userId: reader.userId }
        : { visitorKey: reader.visitorKey! },
      orderBy: { readAt: "desc" },
      take: 20,
      select: { category: true, tags: true, blog: { select: { slug: true } } },
    });

    for (const row of history) {
      if (row.blog.slug === currentSlug) continue;
      if (row.category) {
        categories.set(row.category, (categories.get(row.category) || 0) + 1);
      }
      const rowTags = Array.isArray(row.tags) ? (row.tags as string[]) : [];
      for (const t of rowTags) {
        tags.set(String(t).toLowerCase(), (tags.get(String(t).toLowerCase()) || 0) + 1);
      }
    }
  }

  const current = all.find((b) => b.slug === currentSlug);
  if (current) {
    categories.set(current.category, (categories.get(current.category) || 0) + 2);
    for (const t of current.tags) {
      tags.set(t.toLowerCase(), (tags.get(t.toLowerCase()) || 0) + 1);
    }
  }

  const hasPrefs = categories.size > 0 || tags.size > 0;

  const ranked = all
    .map((blog) => ({
      blog,
      score: hasPrefs ? scoreBlog(blog, { categories, tags }, currentSlug) : 0,
    }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);

  if (hasPrefs && ranked.length > 0) {
    return ranked.slice(0, limit).map((x) => x.blog);
  }

  const sameCategory = all.filter(
    (b) => b.slug !== currentSlug && b.category === current?.category
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  return BLOGS.filter((b) => b.slug !== currentSlug)
    .slice(0, limit)
    .map((b) => all.find((x) => x.slug === b.slug) || b)
    .slice(0, limit);
}
