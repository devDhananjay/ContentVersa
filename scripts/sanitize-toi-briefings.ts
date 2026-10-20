/**
 * Deduplicate repeated paragraphs in published TOI briefings (Prisma only).
 *   NODE_PATH=./build/node_modules npx tsx scripts/sanitize-toi-briefings.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
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

function dedupe(content: string): string {
  const parts = content.split(/\n\n+/);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase().replace(/\s+/g, " ");
    if (key.startsWith("readers who want depth should cross-check")) continue;
    if (seen.has(key)) continue;
    seen.add(key);
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
    where: { metaKeywords: { contains: "toi-rewrite" } },
    select: { id: true, slug: true, content: true },
  });
  let updated = 0;
  for (const row of rows) {
    const next = dedupe(row.content);
    if (next === row.content) continue;
    await prisma.blog.update({
      where: { id: row.id },
      data: { content: next, readingTime: readingTime(next) },
    });
    updated++;
    console.log("[sanitize]", row.slug, createHash("sha1").update(next).digest("hex").slice(0, 8));
  }
  console.log(JSON.stringify({ scanned: rows.length, updated }));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
