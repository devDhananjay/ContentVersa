/**
 * Scheduled push alert stubs — cricket match reminders & stock watchlist moves.
 * Wire to cron via /api/cron/push-alerts?job=cricket|stocks
 */
import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { createUserNotificationsBulk } from "@/lib/notifications/create";
import { sendPushToUser } from "@/lib/notifications/push";
import { getUpcomingMatches } from "@/lib/sports/data";
import { fetchYahooQuotes } from "@/lib/finance/yahoo";

const MATCH_LEAD_MINUTES = 30;

/** Notify users subscribed to cricket category / sports readers */
export async function sendCricketMatchReminders() {
  if (!isDatabaseConfigured()) return { sent: 0, push: 0 };

  const matches = await getUpcomingMatches();
  const soon = matches.find((m) => {
    if (!m.startDate) return false;
    const start = new Date(m.startDate).getTime();
    if (Number.isNaN(start)) return false;
    const diff = start - Date.now();
    return diff > 0 && diff <= MATCH_LEAD_MINUTES * 60_000;
  });

  if (!soon) return { sent: 0, push: 0 };

  const link = "/sports/cricket";
  const title = "Match starts soon";
  const message = `${soon.team1.name} vs ${soon.team2.name} starts in ~${MATCH_LEAD_MINUTES} min.`;

  const sportsReaders = await prisma.readingHistory.findMany({
    where: {
      userId: { not: null },
      OR: [
        { category: { in: ["sports", "cricket"] } },
        { category: { contains: "sport", mode: "insensitive" } },
      ],
    },
    select: { userId: true },
    distinct: ["userId"],
    take: 100,
  });

  const subs = await prisma.categorySubscription.findMany({
    where: { category: { slug: { in: ["sports", "cricket"] } } },
    select: { userId: true },
    take: 100,
  });

  const userIds = new Set<string>();
  for (const r of sportsReaders) {
    if (r.userId) userIds.add(r.userId);
  }
  for (const s of subs) userIds.add(s.userId);

  const payloads = [...userIds].map((userId) => ({
    userId,
    type: NotificationType.SYSTEM,
    title,
    message,
    link,
  }));

  const sent = await createUserNotificationsBulk(payloads);

  await Promise.all(
    [...userIds].map((userId) =>
      sendPushToUser(userId, { title, body: message, link })
    )
  );

  return { sent, push: userIds.size, match: soon.id };
}

/** ±5% move on watchlist symbols */
export async function sendStockWatchlistAlerts() {
  if (!isDatabaseConfigured()) return { sent: 0, push: 0 };

  const items = await prisma.financeWatchlistItem.findMany({
    select: { userId: true, symbol: true },
    take: 200,
  });
  if (!items.length) return { sent: 0, push: 0 };

  const symbols = [...new Set(items.map((i) => i.symbol))];
  const quotes = await fetchYahooQuotes(symbols);
  const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

  const payloads: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link: string;
  }[] = [];

  for (const item of items) {
    const q = quoteMap.get(item.symbol);
    if (!q || q.changePercent == null) continue;
    const pct = Math.abs(q.changePercent);
    if (pct < 5) continue;

    const dir = q.changePercent >= 0 ? "up" : "down";
    const title = `${item.symbol} ${dir} ${pct.toFixed(1)}%`;
    const message = `${q.shortName || item.symbol} moved ${q.changePercent >= 0 ? "+" : ""}${q.changePercent.toFixed(2)}% today.`;
    const link = `/finance?symbol=${encodeURIComponent(item.symbol)}`;

    payloads.push({
      userId: item.userId,
      type: NotificationType.SYSTEM,
      title,
      message,
      link,
    });
  }

  const sent = await createUserNotificationsBulk(payloads);

  await Promise.all(
    payloads.map((p) =>
      sendPushToUser(p.userId, { title: p.title, body: p.message, link: p.link })
    )
  );

  return { sent, push: payloads.length };
}
