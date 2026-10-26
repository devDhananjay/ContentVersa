import type { MetadataRoute } from "next";
import { BlogStatus } from "@prisma/client";
import { BLOGS } from "@/lib/data/blogs";
import { CATEGORIES, categoryPageHref } from "@/lib/data/categories";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { SITE } from "@/lib/seo";
import {
  isIndexableArticle,
  isIndexableTool,
  isToiNewsBriefing,
  MIN_INDEXABLE_READING_MINUTES,
  MIN_NEWS_INDEXABLE_READING_MINUTES,
} from "@/lib/seo/crawl-policy";
import { TOOL_REGISTRY, TOOLS_HUB_PATH } from "@/lib/tools/registry";
import { guideSitemapEntries } from "@/lib/guides/registry";
import { MONEY_TOPIC_SLUGS } from "@/lib/finance/money-topics";
import { isRedirectedPath, isNoindexFinanceTopic } from "@/lib/seo/content-redirects";
import { getCineverseMovieSitemapEntries } from "@/lib/cineverse/sitemap-movies";

type SitemapFreq = MetadataRoute.Sitemap[0]["changeFrequency"];

/**
 * Google-safe sitemap lastmod (GSC "Invalid date"):
 * - default YYYY-MM-DD (Google's simplest accepted form)
 * - datetime style uses `+00:00` (not `Z` / `+0000` — GSC is picky)
 * - never future (TMDB "upcoming" release dates)
 * - never Invalid Date / NaN
 * - never absurdly old (classic films as lastmod confuse validators)
 */
export function formatSitemapLastMod(
  date: Date | string | number | null | undefined,
  opts?: { style?: "date" | "datetime" }
): string {
  const now = new Date();
  let d =
    date instanceof Date
      ? date
      : date == null || date === ""
        ? now
        : new Date(date);
  if (!Number.isFinite(d.getTime())) d = now;
  if (d.getTime() > now.getTime()) d = now;
  // Floor: don't emit theatrical release years from the 1950s–80s as page lastmod.
  const min = new Date(now.getTime() - 10 * 365.25 * 24 * 3600 * 1000);
  if (d.getTime() < min.getTime()) d = min;

  if (opts?.style === "datetime") {
    return d.toISOString().replace(/\.\d{3}Z$/, "+00:00");
  }
  return d.toISOString().slice(0, 10);
}

