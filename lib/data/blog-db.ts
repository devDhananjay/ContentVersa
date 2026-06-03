import { cache } from "react";
import type { BlogStatus, User, Profile, Category, Blog as DbBlog } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { PLATFORM_OWNER_EMAIL } from "@/lib/owner";
import type { Author, Blog } from "@/lib/data/blogs";
import { BLOGS, getBlogBySlug as getMockBlogBySlug } from "@/lib/data/blogs";

type BlogWithRelations = DbBlog & {
  author: User & { profile: Profile | null };
  category: Category | null;
};

export function mapUserToAuthor(
  user: User & { profile?: Profile | null },
  blogCount = 0,
  followers = 0
): Author {
  return {
    id: user.id,
    name: user.name || user.username,
    username: user.username,
    avatar:
      user.image ||
      `https://api.dicebear.com/8.x/notionists/svg?seed=${encodeURIComponent(user.username)}`,
    bio: user.profile?.bio || "",
    verified:
      user.profile?.isVerified ||
      user.role === "VERIFIED_CREATOR" ||
      user.role === "ADMIN" ||
      user.role === "SUPER_ADMIN",
    followers,
    blogs: blogCount,
  };
}

export function mapDbBlogToBlog(blog: BlogWithRelations): Blog {
  const author = mapUserToAuthor(blog.author);
  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt || "",
    content: blog.content,
    coverImage: blog.coverImage || "",
    readingTime: blog.readingTime,
    views: blog.views,
    likes: blog.likesCount,
    comments: blog.commentsCount,
    category: blog.category?.slug || "technology",
    tags: [],
    publishedAt: blog.publishedAt?.toISOString().slice(0, 10) || blog.createdAt.toISOString().slice(0, 10),
    author,
    featured: blog.isFeatured,
    editorPick: blog.isEditorPick,
    premium: blog.isPremium,
    trending: blog.views > 50_000,
  };
}

/** Lite row for lists / recommendations — no heavy `content` field */
type BlogLiteRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  readingTime: number;
  views: number;
  likesCount: number;
  commentsCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  isFeatured: boolean;
  isEditorPick: boolean;
  isPremium: boolean;
  author: User & { profile: Profile | null };
  category: Category | null;
};

function mapLiteToBlog(row: BlogLiteRow): Blog {
  const author = mapUserToAuthor(row.author);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || "",
    content: "",
    coverImage: row.coverImage || "",
    readingTime: row.readingTime,
    views: row.views,
    likes: row.likesCount,
    comments: row.commentsCount,
    category: row.category?.slug || "technology",
    tags: [],
    publishedAt:
      row.publishedAt?.toISOString().slice(0, 10) ||
      row.createdAt.toISOString().slice(0, 10),
    author,
    featured: row.isFeatured,
    editorPick: row.isEditorPick,
    premium: row.isPremium,
    trending: row.views > 50_000,
  };
}

const blogInclude = {
  author: { include: { profile: true } },
  category: true,
} as const;

const blogLiteSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  readingTime: true,
  views: true,
  likesCount: true,
  commentsCount: true,
  publishedAt: true,
  createdAt: true,
  isFeatured: true,
  isEditorPick: true,
  isPremium: true,
  author: { include: { profile: true } },
  category: true,
} as const;

export async function getOwnerUser() {
  if (!isDatabaseConfigured()) return null;
  return prisma.user.findUnique({
    where: { email: PLATFORM_OWNER_EMAIL },
    include: { profile: true },
  });
}

export async function getUserByUsername(username: string) {
  if (!isDatabaseConfigured()) return null;
  return prisma.user.findUnique({
    where: { username },
    include: {
      profile: true,
      blogs: {
        where: { status: "PUBLISHED" },
        include: blogInclude,
        orderBy: { publishedAt: "desc" },
      },
    },
  });
}

export async function getPublishedBlogsFromDb(limit?: number) {
  if (!isDatabaseConfigured()) return null;
  const rows = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    include: blogInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map(mapDbBlogToBlog);
}

/** Fast list fetch without article body */
export async function getPublishedBlogsLiteFromDb(limit = 24) {
  if (!isDatabaseConfigured()) return null;
  const rows = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    select: blogLiteSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map(mapLiteToBlog);
}

export async function getBlogBySlugFromDb(slug: string) {
  if (!isDatabaseConfigured()) return null;
  const row = await prisma.blog.findUnique({
    where: { slug },
    include: blogInclude,
  });
  return row ? mapDbBlogToBlog(row) : null;
}

export const getBlogBySlugHybrid = cache(async (slug: string) => {
  const fromDb = await getBlogBySlugFromDb(slug);
  if (fromDb) return fromDb;
  return getMockBlogBySlug(slug) ?? null;
});

/** DB posts first, then mock posts not yet synced (same slugs as the public site). */
export async function getPublishedBlogsHybrid(limit?: number) {
  if (!isDatabaseConfigured()) {
    const mock = [...BLOGS].sort(
      (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
    );
    return limit ? mock.slice(0, limit) : mock;
  }

  const fromDb = (await getPublishedBlogsFromDb()) ?? [];
  const dbSlugs = new Set(fromDb.map((b) => b.slug));
  const mockExtra = BLOGS.filter((b) => !dbSlugs.has(b.slug));
  const merged = [...fromDb, ...mockExtra].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
  );
  return limit ? merged.slice(0, limit) : merged;
}

