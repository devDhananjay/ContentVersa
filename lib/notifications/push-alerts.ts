/**
 * Cricket match reminders (30 min before) & stock watchlist open/close alerts.
 * Cron: /api/cron/push-alerts?job=cricket|stocks-open|stocks-close
 */
import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  createUserNotificationsBulk,
  emailStockWatchlistDigests,
} from "@/lib/notifications/create";
import { sendPushToUser } from "@/lib/notifications/push";
import { claimAlertDispatch, istDateKey } from "@/lib/notifications/alert-dispatch";
import { getUpcomingMatches } from "@/lib/sports/data";
import { fetchYahooQuotes } from "@/lib/finance/yahoo";
import { displaySymbol } from "@/lib/finance/transformers";
import type { NotificationPayload } from "@/lib/notifications/create";

const MATCH_LEAD_MINUTES = 30;
const MATCH_WINDOW_MIN = 25;
const MATCH_WINDOW_MAX = 35;

function matchStartsInReminderWindow(startDate: string): boolean {
  const start = new Date(startDate).getTime();
  if (Number.isNaN(start)) return false;
  const diffMin = (start - Date.now()) / 60_000;
  return diffMin >= MATCH_WINDOW_MIN && diffMin <= MATCH_WINDOW_MAX;
}

async function notifyUsers(payloads: NotificationPayload[]) {
  if (!payloads.length) return { sent: 0, push: 0 };

  const sent = await createUserNotificationsBulk(payloads);

  await Promise.all(
    payloads.map((p) =>
      sendPushToUser(p.userId, {
        title: p.title,
        body: p.message,
        link: p.link ?? undefined,
      })
    )
  );

  return { sent, push: payloads.length };
}

/** 30 minutes before a cricket match — email + in-app + push for all users. */
export async function sendCricketMatchReminders() {
  if (!isDatabaseConfigured()) return { sent: 0, push: 0, match: null };

  const matches = await getUpcomingMatches();
  const soon = matches.find((m) => m.startDate && matchStartsInReminderWindow(m.startDate));

  if (!soon) return { sent: 0, push: 0, match: null };

  const alertKey = `cricket:${soon.id}:30m`;
  const claimed = await claimAlertDispatch(alertKey);
  if (!claimed) return { sent: 0, push: 0, match: soon.id, skipped: true };

  const link = `/sports/match/${soon.id}`;
  const title = "Cricket match starts in 30 minutes";
  const message = `${soon.team1.name} vs ${soon.team2.name} · ${soon.matchDesc || soon.seriesName}. Tap to view live score.`;

  const users = await prisma.user.findMany({
    select: { id: true },
    take: 5000,
  });

  const payloads: NotificationPayload[] = users.map((user) => ({
    userId: user.id,
    type: NotificationType.CRICKET_MATCH_REMINDER,
    title,
    message,
    link,
  }));

  const result = await notifyUsers(payloads);
  return { ...result, match: soon.id };
}

type StockPhase = "open" | "close";

/** Market open/close price alerts for each user's watchlist symbols. */
export async function sendStockWatchlistSessionAlerts(phase: StockPhase) {
  if (!isDatabaseConfigured()) return { sent: 0, push: 0, phase };

  const dateKey = istDateKey();
  const items = await prisma.financeWatchlistItem.findMany({
    select: { userId: true, symbol: true },
    take: 5000,
  });
  if (!items.length) return { sent: 0, push: 0, phase };

  const symbols = [...new Set(items.map((i) => i.symbol))];
  const quotes = await fetchYahooQuotes(symbols);
  const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

  const payloads: NotificationPayload[] = [];

  for (const item of items) {
    const alertKey = `stock:${item.symbol}:${phase}:${dateKey}:${item.userId}`;
    const claimed = await claimAlertDispatch(alertKey);
    if (!claimed) continue;

    const q = quoteMap.get(item.symbol);
    if (!q) continue;

    const label = displaySymbol(item.symbol);
    const price = q.price.toLocaleString("en-IN", { maximumFractionDigits: 2 });
    const link = `/finance/stock/${label}`;

    if (phase === "open") {
      const openRef = q.previousClose ?? q.price;
      const title = `${label} market open`;
      const message = `${q.shortName || label} opened at ₹${price} (prev close ₹${openRef.toLocaleString("en-IN", { maximumFractionDigits: 2 })}).`;
      payloads.push({
        userId: item.userId,
        type: NotificationType.STOCK_WATCHLIST_ALERT,
        title,
        message,
        link,
      });
    } else {
      const title = `${label} market close`;
      const change =
        q.changePercent >= 0
          ? `+${q.changePercent.toFixed(2)}%`
          : `${q.changePercent.toFixed(2)}%`;
      const message = `${q.shortName || label} closed at ₹${price} (${change} today).`;
      payloads.push({
        userId: item.userId,
        type: NotificationType.STOCK_WATCHLIST_ALERT,
        title,
        message,
        link,
      });
    }
  }

  const result = await notifyUsers(payloads);
  const emails = await emailStockWatchlistDigests(payloads, phase);
  return { ...result, phase, stocks: payloads.length, emails };
}

/** @deprecated Use sendStockWatchlistSessionAlerts('close') for large moves if needed */
export async function sendStockWatchlistAlerts() {
  return sendStockWatchlistSessionAlerts("close");
}
