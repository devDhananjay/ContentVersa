import type { MetadataRoute } from "next";
import { BlogStatus, ReelStatus } from "@prisma/client";
import { BLOGS } from "@/lib/data/blogs";
import { CATEGORIES } from "@/lib/data/categories";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { NIFTY50_SYMBOLS } from "@/lib/finance/constants";
import { displaySymbol } from "@/lib/finance/transformers";
import { getInternationalTeams, getSportsHubData } from "@/lib/sports/data";
import { SITE } from "@/lib/seo";

type SitemapFreq = MetadataRoute.Sitemap[0]["changeFrequency"];

const STATIC_PAGES: Array<{
  path: string;
  changeFrequency: SitemapFreq;
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/blogs", changeFrequency: "hourly", priority: 0.9 },
  { path: "/categories", changeFrequency: "daily", priority: 0.8 },
  { path: "/reels", changeFrequency: "daily", priority: 0.75 },
  { path: "/leaderboard", changeFrequency: "daily", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.45 },
  { path: "/press", changeFrequency: "monthly", priority: 0.45 },
  { path: "/policy", changeFrequency: "yearly", priority: 0.35 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/creator-program", changeFrequency: "monthly", priority: 0.55 },
  { path: "/premium", changeFrequency: "monthly", priority: 0.5 },
  { path: "/site-map", changeFrequency: "monthly", priority: 0.45 },
  { path: "/auth/sign-in", changeFrequency: "monthly", priority: 0.4 },
  { path: "/auth/sign-up", changeFrequency: "monthly", priority: 0.4 },
  { path: "/sports", changeFrequency: "hourly", priority: 0.85 },
  { path: "/sports/teams", changeFrequency: "daily", priority: 0.75 },
  { path: "/sports/players", changeFrequency: "daily", priority: 0.75 },
  { path: "/finance", changeFrequency: "hourly", priority: 0.85 },
  { path: "/jobs", changeFrequency: "daily", priority: 0.8 },
  { path: "/jobs/govt", changeFrequency: "hourly", priority: 0.78 },
  { path: "/jobs/private", changeFrequency: "daily", priority: 0.72 },
];

function entry(
  path: string,
  opts: {
    lastModified?: Date;
    changeFrequency: SitemapFreq;
    priority: number;
  }
): MetadataRoute.Sitemap[0] {
  return {
    url: `${SITE.url}${path}`,
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
  };
}

function financeStockEntries(now: Date): MetadataRoute.Sitemap {
  const symbols = [...new Set(NIFTY50_SYMBOLS)];
  return symbols.map((symbol) =>
    entry(`/finance/stock/${displaySymbol(symbol)}`, {
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.68,
    })
  );
}

async function sportsEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  const [hub, teams] = await Promise.all([getSportsHubData(), getInternationalTeams()]);
  if (!hub.configured && teams.length === 0) return [];

  const out: MetadataRoute.Sitemap = [];
  const matchIds = new Set<number>();
  const playerIds = new Set<number>();

  for (const match of [...hub.live, ...hub.upcoming, ...hub.recent]) {
    if (matchIds.has(match.id)) continue;
    matchIds.add(match.id);
    out.push(
      entry(`/sports/match/${match.id}`, {
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.72,
      })
    );
  }

  for (const day of hub.schedule) {
    for (const match of day.matches) {
      if (matchIds.has(match.id)) continue;
      matchIds.add(match.id);
      out.push(
        entry(`/sports/match/${match.id}`, {
          lastModified: now,
          changeFrequency: "daily",
          priority: 0.7,
        })
      );
    }
  }

  for (const item of hub.news) {
    out.push(
      entry(`/sports/news/${item.id}`, {
        lastModified: item.publishedAt ? new Date(item.publishedAt) : now,
        changeFrequency: "daily",
        priority: 0.66,
      })
    );
  }

  for (const series of hub.series) {
    out.push(
      entry(`/sports/series/${series.id}`, {
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.68,
      })
    );
  }

  for (const player of hub.trendingPlayers) {
    playerIds.add(player.id);
  }
  for (const rows of Object.values(hub.rankingsByFormat)) {
    for (const row of rows ?? []) {
      playerIds.add(row.id);
    }
  }
  for (const id of playerIds) {
    out.push(
      entry(`/sports/player/${id}`, {
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.64,
      })
    );
  }

  for (const team of teams) {
    out.push(
      entry(`/sports/team/${team.id}`, {
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.65,
      })
    );
  }

  return out;
}

async function dynamicDbEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  if (!isDatabaseConfigured()) return [];

  const [blogs, reels, profiles] = await Promise.all([
    prisma.blog.findMany({
      where: {
        status: BlogStatus.PUBLISHED,
        slug: { not: { startsWith: "discover-" } },
      },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.reel.findMany({
      where: { status: ReelStatus.PUBLISHED },
      select: { id: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.user.findMany({
      where: {
        blogs: { some: { status: BlogStatus.PUBLISHED } },
      },
      select: { username: true, updatedAt: true },
    }),
  ]);

  const blogEntries: MetadataRoute.Sitemap = blogs.map((b) =>
    entry(`/blog/${b.slug}`, {
      lastModified: b.publishedAt ?? b.updatedAt,
      changeFrequency: "weekly",
      priority: 0.65,
    })
  );

  const reelEntries: MetadataRoute.Sitemap = reels.map((r) =>
    entry(`/reels/${r.id}`, {
      lastModified: r.publishedAt ?? r.updatedAt,
      changeFrequency: "weekly",
      priority: 0.62,
    })
  );

  const profileEntries: MetadataRoute.Sitemap = profiles.map((u) =>
    entry(`/profile/${u.username}`, {
      lastModified: u.updatedAt,
      changeFrequency: "weekly",
      priority: 0.58,
    })
  );

  return [...blogEntries, ...reelEntries, ...profileEntries];
}

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) =>
    entry(page.path, {
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })
  );

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((c) =>
    entry(`/category/${c.slug}`, {
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    })
  );

  const stockEntries = financeStockEntries(now);

  const [sports, dbEntries] = await Promise.all([
    sportsEntries(now),
    dynamicDbEntries(now),
  ]);

  if (dbEntries.length > 0) {
    return [...staticEntries, ...categoryEntries, ...stockEntries, ...sports, ...dbEntries];
  }

  const fallbackBlogs: MetadataRoute.Sitemap = BLOGS.map((b) =>
    entry(`/blog/${b.slug}`, {
      lastModified: new Date(b.publishedAt),
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  return [...staticEntries, ...categoryEntries, ...stockEntries, ...sports, ...fallbackBlogs];
}
