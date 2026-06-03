import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getBlogBySlug as getMockBlogBySlug } from "@/lib/data/blogs";
import { PLATFORM_OWNER_EMAIL } from "@/lib/owner";
import { readingTime } from "@/lib/utils";

export type ResolvedBlogRef = {
  id: string;
  slug: string;
  status: BlogStatus;
};

/** Ensure a visible blog (mock or DB) exists in Postgres for bookmarks, reactions, etc. */
export async function ensureBlogInDbBySlug(
  slug: string
): Promise<ResolvedBlogRef | null> {
  if (!isDatabaseConfigured()) return null;

  const existing = await prisma.blog.findUnique({
    where: { slug },
    select: { id: true, slug: true, status: true },
  });
  if (existing) return existing;

  const mock = getMockBlogBySlug(slug);
  if (!mock) return null;

  const owner = await prisma.user.findFirst({
    where: {
      OR: [
        { email: PLATFORM_OWNER_EMAIL },
        { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!owner) return null;

  let categoryId: string | null = null;
  if (mock.category) {
    const cat = await prisma.category.upsert({
      where: { slug: mock.category },
      create: {
        name: mock.category.charAt(0).toUpperCase() + mock.category.slice(1),
        slug: mock.category,
      },
      update: {},
      select: { id: true },
    });
    categoryId = cat.id;
  }

  const row = await prisma.blog.upsert({
    where: { slug: mock.slug },
    create: {
      title: mock.title,
      slug: mock.slug,
      excerpt: mock.excerpt,
      content: mock.content,
      coverImage: mock.coverImage,
      readingTime: mock.readingTime || readingTime(mock.content),
      status: BlogStatus.PUBLISHED,
      isFeatured: !!mock.featured,
      isEditorPick: !!mock.editorPick,
      isPremium: !!mock.premium,
      views: mock.views,
      likesCount: mock.likes,
      commentsCount: mock.comments,
      publishedAt: new Date(mock.publishedAt),
      authorId: owner.id,
      categoryId,
    },
    update: {
      title: mock.title,
      excerpt: mock.excerpt,
      content: mock.content,
      coverImage: mock.coverImage,
      readingTime: mock.readingTime || readingTime(mock.content),
      status: BlogStatus.PUBLISHED,
      categoryId,
    },
    select: { id: true, slug: true, status: true },
  });

  return row;
}

export async function resolveBlogByRef(ref: string): Promise<ResolvedBlogRef | null> {
  if (!isDatabaseConfigured()) return null;

  const byId = await prisma.blog.findUnique({
    where: { id: ref },
    select: { id: true, slug: true, status: true },
  });
  if (byId) return byId;

  const bySlug = await prisma.blog.findUnique({
    where: { slug: ref },
    select: { id: true, slug: true, status: true },
  });
  if (bySlug) return bySlug;

  return ensureBlogInDbBySlug(ref);
}
