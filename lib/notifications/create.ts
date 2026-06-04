import { NotificationType, Prisma } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/notifications/push";

export type NotificationPayload = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
};

const BATCH = 100;

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
    }
  }

  return created;
}
