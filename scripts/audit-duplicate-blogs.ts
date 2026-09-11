/**
 * Find and archive duplicate published blogs (same normalized title).
 *
 *   npm run db:audit-duplicates
 *   npm run db:audit-duplicates -- --apply
 *
 * Sets canonicalUrl to the keeper before ARCHIVED so Google hits a 301, not a 404.
 */
import { BlogStatus, PrismaClient } from "@prisma/client";
import {
  isGenericDailyTitle,
  normalizeTitleKey,
  scoreBlogForKeep,
} from "../lib/seo/article-quality";
import { categoryFallbackPath } from "../lib/seo/content-redirects";
import { SITE } from "../lib/seo";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

function absCanonical(dest: string): string {
  if (dest.startsWith("http")) return dest;
  return `${SITE.url}${dest.startsWith("/") ? dest : `/${dest}`}`;
}

async function main() {
  const blogs = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      slug: { not: { startsWith: "discover-" } },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      views: true,
      readingTime: true,
      content: true,
      createdAt: true,
      category: { select: { slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const groups = new Map<string, typeof blogs>();
  for (const blog of blogs) {
    const key = normalizeTitleKey(blog.title);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(blog);
    groups.set(key, list);
  }

  const duplicateGroups = [...groups.entries()].filter(([, list]) => list.length > 1);
  const jobs: { id: string; slug: string; dest: string }[] = [];

  for (const [key, list] of duplicateGroups) {
    const sorted = [...list].sort(
      (a, b) => scoreBlogForKeep(b) - scoreBlogForKeep(a)
    );
    const keeper = sorted[0]!;
    const generic = isGenericDailyTitle(keeper.title);
    const dest = generic
      ? categoryFallbackPath(keeper.category?.slug || "technology")
      : `/blog/${keeper.slug}`;
    console.log(`\n"${key.slice(0, 70)}" (${list.length})`);
    console.log(`  keep: ${keeper.slug} (${keeper.readingTime}m, ${keeper.views} views)`);
    if (generic) {
      console.log("  ⚠ generic daily title — archiving the whole cluster");
    }
    const losers = generic ? sorted : sorted.slice(1);
    for (const loser of losers) {
      if (!generic && loser.id === keeper.id) continue;
      console.log(`  archive: ${loser.slug} → ${dest}`);
      jobs.push({ id: loser.id, slug: loser.slug, dest });
    }
  }

  console.log(`\nPublished: ${blogs.length}`);
  console.log(`Duplicate title groups: ${duplicateGroups.length}`);
  console.log(`To archive: ${jobs.length}`);

  if (!apply) {
    console.log("\nDry run — pass --apply to archive duplicates with 301 canonicals.");
    return;
  }

  let archived = 0;
  for (const job of jobs) {
    const result = await prisma.blog.updateMany({
      where: { id: job.id, status: { not: BlogStatus.ARCHIVED } },
      data: {
        status: BlogStatus.ARCHIVED,
        adEligible: false,
        canonicalUrl: absCanonical(job.dest),
      },
    });
    archived += result.count;
  }
  console.log(`\nArchived ${archived} duplicate blog(s) with canonical 301s.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
