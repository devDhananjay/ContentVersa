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

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL not configured");
  }

  const apply = process.argv.includes("--apply");
  const count = await prisma.blog.count({ where: thinPublishedWhere });
  const samples = await prisma.blog.findMany({
    where: thinPublishedWhere,
    select: { slug: true, title: true, readingTime: true },
    take: 8,
    orderBy: { publishedAt: "desc" },
  });

  console.log(`Thin published matching AdSense cleanup: ${count}`);
  for (const s of samples) {
    console.log(`  - [${s.readingTime} min] ${s.slug} — ${s.title.slice(0, 70)}`);
  }

  if (!apply) {
    console.log("Dry run. Pass --apply to archive and pause AI auto-gen.");
    return;
  }

  const result = await prisma.blog.updateMany({
    where: thinPublishedWhere,
    data: { status: BlogStatus.ARCHIVED, adEligible: false },
  });
  await setAiAutoGenEnabled(false);
  console.log(`Archived ${result.count} post(s). AI auto-generation paused.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
