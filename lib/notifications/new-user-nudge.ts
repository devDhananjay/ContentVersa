import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { createUserNotificationsBulk } from "@/lib/notifications/create";
import { sendEmail } from "@/lib/email/mailer";
import { newUserNudgeEmail } from "@/lib/email/templates";
import { newsletterUnsubscribeUrl } from "@/lib/newsletter/subscribe";
import { WELCOME_NOTIF_TITLE } from "@/lib/notifications/welcome-user";

const NUDGE_TITLE_WRITE = "Publish your first ContentVerse post";
const NUDGE_TITLE_NOTIFY = "Enable notifications on ContentVerse";
const NUDGE_TITLE_EXPLORE = "Pick up where you left off on ContentVerse";

/**
 * Day 1–3 onboarding nudges for brand-new accounts that haven’t engaged yet.
 */
export async function sendNewUserOnboardingNudges() {
  if (!isDatabaseConfigured()) {
    return { sent: 0, emails: 0 };
  }

  const now = Date.now();
  const newest = new Date(now - 1 * 86400000);
  const oldest = new Date(now - 4 * 86400000);

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: oldest, lte: newest },
      role: "USER",
    },
    select: {
      id: true,
      email: true,
      name: true,
      _count: {
        select: {
          blogs: true,
          pushTokens: true,
          bookmarks: true,
          following: true,
        },
      },
    },
    take: 150,
  });

  if (!users.length) return { sent: 0, emails: 0 };

  const payloads: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link: string;
  }[] = [];
  const emailJobs: {
    email: string;
    name: string | null;
    focus: "write" | "explore" | "notify";
  }[] = [];

  for (const u of users) {
    const hadNudge = await prisma.notification.findFirst({
      where: {
        userId: u.id,
        type: NotificationType.SYSTEM,
        title: {
          in: [NUDGE_TITLE_WRITE, NUDGE_TITLE_NOTIFY, NUDGE_TITLE_EXPLORE],
        },
      },
      select: { id: true },
    });
    if (hadNudge) continue;

    const hadWelcome = await prisma.notification.findFirst({
      where: {
        userId: u.id,
        type: NotificationType.SYSTEM,
        title: WELCOME_NOTIF_TITLE,
      },
      select: { id: true },
    });

    const inactive =
      u._count.blogs === 0 &&
      u._count.bookmarks === 0 &&
      u._count.following === 0;

    let title = NUDGE_TITLE_EXPLORE;
    let message =
      "Fresh blogs and Verse hubs are live — explore for a few minutes today.";
    let link = "/blogs";
    let focus: "write" | "explore" | "notify" = "explore";

    if (u._count.blogs === 0) {
      title = NUDGE_TITLE_WRITE;
      message =
        "Draft your first short post — AI can help with titles and outlines.";
      link = "/dashboard/create";
      focus = "write";
    } else if (u._count.pushTokens === 0) {
      title = NUDGE_TITLE_NOTIFY;
      message =
        "Turn on push alerts so you catch comments, tips, and trending picks.";
      link = "/dashboard/notifications";
      focus = "notify";
    } else if (!inactive) {
      continue;
    }

    if (!hadWelcome && !inactive) continue;

    payloads.push({
      userId: u.id,
      type: NotificationType.SYSTEM,
      title,
      message,
      link,
    });

    const email = u.email?.trim().toLowerCase();
    if (email && !email.endsWith("@phone.contentverse.local")) {
      emailJobs.push({ email, name: u.name, focus });
    }
  }

  const sent = await createUserNotificationsBulk(payloads);

  let emails = 0;
  for (const job of emailJobs) {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: job.email },
      select: { id: true },
    });
    const { subject, html } = newUserNudgeEmail({
      name: job.name,
      focus: job.focus,
      unsubscribeUrl: subscriber
        ? newsletterUnsubscribeUrl(subscriber.id)
        : undefined,
    });
    if (await sendEmail({ to: job.email, subject, html })) emails++;
  }

  return { sent, emails };
}
