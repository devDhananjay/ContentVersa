/**
 * Live scan of published blogs for AdSense weak/thin/AI-smell.
 *
 *   npx tsx scripts/audit-weak-published.ts
 *   npx tsx scripts/audit-weak-published.ts --write
 */
import fs from "node:fs";
import path from "node:path";
import { BlogStatus } from "@prisma/client";
import { countAiSmellMarkers, listAiSmellHits } from "../lib/seo/ai-smell";
import {
  isGenericDailyTitle,
  normalizeTitleKey,
  scoreBlogForKeep,
  wordCount,
} from "../lib/seo/article-quality";
import { isAiVolumeArticle } from "../lib/seo/crawl-policy";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

type Row = {
  priority: "P1" | "P2" | "KEEP";
  action: "STRENGTHEN" | "ARCHIVE" | "KEEP";
  slug: string;
  title: string;
  words: number;
  reading_min: number;
  ai_markers: number;
  reason: string;
  url: string;
};

function classify(input: {
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  readingTime: number;
  metaKeywords: string | null;
  views: number;
}): Row {
  const words = wordCount(input.content);
  const blob = `${input.title}\n${input.excerpt || ""}\n${input.content}`;
  const ai_markers = countAiSmellMarkers(blob);
  const hits = listAiSmellHits(blob).slice(0, 3);
  const base = {
    slug: input.slug,
    title: input.title,
    words,
    reading_min: input.readingTime,
    ai_markers,
    url: `https://contentverse.co.in/blog/${input.slug}`,
  };

  if (
    isAiVolumeArticle(input) ||
    isGenericDailyTitle(input.title) ||
    input.slug.startsWith("discover-")
  ) {
    return {
      ...base,
      priority: "P1",
      action: "ARCHIVE",
      reason: "syndicated / daily-AI / generic title",
    };
  }

  // Random-suffix spam / thin manufacturer doorway / stub city pages
  const junkSlug =
    /-(mu|mr|mp|mt|mq)[a-z0-9]{5,}$/i.test(input.slug) ||
    /peb-manufacture|shed-manufacture|about-jaipur|about-mumbai|indian-ipl-mp/i.test(
      input.slug
    );
  if (junkSlug) {
    return {
      ...base,
      priority: "P1",
      action: "ARCHIVE",
      reason: "junk/spam stub slug — do not expand for AdSense",
    };
  }

  if (words < 700 || input.readingTime < 3) {
    return {
      ...base,
      priority: "P1",
      action: "ARCHIVE",
      reason: `too thin to salvage (${words}w, ${input.readingTime} min)`,
    };
  }

  if (words < 1000 || input.readingTime < 5 || ai_markers >= 2) {
    const reasons: string[] = [];
    if (words < 1000) reasons.push(`short ${words}w`);
    if (input.readingTime < 5) reasons.push(`${input.readingTime} min`);
    if (ai_markers >= 2) reasons.push(`AI markers=${ai_markers}${hits.length ? ` [${hits.join("|")}]` : ""}`);
    return {
      ...base,
      priority: ai_markers >= 2 || words < 850 ? "P1" : "P2",
      action: "STRENGTHEN",
      reason: reasons.join(" + "),
    };
  }

  if (ai_markers === 1) {
    return {
      ...base,
      priority: "P2",
      action: "STRENGTHEN",
      reason: `scrub/humanize (markers=1${hits.length ? ` [${hits.join("|")}]` : ""})`,
    };
  }

  return {
    ...base,
    priority: "KEEP",
    action: "KEEP",
    reason: `ok (${words}w, markers=0)`,
  };
}

async function main() {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL not configured");

  const blogs = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    select: {
      slug: true,
      title: true,
      content: true,
      excerpt: true,
      readingTime: true,
      metaKeywords: true,
      views: true,
      createdAt: true,
      category: { select: { slug: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  const rows = blogs.map(classify);
  const strengthen = rows.filter((r) => r.action === "STRENGTHEN");
  const archive = rows.filter((r) => r.action === "ARCHIVE");
  const keep = rows.filter((r) => r.action === "KEEP");

  // Same-title duplicates → archive losers
  const titleGroups = new Map<string, typeof blogs>();
  for (const blog of blogs) {
    const key = normalizeTitleKey(blog.title);
    const list = titleGroups.get(key) ?? [];
    list.push(blog);
    titleGroups.set(key, list);
  }
  const dupArchive: Row[] = [];
  for (const [, list] of titleGroups) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => scoreBlogForKeep(b) - scoreBlogForKeep(a));
    for (const loser of sorted.slice(1)) {
      if (archive.some((a) => a.slug === loser.slug)) continue;
      dupArchive.push({
        priority: "P1",
        action: "ARCHIVE",
        slug: loser.slug,
        title: loser.title,
        words: wordCount(loser.content),
        reading_min: loser.readingTime,
        ai_markers: countAiSmellMarkers(loser.content),
        reason: `duplicate title — keep ${sorted[0]!.slug}`,
        url: `https://contentverse.co.in/blog/${loser.slug}`,
      });
    }
  }

  const allArchive = [...archive, ...dupArchive];
  const strengthenClean = strengthen.filter(
    (s) => !allArchive.some((a) => a.slug === s.slug)
  );

  console.log("=== Weak published audit ===");
  console.log(`Published: ${blogs.length}`);
  console.log(`KEEP: ${keep.length}`);
  console.log(`STRENGTHEN: ${strengthenClean.length}`);
  console.log(`ARCHIVE: ${allArchive.length}`);
  console.log("\n--- STRENGTHEN ---");
  for (const r of strengthenClean.sort((a, b) => (a.priority === "P1" ? -1 : 1) || a.words - b.words)) {
    console.log(`[${r.priority}] ${r.slug} — ${r.reason}`);
  }
  console.log("\n--- ARCHIVE ---");
  for (const r of allArchive) {
    console.log(`[${r.priority}] ${r.slug} — ${r.reason}`);
  }

  if (process.argv.includes("--write")) {
    const out = {
      note: "Fresh live audit for AdSense strengthen pass",
      scanned: blogs.length,
      counts: {
        KEEP: keep.length,
        STRENGTHEN: strengthenClean.length,
        ARCHIVE: allArchive.length,
        STRENGTHEN_P1: strengthenClean.filter((r) => r.priority === "P1").length,
        STRENGTHEN_P2: strengthenClean.filter((r) => r.priority === "P2").length,
      },
      strengthen: strengthenClean,
      archive: allArchive,
      keep,
    };
    const file = path.join(process.cwd(), ".tmp-adsense-blog-priority.json");
    fs.writeFileSync(file, JSON.stringify(out, null, 2));
    console.log(`\nWrote ${file}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
