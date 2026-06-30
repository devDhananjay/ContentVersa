/**
 * Regenerate cover images so they match article content (Gemini image + fallback).
 *
 *   npm run db:regen-covers
 *   npm run db:regen-covers -- --limit=20
 *   npm run db:regen-covers -- --slug=my-article
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { BlogStatus, PrismaClient } from "@prisma/client";
import { resolveArticleCoverImage } from "../lib/seo/article-cover";
import { normalizeCoverUrl } from "../lib/seo/cover-image";

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

function parseArgs() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  return {
    limit: limitArg ? Number(limitArg.split("=")[1]) : 40,
    slug: slugArg?.split("=")[1],
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY missing — required for content-matched covers");
  }

  const { limit, slug } = parseArgs();

  const rows = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      slug: slug ? slug : { not: { startsWith: "discover-" } },
    },
    include: {
      category: { select: { slug: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: slug ? 1 : 300,
  });

  const coverCounts = new Map<string, number>();
  for (const row of rows) {
    const norm = normalizeCoverUrl(row.coverImage);
    if (norm) coverCounts.set(norm, (coverCounts.get(norm) ?? 0) + 1);
  }

  const targets = rows.filter((row) => {
    const norm = normalizeCoverUrl(row.coverImage);
    const isDupe = norm ? (coverCounts.get(norm) ?? 0) > 1 : false;
    const isPicsum = row.coverImage?.includes("picsum.photos");
    const isGenericUnsplash = row.coverImage?.includes("images.unsplash.com");
    return isDupe || isPicsum || isGenericUnsplash || slug;
  });

  const batch = targets.slice(0, limit);
  console.log(`Regenerating covers for ${batch.length} article(s)...`);

  let ok = 0;
  let failed = 0;

  for (const blog of batch) {
    const categorySlug = blog.category?.slug ?? "technology";
    const tags = blog.tags.map((t) => t.tag.name);
    console.log(`\n→ ${blog.slug}`);

    try {
      const coverImage = await resolveArticleCoverImage(
        {
          categorySlug,
          title: blog.title,
          excerpt: blog.excerpt ?? undefined,
          tags,
          slug: blog.slug,
          searchIntent: blog.metaKeywords ?? blog.excerpt ?? undefined,
          contentSnippet: blog.content.slice(0, 600),
        },
        { preferAi: true, retries: 2 }
      );

      if (!coverImage || coverImage === blog.coverImage) {
        console.log("  ✗ no better cover");
        failed++;
        continue;
      }

      await prisma.blog.update({
        where: { id: blog.id },
        data: { coverImage },
      });
      console.log(`  ✓ ${coverImage.slice(0, 80)}…`);
      ok++;
    } catch (err) {
      console.error("  ✗", err instanceof Error ? err.message : err);
      failed++;
    }

    await sleep(3500);
  }

  console.log(`\nDone: ${ok} updated, ${failed} skipped/failed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
