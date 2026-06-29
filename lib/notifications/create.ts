import { NotificationType, Prisma } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/notifications/push";
import { sendEmail } from "@/lib/email/mailer";
import {
  notificationEmail,
  stockWatchlistDigestEmail,
} from "@/lib/email/templates";
import {
  newsletterUnsubscribeUrl,
} from "@/lib/newsletter/subscribe";

export type NotificationPayload = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
};

const BATCH = 100;

/** Email types we mirror to inbox (skip noisy/low-value). */
const EMAIL_TYPES = new Set<NotificationType>([
  NotificationType.TRENDING,
  NotificationType.WEEKLY_DIGEST,
  NotificationType.INACTIVE_REMINDER,
  NotificationType.CATEGORY_NEW,
  NotificationType.RELATED_BLOG,
  NotificationType.BLOG_PUBLISHED,
  NotificationType.COMMENT,
  NotificationType.REPLY,
  NotificationType.LIKE,
  NotificationType.TIP_RECEIVED,
  NotificationType.FOLLOW,
  NotificationType.APPROVAL,
  NotificationType.CRICKET_MATCH_REMINDER,
]);

async function emailUserForNotification(
  userId: string,
  payload: NotificationPayload
) {
  if (!EMAIL_TYPES.has(payload.type)) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user?.email) return;

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email: user.email.toLowerCase() },
    select: { id: true },
  });

  const { subject, html } = notificationEmail({
    title: payload.title,
    message: payload.message,
    link: payload.link,
    unsubscribeUrl: subscriber
      ? newsletterUnsubscribeUrl(subscriber.id)
      : undefined,
  });

  await sendEmail({ to: user.email, subject, html });
}

export async function createUserNotification(payload: NotificationPayload) {
  if (!isDatabaseConfigured()) return null;

  const row = await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      link: payload.link ?? null,
    },
  });

  void sendPushToUser(payload.userId, {
    title: payload.title,
    body: payload.message,
    link: payload.link ?? undefined,
  });

  void emailUserForNotification(payload.userId, payload);

  return row;
}

export async function createUserNotificationsBulk(
  payloads: NotificationPayload[]
) {
  if (!isDatabaseConfigured() || payloads.length === 0) return 0;

  let created = 0;
  for (let i = 0; i < payloads.length; i += BATCH) {
    const slice = payloads.slice(i, i + BATCH);
    const data: Prisma.NotificationCreateManyInput[] = slice.map((p) => ({
      userId: p.userId,
      type: p.type,
      title: p.title,
      message: p.message,
      link: p.link ?? null,
    }));
    const result = await prisma.notification.createMany({ data });
    created += result.count;

    for (const p of slice) {
      void sendPushToUser(p.userId, {
        title: p.title,
        body: p.message,
        link: p.link ?? undefined,
      });
      void emailUserForNotification(p.userId, p);
    }
  }

  return created;
}

export type StockMoverEmailRow = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
};

/** One combined inbox email per user for all watchlist stocks in a session. */
export async function emailStockWatchlistDigests(
  payloads: NotificationPayload[],
  phase: "open" | "close",
  movers?: { topGainers: StockMoverEmailRow[]; topLosers: StockMoverEmailRow[] }
): Promise<number> {
  if (!payloads.length) return 0;

  const byUser = new Map<string, NotificationPayload[]>();
  for (const payload of payloads) {
    const list = byUser.get(payload.userId) ?? [];
    list.push(payload);
    byUser.set(payload.userId, list);
  }

  const userIds = [...byUser.keys()];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  });

  let sent = 0;
  for (const user of users) {
    if (!user.email) continue;

    const items = byUser.get(user.id);
    if (!items?.length) continue;

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: user.email.toLowerCase() },
      select: { id: true },
    });

    const { subject, html } = stockWatchlistDigestEmail({
      phase,
      items: items.map((item) => ({
        title: item.title,
        message: item.message,
        link: item.link,
      })),
      topGainers: movers?.topGainers,
      topLosers: movers?.topLosers,
      unsubscribeUrl: subscriber
        ? newsletterUnsubscribeUrl(subscriber.id)
        : undefined,
    });

    const ok = await sendEmail({ to: user.email, subject, html });
    if (ok) sent += 1;
  }

  return sent;
}

export async function getSubscriberIdByEmail(email: string) {
  const row = await prisma.newsletterSubscriber.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  return row?.id;
}
