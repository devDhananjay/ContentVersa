/**
 * Rewrite published blogs that still smell like AI so they read human.
 *
 *   npx tsx scripts/humanize-published-blogs.ts
 *   npx tsx scripts/humanize-published-blogs.ts --apply
 *   npx tsx scripts/humanize-published-blogs.ts --apply --limit=10
 *   npx tsx scripts/humanize-published-blogs.ts --apply --slug=seo-checklist-new-websites-2026
 *   npx tsx scripts/humanize-published-blogs.ts --apply --min-markers=1
 */
import { BlogStatus } from "@prisma/client";
import { countAiSmellMarkers, listAiSmellHits } from "../lib/seo/ai-smell";
import { humanizeArticle } from "../lib/seo/humanize-article";
import { wordCount } from "../lib/seo/article-quality";
import { readingTime } from "../lib/utils";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  const minArg = process.argv.find((a) => a.startsWith("--min-markers="));
  return {
    apply: process.argv.includes("--apply"),
    limit: limitArg ? Number(limitArg.split("=")[1]) : 200,
    slug: slugArg?.split("=")[1],
    minMarkers: minArg ? Number(minArg.split("=")[1]) : 1,
  };
}

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL not configured");
  }
  if (!process.env.GEMINI_API_KEY?.trim() && !process.env.GEMINI_BLOG_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY / GEMINI_BLOG_API_KEY missing");
  }

  const { apply, limit, slug, minMarkers } = parseArgs();

  const rows = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      ...(slug ? { slug } : {}),
    },
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const scored = rows
    .map((b) => {
      const blob = `${b.title}\n${b.excerpt || ""}\n${b.content}`;
      const markers = countAiSmellMarkers(blob);
      return {
        blog: b,
        markers,
        words: wordCount(b.content),
        hits: listAiSmellHits(blob),
      };
    })
    .filter((r) => r.markers >= minMarkers)
    .sort((a, b) => b.markers - a.markers || a.words - b.words)
    .slice(0, limit);

  console.log(
    `Humanize candidates: ${scored.length} (min-markers=${minMarkers}, published=${rows.length})`
  );
  for (const r of scored) {
    console.log(
      `  m${r.markers} ${r.words}w  ${r.blog.slug}  [${r.hits.slice(0, 3).join(" | ")}]`
    );
  }

  if (!apply) {
    console.log("\nDry run. Pass --apply to rewrite with Gemini + save.");
    return;
  }

  let ok = 0;
  let failed = 0;
  let stillAi = 0;

  for (const r of scored) {
    const b = r.blog;
    console.log(`\n→ ${b.slug} (before m${r.markers}, ${r.words}w)`);

    const result = await humanizeArticle({
      title: b.title,
      category: b.category?.name ?? "General",
      content: b.content,
      excerpt: b.excerpt,
    });

    if (!result.article) {
      console.error(
        `  ✗ failed (${result.reason || "unknown"})${
          result.failure?.message ? `: ${result.failure.message}` : ""
        }`
      );
      failed++;
      if (result.reason === "quota") {
        console.error("  Stopping — Gemini quota exceeded.");
        break;
      }
      await sleep(3000);
      continue;
    }

    const { article, markersAfter, markersBefore } = result;

    await prisma.blog.update({
      where: { id: b.id },
      data: {
        title: article.title || b.title,
        excerpt: article.excerpt,
        content: article.content.trim(),
        readingTime: readingTime(article.content),
        metaDescription: article.metaDescription,
      },
    });

    if (markersAfter >= 2) stillAi++;
    ok++;
    console.log(
      `  ✓ saved — markers ${markersBefore}→${markersAfter}, ${wordCount(article.content)}w, ${readingTime(article.content)} min`
    );
    await sleep(2500);
  }

  console.log(
    `\nDone: ${ok} rewritten, ${failed} failed, ${stillAi} still had ≥2 AI markers after rewrite.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
