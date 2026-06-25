import { BlogStatus, RevenueSource } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export type PlatformAnalyticsData = {
  dau: number;
  dauDelta: number;
  articles: number;
  articlesDelta: number;
  pageViews: number;
  pageViewsDelta: number;
  countries: number;
  countriesDelta: number;
  weeklyTraffic: { label: string; value: number }[];
};

export type RevenueBreakdownRow = {
  source: string;
  amount: number;
  label: string;
};

export type PlatformRevenueData = {
  currency: string;
  mrr: number;
  mrrDelta: number;
  arr: number;
  arrDelta: number;
  payouts: number;
  payoutsDelta: number;
  activeSubs: number;
  activeSubsDelta: number;
  breakdown: RevenueBreakdownRow[];
};

const REVENUE_LABELS: Record<RevenueSource, string> = {
  SUBSCRIPTION: "Subscriptions",
  SPONSORED: "Sponsored articles",
  ADS: "Ads (Google)",
  TIP: "Tips",
  AFFILIATE: "Affiliate",
  PAID_CONTENT: "Paid content",
  NEWSLETTER: "Newsletter",
};

function pctDelta(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function decimalToNumber(value: { toNumber?: () => number } | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value) || 0;
}

async function countActiveVisitors(since: Date, until?: Date) {
  return prisma.siteVisitor.count({
    where: {
      lastSeen: until ? { gte: since, lt: until } : { gte: since },
    },
  });
}

async function getWeeklyTraffic(): Promise<{ label: string; value: number }[]> {
  const weeks: { label: string; value: number }[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setHours(0, 0, 0, 0);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    const value = await prisma.siteVisitor.count({
      where: { lastSeen: { gte: weekStart, lt: weekEnd } },
    });

    weeks.push({ label: `W${12 - i}`, value });
  }

  return weeks;
}

async function countDistinctLocations(): Promise<number> {
  const rows = await prisma.profile.findMany({
    where: { location: { not: null } },
    select: { location: true },
    take: 5000,
  });
  const set = new Set(
    rows
      .map((r) => r.location?.trim().toLowerCase())
      .filter((v): v is string => Boolean(v && v.length > 1))
  );
  return set.size;
}

const EMPTY_ANALYTICS: PlatformAnalyticsData = {
  dau: 0,
  dauDelta: 0,
  articles: 0,
  articlesDelta: 0,
  pageViews: 0,
  pageViewsDelta: 0,
  countries: 0,
  countriesDelta: 0,
  weeklyTraffic: Array.from({ length: 12 }, (_, i) => ({ label: `W${i + 1}`, value: 0 })),
};

const EMPTY_REVENUE: PlatformRevenueData = {
  currency: "INR",
  mrr: 0,
  mrrDelta: 0,
  arr: 0,
  arrDelta: 0,
  payouts: 0,
  payoutsDelta: 0,
  activeSubs: 0,
  activeSubsDelta: 0,
  breakdown: [
    { source: "SUBSCRIPTION", label: "Subscriptions", amount: 0 },
    { source: "SPONSORED", label: "Sponsored articles", amount: 0 },
    { source: "ADS", label: "Ads (Google)", amount: 0 },
    { source: "TIP", label: "Tips", amount: 0 },
  ],
};

export async function getPlatformAnalytics(): Promise<PlatformAnalyticsData> {
  if (!isDatabaseConfigured()) return EMPTY_ANALYTICS;

  try {
    const dayAgo = daysAgo(1);
    const twoDaysAgo = daysAgo(2);
    const weekAgo = daysAgo(7);
    const twoWeeksAgo = daysAgo(14);
    const monthAgo = daysAgo(30);
    const twoMonthsAgo = daysAgo(60);

    const [
      dau,
      dauPrev,
      articles,
      articlesNewMonth,
      articlesNewPrevMonth,
      blogViews,
      reelViews,
      readsWeek,
      readsPrevWeek,
      countries,
      usersMonth,
      usersPrevMonth,
      weeklyTraffic,
    ] = await Promise.all([
      countActiveVisitors(dayAgo),
      countActiveVisitors(twoDaysAgo, dayAgo),
      prisma.blog.count({ where: { status: BlogStatus.PUBLISHED } }),
      prisma.blog.count({
        where: { status: BlogStatus.PUBLISHED, publishedAt: { gte: monthAgo } },
      }),
      prisma.blog.count({
        where: {
          status: BlogStatus.PUBLISHED,
          publishedAt: { gte: twoMonthsAgo, lt: monthAgo },
        },
      }),
      prisma.blog.aggregate({ _sum: { views: true } }),
      prisma.reel.aggregate({ where: { status: "PUBLISHED" }, _sum: { views: true } }),
      prisma.readingHistory.count({ where: { readAt: { gte: weekAgo } } }),
      prisma.readingHistory.count({
        where: { readAt: { gte: twoWeeksAgo, lt: weekAgo } },
      }),
      countDistinctLocations(),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.user.count({
        where: { createdAt: { gte: twoMonthsAgo, lt: monthAgo } },
      }),
      getWeeklyTraffic(),
    ]);

    const pageViews = (blogViews._sum.views ?? 0) + (reelViews._sum.views ?? 0);

    return {
      dau,
      dauDelta: pctDelta(dau, dauPrev),
      articles,
      articlesDelta: pctDelta(articlesNewMonth, articlesNewPrevMonth),
      pageViews,
      pageViewsDelta: pctDelta(readsWeek, readsPrevWeek),
      countries,
      countriesDelta: pctDelta(usersMonth, usersPrevMonth),
      weeklyTraffic,
    };
  } catch (err) {
    console.error("[platform analytics]", err);
    return EMPTY_ANALYTICS;
  }
}

