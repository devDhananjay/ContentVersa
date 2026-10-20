/**
 * Strip TOI footers from published TOI briefings + enable ads.
 *   NODE_PATH=./build/node_modules npx tsx scripts/sanitize-toi-briefings.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

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

function sanitizeContent(content: string): string {
  const parts = content.split(/\n\n+/);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    let trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed === "---" || trimmed === "***" || trimmed === "* * *") continue;
    const key = trimmed.toLowerCase().replace(/\s+/g, " ");
    if (key.startsWith("readers who want depth should cross-check")) continue;
    if (
      key.includes("primary reporting") &&
      (key.includes("times of india") || key.includes("toi"))
    ) {
      continue;
    }
    trimmed = trimmed
      .replace(
        /\n?\*?ContentVerse India original briefing\.\s*Primary reporting:\s*\[[^\]]*\]\([^)]*\)\.?\*?/gi,
        ""
      )
      .replace(
        /\n?\*?ContentVerse India original briefing\.\s*Primary reporting:\s*Times of India\.?\*?/gi,
        ""
      )
      .trim();
    if (!trimmed) continue;
    const key2 = trimmed.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key2)) continue;
    seen.add(key2);
    out.push(trimmed);
  }
  return out.join("\n\n");
}

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

loadEnvFiles();

async function main() {
  const prisma = new PrismaClient();
  const rows = await prisma.blog.findMany({
    where: {
      metaKeywords: { contains: "toi-rewrite" },
      status: "PUBLISHED",
    },
    select: { id: true, slug: true, content: true, adEligible: true },
  });
  let updated = 0;
  for (const row of rows) {
    const next = sanitizeContent(row.content);
    const needContent = next !== row.content;
    const needAds = row.adEligible !== true;
    if (!needContent && !needAds) continue;
    await prisma.blog.update({
      where: { id: row.id },
      data: {
        ...(needContent
          ? { content: next, readingTime: readingTime(next) }
          : {}),
        adEligible: true,
      },
    });
    updated++;
    console.log(
      "[sanitize]",
      row.slug,
      needContent ? "content" : "",
      needAds ? "ads" : ""
    );
  }
  console.log(JSON.stringify({ scanned: rows.length, updated }));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
