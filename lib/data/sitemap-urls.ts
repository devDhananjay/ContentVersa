import type { MetadataRoute } from "next";
import { BlogStatus } from "@prisma/client";
import { BLOGS } from "@/lib/data/blogs";
import { CATEGORIES } from "@/lib/data/categories";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { SITE } from "@/lib/seo";

const STATIC_PAGES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
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
  { path: "/sports", changeFrequency: "hourly", priority: 0.85 },
  { path: "/sports/teams", changeFrequency: "daily", priority: 0.75 },
  { path: "/sports/players", changeFrequency: "daily", priority: 0.75 },
  { path: "/finance", changeFrequency: "hourly", priority: 0.85 },
  { path: "/jobs", changeFrequency: "daily", priority: 0.8 },
  { path: "/jobs/govt", changeFrequency: "hourly", priority: 0.78 },
  { path: "/jobs/private", changeFrequency: "daily", priority: 0.72 },
];

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${SITE.url}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE.url}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];

  if (isDatabaseConfigured()) {
    const rows = await prisma.blog.findMany({
      where: {
        status: BlogStatus.PUBLISHED,
        // Syndicated discover feeds are thin/duplicate — exclude from sitemap (AdSense + SEO)
        slug: { not: { startsWith: "discover-" } },
      },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    if (rows.length > 0) {
      blogEntries = rows.map((b) => ({
        url: `${SITE.url}/blog/${b.slug}`,
        lastModified: b.publishedAt ?? b.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.65,
      }));
    }
  }

  if (blogEntries.length === 0) {
    blogEntries = BLOGS.map((b) => ({
      url: `${SITE.url}/blog/${b.slug}`,
      lastModified: new Date(b.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  }

  return [...staticEntries, ...categoryEntries, ...blogEntries];
}
