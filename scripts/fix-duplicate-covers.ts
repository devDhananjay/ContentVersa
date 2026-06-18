/**
 * Re-assign unique cover images for every blog (fixes duplicate Unsplash covers).
 *
 *   npm run db:fix-duplicate-covers
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  assignUniqueCovers,
  isUserUpload,
} from "../lib/seo/cover-image";

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

async function main() {
  const rows = await prisma.blog.findMany({
    where: {
      slug: { not: { startsWith: "discover-" } },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      category: { select: { slug: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  const prepared = rows
    .filter((r) => r.category?.slug)
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      coverImage: r.coverImage,
      categorySlug: r.category!.slug!,
      tags: r.tags.map((t) => t.tag.name),
    }));

  const assignments = assignUniqueCovers(prepared);

  let updated = 0;
  let skippedUploads = 0;

  for (const row of prepared) {
    if (isUserUpload(row.coverImage)) {
      skippedUploads++;
      continue;
    }

    const nextCover = assignments.get(row.slug);
    if (!nextCover) continue;

    await prisma.blog.update({
      where: { id: row.id },
      data: { coverImage: nextCover },
    });
    updated++;
  }

  const dupes = await prisma.$queryRaw<{ cover: string; c: bigint }[]>`
    SELECT split_part("coverImage", '?', 1) as cover, COUNT(*)::bigint as c
    FROM "Blog"
    WHERE "coverImage" IS NOT NULL
      AND "coverImage" <> ''
      AND slug NOT LIKE 'discover-%'
    GROUP BY 1
    HAVING COUNT(*) > 1
    ORDER BY c DESC
    LIMIT 5
  `;

  console.log(`\nUpdated ${updated} blog cover(s). Skipped ${skippedUploads} user upload(s).`);
  if (dupes.length) {
    console.log("\nRemaining duplicate cover groups (top 5):");
    for (const d of dupes) console.log(`  ${d.c}x ${d.cover}`);
  } else {
    console.log("\nNo duplicate cover groups remaining.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
