/**
 * AdSense prep: archive irreparable weak posts, expand short keepers,
 * humanize AI-smelling copy, then deterministic scrub.
 *
 * Requires `.tmp-adsense-blog-priority.json` from:
 *   npx tsx scripts/audit-weak-published.ts --write
 *
 *   npx tsx scripts/strengthen-weak-published.ts
 *   npx tsx scripts/strengthen-weak-published.ts --apply
 *   npx tsx scripts/strengthen-weak-published.ts --apply --limit=20
 *   npx tsx scripts/strengthen-weak-published.ts --apply --skip-archive
 */
import fs from "node:fs";
import path from "node:path";
import { BlogStatus } from "@prisma/client";
import { setAiAutoGenEnabled } from "../lib/ai/auto-gen-toggle";
import { generateSeoArticle } from "../lib/seo/article-generator";
import { countAiSmellMarkers, listAiSmellHits } from "../lib/seo/ai-smell";
import { scrubAiFreeText } from "../lib/seo/ai-free-content";
import { passesArticleQualityGate, wordCount } from "../lib/seo/article-quality";
import { humanizeArticle } from "../lib/seo/humanize-article";
import {
  categoryFallbackPath,
  publicCanonicalUrl,
} from "../lib/seo/content-redirects";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

type PriorityRow = {
  priority?: string;
  action?: string;
  slug: string;
  title?: string;
  words?: number;
  ai_markers?: number;
  reason?: string;
};

type PriorityFile = {
  strengthen?: PriorityRow[];
  rewrite?: PriorityRow[];
  archive?: PriorityRow[];
};

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  return {
    apply: process.argv.includes("--apply"),
    skipArchive: process.argv.includes("--skip-archive"),
    limit: limitArg ? Number(limitArg.split("=")[1]) : 80,
  };
}

async function archiveRows(rows: PriorityRow[], apply: boolean) {
  const slugs = [...new Set(rows.map((r) => r.slug))];
  console.log(`\n=== ARCHIVE (${slugs.length}) ===`);
  for (const slug of slugs) {
    const row = rows.find((r) => r.slug === slug)!;
    console.log(`  ${slug} — ${row.reason || "weak"}`);
  }
  if (!apply) return 0;

  let archived = 0;
  for (const slug of slugs) {
    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: {
        id: true,
        status: true,
        category: { select: { slug: true } },
      },
    });
    if (!blog || blog.status === BlogStatus.ARCHIVED) continue;
    const dest = categoryFallbackPath(blog.category?.slug || "technology");
    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        status: BlogStatus.ARCHIVED,
        adEligible: false,
        canonicalUrl: publicCanonicalUrl(dest),
      },
    });
    archived++;
  }
  await setAiAutoGenEnabled(false);
  console.log(`Archived ${archived}. AI auto-gen paused.`);
  return archived;
}

