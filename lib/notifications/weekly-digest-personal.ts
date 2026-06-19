import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export type DigestArticle = {
  title: string;
  slug: string;
  excerpt: string | null;
  reason?: "followed" | "unread" | "trending";
};

const ARTICLE_SELECT = {
  title: true,
  slug: true,
  excerpt: true,
  id: true,
  views: true,
  publishedAt: true,
} as const;

export async function resolveUserIdFromEmail(email: string): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function buildPersonalizedDigestArticles(opts: {
  userId?: string | null;
  email?: string | null;
  limit?: number;
}): Promise<DigestArticle[]> {
  const limit = opts.limit ?? 5;
  if (!isDatabaseConfigured()) return [];

  let userId = opts.userId ?? null;
  if (!userId && opts.email) {
    userId = await resolveUserIdFromEmail(opts.email);
  }

  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const trending = await prisma.blog.findMany({
    where: { status: "PUBLISHED", publishedAt: { gte: weekAgo } },
    orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
    take: 20,
    select: ARTICLE_SELECT,
  });

  if (!userId) {
    return trending.slice(0, limit).map((b) => ({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      reason: "trending" as const,
    }));
  }

  const [subs, history] = await Promise.all([
    prisma.categorySubscription.findMany({
      where: { userId },
      include: { category: { select: { slug: true, name: true } } },
    }),
    prisma.readingHistory.findMany({
      where: { userId },
      select: { blogId: true, progress: true },
    }),
  ]);

  const followedSlugs = subs.map((s) => s.category.slug).filter(Boolean);
  const readIds = new Set(
    history.filter((h) => h.progress >= 80).map((h) => h.blogId)
  );
  const picked = new Map<string, DigestArticle>();

  const add = (blog: (typeof trending)[0], reason: DigestArticle["reason"]) => {
    if (picked.has(blog.id) || readIds.has(blog.id)) return;
    picked.set(blog.id, {
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      reason,
    });
  };

  if (followedSlugs.length > 0) {
    const fromFollowed = await prisma.blog.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: weekAgo },
        category: { slug: { in: followedSlugs } },
      },
      orderBy: [{ publishedAt: "desc" }, { views: "desc" }],
      take: 15,
      select: ARTICLE_SELECT,
    });
    for (const b of fromFollowed) {
      add(b, "followed");
      if (picked.size >= limit) break;
    }
  }

  if (picked.size < limit) {
    const unreadTrending = await prisma.blog.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: weekAgo },
        id: { notIn: [...readIds, ...picked.keys()] },
      },
      orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
      take: 15,
      select: ARTICLE_SELECT,
    });
    for (const b of unreadTrending) {
      add(b, "unread");
      if (picked.size >= limit) break;
    }
  }

  if (picked.size < limit) {
    for (const b of trending) {
      add(b, "trending");
      if (picked.size >= limit) break;
    }
  }

  return [...picked.values()].slice(0, limit);
}
