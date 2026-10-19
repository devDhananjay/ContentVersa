/**
 * Recalculate readingTime from content word count for all published blogs.
 *
 *   npx tsx scripts/sync-reading-times.ts
 *   npx tsx scripts/sync-reading-times.ts --apply
 */
import { BlogStatus } from "@prisma/client";
import { wordCount } from "../lib/seo/article-quality";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

function readingTimeFromContent(content: string): number {
  return Math.max(1, Math.ceil(wordCount(content) / 220));
}

async function main() {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL not configured");
  const apply = process.argv.includes("--apply");

  const blogs = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    select: { id: true, slug: true, content: true, readingTime: true },
  });

  let changed = 0;
  for (const b of blogs) {
    const next = readingTimeFromContent(b.content);
    if (next === b.readingTime) continue;
    changed++;
    console.log(`  ${b.slug}: ${b.readingTime} → ${next} min (${wordCount(b.content)}w)`);
    if (apply) {
      await prisma.blog.update({
        where: { id: b.id },
        data: { readingTime: next },
      });
    }
  }

  console.log(`\n${changed} readingTime mismatch(es)${apply ? " updated" : " (dry-run)"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
