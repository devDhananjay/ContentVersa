import { cache } from "react";
import type { RevenueSource } from "@prisma/client";
import { prisma, isDatabaseConfigured, safeDbQuery } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import {
  mapDbBlogToBlog,
  mapDbBlogToDashboardRow,
  type DashboardBlogRow,
} from "@/lib/data/blog-db";
import type { Blog } from "@/lib/data/blogs";
import { formatNumber, formatINR } from "@/lib/utils";

export { resolveUserId };

function formatStatValue(n: number): string {
  return formatNumber(n);
}

function pctDelta(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function avgReadingTimeMinutes(blogs: { readingTime: number }[]): string {
  if (blogs.length === 0) return "—";
  const avg = blogs.reduce((s, b) => s + b.readingTime, 0) / blogs.length;
  const mins = Math.floor(avg);
  const secs = Math.round((avg - mins) * 60);
  return `${mins}m ${secs}s`;
}

function formatSecondsDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "—";
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function buildDailyViews(
  reads: { readAt: Date }[],
  days = 30
): number[] {
  const buckets = Array(days).fill(0) as number[];
  const now = Date.now();
  for (const r of reads) {
    const daysAgo = Math.floor((now - r.readAt.getTime()) / (24 * 60 * 60 * 1000));
    if (daysAgo >= 0 && daysAgo < days) {
      buckets[days - 1 - daysAgo] += 1;
    }
  }
  return buckets;
}

export type DashboardStats = {
  views30d: string;
  views30dRaw: number;
  reactions: string;
  reactionsRaw: number;
  followers: string;
  followersRaw: number;
  earnings: string;
  earningsRaw: number;
  viewsDelta: number;
  reactionsDelta: number;
  followersDelta: number;
  earningsDelta: number;
  streakDays: number;
  blogCount: number;
  publishedCount: number;
  pendingCount: number;
  draftCount: number;
  avgReadTime: string;
  ctr: string;
  bounceRate: string;
  unreadNotifications: number;
  walletBalance: string;
  walletBalanceRaw: number;
  lifetimeEarnings: string;
  lifetimeEarningsRaw: number;
  viewsDaily: number[];
  totalViews: number;
};

export type DashboardNotification = {
  id: string;
  icon: "approval" | "follow" | "like" | "comment" | "achievement" | "rejection" | "system";
  title: string;
  body: string;
  time: string;
  unread: boolean;
  link?: string | null;
};

export type DashboardAchievement = {
  id: string;
  code: string;
  title: string;
  description: string;
  earnedAt: string;
  earned: boolean;
};

export type RevenueSourceRow = {
  source: string;
  amount: number;
  iconKey: "ads" | "subscription" | "tip" | "sponsored";
};

export type PayoutRow = {
  date: string;
  method: string;
  amount: number;
  status: string;
};

export type DashboardData = {
  userId: string;
  stats: DashboardStats;
  topBlogs: Blog[];
  allBlogs: DashboardBlogRow[];
  notifications: DashboardNotification[];
  bookmarks: Blog[];
  achievements: DashboardAchievement[];
  revenueSources: RevenueSourceRow[];
  payouts: PayoutRow[];
};

const NOTIF_ICON: Record<string, DashboardNotification["icon"]> = {
  APPROVAL: "approval",
  REJECTION: "rejection",
  COMMENT: "comment",
  REPLY: "comment",
  LIKE: "like",
  FOLLOW: "follow",
  MENTION: "system",
  SYSTEM: "system",
  TIP_RECEIVED: "like",
  PAYOUT: "achievement",
  BLOG_PUBLISHED: "approval",
  RELATED_BLOG: "system",
  INACTIVE_REMINDER: "system",
  TRENDING: "like",
  WEEKLY_DIGEST: "system",
  CATEGORY_NEW: "system",
};

function timeAgoShort(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function iconKeyForRevenue(source: RevenueSource): RevenueSourceRow["iconKey"] {
  if (source === "ADS") return "ads";
  if (source === "SUBSCRIPTION") return "subscription";
  if (source === "TIP") return "tip";
  if (source === "SPONSORED") return "sponsored";
  return "ads";
}

const REVENUE_LABELS: Record<RevenueSource, string> = {
  ADS: "Ad Revenue",
  SUBSCRIPTION: "Subscriptions",
  TIP: "Tips",
  SPONSORED: "Sponsored",
  AFFILIATE: "Affiliate",
  PAID_CONTENT: "Paid content",
  NEWSLETTER: "Newsletter",
};

const REVENUE_SOURCE_ORDER: RevenueSource[] = [
  "ADS",
  "SUBSCRIPTION",
  "TIP",
  "SPONSORED",
  "AFFILIATE",
  "PAID_CONTENT",
  "NEWSLETTER",
];

export async function getDashboardData(session: SessionUser): Promise<DashboardData | null> {
  const userId = await resolveUserId(session);
  if (!userId || !isDatabaseConfigured()) return null;

  return safeDbQuery(null, async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [user, blogs, notifications, bookmarks, achievements, wallet, revenues, tips, followerCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
      prisma.blog.findMany({
        where: { authorId: userId },
        include: {
          author: { include: { profile: true } },
          category: true,
        },
        orderBy: { views: "desc" },
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.bookmark.findMany({
        where: { userId },
        include: {
          blog: {
            include: {
              author: { include: { profile: true } },
              category: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { earnedAt: "desc" },
      }),
      prisma.wallet.findUnique({ where: { userId } }),
      prisma.revenue.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tip.findMany({
        where: { toUserId: userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.follower.count({ where: { followingId: userId } }),
    ]);

  if (!user) return null;

  const blogIds = blogs.map((b) => b.id);
  const mappedBlogs = blogs.map((b) => mapDbBlogToBlog(b));
  const totalViews = blogs.reduce((s, b) => s + b.views, 0);
  const totalLikes = blogs.reduce((s, b) => s + b.likesCount, 0);
  const publishedCount = blogs.filter((b) => b.status === "PUBLISHED").length;

  const [
    viewsLast30,
    viewsPrev30,
    reactionsLast30,
    reactionsPrev30,
    followersLast30,
    followersPrev30,
    readingRows,
    readsLast30,
  ] =
    blogIds.length > 0
      ? await Promise.all([
          prisma.readingHistory.count({
            where: { blogId: { in: blogIds }, readAt: { gte: thirtyDaysAgo } },
          }),
          prisma.readingHistory.count({
            where: {
              blogId: { in: blogIds },
              readAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
          }),
          prisma.reaction.count({
            where: {
              blogId: { in: blogIds },
              createdAt: { gte: thirtyDaysAgo },
            },
          }),
          prisma.reaction.count({
            where: {
              blogId: { in: blogIds },
              createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
          }),
          prisma.follower.count({
            where: { followingId: userId, createdAt: { gte: thirtyDaysAgo } },
          }),
          prisma.follower.count({
            where: {
              followingId: userId,
              createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
          }),
          prisma.readingHistory.findMany({
            where: { blogId: { in: blogIds } },
            select: { progress: true, secondsRead: true },
          }),
          prisma.readingHistory.findMany({
            where: { blogId: { in: blogIds }, readAt: { gte: thirtyDaysAgo } },
            select: { readAt: true },
          }),
        ])
      : [0, 0, 0, 0, 0, 0, [], [] as { readAt: Date }[]];

  const walletBal = wallet ? Number(wallet.balance) : 0;
  const revenueTotal = revenues.reduce((s, r) => s + Number(r.amount), 0);
  const tipsTotal = tips.reduce((s, t) => s + Number(t.amount), 0);
  const lifetime = revenueTotal > 0 ? revenueTotal : tipsTotal;

  const monthRevenue = revenues
    .filter((r) => r.createdAt >= startOfMonth)
    .reduce((s, r) => s + Number(r.amount), 0);
  const monthTips = tips
    .filter((t) => t.createdAt >= startOfMonth)
    .reduce((s, t) => s + Number(t.amount), 0);
  const monthEarnings = monthRevenue > 0 ? monthRevenue : monthTips;

  const prevMonthRevenue = revenues
    .filter((r) => r.createdAt >= startOfPrevMonth && r.createdAt < startOfMonth)
    .reduce((s, r) => s + Number(r.amount), 0);
  const prevMonthTips = tips
    .filter((t) => t.createdAt >= startOfPrevMonth && t.createdAt < startOfMonth)
    .reduce((s, t) => s + Number(t.amount), 0);
  const prevMonthEarnings = prevMonthRevenue > 0 ? prevMonthRevenue : prevMonthTips;

  const readCount = readingRows.length;
  const completedReads = readingRows.filter((r) => r.progress >= 80).length;
  const bouncedReads = readingRows.filter(
    (r) => r.progress < 25 && r.secondsRead < 45
  ).length;
  const avgSeconds =
    readCount > 0
      ? Math.round(
          readingRows.reduce((s, r) => s + r.secondsRead, 0) / readCount
        )
      : 0;

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const viewsDaily = buildDailyViews(readsLast30);

  const stats: DashboardStats = {
    views30d: formatStatValue(viewsLast30),
    views30dRaw: viewsLast30,
    reactions: formatStatValue(totalLikes),
    reactionsRaw: totalLikes,
    followers: followerCount.toLocaleString("en-IN"),
    followersRaw: followerCount,
    earnings: formatINR(monthEarnings),
    earningsRaw: monthEarnings,
    viewsDelta: pctDelta(viewsLast30, viewsPrev30),
    reactionsDelta: pctDelta(reactionsLast30, reactionsPrev30),
    followersDelta: pctDelta(followersLast30, followersPrev30),
    earningsDelta: pctDelta(monthEarnings, prevMonthEarnings),
    streakDays: user.profile?.streakDays ?? 0,
    blogCount: blogs.length,
    publishedCount,
    pendingCount: blogs.filter((b) => b.status === "PENDING").length,
    draftCount: blogs.filter((b) => b.status === "DRAFT").length,
    avgReadTime:
      avgSeconds > 0 ? formatSecondsDuration(avgSeconds) : avgReadingTimeMinutes(blogs),
    ctr: readCount > 0 ? `${Math.round((completedReads / readCount) * 100)}%` : "—",
    bounceRate:
      readCount > 0 ? `${Math.round((bouncedReads / readCount) * 100)}%` : "—",
    unreadNotifications,
    walletBalance: formatINR(walletBal),
    walletBalanceRaw: walletBal,
    lifetimeEarnings: formatINR(lifetime),
    lifetimeEarningsRaw: lifetime,
    viewsDaily,
    totalViews,
  };

  const revenueBySource = new Map<RevenueSource, number>();
  for (const r of revenues) {
    if (r.createdAt < thirtyDaysAgo) continue;
    revenueBySource.set(
      r.source,
      (revenueBySource.get(r.source) ?? 0) + Number(r.amount)
    );
  }

  const tipsLast30 = tips
    .filter((t) => t.createdAt >= thirtyDaysAgo)
    .reduce((s, t) => s + Number(t.amount), 0);
  if (tipsLast30 > 0) {
    revenueBySource.set("TIP", (revenueBySource.get("TIP") ?? 0) + tipsLast30);
  }

  const revenueSources: RevenueSourceRow[] = REVENUE_SOURCE_ORDER.map((source) => ({
    source: REVENUE_LABELS[source],
    amount: revenueBySource.get(source) ?? 0,
    iconKey: iconKeyForRevenue(source),
  }));

  const payoutRows: PayoutRow[] = [
    ...tips.map((t) => ({
      date: t.createdAt.toISOString().slice(0, 10),
      method: "Tip",
      amount: Number(t.amount),
      status: "Received",
    })),
    ...revenues.map((r) => ({
      date: r.createdAt.toISOString().slice(0, 10),
      method: r.source === "TIP" ? "Tip" : "Revenue",
      amount: Number(r.amount),
      status: "Credited",
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return {
    userId,
    stats,
    topBlogs: mappedBlogs.filter((b) => b).slice(0, 3),
    allBlogs: blogs.map((b) => mapDbBlogToDashboardRow(b)),
    notifications: notifications.map((n) => ({
      id: n.id,
      icon: NOTIF_ICON[n.type] ?? "system",
      title: n.title,
      body: n.message,
      time: timeAgoShort(n.createdAt),
      unread: !n.read,
      link: n.link,
    })),
    bookmarks: bookmarks
      .map((bk) => (bk.blog ? mapDbBlogToBlog(bk.blog) : null))
      .filter((b): b is Blog => b !== null),
    achievements: achievements.map((ua) => ({
      id: ua.achievement.id,
      code: ua.achievement.code,
      title: ua.achievement.title,
      description: ua.achievement.description,
      earnedAt: ua.earnedAt.toISOString(),
      earned: true,
    })),
    revenueSources,
    payouts: payoutRows,
  };
  }, "dashboard");
}

/** Per-request cache so layout + pages share one DB round-trip. */
export const getDashboardDataCached = cache(
  async (session: SessionUser) => getDashboardData(session)
);
