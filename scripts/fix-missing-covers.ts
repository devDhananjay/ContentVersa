/**
 * Backfill missing blog cover images from category banners.
 *
 *   npm run db:fix-covers
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { CATEGORIES } from "../lib/data/categories";

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

function categoryBanner(slug: string | null | undefined): string {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  return cat?.banner
    ? `${cat.banner}${cat.banner.includes("?") ? "&" : "?"}w=1600&auto=format&fit=crop`
    : "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&auto=format&fit=crop";
}

async function main() {
  const rows = await prisma.blog.findMany({
    where: {
      OR: [{ coverImage: null }, { coverImage: "" }],
      slug: { not: { startsWith: "discover-" } },
    },
    select: { id: true, slug: true, category: { select: { slug: true } } },
  });

  let updated = 0;
  for (const row of rows) {
    const cover = categoryBanner(row.category?.slug);
    await prisma.blog.update({
      where: { id: row.id },
      data: { coverImage: cover },
    });
    updated++;
    console.log(`✓ ${row.slug}`);
  }

  console.log(`\nFixed ${updated} missing cover(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
