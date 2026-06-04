import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { createUserNotificationsBulk } from "@/lib/notifications/create";

const INACTIVE_DAYS_MIN = 3;
const INACTIVE_DAYS_MAX = 7;
const USER_BATCH = 100;

export async function sendInactiveReaderReminders() {
  if (!isDatabaseConfigured()) return { sent: 0 };

  const now = Date.now();
  const from = new Date(now - INACTIVE_DAYS_MAX * 86400000);
  const to = new Date(now - INACTIVE_DAYS_MIN * 86400000);

  const inactiveUsers = await prisma.user.findMany({
    where: {
      profile: {
        lastActiveAt: { gte: from, lte: to },
      },
    },
    select: { id: true },
    take: USER_BATCH,
  });

  if (!inactiveUsers.length) return { sent: 0 };

  const latest = await prisma.blog.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { title: true, slug: true },
  });
  if (!latest) return { sent: 0 };

  const link = `/blog/${latest.slug}`;
  const since = new Date(now - 86400000);

  const payloads = [];
  for (const u of inactiveUsers) {
    const dup = await prisma.notification.findFirst({
      where: {
        userId: u.id,
        type: NotificationType.INACTIVE_REMINDER,
        createdAt: { gte: since },
      },
    });
    if (dup) continue;
    payloads.push({
      userId: u.id,
      type: NotificationType.INACTIVE_REMINDER,
      title: "We've published new content you may like",
      message: `Catch up with “${latest.title}” and more on ContentVerse.`,
      link,
    });
  }

  const sent = await createUserNotificationsBulk(payloads);
  return { sent };
}

export async function sendTrendingArticleAlert() {
  if (!isDatabaseConfigured()) return { sent: 0 };

  const since = new Date(Date.now() - 24 * 3600000);
  const trending = await prisma.blog.findFirst({
    where: { status: "PUBLISHED", publishedAt: { gte: since } },
    orderBy: [{ views: "desc" }, { likesCount: "desc" }],
    select: { id: true, title: true, slug: true },
  });

  if (!trending) {
    const fallback = await prisma.blog.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { views: "desc" },
      select: { id: true, title: true, slug: true },
    });
    if (!fallback) return { sent: 0 };
    return notifyTrending(fallback, since);
  }

  return notifyTrending(trending, since);
}

async function notifyTrending(
  blog: { id: string; title: string; slug: string },
  since: Date
) {
  const link = `/blog/${blog.slug}`;
  const readers = await prisma.readingHistory.findMany({
    where: { userId: { not: null } },
    select: { userId: true },
    distinct: ["userId"],
    take: USER_BATCH,
  });

  const payloads = [];
  for (const r of readers) {
    if (!r.userId) continue;
    const dup = await prisma.notification.findFirst({
      where: {
        userId: r.userId,
        type: NotificationType.TRENDING,
        link,
        createdAt: { gte: since },
      },
    });
    if (dup) continue;
    payloads.push({
      userId: r.userId,
      type: NotificationType.TRENDING,
      title: "This article is trending today",
      message: `“${blog.title}” is getting lots of attention — take a look.`,
      link,
    });
  }

  const sent = await createUserNotificationsBulk(payloads);
  return { sent };
}

export async function sendWeeklyDigest() {
  if (!isDatabaseConfigured()) return { sent: 0 };

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const top = await prisma.blog.findMany({
    where: { status: "PUBLISHED", publishedAt: { gte: weekAgo } },
    orderBy: { views: "desc" },
    take: 5,
    select: { title: true },
  });

  if (!top.length) return { sent: 0 };

  const titles = top.map((b) => b.title).join(" · ");
  const link = "/blogs";
  const digestSince = new Date(Date.now() - 6 * 86400000);

  const users = await prisma.user.findMany({
    where: {
      profile: {
        lastActiveAt: { gte: weekAgo },
      },
    },
    select: { id: true },
    take: USER_BATCH,
  });

  const payloads = [];
  for (const u of users) {
    const dup = await prisma.notification.findFirst({
      where: {
        userId: u.id,
        type: NotificationType.WEEKLY_DIGEST,
        createdAt: { gte: digestSince },
      },
    });
    if (dup) continue;
    payloads.push({
      userId: u.id,
      type: NotificationType.WEEKLY_DIGEST,
      title: "Your weekly reading digest",
      message: `Top picks this week: ${titles}`,
      link,
    });
  }

  const sent = await createUserNotificationsBulk(payloads);
  return { sent };
}