async function sumRevenue(
  since: Date,
  until: Date | undefined,
  source?: RevenueSource
): Promise<number> {
  const result = await prisma.revenue.aggregate({
    where: {
      ...(source ? { source } : {}),
      createdAt: until ? { gte: since, lt: until } : { gte: since },
    },
    _sum: { amount: true },
  });
  return decimalToNumber(result._sum.amount);
}

async function sumPayouts(since: Date, until?: Date): Promise<number> {
  const result = await prisma.payoutRequest.aggregate({
    where: {
      status: { in: ["COMPLETED", "PAID", "APPROVED", "SUCCESS"] },
      createdAt: until ? { gte: since, lt: until } : { gte: since },
    },
    _sum: { amount: true },
  });
  return decimalToNumber(result._sum.amount);
}

export async function getPlatformRevenue(): Promise<PlatformRevenueData> {
  if (!isDatabaseConfigured()) return EMPTY_REVENUE;

  try {
    const monthAgo = daysAgo(30);
    const twoMonthsAgo = daysAgo(60);

    const [
      mrr,
      mrrPrev,
      payouts,
      payoutsPrev,
      activeSubs,
      activeSubsPrev,
      breakdownRows,
    ] = await Promise.all([
      sumRevenue(monthAgo, undefined, "SUBSCRIPTION"),
      sumRevenue(twoMonthsAgo, monthAgo, "SUBSCRIPTION"),
      sumPayouts(monthAgo),
      sumPayouts(twoMonthsAgo, monthAgo),
      prisma.categorySubscription.count(),
      prisma.categorySubscription.count({
        where: { createdAt: { lt: monthAgo } },
      }),
      prisma.revenue.groupBy({
        by: ["source"],
        where: { createdAt: { gte: monthAgo } },
        _sum: { amount: true },
      }),
    ]);

    const breakdownMap = new Map(
      breakdownRows.map((row) => [row.source, decimalToNumber(row._sum.amount)])
    );

    const breakdown: RevenueBreakdownRow[] = (
      ["SUBSCRIPTION", "SPONSORED", "ADS", "TIP"] as RevenueSource[]
    ).map((source) => ({
      source,
      label: REVENUE_LABELS[source],
      amount: breakdownMap.get(source) ?? 0,
    }));

    for (const row of breakdownRows) {
      if (!breakdown.some((b) => b.source === row.source)) {
        breakdown.push({
          source: row.source,
          label: REVENUE_LABELS[row.source] ?? row.source,
          amount: decimalToNumber(row._sum.amount),
        });
      }
    }

    const totalMonth = breakdown.reduce((sum, row) => sum + row.amount, 0);
    const mrrValue = mrr > 0 ? mrr : totalMonth;
    const mrrPrevValue =
      mrrPrev > 0 ? mrrPrev : await sumRevenue(twoMonthsAgo, monthAgo);

    return {
      currency: "INR",
      mrr: mrrValue,
      mrrDelta: pctDelta(mrrValue, mrrPrevValue),
      arr: mrrValue * 12,
      arrDelta: pctDelta(mrrValue * 12, mrrPrevValue * 12),
      payouts,
      payoutsDelta: pctDelta(payouts, payoutsPrev),
      activeSubs,
      activeSubsDelta: pctDelta(activeSubs - activeSubsPrev, activeSubsPrev),
      breakdown: breakdown.sort((a, b) => b.amount - a.amount),
    };
  } catch (err) {
    console.error("[platform revenue]", err);
    return EMPTY_REVENUE;
  }
}