async function strengthenOne(
  slug: string
): Promise<"ok" | "fail" | "miss" | "skip" | "quota"> {
  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: { category: { select: { name: true, slug: true } } },
  });
  if (!blog) return "miss";
  if (blog.status !== BlogStatus.PUBLISHED) return "skip";

  let title = blog.title;
  let excerpt = blog.excerpt;
  let content = blog.content;
  let metaDescription = blog.metaDescription;
  let hitQuota = false;
  const wordsBefore = wordCount(content);
  const markersBefore = countAiSmellMarkers(
    `${title}\n${excerpt || ""}\n${content}`
  );

  console.log(`\n→ ${slug} (${wordsBefore}w, m${markersBefore})`);

  // 1) Expand if short — target 1100–1400w (AdSense-safe depth)
  if (wordsBefore < 1050 || blog.readingTime < 5) {
    console.log("  expanding…");
    try {
      const { article, failure, reason } = await generateSeoArticle({
        title: blog.title,
        category: blog.category?.name ?? "General",
        categorySlug: blog.category?.slug ?? "technology",
        searchIntent: blog.metaKeywords || blog.excerpt || blog.title,
        expandFrom: blog.content,
        minWords: 1100,
        maxWords: 1400,
      });
      if (failure?.quotaExceeded || reason === "quota") {
        hitQuota = true;
        console.log("  expand hit Gemini quota — leaving post unchanged");
      } else if (article?.content && wordCount(article.content) >= 1000) {
        title = article.title || title;
        excerpt = article.excerpt || excerpt;
        content = article.content.trim();
        metaDescription = article.metaDescription || metaDescription;
        console.log(`  expand ok → ${wordCount(content)}w`);
      } else if (article?.content && passesArticleQualityGate(article.content)) {
        title = article.title || title;
        excerpt = article.excerpt || excerpt;
        content = article.content.trim();
        metaDescription = article.metaDescription || metaDescription;
        console.log(
          `  expand thin (${wordCount(content)}w) — will humanize/retry`
        );
      } else {
        console.log("  expand below bar — continuing with humanize/scrub");
      }
    } catch (err) {
      console.error(
        `  expand error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
    await sleep(8000);
  }

  if (hitQuota) return "quota";

  // 2) Humanize if AI smell remains
  let markersMid = countAiSmellMarkers(`${title}\n${excerpt || ""}\n${content}`);
  if (markersMid >= 1) {
    console.log(`  humanizing (m${markersMid})…`);
    try {
      const result = await humanizeArticle({
        title,
        category: blog.category?.name ?? "General",
        content,
        excerpt,
      });
      if (result.article) {
        title = result.article.title || title;
        excerpt = result.article.excerpt || excerpt;
        content = result.article.content.trim();
        metaDescription = result.article.metaDescription || metaDescription;
        console.log(
          `  humanize ok → m${result.markersBefore}→${result.markersAfter}, ${wordCount(content)}w`
        );
      } else {
        console.log(
          `  humanize skipped (${result.reason || "unknown"}${
            result.failure?.message ? `: ${result.failure.message}` : ""
          })`
        );
        if (result.reason === "quota") {
          console.log(
            "  humanize hit quota — saving expand+scrub (retry humanize later)"
          );
          hitQuota = true;
        }
      }
    } catch (err) {
      console.error(
        `  humanize error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
    await sleep(5000);
  }

  // 3) Deterministic scrub always
  title = scrubAiFreeText(title);
  excerpt = excerpt ? scrubAiFreeText(excerpt) : excerpt;
  content = scrubAiFreeText(content);
  metaDescription = metaDescription
    ? scrubAiFreeText(metaDescription)
    : metaDescription;

  const wordsAfter = wordCount(content);
  const markersAfter = countAiSmellMarkers(
    `${title}\n${excerpt || ""}\n${content}`
  );

  // Only archive if we actually got a rewrite attempt AND it's still junk.
  // Never archive on quota/short-fail — leave for retry.
  const contentChanged = content !== blog.content;
  if (contentChanged && (wordsAfter < 1000 || markersAfter >= 3)) {
    console.log(
      `  ✗ still weak after rewrite (${wordsAfter}w, m${markersAfter}) — archiving`
    );
    const dest = categoryFallbackPath(blog.category?.slug || "technology");
    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        status: BlogStatus.ARCHIVED,
        adEligible: false,
        canonicalUrl: publicCanonicalUrl(dest),
      },
    });
    return "fail";
  }
  if (!contentChanged && (wordsAfter < 1000 || markersAfter >= 2)) {
    console.log(
      `  skip — still short/AI (${wordsAfter}w, m${markersAfter}); retry later`
    );
    return hitQuota ? "quota" : "skip";
  }

  if (contentChanged) {
    const data = {
      title,
      excerpt,
      content,
      metaDescription,
      readingTime: readingTime(content),
      adEligible: wordsAfter >= 1000 && markersAfter === 0,
    };
    // Tunnel blips (P1001) are common on long Gemini runs — retry before giving up.
    let saved = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.blog.update({ where: { id: blog.id }, data });
        saved = true;
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const transient =
          msg.includes("Can't reach database") ||
          msg.includes("P1001") ||
          msg.includes("Server has closed the connection");
        if (!transient || attempt === 3) throw err;
        console.log(`  db retry ${attempt}/3 after: ${msg.slice(0, 80)}`);
        await sleep(2000 * attempt);
      }
    }
    if (!saved) return "fail";

    console.log(
      `  ✓ saved ${wordsBefore}→${wordsAfter}w, m${markersBefore}→${markersAfter}` +
        (markersAfter > 0
          ? ` leftover=[${listAiSmellHits(`${title}\n${content}`).slice(0, 3).join("|")}]`
          : "")
    );
  } else {
    console.log("  unchanged");
  }

  return hitQuota ? "quota" : "ok";
}

async function main() {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL not configured");
  if (
    !process.env.GEMINI_API_KEY?.trim() &&
    !process.env.GEMINI_BLOG_API_KEY?.trim()
  ) {
    throw new Error("GEMINI_API_KEY / GEMINI_BLOG_API_KEY missing");
  }

  // Prefer primary GEMINI_API_KEY — blog key is often free-tier (20 RPM).
  if (process.env.GEMINI_API_KEY?.trim()) {
    process.env.GEMINI_BLOG_API_KEY = process.env.GEMINI_API_KEY.trim();
  }

  const { apply, skipArchive, limit } = parseArgs();
  const filePath = path.join(process.cwd(), ".tmp-adsense-blog-priority.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing ${filePath} — run: npx tsx scripts/audit-weak-published.ts --write`
    );
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8")) as PriorityFile;
  const archiveList = data.archive ?? [];
  const strengthenList = [
    ...(data.strengthen ?? []),
    ...(data.rewrite ?? []).filter((r) => r.action !== "ARCHIVE"),
  ];

  console.log("=== Strengthen weak published (AdSense) ===");
  console.log(`Archive candidates: ${archiveList.length}`);
  console.log(`Strengthen candidates: ${strengthenList.length}`);
  console.log(`Apply: ${apply} · limit: ${limit}`);

  if (!skipArchive) {
    await archiveRows(archiveList, apply);
  }

  const targets = strengthenList
    .filter((r) => !archiveList.some((a) => a.slug === r.slug))
    .slice(0, limit);

  console.log(`\n=== STRENGTHEN (${targets.length}) ===`);
  for (const t of targets) {
    console.log(`  [${t.priority}] ${t.slug} — ${t.reason || ""}`);
  }

  if (!apply) {
    console.log("\nDry run. Pass --apply to archive + expand + humanize + scrub.");
    return;
  }

  let ok = 0;
  let failed = 0;
  let missing = 0;
  let skipped = 0;
  let quotaStops = 0;

  for (const t of targets) {
    const result = await strengthenOne(t.slug);
    if (result === "ok") ok++;
    else if (result === "miss") missing++;
    else if (result === "fail") failed++;
    else if (result === "skip") skipped++;
    else if (result === "quota") {
      quotaStops++;
      console.error("\nStopping early — Gemini quota exceeded. Re-run later.");
      break;
    }
    await sleep(5000);
  }

  await setAiAutoGenEnabled(false);
  console.log(
    `\nDone: ${ok} strengthened, ${failed} archived/failed, ${skipped} deferred, ${quotaStops} quota-stop, ${missing} missing. AI auto-gen paused.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
