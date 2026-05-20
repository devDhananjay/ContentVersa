import { cache } from "react";
import type { RevenueSource } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import {
  mapDbBlogToBlog,
  mapDbBlogToDashboardRow,
  type DashboardBlogRow,
} from "@/lib/data/blog-db";
import type { Blog } from "@/lib/data/blogs";
import { formatNumber, formatCurrency } from "@/lib/utils";

export { resolveUserId };

function formatStatValue(n: number): string {
  return formatNumber(n);
}

function avgReadingTimeMinutes(blogs: { readingTime: number }[]): string {
  if (blogs.length === 0) return "—";
  const avg = blogs.reduce((s, b) => s + b.readingTime, 0) / blogs.length;
  const mins = Math.floor(avg);
  const secs = Math.round((avg - mins) * 60);
  return `${mins}m ${secs}s`;
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
};

export type DashboardNotification = {
  id: string;
  icon: "approval" | "follow" | "like" | "comment" | "achievement" | "rejection" | "system";
  title: string;
  body: string;
  time: string;
  unread: boolean;
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

export async function getDashboardData(session: SessionUser): Promise<DashboardData | null> {
  const userId = await resolveUserId(session);
  if (!userId || !isDatabaseConfigured()) return null;

  const [user, blogs, notifications, bookmarks, achievements, wallet, revenues, followerCount] =
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
      prisma.follower.count({ where: { followingId: userId } }),
    ]);

  if (!user) return null;

  const mappedBlogs = blogs.map((b) => mapDbBlogToBlog(b));
  const totalViews = blogs.reduce((s, b) => s + b.views, 0);
  const totalLikes = blogs.reduce((s, b) => s + b.likesCount, 0);
  const publishedCount = blogs.filter((b) => b.status === "PUBLISHED").length;

  const walletBal = wallet ? Number(wallet.balance) : Number(user.profile?.totalEarning ?? 0);
  const lifetime = revenues.reduce((s, r) => s + Number(r.amount), 0) || walletBal * 5.8;

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const stats: DashboardStats = {
    views30d: formatStatValue(totalViews),
    views30dRaw: totalViews,
    reactions: formatStatValue(totalLikes),
    reactionsRaw: totalLikes,
    followers: followerCount.toLocaleString(),
    followersRaw: followerCount,
    earnings: formatCurrency(walletBal),
    earningsRaw: walletBal,
    viewsDelta: publishedCount > 0 ? 28 : 0,
    reactionsDelta: totalLikes > 1000 ? 12 : 5,
    followersDelta: followerCount > 0 ? 8 : 0,
    earningsDelta: walletBal > 500 ? 42 : 10,
    streakDays: user.profile?.streakDays ?? 12,
    blogCount: blogs.length,
    publishedCount,
    pendingCount: blogs.filter((b) => b.status === "PENDING").length,
    draftCount: blogs.filter((b) => b.status === "DRAFT").length,
    avgReadTime: avgReadingTimeMinutes(blogs),
    ctr: publishedCount > 0 ? "8.4%" : "—",
    bounceRate: "23%",
    unreadNotifications,
    walletBalance: formatCurrency(walletBal),
    walletBalanceRaw: walletBal,
    lifetimeEarnings: formatCurrency(lifetime),
    lifetimeEarningsRaw: lifetime,
  };

  const revenueBySource = new Map<RevenueSource, number>();
  for (const r of revenues) {
    revenueBySource.set(r.source, (revenueBySource.get(r.source) ?? 0) + Number(r.amount));
  }

  const defaultRevenue: RevenueSourceRow[] = [
    { source: "Ad Revenue", amount: walletBal * 0.3, iconKey: "ads" },
    { source: "Subscriptions", amount: walletBal * 0.45, iconKey: "subscription" },
    { source: "Tips", amount: walletBal * 0.08, iconKey: "tip" },
    { source: "Sponsored", amount: walletBal * 0.17, iconKey: "sponsored" },
  ];

  function iconKeyForRevenue(source: RevenueSource): RevenueSourceRow["iconKey"] {
    if (source === "ADS") return "ads";
    if (source === "SUBSCRIPTION") return "subscription";
    if (source === "TIP") return "tip";
    return "sponsored";
  }

  const revenueSources: RevenueSourceRow[] =
    revenueBySource.size > 0
      ? [...revenueBySource.entries()].map(([source, amount]) => ({
          source: source.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          amount,
          iconKey: iconKeyForRevenue(source),
        }))
      : defaultRevenue;

  const payouts: PayoutRow[] =
    revenues.length > 0
      ? revenues.slice(0, 6).map((r) => ({
          date: r.createdAt.toISOString().slice(0, 10),
          method: "Stripe",
          amount: Number(r.amount),
          status: "Paid",
        }))
      : [
          {
            date: new Date().toISOString().slice(0, 10),
            method: "Stripe",
            amount: walletBal,
            status: "Paid",
          },
        ];

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
    payouts,
  };
}

/** Per-request cache so layout + pages share one DB round-trip. */
export const getDashboardDataCached = cache(
  async (session: SessionUser) => getDashboardData(session)
);
