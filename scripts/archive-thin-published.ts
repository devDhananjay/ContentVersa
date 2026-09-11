/**
 * Archive thin / syndicated / nightly-AI published posts for AdSense recovery.
 *
 *   npx tsx scripts/archive-thin-published.ts          # dry-run
 *   npx tsx scripts/archive-thin-published.ts --apply
 */
import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { thinPublishedWhere } from "../lib/seo/thin-published";
import { setAiAutoGenEnabled } from "../lib/ai/auto-gen-toggle";
import { categoryFallbackPath } from "../lib/seo/content-redirects";
import { SITE } from "../lib/seo";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL not configured");
  }

  const apply = process.argv.includes("--apply");
  const count = await prisma.blog.count({ where: thinPublishedWhere });
  const samples = await prisma.blog.findMany({
    where: thinPublishedWhere,
    select: { slug: true, title: true, readingTime: true, category: { select: { slug: true } } },
    take: 8,
    orderBy: { publishedAt: "desc" },
  });

  console.log(`Thin published matching AdSense cleanup: ${count}`);
  for (const s of samples) {
    console.log(`  - [${s.readingTime} min] ${s.slug} — ${s.title.slice(0, 70)}`);
  }

  const rows = await prisma.blog.findMany({
    where: thinPublishedWhere,
    select: { id: true, slug: true, category: { select: { slug: true } } },
  });

  if (!apply) {
    console.log("Dry run. Pass --apply to archive and pause AI auto-gen.");
    return;
  }

  let archived = 0;
  for (const row of rows) {
    const dest = categoryFallbackPath(row.category?.slug || "technology");
    const result = await prisma.blog.updateMany({
      where: { id: row.id },
      data: {
        status: BlogStatus.ARCHIVED,
        adEligible: false,
        canonicalUrl: `${SITE.url}${dest}`,
      },
    });
    archived += result.count;
  }
  await setAiAutoGenEnabled(false);
  console.log(`Archived ${archived} post(s). AI auto-generation paused.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
