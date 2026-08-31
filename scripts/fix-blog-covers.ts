/**
 * Fix broken blog covers: restore orphaned /uploads/ + replace picsum placeholders.
 * NEVER overwrites an existing /uploads/ cover.
 *
 *   npm run db:restore-covers -- --upload-index=/tmp/cv-upload-files.txt
 *   npm run db:restore-covers -- --dry-run
 */
import { readFileSync, existsSync } from "node:fs";
import { BlogStatus, PrismaClient } from "@prisma/client";
import { loadScriptEnv } from "./load-script-env";
import { pickCoverForNewArticle } from "../lib/seo/pick-cover";
import { isUserUpload, normalizeCoverUrl } from "../lib/seo/cover-image";

loadScriptEnv();

const prisma = new PrismaClient();

function parseArgs() {
  const dryRun = process.argv.includes("--dry-run");
  const indexArg = process.argv.find((a) => a.startsWith("--upload-index="));
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  return {
    dryRun,
    uploadIndex: indexArg?.split("=")[1] ?? process.env.UPLOAD_INDEX,
    limit: limitArg ? Number(limitArg.split("=")[1]) : 500,
  };
}

function slugTokens(slug: string, title: string): string[] {
  const fromSlug = slug.split("-").filter((w) => w.length >= 4 && !/^\d+$/.test(w));
  const fromTitle = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4);
  return [...new Set([...fromSlug, ...fromTitle])].slice(0, 12);
}

function scoreFilename(filename: string, tokens: string[]): number {
  const fn = filename.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (fn.includes(t.toLowerCase())) score += Math.min(t.length, 12);
  }
  return score;
}

function isBrokenCover(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  if (isUserUpload(url)) return false;
  if (url.includes("picsum.photos")) return true;
  return false;
}

const EXPANSION_OVERWRITE_SINCE = new Date("2026-08-29T00:00:00+05:30");

function needsCoverFix(
  coverImage: string | null | undefined,
  updatedAt: Date
): boolean {
  if (isUserUpload(coverImage)) return false;
  if (isBrokenCover(coverImage)) return true;
  // Article expansion replaced manual uploads with generic Unsplash fallbacks.
  if (
    coverImage?.includes("images.unsplash.com") &&
    updatedAt >= EXPANSION_OVERWRITE_SINCE
  ) {
    return true;
  }
  return false;
}

async function main() {
  const { dryRun, uploadIndex, limit } = parseArgs();

  let diskFiles: string[] = [];
  if (uploadIndex && existsSync(uploadIndex)) {
    diskFiles = readFileSync(uploadIndex, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }

  const rows = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    include: {
      category: { select: { slug: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const usedFiles = new Set(
    rows
      .map((r) => r.coverImage?.trim())
      .filter((u): u is string => isUserUpload(u))
      .map((u) => u.split("/").pop()!)
  );

  const orphanFiles = diskFiles.filter((f) => !usedFiles.has(f));
  console.log(
    `Disk files: ${diskFiles.length}, linked: ${usedFiles.size}, orphans: ${orphanFiles.length}`
  );

  const targets = rows
    .filter((r) => needsCoverFix(r.coverImage, r.updatedAt))
    .slice(0, limit);

  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Fixing ${targets.length} covers (${rows.filter((r) => needsCoverFix(r.coverImage, r.updatedAt)).length} total)…`
  );

  const assigned = new Set<string>();
  let restored = 0;
  let themed = 0;
  let skipped = 0;

  for (const blog of targets) {
    const tokens = slugTokens(blog.slug, blog.title);
    let nextCover: string | null = null;

    if (orphanFiles.length && tokens.length) {
      let best: { file: string; score: number } | null = null;
      for (const file of orphanFiles) {
        if (assigned.has(file)) continue;
        const score = scoreFilename(file, tokens);
        if (score >= 8 && (!best || score > best.score)) {
          best = { file, score };
        }
      }
      if (best) {
        nextCover = `/uploads/${best.file}`;
        assigned.add(best.file);
        restored++;
      }
    }

    if (!nextCover) {
      nextCover = await pickCoverForNewArticle({
        categorySlug: blog.category?.slug ?? "technology",
        title: blog.title,
        excerpt: blog.excerpt ?? undefined,
        tags: blog.tags.map((t) => t.tag.name),
        slug: blog.slug,
      });
      themed++;
    }

    if (normalizeCoverUrl(nextCover) === normalizeCoverUrl(blog.coverImage)) {
      skipped++;
      continue;
    }

    console.log(`→ ${blog.slug}\n  ${(blog.coverImage ?? "null").slice(0, 70)} → ${nextCover}`);

    if (!dryRun) {
      await prisma.blog.update({
        where: { id: blog.id },
        data: { coverImage: nextCover },
      });
    }
  }

  console.log(
    `\nDone: ${restored} restored from disk uploads, ${themed} themed fallback, ${skipped} skipped.${dryRun ? " (dry run)" : ""}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
