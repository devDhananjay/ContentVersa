import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  createUserNotification,
  createUserNotificationsBulk,
  type NotificationPayload,
} from "@/lib/notifications/create";

const AUDIENCE_LIMIT = 80;

/**
 * When a blog is approved & published: notify author + interested readers.
 */
export async function dispatchBlogPublishedNotifications(blogId: string) {
  if (!isDatabaseConfigured()) return;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    include: { category: true },
  });
  if (!blog || blog.status !== "PUBLISHED") return;

  const link = `/blog/${blog.slug}`;
  const categoryName = blog.category?.name ?? "ContentVerse";
  const categorySlug = blog.category?.slug ?? "";

  await createUserNotification({
    userId: blog.authorId,
    type: NotificationType.APPROVAL,
    title: "New article is live!",
    message: `“${blog.title}” is now published on ContentVerse.`,
    link,
  });

  const exclude = new Set<string>([blog.authorId]);
  const payloads: NotificationPayload[] = [];

  const addUnique = (userId: string, payload: NotificationPayload) => {
    if (exclude.has(userId) || payloads.length >= AUDIENCE_LIMIT) return;
    exclude.add(userId);
    payloads.push(payload);
  };

  if (blog.categoryId && categorySlug) {
    const [subscribers, readers] = await Promise.all([
      prisma.categorySubscription.findMany({
        where: { categoryId: blog.categoryId },
        select: { userId: true },
        take: AUDIENCE_LIMIT,
      }),
      prisma.readingHistory.findMany({
        where: {
          category: categorySlug,
          userId: { not: null },
          progress: { gte: 15 },
          blogId: { not: blogId },
        },
        select: { userId: true },
        distinct: ["userId"],
        take: AUDIENCE_LIMIT,
      }),
    ]);

    for (const s of subscribers) {
      addUnique(s.userId, {
        userId: s.userId,
        type: NotificationType.CATEGORY_NEW,
        title: `New in ${categoryName}`,
        message: `“${blog.title}” — new in a category you follow.`,
        link,
      });
    }

    for (const r of readers) {
      if (!r.userId) continue;
      addUnique(r.userId, {
        userId: r.userId,
        type: NotificationType.RELATED_BLOG,
        title: "You might like this",
        message: `Based on what you've read: “${blog.title}”.`,
        link,
      });
    }
  }

  const blogTagRows = await prisma.blogTag.findMany({
    where: { blogId },
    include: { tag: true },
  });
  const tagSlugs = new Set(blogTagRows.map((t) => t.tag.slug));

  if (tagSlugs.size > 0) {
    const recentReaders = await prisma.readingHistory.findMany({
      where: { userId: { not: null }, NOT: { blogId } },
      select: { userId: true, tags: true },
      take: 200,
    });

    for (const row of recentReaders) {
      if (!row.userId) continue;
      const tags = Array.isArray(row.tags) ? (row.tags as string[]) : [];
      if (!tags.some((t) => tagSlugs.has(t))) continue;
      addUnique(row.userId, {
        userId: row.userId,
        type: NotificationType.RELATED_BLOG,
        title: "Recommended for you",
        message: `“${blog.title}” matches topics you've explored.`,
        link,
      });
    }
  }

  if (payloads.length) {
    await createUserNotificationsBulk(payloads);
  }

  if (blog.seriesSlug && blog.seriesPart && blog.seriesPart > 1) {
    const prevPart = await prisma.blog.findFirst({
      where: {
        seriesSlug: blog.seriesSlug,
        seriesPart: blog.seriesPart - 1,
        status: "PUBLISHED",
      },
      select: { id: true },
    });
    if (prevPart) {
      const readers = await prisma.readingHistory.findMany({
        where: {
          blogId: prevPart.id,
          userId: { not: null },
          progress: { gte: 20 },
        },
        select: { userId: true },
        distinct: ["userId"],
        take: AUDIENCE_LIMIT,
      });
      const seriesPayloads = readers
        .filter((r) => r.userId && !exclude.has(r.userId))
        .map((r) => ({
          userId: r.userId!,
          type: NotificationType.RELATED_BLOG,
          title: `Part ${blog.seriesPart} is live`,
          message: `Continue the series: “${blog.title}”.`,
          link,
        }));
      if (seriesPayloads.length) {
        await createUserNotificationsBulk(seriesPayloads);
      }
    }
  }

  void import("@/lib/engagement/achievements").then(({ checkPublishAchievements }) =>
    checkPublishAchievements(blog.authorId, { views: blog.views })
  );

  // Ensure author + audience alerts always have a deep link when possible
  await prisma.notification.updateMany({
    where: { userId: blog.authorId, link: null, message: { contains: blog.title } },
    data: { link },
  });
}
