import type { MetadataRoute } from "next";
import { BlogStatus } from "@prisma/client";
import { BLOGS } from "@/lib/data/blogs";
import { CATEGORIES, categoryPageHref } from "@/lib/data/categories";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { SITE } from "@/lib/seo";
import {
  isIndexableArticle,
  MIN_INDEXABLE_READING_MINUTES,
} from "@/lib/seo/crawl-policy";
import { TOOL_REGISTRY, TOOLS_HUB_PATH } from "@/lib/tools/registry";
import { guideSitemapEntries } from "@/lib/guides/registry";
import { getCineverseHubDataCached } from "@/lib/cineverse/data";

type SitemapFreq = MetadataRoute.Sitemap[0]["changeFrequency"];

/** Google-safe W3C datetime — no fractional seconds (GSC rejects .205Z). */
export function formatSitemapLastMod(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

const STATIC_PAGES: Array<{
  path: string;
  changeFrequency: SitemapFreq;
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/blogs", changeFrequency: "hourly", priority: 0.9 },
  { path: "/categories", changeFrequency: "daily", priority: 0.8 },
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
  { path: "/sports", changeFrequency: "hourly", priority: 0.85 },
  { path: "/sports/teams", changeFrequency: "daily", priority: 0.75 },
  { path: "/sports/players", changeFrequency: "daily", priority: 0.75 },
  { path: "/finance", changeFrequency: "hourly", priority: 0.85 },
  { path: "/jobs", changeFrequency: "daily", priority: 0.8 },
  { path: "/results", changeFrequency: "daily", priority: 0.88 },
  { path: "/reels", changeFrequency: "daily", priority: 0.75 },
  { path: "/cineverse", changeFrequency: "hourly", priority: 0.82 },
  { path: "/goldverse", changeFrequency: "hourly", priority: 0.84 },
  { path: "/moneyverse", changeFrequency: "daily", priority: 0.86 },
  { path: "/moneyverse/screenshot-scan", changeFrequency: "weekly", priority: 0.88 },
  { path: "/moneyverse/bank-statement-analyzer", changeFrequency: "weekly", priority: 0.9 },
  { path: "/huid-verification", changeFrequency: "daily", priority: 0.9 },
  { path: "/tools", changeFrequency: "daily", priority: 0.92 },
  { path: "/trending", changeFrequency: "hourly", priority: 0.86 },
  ...guideSitemapEntries(),
  ...TOOL_REGISTRY.map((t) => ({
    path: `${TOOLS_HUB_PATH}/${t.slug}`,
    changeFrequency: "weekly" as SitemapFreq,
    priority:
      t.slug === "salary-tax-calculator"
        ? 0.9
        : t.slug.startsWith("nearby-")
          ? 0.84
          : 0.87,
  })),
  // Location matrix pages are noindex (thin templates) — keep out of sitemap.
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
    lastModified: formatSitemapLastMod(opts.lastModified ?? new Date()),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
  };
}

async function dynamicDbEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  if (!isDatabaseConfigured()) return [];

  const blogs = await prisma.blog.findMany({
      where: {
        status: BlogStatus.PUBLISHED,
        slug: { not: { startsWith: "discover-" } },
        readingTime: { gte: MIN_INDEXABLE_READING_MINUTES },
      },
      select: { slug: true, updatedAt: true, publishedAt: true, readingTime: true },
      orderBy: { publishedAt: "desc" },
  });

  const blogEntries: MetadataRoute.Sitemap = blogs
    .filter((b) => isIndexableArticle({ slug: b.slug, readingTime: b.readingTime }))
    .map((b) =>
      entry(`/blog/${b.slug}`, {
        lastModified: b.publishedAt ?? b.updatedAt,
        changeFrequency: "weekly",
        priority: 0.65,
      })
    );

  const profileGroups = await prisma.blog.groupBy({
    by: ["authorId"],
    where: { status: BlogStatus.PUBLISHED },
    _count: { _all: true },
  });
  const eligibleAuthorIds = profileGroups
    .filter((g) => g._count._all >= 2)
    .map((g) => g.authorId)
    .slice(0, 200);

  let profileEntries: MetadataRoute.Sitemap = [];
  if (eligibleAuthorIds.length) {
    const authors = await prisma.user.findMany({
      where: { id: { in: eligibleAuthorIds } },
      select: { username: true, updatedAt: true },
    });
    profileEntries = authors
      .filter((a) => a.username)
      .map((a) =>
        entry(`/profile/${a.username}`, {
          lastModified: a.updatedAt ?? now,
          changeFrequency: "weekly",
          priority: 0.45,
        })
      );
  }

  return [...blogEntries, ...profileEntries];
}

async function cineverseMovieEntries(
  now: Date
): Promise<MetadataRoute.Sitemap> {
  try {
    const hub = await getCineverseHubDataCached();
    const movies = [...hub.trending, ...hub.nowPlaying, ...hub.upcoming];
    const seen = new Set<string>();
    const out: MetadataRoute.Sitemap = [];
    for (const m of movies) {
      if (!m.id || seen.has(m.id)) continue;
      seen.add(m.id);
      out.push(
        entry(`/cineverse/movie/${m.id}`, {
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.55,
        })
      );
      if (out.length >= 40) break;
    }
    return out;
  } catch {
    return [];
  }
}

function dedupeSitemap(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const byUrl = new Map<string, MetadataRoute.Sitemap[0]>();
  for (const item of entries) {
    const prev = byUrl.get(item.url);
    if (!prev || (item.priority ?? 0) > (prev.priority ?? 0)) {
      byUrl.set(item.url, item);
    }
  }
  return [...byUrl.values()];
}

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = new Set(STATIC_PAGES.map((p) => p.path || "/"));

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) =>
    entry(page.path, {
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })
  );

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.filter(
    (c) => !staticPaths.has(categoryPageHref(c.slug))
  ).map((c) =>
    entry(categoryPageHref(c.slug), {
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    })
  );

  let dbEntries: MetadataRoute.Sitemap = [];
  let movieEntries: MetadataRoute.Sitemap = [];
  let trendEntries: MetadataRoute.Sitemap = [];
  try {
    dbEntries = await dynamicDbEntries(now);
  } catch {
    // Sitemap must not 500 when DB is briefly unavailable.
  }
  try {
    movieEntries = await cineverseMovieEntries(now);
  } catch {
    /* TMDB optional */
  }
  try {
    const { fetchIndiaTrends } = await import("@/lib/trending/google-trends");
    const trends = await fetchIndiaTrends();
    trendEntries = trends.slice(0, 20).map((t) =>
      entry(t.href, {
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.72,
      })
    );
  } catch {
    /* Trends RSS optional */
  }

  if (dbEntries.length > 0 || movieEntries.length > 0 || trendEntries.length > 0) {
    return dedupeSitemap([
      ...staticEntries,
      ...categoryEntries,
      ...dbEntries,
      ...movieEntries,
      ...trendEntries,
    ]);
  }

  const fallbackBlogs: MetadataRoute.Sitemap = BLOGS.filter((b) =>
    isIndexableArticle({ slug: b.slug, readingTime: b.readingTime })
  ).map((b) =>
    entry(`/blog/${b.slug}`, {
      lastModified: new Date(b.publishedAt),
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  return dedupeSitemap([
    ...staticEntries,
    ...categoryEntries,
    ...fallbackBlogs,
    ...trendEntries,
  ]);
}
