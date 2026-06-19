import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { createUserNotification } from "@/lib/notifications/create";
import { NotificationType } from "@prisma/client";

export async function getRepostCounts(blogIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (!isDatabaseConfigured() || blogIds.length === 0) return map;

  const rows = await prisma.blogRepost.groupBy({
    by: ["blogId"],
    where: { blogId: { in: blogIds } },
    _count: { _all: true },
  });
  for (const row of rows) {
    map.set(row.blogId, row._count._all);
  }
  return map;
}

export async function getUserRepostedBlogIds(
  userId: string,
  blogIds: string[]
): Promise<Set<string>> {
  if (!isDatabaseConfigured() || blogIds.length === 0) return new Set();

  const rows = await prisma.blogRepost.findMany({
    where: { userId, blogId: { in: blogIds } },
    select: { blogId: true },
  });
  return new Set(rows.map((r) => r.blogId));
}

export async function toggleBlogRepost(
  blogId: string,
  userId: string
): Promise<{ reposted: boolean; repostCount: number }> {
  if (!isDatabaseConfigured()) {
    return { reposted: false, repostCount: 0 };
  }

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { id: true, slug: true, title: true, authorId: true },
  });
  if (!blog) throw new Error("BLOG_NOT_FOUND");

  const existing = await prisma.blogRepost.findUnique({
    where: { blogId_userId: { blogId, userId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.blogRepost.delete({ where: { id: existing.id } }),
      prisma.blog.update({
        where: { id: blogId },
        data: { sharesCount: { decrement: 1 } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.blogRepost.create({ data: { blogId, userId } }),
      prisma.blog.update({
        where: { id: blogId },
        data: { sharesCount: { increment: 1 } },
      }),
    ]);

    if (blog.authorId !== userId) {
      const actor = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, username: true },
      });
      const actorName = actor?.name || actor?.username || "Someone";
      await createUserNotification({
        userId: blog.authorId,
        type: NotificationType.SYSTEM,
        title: "Your article was reposted",
        message: `${actorName} reposted “${blog.title}”.`,
        link: `/blog/${blog.slug}`,
      });
    }
  }

  const repostCount = await prisma.blogRepost.count({ where: { blogId } });
  return { reposted: !existing, repostCount };
}

export async function getBlogRepostState(blogId: string, userId: string | null) {
  if (!isDatabaseConfigured()) {
    return { repostCount: 0, reposted: false };
  }

  const [repostCount, reposted] = await Promise.all([
    prisma.blogRepost.count({ where: { blogId } }),
    userId
      ? prisma.blogRepost
          .findUnique({
            where: { blogId_userId: { blogId, userId } },
            select: { id: true },
          })
          .then(Boolean)
      : Promise.resolve(false),
  ]);

  return { repostCount, reposted };
}
