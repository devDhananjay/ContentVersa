/**
 * Expand short articles (manual + SEO) with Gemini.
 *
 *   npm run db:expand-articles
 *   npm run db:expand-articles -- --limit=5
 *   npm run db:expand-articles -- --slug=best-budget-laptops-students-india-2026
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient, BlogStatus } from "@prisma/client";
import { generateSeoArticle } from "../lib/seo/article-generator";
import { resolveArticleCoverImage } from "../lib/seo/article-cover";
import { passesArticleQualityGate } from "../lib/seo/article-quality";
import { readingTime } from "../lib/utils";

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

const MIN_WORDS = 800;
const MIN_READING_MIN = 4;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  return {
    limit: limitArg ? Number(limitArg.split("=")[1]) : 50,
    slug: slugArg?.split("=")[1],
  };
}

async function main() {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY missing in .env");
  }

  const { limit, slug } = parseArgs();

  const rows = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      slug: slug
        ? slug
        : { not: { startsWith: "discover-" } },
    },
    include: { category: true },
    orderBy: { readingTime: "asc" },
    take: slug ? 1 : 200,
  });

  const short = rows.filter(
    (b) =>
      b.readingTime < MIN_READING_MIN ||
      b.content.trim().split(/\s+/).length < MIN_WORDS
  );

  const targets = short.slice(0, limit);
  console.log(`Expanding ${targets.length} short article(s)...`);

  let ok = 0;
  let failed = 0;

  for (const blog of targets) {
    console.log(`\n→ ${blog.slug} (${blog.readingTime} min)`);

    const { article } = await generateSeoArticle({
      title: blog.title,
      category: blog.category?.name ?? "General",
      categorySlug: blog.category?.slug ?? "technology",
      searchIntent: blog.metaKeywords || blog.excerpt || blog.title,
      expandFrom: blog.content,
    });

    if (!article?.content || !passesArticleQualityGate(article.content)) {
      console.error("  ✗ Gemini failed or below quality bar (800+ words)");
      failed++;
      await sleep(3000);
      continue;
    }

    const coverImage = await resolveArticleCoverImage(
      {
        categorySlug: blog.category?.slug ?? "technology",
        title: article.title || blog.title,
        excerpt: article.excerpt,
        tags: article.tags,
        coverKeywords: article.coverKeywords,
        coverImagePrompt: article.coverImagePrompt,
        searchIntent: blog.metaKeywords ?? blog.excerpt ?? undefined,
        contentSnippet: article.content.slice(0, 800),
        slug: blog.slug,
      },
      { preferAi: true, retries: 2 }
    );

    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        title: article.title || blog.title,
        excerpt: article.excerpt,
        content: article.content.trim(),
        coverImage,
        readingTime: readingTime(article.content),
        metaDescription: article.metaDescription,
        metaKeywords: article.metaKeywords ?? article.tags.join(", "),
      },
    });

    console.log(`  ✓ expanded — ${readingTime(article.content)} min read`);
    ok++;
    await sleep(2500);
  }

  console.log(`\nDone: ${ok} expanded, ${failed} failed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