const STATIC_PAGES: Array<{
  path: string;
  changeFrequency: SitemapFreq;
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/blogs", changeFrequency: "hourly", priority: 0.9 },
  { path: "/news", changeFrequency: "hourly", priority: 0.88 },
  { path: "/categories", changeFrequency: "daily", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/advertise", changeFrequency: "monthly", priority: 0.55 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.45 },
  { path: "/press", changeFrequency: "monthly", priority: 0.45 },
  { path: "/press-kit", changeFrequency: "monthly", priority: 0.5 },
  { path: "/policy", changeFrequency: "yearly", priority: 0.35 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/creator-program", changeFrequency: "monthly", priority: 0.55 },
  { path: "/premium", changeFrequency: "monthly", priority: 0.5 },
  { path: "/site-map", changeFrequency: "monthly", priority: 0.45 },
  // /sports, /trending, /results stay live for users but noindex — out of sitemap (AdSense).
  // /sports/teams + /sports/players are noindex directory hubs — keep out of sitemap.
  { path: "/finance", changeFrequency: "hourly", priority: 0.85 },
  ...MONEY_TOPIC_SLUGS.filter(
    (slug) =>
      !isRedirectedPath(`/finance/${slug}`) && !isNoindexFinanceTopic(slug)
  ).map((slug) => ({
    path: `/finance/${slug}`,
    changeFrequency: "weekly" as SitemapFreq,
    priority: 0.8,
  })),
  { path: "/jobs", changeFrequency: "daily", priority: 0.8 },
  { path: "/cineverse", changeFrequency: "hourly", priority: 0.82 },
  { path: "/goldverse", changeFrequency: "hourly", priority: 0.84 },
  { path: "/moneyverse", changeFrequency: "daily", priority: 0.86 },
  { path: "/huid-verification", changeFrequency: "daily", priority: 0.9 },
  { path: "/tools", changeFrequency: "daily", priority: 0.92 },
  ...guideSitemapEntries(),
  ...TOOL_REGISTRY.filter((t) => isIndexableTool(t.slug)).map((t) => ({
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
  // /reels is Disallow'd in robots — keep out of sitemap.
  // /ai + MoneyVerse OCR analyzers stay live but unsitemap'd (form-heavy / thin for AdSense).
  { path: "/jobs/govt", changeFrequency: "hourly", priority: 0.78 },
  { path: "/jobs/private", changeFrequency: "daily", priority: 0.72 },
];

/** Hindi UI hubs (dictionary i18n) — safe to sitemap; blog HI only when PUBLISHED. */
const HI_STATIC_HUBS: Array<{
  path: string;
  changeFrequency: SitemapFreq;
  priority: number;
}> = [
  { path: "/hi", changeFrequency: "daily", priority: 0.95 },
  { path: "/hi/blogs", changeFrequency: "hourly", priority: 0.85 },
  { path: "/hi/news", changeFrequency: "hourly", priority: 0.85 },
  { path: "/hi/categories", changeFrequency: "daily", priority: 0.75 },
  { path: "/hi/about", changeFrequency: "monthly", priority: 0.45 },
  { path: "/hi/tools", changeFrequency: "daily", priority: 0.88 },
  { path: "/hi/jobs", changeFrequency: "daily", priority: 0.75 },
  { path: "/hi/finance", changeFrequency: "hourly", priority: 0.8 },
  { path: "/hi/moneyverse", changeFrequency: "daily", priority: 0.8 },
  { path: "/hi/goldverse", changeFrequency: "hourly", priority: 0.8 },
  { path: "/hi/cineverse", changeFrequency: "hourly", priority: 0.78 },
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
        OR: [
          {
            readingTime: { gte: MIN_INDEXABLE_READING_MINUTES },
            NOT: [
              { slug: { contains: "-daily-" } },
              { metaKeywords: { contains: "ai-daily" } },
            ],
          },
          {
            metaKeywords: { contains: "toi-rewrite" },
            readingTime: { gte: MIN_NEWS_INDEXABLE_READING_MINUTES },
          },
        ],
      },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
        publishedAt: true,
        readingTime: true,
        metaKeywords: true,
      },
      orderBy: { publishedAt: "desc" },
  });

  const indexableBlogs = blogs
    .filter((b) =>
      isIndexableArticle({
        slug: b.slug,
        readingTime: b.readingTime,
        metaKeywords: b.metaKeywords,
      })
    )
    .filter((b) => !isRedirectedPath(`/blog/${b.slug}`));

  const blogEntries: MetadataRoute.Sitemap = indexableBlogs.map((b) => {
    const isNews = isToiNewsBriefing(b.metaKeywords);
    return entry(`/blog/${b.slug}`, {
      lastModified: b.publishedAt ?? b.updatedAt,
      changeFrequency: isNews ? "hourly" : "weekly",
      priority: isNews ? 0.88 : 0.65,
    });
  });

  let hiBlogEntries: MetadataRoute.Sitemap = [];
  try {
    const hiPublished = await prisma.blogTranslation.findMany({
      where: {
        locale: "hi",
        status: "PUBLISHED",
        blog: { status: BlogStatus.PUBLISHED },
      },
      select: {
        updatedAt: true,
        blog: {
          select: {
            slug: true,
            publishedAt: true,
            metaKeywords: true,
            readingTime: true,
          },
        },
      },
      take: 2000,
    });

    hiBlogEntries = hiPublished
      .filter(
        (t) =>
          t.blog?.slug &&
          !isRedirectedPath(`/blog/${t.blog.slug}`) &&
          isIndexableArticle({
            slug: t.blog.slug,
            readingTime: t.blog.readingTime,
            metaKeywords: t.blog.metaKeywords,
          })
      )
      .map((t) => {
        const isNews = isToiNewsBriefing(t.blog.metaKeywords);
        return entry(`/hi/blog/${t.blog.slug}`, {
          lastModified: t.blog.publishedAt ?? t.updatedAt,
          changeFrequency: isNews ? "hourly" : "weekly",
          priority: isNews ? 0.86 : 0.62,
        });
      });
  } catch {
    /* table may not exist until migrate */
  }

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

  return [...blogEntries, ...hiBlogEntries, ...profileEntries];
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

  const staticEntries: MetadataRoute.Sitemap = [
    ...STATIC_PAGES.filter((page) => !isRedirectedPath(page.path || "/")),
    ...HI_STATIC_HUBS,
  ].map((page) =>
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
  try {
    dbEntries = await dynamicDbEntries(now);
  } catch {
    // Sitemap must not 500 when DB is briefly unavailable.
  }

  let movieEntries: MetadataRoute.Sitemap = [];
  try {
    const movies = await getCineverseMovieSitemapEntries(500);
    movieEntries = movies
      .filter((m) => !isRedirectedPath(m.path))
      .map((m) =>
        entry(m.path, {
          lastModified: m.lastModified,
          changeFrequency: "weekly",
          priority: 0.72,
        })
      );
  } catch {
    // TMDB optional — sitemap still returns blogs/static.
  }

  if (dbEntries.length > 0) {
    return dedupeSitemap([
      ...staticEntries,
      ...categoryEntries,
      ...dbEntries,
      ...movieEntries,
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
    ...movieEntries,
  ]);
}
