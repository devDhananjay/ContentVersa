/**
 * Find and archive duplicate published blogs (same normalized title).
 *
 *   npm run db:audit-duplicates
 *   npm run db:audit-duplicates -- --apply
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { BlogStatus, PrismaClient } from "@prisma/client";
import {
  isGenericDailyTitle,
  normalizeTitleKey,
  scoreBlogForKeep,
} from "../lib/seo/article-quality";

function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
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
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnvFiles();

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

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
  const toArchive: string[] = [];

  for (const [key, list] of duplicateGroups) {
    const sorted = [...list].sort(
      (a, b) =>
        scoreBlogForKeep(b) - scoreBlogForKeep(a)
    );
    const keeper = sorted[0]!;
    const losers = sorted.slice(1);
    console.log(`\n"${key.slice(0, 70)}" (${list.length})`);
    console.log(`  keep: ${keeper.slug} (${keeper.readingTime}m, ${keeper.views} views)`);
    for (const loser of losers) {
      console.log(`  archive: ${loser.slug}`);
      toArchive.push(loser.id);
    }
    if (isGenericDailyTitle(keeper.title)) {
      console.log("  ⚠ generic daily title — consider regenerating with hot topics");
    }
  }

  console.log(`\nPublished: ${blogs.length}`);
  console.log(`Duplicate title groups: ${duplicateGroups.length}`);
  console.log(`To archive: ${toArchive.length}`);

  if (!apply) {
    console.log("\nDry run — pass --apply to archive duplicates.");
    return;
  }

  if (toArchive.length) {
    const result = await prisma.blog.updateMany({
      where: { id: { in: toArchive } },
      data: { status: BlogStatus.ARCHIVED },
    });
    console.log(`\nArchived ${result.count} duplicate blog(s).`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
