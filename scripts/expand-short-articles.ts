/**
 * Expand short / borderline articles with Gemini so they clear the AdSense
 * index bar (MIN_INDEXABLE_READING_MINUTES = 5 ≈ 1100+ words).
 *
 *   npm run db:expand-articles
 *   npm run db:expand-articles -- --limit=10
 *   npm run db:expand-articles -- --slug=best-budget-laptops-students-india-2026
 *   npm run db:expand-articles -- --slugs=a,b,c --limit=26
 */
import { PrismaClient, BlogStatus } from "@prisma/client";
import { generateSeoArticle } from "../lib/seo/article-generator";
import {
  passesArticleQualityGate,
  wordCount,
} from "../lib/seo/article-quality";
import { MIN_INDEXABLE_READING_MINUTES } from "../lib/seo/crawl-policy";
import { readingTime } from "../lib/utils";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

const prisma = new PrismaClient();

/** Expand until indexable (≥5 min) and solid word depth. */
const TARGET_MIN_WORDS = 1200;
const TARGET_MAX_WORDS = 1650;
const MIN_WORDS_TO_EXPAND = 1100;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  const slugsArg = process.argv.find((a) => a.startsWith("--slugs="));
  const slugs = slugsArg
    ? slugsArg
        .slice("--slugs=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  return {
    limit: limitArg ? Number(limitArg.split("=")[1]) : 50,
    slug: slugArg?.split("=")[1],
    slugs,
  };
}

async function main() {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY missing in .env");
  }

  const { limit, slug, slugs } = parseArgs();
  const slugFilter = slug ? [slug] : slugs.length ? slugs : null;

  const rows = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      ...(slugFilter
        ? { slug: { in: slugFilter } }
        : { slug: { not: { startsWith: "discover-" } } }),
    },
    include: { category: true },
    orderBy: { readingTime: "asc" },
    take: slugFilter ? slugFilter.length : 200,
  });

  const short = rows.filter((b) => {
    const words = b.content.trim().split(/\s+/).filter(Boolean).length;
    return (
      b.readingTime < MIN_INDEXABLE_READING_MINUTES ||
      words < MIN_WORDS_TO_EXPAND
    );
  });

  const targets = short.slice(0, limit);
  console.log(
    `Expanding ${targets.length} article(s) to ≥${MIN_INDEXABLE_READING_MINUTES} min / ${TARGET_MIN_WORDS}+ words...`
  );

  let ok = 0;
  let failed = 0;
  let skipped = 0;

  for (const blog of targets) {
    const beforeWords = wordCount(blog.content);
    console.log(
      `\n→ ${blog.slug} (${blog.readingTime} min, ${beforeWords}w)`
    );

    const { article } = await generateSeoArticle({
      title: blog.title,
      category: blog.category?.name ?? "General",
      categorySlug: blog.category?.slug ?? "technology",
      searchIntent: blog.metaKeywords || blog.excerpt || blog.title,
      expandFrom: blog.content,
      minWords: TARGET_MIN_WORDS,
      maxWords: TARGET_MAX_WORDS,
    });

    if (!article?.content || !passesArticleQualityGate(article.content)) {
      console.error("  ✗ Gemini failed or below quality bar");
      failed++;
      await sleep(3000);
      continue;
    }

    const nextRead = readingTime(article.content);
    const nextWords = wordCount(article.content);
    if (
      nextRead < MIN_INDEXABLE_READING_MINUTES &&
      nextWords <= beforeWords
    ) {
      console.error(
        `  ✗ still thin after expand (${nextRead} min, ${nextWords}w) — keeping original`
      );
      failed++;
      await sleep(3000);
      continue;
    }

    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        title: article.title || blog.title,
        excerpt: article.excerpt,
        content: article.content.trim(),
        // Keep existing cover — images are added manually in admin.
        readingTime: nextRead,
        metaDescription: article.metaDescription,
        metaKeywords: article.metaKeywords ?? article.tags.join(", "),
      },
    });

    console.log(`  ✓ expanded — ${nextRead} min / ${nextWords}w`);
    if (nextRead < MIN_INDEXABLE_READING_MINUTES) skipped++;
    ok++;
    await sleep(2500);
  }

  console.log(
    `\nDone: ${ok} expanded, ${failed} failed, ${skipped} still under ${MIN_INDEXABLE_READING_MINUTES} min (retry later).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
