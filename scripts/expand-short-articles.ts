/**
 * Expand short / borderline articles with Gemini so they clear the AdSense
 * index bar (MIN_INDEXABLE_READING_MINUTES = 5 ≈ 1100+ words).
 *
 *   npm run db:expand-articles
 *   npm run db:expand-articles -- --limit=10
 *   npm run db:expand-articles -- --slug=best-budget-laptops-students-india-2026
 *   npm run db:expand-articles -- --slugs=a,b,c --limit=26
 *   npm run db:expand-articles -- --status=DRAFT --limit=11
 *   npm run db:expand-articles -- --status=DRAFT --publish
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

/** Ephemeral / thin news — expand OK, do not auto-publish for AdSense. */
const SKIP_AUTO_PUBLISH =
  /live streaming|this weekend|this week|outbreak|stunned|leaks|admit card out|long weekend|what to know today/i;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  const slugsArg = process.argv.find((a) => a.startsWith("--slugs="));
  const statusArg = process.argv.find((a) => a.startsWith("--status="));
  const publish = process.argv.includes("--publish");
  const slugs = slugsArg
    ? slugsArg
        .slice("--slugs=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const statusRaw = statusArg?.split("=")[1]?.toUpperCase();
  const status =
    statusRaw === "DRAFT" || statusRaw === "PUBLISHED" || statusRaw === "ALL"
      ? statusRaw
      : "PUBLISHED";
  return {
    limit: limitArg ? Number(limitArg.split("=")[1]) : 50,
    slug: slugArg?.split("=")[1],
    slugs,
    status: status as "DRAFT" | "PUBLISHED" | "ALL",
    publish,
  };
}

async function main() {
  if (
    !process.env.GEMINI_API_KEY?.trim() &&
    !process.env.GEMINI_BLOG_API_KEY?.trim()
  ) {
    throw new Error("GEMINI_API_KEY / GEMINI_BLOG_API_KEY missing in .env");
  }

  const { limit, slug, slugs, status, publish } = parseArgs();
  const slugFilter = slug ? [slug] : slugs.length ? slugs : null;

  const statusWhere =
    status === "ALL"
      ? { in: [BlogStatus.DRAFT, BlogStatus.PUBLISHED] as BlogStatus[] }
      : status === "DRAFT"
        ? BlogStatus.DRAFT
        : BlogStatus.PUBLISHED;

  const rows = await prisma.blog.findMany({
    where: {
      status: statusWhere,
      ...(slugFilter
        ? { slug: { in: slugFilter } }
        : { slug: { not: { startsWith: "discover-" } } }),
    },
    include: { category: true },
    orderBy: { readingTime: "asc" },
    take: slugFilter ? slugFilter.length : 200,
  });

  const bySlug = new Map(rows.map((b) => [b.slug, b]));
  // Keep --slugs order (top priority first). Otherwise shortest first.
  const ordered = slugFilter
    ? slugFilter.map((s) => bySlug.get(s)).filter(Boolean)
    : rows;

  const short = ordered.filter((b) => {
    if (!b) return false;
    const words = b.content.trim().split(/\s+/).filter(Boolean).length;
    // Drafts: push to full AdSense depth. Published: only if still under index bar.
    if (b.status === BlogStatus.DRAFT) {
      return words < TARGET_MIN_WORDS || b.readingTime < 6;
    }
    return (
      b.readingTime < MIN_INDEXABLE_READING_MINUTES ||
      words < MIN_WORDS_TO_EXPAND
    );
  }) as typeof rows;

  const targets = short.slice(0, limit);
  console.log(
    `Expanding ${targets.length} ${status} article(s) to ≥${MIN_INDEXABLE_READING_MINUTES} min / ${TARGET_MIN_WORDS}+ words...`
  );

  let ok = 0;
  let failed = 0;
  let published = 0;
  let skippedPublish = 0;

  for (const blog of targets) {
    const beforeWords = wordCount(blog.content);
    console.log(
      `\n→ ${blog.slug} (${blog.status}, ${blog.readingTime} min, ${beforeWords}w)`
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
      console.error("  ✗ Gemini failed or below quality bar — keeping original");
      failed++;
      await sleep(12000);
      continue;
    }

    const nextRead = readingTime(article.content);
    const nextWords = wordCount(article.content);
    // Reject near-no-op expands (503 partials that barely grow copy).
    if (
      nextWords < TARGET_MIN_WORDS ||
      nextRead < MIN_INDEXABLE_READING_MINUTES ||
      nextWords < beforeWords + 150
    ) {
      console.error(
        `  ✗ too weak after expand (${nextRead} min, ${nextWords}w; was ${beforeWords}w) — keeping original`
      );
      failed++;
      await sleep(12000);
      continue;
    }

    const nextTitle = article.title || blog.title;
    const canPublish =
      publish &&
      blog.status === BlogStatus.DRAFT &&
      nextRead >= MIN_INDEXABLE_READING_MINUTES &&
      nextWords >= TARGET_MIN_WORDS &&
      !SKIP_AUTO_PUBLISH.test(nextTitle);

    const metaKeywords = (
      article.metaKeywords ?? article.tags.join(", ")
    )
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !/ai-daily/i.test(s) && !/^cron$/i.test(s))
      .join(", ");

    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        title: nextTitle,
        excerpt: article.excerpt,
        content: article.content.trim(),
        // Keep existing cover — images are added manually in admin.
        readingTime: nextRead,
        metaDescription: article.metaDescription,
        metaKeywords,
        ...(canPublish
          ? {
              status: BlogStatus.PUBLISHED,
              publishedAt: blog.publishedAt ?? new Date(),
            }
          : {}),
      },
    });

    console.log(`  ✓ expanded — ${nextRead} min / ${nextWords}w`);
    if (canPublish) {
      console.log("  ✓ published");
      published++;
    } else if (publish && blog.status === BlogStatus.DRAFT) {
      console.log("  · left as DRAFT (ephemeral title or quality gate)");
      skippedPublish++;
    }
    ok++;
    await sleep(4000);
  }

  console.log(
    `\nDone: ${ok} expanded, ${failed} failed, ${published} published, ${skippedPublish} draft-kept.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
