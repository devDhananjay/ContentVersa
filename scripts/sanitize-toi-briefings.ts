/**
 * Deduplicate repeated paragraphs in published TOI local briefings.
 *   npx tsx scripts/sanitize-toi-briefings.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { dedupeBriefingParagraphs } from "../lib/seo/toi-news-rewrite";
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

async function main() {
  const prisma = new PrismaClient();
  const rows = await prisma.blog.findMany({
    where: { metaKeywords: { contains: "toi-rewrite" } },
    select: { id: true, slug: true, content: true },
  });
  let updated = 0;
  for (const row of rows) {
    const next = dedupeBriefingParagraphs(row.content);
    if (next === row.content) continue;
    await prisma.blog.update({
      where: { id: row.id },
      data: { content: next, readingTime: readingTime(next) },
    });
    updated++;
    console.log("[sanitize]", row.slug);
  }
  console.log(JSON.stringify({ scanned: rows.length, updated }));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
