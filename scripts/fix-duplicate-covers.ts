/**
 * Re-assign cover images for blogs still using the generic category banner.
 *
 *   npm run db:fix-covers
 *   npm run db:fix-duplicate-covers
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  isGenericCategoryCover,
  pickArticleCoverImage,
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
      status: { in: ["PUBLISHED", "DRAFT"] },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      category: { select: { slug: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  let updated = 0;
  for (const row of rows) {
    const categorySlug = row.category?.slug;
    if (!categorySlug) continue;
    if (!isGenericCategoryCover(row.coverImage, categorySlug)) continue;

    const coverImage = pickArticleCoverImage({
      categorySlug,
      title: row.title,
      slug: row.slug,
      tags: row.tags.map((t) => t.tag.name),
    });

    if (coverImage === row.coverImage) continue;

    await prisma.blog.update({
      where: { id: row.id },
      data: { coverImage },
    });
    updated++;
    console.log(`✓ ${row.slug}`);
  }

  console.log(`\nUpdated ${updated} duplicate/generic cover(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