export async function getPublishedBlogsLiteHybrid(limit = 24) {
  const merged = await getPublishedBlogsHybrid(limit * 2);
  return merged
    .slice(0, limit)
    .map((b) => ({ ...b, content: "" }));
}

export async function getBlogsByCategoryHybrid(categorySlug: string, limit = 48) {
  const all = await getPublishedBlogsHybrid(limit * 2);
  return all.filter((b) => b.category === categorySlug).slice(0, limit);
}

export async function getBlogsByAuthorId(authorId: string) {
  if (!isDatabaseConfigured()) return [];
  const rows = await prisma.blog.findMany({
    where: { authorId },
    include: blogInclude,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapDbBlogToBlog);
}

export async function getBlogsByAuthorIdWithStatus(authorId: string) {
  if (!isDatabaseConfigured()) return [];
  return prisma.blog.findMany({
    where: { authorId },
    include: blogInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTrendingHybrid(limit = 6) {
  const all = await getPublishedBlogsLiteHybrid(limit * 2);
  const trending = all.filter((b) => b.trending);
  if (trending.length >= limit) return trending.slice(0, limit);
  return all.slice(0, limit);
}

export async function getBlogsForProfile(username: string) {
  const user = await getUserByUsername(username);
  if (user) {
    const followerCount = await prisma.follower.count({
      where: { followingId: user.id },
    });
    return {
      user: mapUserToAuthor(user, user.blogs.length, followerCount),
      userId: user.id,
      blogs: user.blogs.map((b) => mapDbBlogToBlog(b as BlogWithRelations)),
      fromDb: true as const,
    };
  }
  return null;
}

export type DashboardBlogRow = Blog & { status: BlogStatus };

export function mapDbBlogToDashboardRow(
  blog: BlogWithRelations & { status: BlogStatus }
): DashboardBlogRow {
  return { ...mapDbBlogToBlog(blog), status: blog.status };
}

export async function getFeaturedHybrid(limit = 3) {
  const all = await getPublishedBlogsLiteHybrid(40);
  const featured = all.filter((b) => b.featured);
  return featured.length >= limit ? featured.slice(0, limit) : all.slice(0, limit);
}

export async function getEditorPicksHybrid(limit = 4) {
  const all = await getPublishedBlogsLiteHybrid(40);
  const picks = all.filter((b) => b.editorPick);
  return picks.length >= limit ? picks.slice(0, limit) : all.slice(0, limit);
}

export async function getLatestHybrid(limit = 8) {
  return getPublishedBlogsLiteHybrid(limit);
}

export async function getCategoriesWithCountsHybrid() {
  const { CATEGORIES } = await import("@/lib/data/categories");
  if (!isDatabaseConfigured()) {
    return CATEGORIES.map((c) => ({
      ...c,
      blogCount: BLOGS.filter((b) => b.category === c.slug).length,
    }));
  }

  const rows = await prisma.category.findMany({
    include: {
      _count: { select: { blogs: { where: { status: "PUBLISHED" } } } },
    },
    orderBy: { order: "asc" },
  });

  if (rows.length === 0) {
    return CATEGORIES.map((c) => ({
      ...c,
      blogCount: BLOGS.filter((b) => b.category === c.slug).length,
    }));
  }

  const countBySlug = new Map(rows.map((r) => [r.slug, r._count.blogs]));

  return CATEGORIES.map((c) => ({
    ...c,
    blogCount: countBySlug.get(c.slug) ?? 0,
  })).filter((c) => c.blogCount > 0 || rows.some((r) => r.slug === c.slug));
}

export async function getFeaturedCreatorsHybrid(limit = 6) {
  const { getFeaturedAuthors } = await import("@/lib/data/blogs");

  if (!isDatabaseConfigured()) return getFeaturedAuthors(limit);

  const users = await prisma.user.findMany({
    where: {
      blogs: { some: { status: "PUBLISHED" } },
    },
    include: {
      profile: true,
      _count: { select: { blogs: { where: { status: "PUBLISHED" } } } },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  if (users.length === 0) {
    const owner = await getOwnerUser();
    if (owner) {
      const count = await prisma.blog.count({
        where: { authorId: owner.id, status: "PUBLISHED" },
      });
      return [mapUserToAuthor(owner, count)];
    }
    return getFeaturedAuthors(limit);
  }

  return users
    .sort((a, b) => b._count.blogs - a._count.blogs)
    .slice(0, limit)
    .map((u) => mapUserToAuthor(u, u._count.blogs));
}

export async function getPlatformStatsHybrid() {
  if (!isDatabaseConfigured()) {
    return {
      creators: "120K+",
      readers: "8.4M",
      paid: "$2.1M",
    };
  }

  const [userCount, agg] = await Promise.all([
    prisma.user.count(),
    prisma.blog.aggregate({
      where: { status: "PUBLISHED" },
      _sum: { views: true, likesCount: true },
      _count: true,
    }),
  ]);

  const views = agg._sum.views ?? 0;
  const format = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K+` : `${n}`;

  return {
    creators: userCount > 0 ? `${userCount}+` : "1+",
    readers: views > 0 ? format(views) : "—",
    paid: agg._sum.likesCount ? `$${format(agg._sum.likesCount * 2)}` : "—",
  };
}
