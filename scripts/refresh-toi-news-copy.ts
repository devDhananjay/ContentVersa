/**
 * Re-write filler TOI Live News posts into proper newspaper-style articles.
 *
 *   npx tsx scripts/refresh-toi-news-copy.ts
 *   npx tsx scripts/refresh-toi-news-copy.ts --limit=20
 *   npx tsx scripts/refresh-toi-news-copy.ts --slug=pm-modi-invokes-ram-rajya
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  isFillerNewsBriefing,
  resetToiRewriteProviderState,
  rewriteToiHeadline,
} from "../lib/seo/toi-news-rewrite";
import { fetchToiArticleText } from "../lib/seo/toi-article-fetch";
import { fetchToiRssHeadlines } from "../lib/seo/toi-rss";
import { readingTime } from "../lib/utils";
import { MIN_NEWS_INDEXABLE_READING_MINUTES } from "../lib/seo/crawl-policy";

function extractToiSrcLink(metaKeywords: string | null | undefined): string | null {
  if (!metaKeywords) return null;
  const hit = metaKeywords
    .split(",")
    .map((k) => k.trim())
    .find((k) => k.startsWith("toi-src:"));
  if (!hit) return null;
  const url = hit.slice("toi-src:".length).trim();
  return url.startsWith("http") ? url : null;
}

function titleOverlap(a: string, b: string): number {
  const ta = new Set(
    a
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
  const tb = b
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  if (!ta.size || !tb.length) return 0;
  let hit = 0;
  for (const w of tb) if (ta.has(w)) hit++;
  return hit / Math.max(ta.size, tb.length);
}

function loadEnvFiles() {
  // Prefer .env.local (prod tunnel) over .env — force-override DATABASE_URL.
  for (const file of [".env", ".env.local"]) {
    const path = join(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      const preferLocal = file === ".env.local";
      if (preferLocal || !process.env[key]) process.env[key] = val;
    }
  }
}

function argValue(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

loadEnvFiles();

async function main() {
  const prisma = new PrismaClient();
  const limit = Math.max(1, Number(argValue("limit") || "200") || 200);
  const slugFilter = argValue("slug")?.trim();
  // Default: refresh every published TOI news post. Use --filler-only for old templates.
  const fillerOnly =
    process.argv.includes("--filler-only") ||
    process.argv.includes("--filler");

  const rows = await prisma.blog.findMany({
    where: {
      metaKeywords: { contains: "toi-rewrite" },
      status: "PUBLISHED",
      ...(slugFilter ? { slug: { contains: slugFilter } } : {}),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      metaKeywords: true,
      publishedAt: true,
      category: { select: { slug: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: slugFilter ? 20 : 500,
  });

  const targets = rows
    .filter((r) => {
      if (slugFilter) return true;
      if (fillerOnly) return isFillerNewsBriefing(r.content);
      return true;
    })
    .slice(0, limit);

  console.log(
    JSON.stringify({
      scanned: rows.length,
      refreshing: targets.length,
      slugFilter: slugFilter || null,
      fillerOnly,
    })
  );

  resetToiRewriteProviderState();
  let updated = 0;
  let failed = 0;

  const rss = await fetchToiRssHeadlines({
    maxPerFeed: 12,
    maxTotal: 48,
  }).catch(() => []);

  for (const row of targets) {
    const categorySlug = row.category?.slug || "lifestyle";
    const storedLink = extractToiSrcLink(row.metaKeywords);
    const rssMatch = rss
      .map((item) => ({ item, score: titleOverlap(row.title, item.title) }))
      .sort((a, b) => b.score - a.score)[0];
    const matched =
      rssMatch && rssMatch.score >= 0.35 ? rssMatch.item : null;
    const sourceLink = storedLink || matched?.link || null;

    let articleBody = "";
    let headline = matched?.title || row.title;
    let description = matched?.description || row.excerpt || "";
    let imageUrl = matched?.imageUrl;
    let publishedAt =
      matched?.publishedAt || row.publishedAt?.toISOString();

    if (sourceLink) {
      const extracted = await fetchToiArticleText(sourceLink);
      if (extracted?.articleBody) {
        articleBody = extracted.articleBody;
        headline = extracted.headline || headline;
        description = extracted.description || description;
        imageUrl = imageUrl || extracted.imageUrl;
        publishedAt = extracted.datePublished || publishedAt;
      }
    }

    if (!articleBody) {
      articleBody =
        description ||
        row.content
          .replace(/^#+\s.*$/gm, "")
          .split(/\n\n+/)
          .map((p) => p.trim())
          .filter((p) => p.length > 40 && !p.startsWith("##"))
          .slice(0, 8)
          .join(" ");
    }

    const result = await rewriteToiHeadline(
      {
        title: headline,
        link: sourceLink || `https://contentverse.co.in/blog/${row.slug}`,
        description: description.slice(0, 2000),
        articleBody,
        publishedAt,
        feedKey: matched?.feedKey || "refresh",
        imageUrl,
      },
      categorySlug
    );

    if (!result.ok) {
      failed++;
      console.warn("[refresh] fail", row.slug);
      continue;
    }

    const article = result.article;
    // Prefer AI; local is fine if it no longer looks like filler.
    if (isFillerNewsBriefing(article.content)) {
      failed++;
      console.warn("[refresh] still filler", row.slug, article.provider);
      continue;
    }

    const keywords = (row.metaKeywords || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
      .filter(
        (k) =>
          !k.startsWith("toi-provider:") &&
          k !== "toi-news-refreshed" &&
          k !== "toi-rss-only" &&
          k !== "toi-full-article"
      );
    keywords.push(`toi-provider:${article.provider}`);
    keywords.push(articleBody.length >= 180 ? "toi-full-article" : "toi-rss-only");
    keywords.push("toi-news-refreshed");
    if (sourceLink && !keywords.some((k) => k.startsWith("toi-src:"))) {
      keywords.push(`toi-src:${sourceLink}`);
    }

    await prisma.blog.update({
      where: { id: row.id },
      data: {
        title: article.title.slice(0, 160),
        excerpt: article.excerpt,
        content: article.content,
        metaTitle: article.title.slice(0, 160),
        metaDescription: article.metaDescription,
        metaKeywords: [...new Set(keywords)].join(", "),
        coverImage: imageUrl || undefined,
        readingTime: Math.max(
          MIN_NEWS_INDEXABLE_READING_MINUTES,
          readingTime(article.content)
        ),
      },
    });
    updated++;
    console.log(`[refresh] ${article.provider}: ${row.slug}`);
  }

  console.log(JSON.stringify({ updated, failed }));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
