import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured, safeDbQuery } from "@/lib/prisma";

export type PlatformStats = {
  creators: string;
  readers: string;
  paid: string;
};

const EMPTY_STATS: PlatformStats = {
  creators: "—",
  readers: "—",
  paid: "—",
};

function formatCount(n: number): string {
  if (n <= 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("en-IN");
}

function formatInrTotal(n: number): string {
  if (n <= 0) return "—";
  if (n >= 1_000_000) return `₹${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 100_000) return `₹${Math.round(n / 1000)}K`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/** Live platform numbers from the database — no inflated demo values. */
export async function getPlatformStats(): Promise<PlatformStats> {
  if (!isDatabaseConfigured()) return EMPTY_STATS;

  return safeDbQuery(EMPTY_STATS, async () => {
    const [publishedCreators, viewsAgg, tipsAgg, revenueInrAgg] = await Promise.all([
      prisma.user.count({
        where: { blogs: { some: { status: BlogStatus.PUBLISHED } } },
      }),
      prisma.blog.aggregate({
        where: { status: BlogStatus.PUBLISHED },
        _sum: { views: true },
      }),
      prisma.tip.aggregate({ _sum: { amount: true } }),
      prisma.revenue.aggregate({
        where: { currency: "INR" },
        _sum: { amount: true },
      }),
    ]);

    const reads = viewsAgg._sum.views ?? 0;
    const paidInr =
      Number(tipsAgg._sum.amount ?? 0) + Number(revenueInrAgg._sum.amount ?? 0);

    return {
      creators: formatCount(publishedCreators),
      readers: formatCount(reads),
      paid: formatInrTotal(paidInr),
    };
  }, "platform-stats");
}

export const PLATFORM_STAT_LABELS = [
  { key: "creators" as const, label: "Published creators" },
  { key: "readers" as const, label: "Article reads" },
  { key: "paid" as const, label: "Paid to creators" },
];

export function platformStatItems(stats: PlatformStats) {
  return PLATFORM_STAT_LABELS.map(({ key, label }) => ({
    value: stats[key],
    label,
  })).filter((row) => row.value !== "—");
}
