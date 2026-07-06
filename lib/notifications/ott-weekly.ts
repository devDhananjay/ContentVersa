import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { fetchCineverseHubData } from "@/lib/cineverse/tmdb-hub";
import { sendEmailBulk } from "@/lib/email/mailer";
import { ottWeeklyEmail } from "@/lib/email/templates";
import { newsletterUnsubscribeUrl } from "@/lib/newsletter/subscribe";
import { createUserNotificationsBulk } from "@/lib/notifications/create";
import { NotificationType } from "@prisma/client";

/** Friday-style OTT picks email for newsletter subscribers who opted in. */
export async function sendOttWeeklyDigest() {
  if (!isDatabaseConfigured()) return { emails: 0, notified: 0 };

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { ottDigest: true },
    select: { id: true, email: true },
    take: 500,
  });

  if (!subscribers.length) return { emails: 0, notified: 0 };

  const hub = await fetchCineverseHubData();
  const picks = [
    ...hub.trending.slice(0, 3),
    ...hub.upcoming.slice(0, 2),
  ].slice(0, 5);

  if (!picks.length) return { emails: 0, notified: 0 };

  const emails = await sendEmailBulk(subscribers.map((s) => s.email), (email) => {
    const sub = subscribers.find((s) => s.email === email)!;
    const { subject, html } = ottWeeklyEmail({
      movies: picks.map((m) => ({
        title: m.title,
        href: `/cineverse/movie/${m.id}`,
        releaseDate: m.releaseDate,
      })),
      unsubscribeUrl: newsletterUnsubscribeUrl(sub.id),
    });
    return { to: email, subject, html };
  });

  const users = await prisma.user.findMany({
    where: { email: { in: subscribers.map((s) => s.email) } },
    select: { id: true },
    take: 500,
  });

  const notified = await createUserNotificationsBulk(
    users.map((u) => ({
      userId: u.id,
      type: NotificationType.OTT_WEEKLY,
      title: "This week on CineVerse",
      message: `Trending & upcoming: ${picks.map((p) => p.title).join(" · ")}`,
      link: "/cineverse",
    }))
  );

  return { emails, notified };
}
