import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/mailer";
import { welcomeUserEmail } from "@/lib/email/templates";
import { createUserNotification } from "@/lib/notifications/create";
import { newsletterUnsubscribeUrl } from "@/lib/newsletter/subscribe";

export const WELCOME_NOTIF_TITLE = "Welcome to ContentVerse";

function isRealEmail(email: string | null | undefined): email is string {
  const e = email?.trim().toLowerCase() ?? "";
  if (!e || !e.includes("@")) return false;
  if (e.endsWith("@phone.contentverse.local")) return false;
  return true;
}

/** Soft-add to newsletter so weekly digests can reach new members. */
async function softSubscribeNewsletter(email: string) {
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      create: {
        email: email.toLowerCase(),
        verified: true,
        weeklyDigest: true,
      },
      update: {},
    });
  } catch (err) {
    console.warn("[welcome-user] newsletter soft-subscribe failed", err);
  }
}

/**
 * Welcome every new account: in-app notification + email + soft newsletter.
 * Idempotent — skips if welcome notification already exists.
 */
export async function welcomeNewUser(input: {
  userId: string;
  email?: string | null;
  name?: string | null;
  /** Re-send email even if welcome notification already exists. */
  forceEmail?: boolean;
}): Promise<{ notified: boolean; emailed: boolean }> {
  if (!isDatabaseConfigured()) return { notified: false, emailed: false };

  try {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: input.userId,
        type: NotificationType.SYSTEM,
        title: WELCOME_NOTIF_TITLE,
      },
      select: { id: true },
    });

    let notified = false;
    if (!existing) {
      await createUserNotification({
        userId: input.userId,
        type: NotificationType.SYSTEM,
        title: WELCOME_NOTIF_TITLE,
        message:
          "You’re in! Read trending blogs, try CineVerse & MoneyVerse, or write your first draft from the dashboard.",
        link: "/dashboard",
      });
      notified = true;
    } else if (!input.forceEmail) {
      return { notified: false, emailed: false };
    }

    let emailed = false;
    if (isRealEmail(input.email)) {
      await softSubscribeNewsletter(input.email);

      const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email: input.email.toLowerCase() },
        select: { id: true },
      });

      const { subject, html } = welcomeUserEmail({
        name: input.name,
        unsubscribeUrl: subscriber
          ? newsletterUnsubscribeUrl(subscriber.id)
          : undefined,
      });

      emailed = await sendEmail({ to: input.email, subject, html });
    }

    return { notified, emailed };
  } catch (err) {
    console.error("[welcome-user]", err);
    return { notified: false, emailed: false };
  }
}
