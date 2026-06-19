import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  createUserNotificationsBulk,
} from "@/lib/notifications/create";
import { sendEmailBulk } from "@/lib/email/mailer";
import {
  trendingArticleEmail,
  weeklyDigestEmail,
  notificationEmail,
} from "@/lib/email/templates";
import { newsletterUnsubscribeUrl } from "@/lib/newsletter/subscribe";
import { buildPersonalizedDigestArticles } from "@/lib/notifications/weekly-digest-personal";

const INACTIVE_DAYS_MIN = 3;
const INACTIVE_DAYS_MAX = 7;
const USER_BATCH = 100;

export async function sendInactiveReaderReminders() {
  if (!isDatabaseConfigured()) return { sent: 0, emails: 0 };

  const now = Date.now();
  const from = new Date(now - INACTIVE_DAYS_MAX * 86400000);
  const to = new Date(now - INACTIVE_DAYS_MIN * 86400000);

  const inactiveUsers = await prisma.user.findMany({
    where: {
      profile: {
        lastActiveAt: { gte: from, lte: to },
      },
    },
    select: { id: true, email: true },
    take: USER_BATCH,
  });

  if (!inactiveUsers.length) return { sent: 0, emails: 0 };

  const latest = await prisma.blog.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { title: true, slug: true, excerpt: true },
  });
  if (!latest) return { sent: 0, emails: 0 };

  const link = `/blog/${latest.slug}`;
  const since = new Date(now - 86400000);

  const payloads = [];
  const emailRecipients: string[] = [];

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
    if (u.email) emailRecipients.push(u.email);
  }

  const sent = await createUserNotificationsBulk(payloads);

  const emails = await sendEmailBulk(emailRecipients, (to) => {
    const { subject, html } = notificationEmail({
      title: "We miss you on ContentVerse",
      message: `New article: “${latest.title}” — come back and catch up.`,
      link,
    });
    return { to, subject, html };
  });

  return { sent, emails };
}

export async function sendTrendingArticleAlert() {
  if (!isDatabaseConfigured()) return { sent: 0, emails: 0 };

  const since = new Date(Date.now() - 24 * 3600000);
  const trending = await prisma.blog.findFirst({
    where: { status: "PUBLISHED", publishedAt: { gte: since } },
    orderBy: [{ views: "desc" }, { likesCount: "desc" }],
    select: { id: true, title: true, slug: true, excerpt: true },
  });

  const blog =
    trending ??
    (await prisma.blog.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { views: "desc" },
      select: { id: true, title: true, slug: true, excerpt: true },
    }));

  if (!blog) return { sent: 0, emails: 0 };

  return notifyTrending(blog, since);
}

async function notifyTrending(
  blog: { id: string; title: string; slug: string; excerpt: string | null },
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

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { weeklyDigest: true },
    select: { email: true, id: true },
  });

  const emails = await sendEmailBulk(
    subscribers.map((s) => s.email),
    (email) => {
      const sub = subscribers.find((s) => s.email === email);
      const { subject, html } = trendingArticleEmail({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        unsubscribeUrl: sub ? newsletterUnsubscribeUrl(sub.id) : "#",
      });
      return { to: email, subject, html };
    }
  );

  return { sent, emails };
}

export async function sendWeeklyDigest() {
  if (!isDatabaseConfigured()) return { sent: 0, emails: 0 };

  const weekAgo = new Date(Date.now() - 7 * 86400000);
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

    const articles = await buildPersonalizedDigestArticles({
      userId: u.id,
      limit: 5,
    });
    if (!articles.length) continue;

    const titles = articles.map((b) => b.title).join(" · ");
    payloads.push({
      userId: u.id,
      type: NotificationType.WEEKLY_DIGEST,
      title: "Your weekly reading digest",
      message: `Picked for you: ${titles}`,
      link: "/blogs",
    });
  }

  const sent = await createUserNotificationsBulk(payloads);

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { weeklyDigest: true },
    select: { email: true, id: true },
  });

  const emailJobs = (
    await Promise.all(
      subscribers.map(async (s) => {
        const articles = await buildPersonalizedDigestArticles({
          email: s.email,
          limit: 5,
        });
        if (!articles.length) return null;
        return { email: s.email, subId: s.id, articles };
      })
    )
  ).filter((j): j is NonNullable<typeof j> => Boolean(j));

  const emails = await sendEmailBulk(emailJobs.map((j) => j.email), (email) => {
    const job = emailJobs.find((j) => j.email === email)!;
    const { subject, html } = weeklyDigestEmail({
      articles: job.articles,
      unsubscribeUrl: newsletterUnsubscribeUrl(job.subId),
    });
    return { to: email, subject, html };
  });

  return { sent, emails };
}
