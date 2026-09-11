/**
 * Archive overlapping / thin / generic-title blogs AFTER 301s exist.
 *
 *   npm run db:adsense-apply            # dry-run
 *   npm run db:adsense-apply -- --apply
 *
 * Sets canonicalUrl to the keeper, status ARCHIVED, adEligible false.
 * Pauses nightly AI auto-gen.
 */
import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { thinPublishedWhere } from "../lib/seo/thin-published";
import { setAiAutoGenEnabled } from "../lib/ai/auto-gen-toggle";
import {
  isGenericDailyTitle,
  normalizeTitleKey,
  scoreBlogForKeep,
} from "../lib/seo/article-quality";
import {
  MERGE_BLOG_SLUGS,
  destinationForBlogSlug,
  categoryFallbackPath,
} from "../lib/seo/content-redirects";
import { SITE } from "../lib/seo";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

function absCanonical(dest: string): string {
  if (dest.startsWith("http")) return dest;
  return `${SITE.url}${dest.startsWith("/") ? dest : `/${dest}`}`;
}

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL not configured");
  }

  const apply = process.argv.includes("--apply");
  const planned: { slug: string; dest: string; reason: string }[] = [];

  for (const slug of MERGE_BLOG_SLUGS) {
    const dest = destinationForBlogSlug(slug);
    if (!dest) continue;
    const row = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true, status: true, slug: true },
    });
    if (!row || row.status === BlogStatus.ARCHIVED) continue;
    planned.push({ slug, dest, reason: "overlap-map" });
  }

  const thin = await prisma.blog.findMany({
    where: thinPublishedWhere,
    select: { slug: true, title: true, category: { select: { slug: true } } },
  });
  for (const row of thin) {
    if (planned.some((p) => p.slug === row.slug)) continue;
    planned.push({
      slug: row.slug,
      dest: categoryFallbackPath(row.category?.slug || "technology"),
      reason: "thin/ai-daily",
    });
  }

  const published = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      slug: { not: { startsWith: "discover-" } },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      views: true,
      readingTime: true,
      content: true,
      createdAt: true,
      category: { select: { slug: true } },
    },
  });

  const groups = new Map<string, typeof published>();
  for (const blog of published) {
    const key = normalizeTitleKey(blog.title);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(blog);
    groups.set(key, list);
  }

  for (const [, list] of groups) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => scoreBlogForKeep(b) - scoreBlogForKeep(a));
    const keeper = sorted[0]!;
    const generic = isGenericDailyTitle(keeper.title);
    const dest = generic
      ? categoryFallbackPath(keeper.category?.slug || "technology")
      : `/blog/${keeper.slug}`;
    const losers = generic ? sorted : sorted.slice(1);
    for (const loser of losers) {
      if (planned.some((p) => p.slug === loser.slug)) continue;
      if (!generic && loser.slug === keeper.slug) continue;
      planned.push({
        slug: loser.slug,
        dest,
        reason: generic ? "generic-daily-title" : "duplicate-title",
      });
    }
  }

  for (const blog of published) {
    if (!isGenericDailyTitle(blog.title)) continue;
    if (planned.some((p) => p.slug === blog.slug)) continue;
    planned.push({
      slug: blog.slug,
      dest: categoryFallbackPath(blog.category?.slug || "technology"),
      reason: "generic-daily-title",
    });
  }

  console.log(`Planned archives: ${planned.length}`);
  for (const row of planned) {
    console.log(`  [${row.reason}] /blog/${row.slug} → ${row.dest}`);
  }

  if (!apply) {
    console.log("\nDry run. Pass --apply to archive, set canonicals, pause AI.");
    return;
  }

  let archived = 0;
  for (const row of planned) {
    const result = await prisma.blog.updateMany({
      where: { slug: row.slug, status: { not: BlogStatus.ARCHIVED } },
      data: {
        status: BlogStatus.ARCHIVED,
        adEligible: false,
        canonicalUrl: absCanonical(row.dest),
      },
    });
    archived += result.count;
  }

  await setAiAutoGenEnabled(false);
  console.log(`\nArchived ${archived} post(s). AI auto-generation paused.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
