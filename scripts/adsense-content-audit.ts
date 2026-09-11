/**
 * Classify published blogs for AdSense low-value cleanup.
 *
 *   npm run db:adsense-audit
 *
 * Compares Prisma listing filters vs sitemap /blog/* vs known merge map.
 * Dry-run only — use db:adsense-apply to archive + set canonicals.
 */
import { BlogStatus } from "@prisma/client";
import {
  isGenericDailyTitle,
  normalizeTitleKey,
  scoreBlogForKeep,
  wordCount,
} from "../lib/seo/article-quality";
import {
  MERGE_BLOG_SLUG_SET,
  destinationForBlogSlug,
  categoryFallbackPath,
} from "../lib/seo/content-redirects";
import { GUIDE_ARTICLES, guideArticlePath } from "../lib/guides/registry";
import { MIN_INDEXABLE_READING_MINUTES } from "../lib/seo/crawl-policy";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { loadScriptEnv } from "./load-script-env";
import { SITE } from "../lib/seo";

loadScriptEnv();

type Bucket = "keep" | "rewrite" | "merge" | "remove";

function classify(input: {
  slug: string;
  title: string;
  readingTime: number;
  content: string;
  views: number;
}): { bucket: Bucket; reason: string; destination?: string } {
  const dest = destinationForBlogSlug(input.slug);
  if (dest) {
    return { bucket: "merge", reason: "Overlaps a guide/tool pillar", destination: dest };
  }
  if (isGenericDailyTitle(input.title)) {
    return {
      bucket: "remove",
      reason: "Generic daily title (What to Know Today / similar)",
    };
  }
  const words = wordCount(input.content);
  if (words < 800 || input.readingTime < 4) {
    return { bucket: "remove", reason: `Thin copy (${words} words, ${input.readingTime} min)` };
  }
  const genericLead =
    /boosting business strategy|data-driven leadership|t20 cricket strategy/i.test(
      input.title
    );
  if (genericLead) {
    return { bucket: "rewrite", reason: "Broad commentary without a unique India how-to" };
  }
  if (
    /best \d+|things to know|ultimate guide to success|in india: what/i.test(input.title) &&
    words < 1200
  ) {
    return { bucket: "rewrite", reason: "Generic listicle pattern — needs original examples" };
  }
  return { bucket: "keep", reason: "Passes length + uniqueness heuristics" };
}

async function sitemapBlogSlugs(): Promise<string[]> {
  const url = `${SITE.url}/sitemap.xml`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return [];
    const xml = await res.text();
    const slugs: string[] = [];
    const re = /<loc>\s*https?:\/\/[^<]+\/blog\/([^</\s]+)\s*<\/loc>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml))) {
      slugs.push(decodeURIComponent(m[1]));
    }
    return [...new Set(slugs)];
  } catch {
    return [];
  }
}

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL not configured");
  }

  const blogs = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED, slug: { not: { startsWith: "discover-" } } },
    select: {
      id: true,
      slug: true,
      title: true,
      readingTime: true,
      content: true,
      views: true,
      createdAt: true,
      category: { select: { slug: true } },
      metaKeywords: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  const listing = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      readingTime: { gte: MIN_INDEXABLE_READING_MINUTES },
      NOT: [
        { slug: { startsWith: "discover-" } },
        { slug: { contains: "-daily-" } },
        { metaKeywords: { contains: "ai-daily" } },
      ],
    },
    select: { slug: true },
  });
  const listingSet = new Set(listing.map((b) => b.slug));
  const sitemapSlugs = await sitemapBlogSlugs();
  const sitemapSet = new Set(sitemapSlugs);

  const buckets: Record<Bucket, number> = {
    keep: 0,
    rewrite: 0,
    merge: 0,
    remove: 0,
  };

  const titleGroups = new Map<string, typeof blogs>();
  for (const blog of blogs) {
    const key = normalizeTitleKey(blog.title);
    const list = titleGroups.get(key) ?? [];
    list.push(blog);
    titleGroups.set(key, list);
  }
  const duplicateTitleGroups = [...titleGroups.entries()].filter(([, list]) => list.length > 1);

  console.log("=== ContentVerse AdSense audit (dry-run) ===\n");
  console.log(`Published (non-discover): ${blogs.length}`);
  console.log(`Public listing filter:    ${listing.length}`);
  console.log(`Live sitemap /blog/*:     ${sitemapSlugs.length || "(fetch failed)"}`);
  console.log(`Guide articles (static):  ${GUIDE_ARTICLES.length}`);

  const onlySitemap = sitemapSlugs.filter((s) => !listingSet.has(s));
  const onlyListing = [...listingSet].filter((s) => sitemapSlugs.length && !sitemapSet.has(s));
  if (onlySitemap.length) {
    console.log(`\nIn sitemap, not in listing (${onlySitemap.length}):`);
    for (const s of onlySitemap.slice(0, 20)) console.log(`  - ${s}`);
  }
  if (onlyListing.length) {
    console.log(`\nIn listing, not in sitemap (${onlyListing.length}):`);
    for (const s of onlyListing.slice(0, 20)) console.log(`  - ${s}`);
  }

  console.log("\n=== Classification ===");
  for (const blog of blogs) {
    const result = classify(blog);
    buckets[result.bucket]++;
    if (result.bucket !== "keep") {
      console.log(
        `[${result.bucket.toUpperCase()}] /blog/${blog.slug}` +
          (result.destination ? ` → ${result.destination}` : "") +
          ` — ${result.reason}`
      );
    }
  }

  console.log("\n=== Same-title groups ===");
  for (const [key, list] of duplicateTitleGroups) {
    const sorted = [...list].sort((a, b) => scoreBlogForKeep(b) - scoreBlogForKeep(a));
    const keeper = sorted[0]!;
    console.log(`"${key.slice(0, 72)}" ×${list.length} keep=${keeper.slug}`);
    for (const loser of sorted.slice(1)) {
      const dest = isGenericDailyTitle(keeper.title)
        ? categoryFallbackPath(keeper.category?.slug || "technology")
        : `/blog/${keeper.slug}`;
      console.log(`  archive ${loser.slug} → ${dest}`);
    }
  }

  console.log("\n=== Known merge map slugs missing from DB ===");
  for (const slug of MERGE_BLOG_SLUG_SET) {
    if (!blogs.some((b) => b.slug === slug)) {
      console.log(`  (not published) ${slug} → ${destinationForBlogSlug(slug)}`);
    }
  }

  console.log("\n=== Sample keepers (guides) ===");
  for (const g of GUIDE_ARTICLES.slice(0, 8)) {
    console.log(`  ${guideArticlePath(g)}`);
  }

  console.log("\n=== Totals ===");
  console.log(buckets);
  console.log(`Duplicate title groups: ${duplicateTitleGroups.length}`);
  console.log("\nDry run only. Next: npm run db:adsense-apply");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
