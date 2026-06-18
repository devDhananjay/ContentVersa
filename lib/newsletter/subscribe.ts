import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/mailer";
import { newsletterWelcomeEmail } from "@/lib/email/templates";
import { getAppUrl } from "@/lib/app-url";

export function newsletterUnsubscribeUrl(subscriberId: string) {
  return `${getAppUrl()}/api/newsletter/unsubscribe?id=${subscriberId}`;
}

export async function subscribeToNewsletter(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!isDatabaseConfigured()) {
    return { ok: false as const, error: "Database not configured" };
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: normalized },
  });

  if (existing) {
    if (!existing.weeklyDigest) {
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { weeklyDigest: true },
      });
    }
    const { subject, html } = newsletterWelcomeEmail(
      newsletterUnsubscribeUrl(existing.id)
    );
    const emailed = await sendEmail({ to: normalized, subject, html });
    return { ok: true as const, alreadySubscribed: true, id: existing.id, emailed };
  }

  const subscriber = await prisma.newsletterSubscriber.create({
    data: { email: normalized, verified: true, weeklyDigest: true },
  });

  const { subject, html } = newsletterWelcomeEmail(
    newsletterUnsubscribeUrl(subscriber.id)
  );
  const emailed = await sendEmail({ to: normalized, subject, html });

  return { ok: true as const, alreadySubscribed: false, id: subscriber.id, emailed };
}

export async function getNewsletterRecipientEmails(): Promise<string[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await prisma.newsletterSubscriber.findMany({
    select: { email: true },
  });
  return rows.map((r) => r.email);
}
