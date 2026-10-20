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

/** Last 48h of indexable Live News briefings (Google News–style window). */
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
    take: limit,
  });

  return blogs
    .filter((b) =>
      isIndexableArticle({
        slug: b.slug,
        readingTime: b.readingTime,
        metaKeywords: b.metaKeywords,
      })
    )
    .filter((b) => !isRedirectedPath(`/blog/${b.slug}`))
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
      const pub = formatSitemapLastMod(row.publishedAt);
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
