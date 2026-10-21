import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { claimAlertDispatch } from "@/lib/notifications/alert-dispatch";
import { createUserNotificationsBulk } from "@/lib/notifications/create";
import { TRENDING_TITLE_RE } from "@/lib/seo/toi-rss";

/** Prefer top / latest / India / business desks; also viral/breaking titles. */
const PRIORITY_FEEDS = new Set([
  "top",
  "latest",
  "india",
  "business",
]);

/** Max distinct live-news pushes per ingest run (avoid inbox spam). */
const MAX_STORIES_PER_RUN = 2;
const USER_PAGE = 250;

export type LiveNewsNotifyItem = {
  slug: string;
  title: string;
  feedKey: string;
};

export function isLiveNewsNotifyWorthy(feedKey: string, title: string): boolean {
  if (PRIORITY_FEEDS.has(feedKey)) return true;
  return TRENDING_TITLE_RE.test(title);
}

function notifyPriority(feedKey: string, title: string): number {
  if (feedKey === "top") return 100;
  if (feedKey === "latest") return 90;
  if (feedKey === "india") return 80;
  if (feedKey === "business") return 75;
  if (TRENDING_TITLE_RE.test(title)) return 70;
  return 0;
}

/**
 * Push + in-app inbox to every non-banned user for top/live desk stories.
 * Email is intentionally skipped (see EMAIL_TYPES) — high frequency.
 */
export async function dispatchLiveNewsNotifications(
  items: LiveNewsNotifyItem[]
): Promise<{ stories: number; notified: number }> {
  if (!isDatabaseConfigured() || items.length === 0) {
    return { stories: 0, notified: 0 };
  }

  const ranked = [...items]
    .filter((i) => isLiveNewsNotifyWorthy(i.feedKey, i.title))
    .sort(
      (a, b) =>
        notifyPriority(b.feedKey, b.title) - notifyPriority(a.feedKey, a.title)
    )
    .slice(0, MAX_STORIES_PER_RUN);

  if (!ranked.length) return { stories: 0, notified: 0 };

  let stories = 0;
  let notified = 0;

  for (const item of ranked) {
    const link = `/blog/${item.slug}`;
    const alertKey = `live-news:${item.slug}`;
    const claimed = await claimAlertDispatch(alertKey);
    if (!claimed) continue;

    const title =
      item.feedKey === "top" || item.feedKey === "latest"
        ? "Live news"
        : item.feedKey === "business"
          ? "Market news"
          : "Top story";

    const message = `“${item.title}” — tap to read on ContentVerse India.`;

    let cursor: string | undefined;
    let storyNotified = 0;

    for (;;) {
      const users = await prisma.user.findMany({
        where: { banned: false },
        select: { id: true },
        orderBy: { id: "asc" },
        take: USER_PAGE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      });
      if (!users.length) break;

      const payloads = users.map((u) => ({
        userId: u.id,
        type: NotificationType.LIVE_NEWS,
        title,
        message,
        link,
      }));

      storyNotified += await createUserNotificationsBulk(payloads);
      cursor = users[users.length - 1]!.id;
      if (users.length < USER_PAGE) break;
    }

    if (storyNotified > 0) {
      stories++;
      notified += storyNotified;
      console.log(
        `[live-news] notified ${storyNotified} users — ${item.slug} (${item.feedKey})`
      );
    }
  }

  return { stories, notified };
}
