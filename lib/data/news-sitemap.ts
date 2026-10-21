/**
 * Dedicated Live News sitemap — recent toi-rewrite briefings for fast discovery.
 */

import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { SITE } from "@/lib/seo";
import { formatSitemapLastMod } from "@/lib/data/sitemap-urls";
import {
  isIndexableArticle,
  MIN_NEWS_INDEXABLE_READING_MINUTES,
} from "@/lib/seo/crawl-policy";
import { isRedirectedPath } from "@/lib/seo/content-redirects";

export type NewsSitemapRow = {
  loc: string;
  title: string;
  publishedAt: Date;
  updatedAt: Date;
};

/** Prefer India desk feeds in Google News sitemap (skip pure world wire). */
const INDIA_DESK_FEEDS = new Set([
  "india",
  "business",
  "cricket",
  "sports",
  "top",
  "latest",
  "entertainment",
  "lifestyle",
]);

/** Titles that are usually US/global sports or politics with weak India intent. */
const LOW_INDIA_INTENT_TITLE =
  /\b(ohio|nfl|nba|mlb|nhl|titans|white house|los angeles|new york|texas governor|gop primary|midterms|premier league matchday)\b/i;

function feedKeyFromKeywords(meta: string | null | undefined): string | null {
  if (!meta) return null;
  const m = meta.match(/\btoi-feed:([a-z0-9-]+)\b/i);
  return m?.[1]?.toLowerCase() ?? null;
}

/** Keep Google News focused on India-relevant briefings (AdSense + News quality). */
export function isIndiaDeskNewsBriefing(input: {
  title: string;
  metaKeywords?: string | null;
}): boolean {
  const feed = feedKeyFromKeywords(input.metaKeywords);
  if (feed === "world") return false;
  if (feed && !INDIA_DESK_FEEDS.has(feed)) return false;
  if (LOW_INDIA_INTENT_TITLE.test(input.title)) return false;
  return true;
}

/**
 * Last 48h of indexable Live News briefings (Google News sitemap window).
 * Submit https://contentverse.co.in/news-sitemap.xml in Search Console → Sitemaps
 * (in addition to sitemap.xml). robots.txt already lists both.
 */
export async function getNewsSitemapRows(
  limit = 100
): Promise<NewsSitemapRow[]> {
  if (!isDatabaseConfigured()) return [];

  const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const blogs = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      metaKeywords: { contains: "toi-rewrite" },
      readingTime: { gte: MIN_NEWS_INDEXABLE_READING_MINUTES },
      publishedAt: { gte: since },
      // Drop pure world wire from the News sitemap intake.
      NOT: { metaKeywords: { contains: "toi-feed:world" } },
    },
    select: {
      slug: true,
      title: true,
      publishedAt: true,
      updatedAt: true,
      readingTime: true,
      metaKeywords: true,
    },
    orderBy: { publishedAt: "desc" },
    take: Math.min(400, limit * 3),
  });

  return blogs
    .filter((b) =>
      isIndexableArticle({
        slug: b.slug,
        readingTime: b.readingTime,
        metaKeywords: b.metaKeywords,
      })
    )
    .filter((b) =>
      isIndiaDeskNewsBriefing({
        title: b.title,
        metaKeywords: b.metaKeywords,
      })
    )
    .filter((b) => !isRedirectedPath(`/blog/${b.slug}`))
    .slice(0, limit)
    .map((b) => ({
      loc: `${SITE.url}/blog/${b.slug}`,
      title: b.title,
      publishedAt: b.publishedAt ?? b.updatedAt,
      updatedAt: b.updatedAt,
    }));
}

export function renderNewsSitemapXml(rows: NewsSitemapRow[]): string {
  const items = rows
    .map((row) => {
      const pub = formatSitemapLastMod(row.publishedAt, { style: "datetime" });
      const title = escapeXml(row.title);
      return `  <url>
    <loc>${escapeXml(row.loc)}</loc>
    <lastmod>${pub}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
    <news:news>
      <news:publication>
        <news:name>ContentVerse India</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pub}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>
`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
