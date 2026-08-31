/**
 * Aggressive orphan upload restore — link disk files to blogs missing /uploads/ covers.
 * Uses global best-match (highest score pairs first). Never overwrites existing /uploads/.
 *
 *   npm run db:restore-uploads -- --upload-index=/tmp/cv-upload-files.txt
 *   npm run db:restore-uploads -- --dry-run
 */
import { readFileSync, existsSync } from "node:fs";
import { BlogStatus, PrismaClient } from "@prisma/client";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

const prisma = new PrismaClient();

const STOP = new Set([
  "about", "after", "before", "being", "between", "could", "every", "first",
  "from", "have", "india", "indian", "into", "more", "most", "other", "should",
  "that", "their", "there", "these", "those", "through", "under", "until",
  "what", "when", "where", "which", "while", "with", "would", "your",
  "guide", "2024", "2025", "2026", "daily", "today", "best", "tips", "how",
]);

function parseArgs() {
  return {
    dryRun: process.argv.includes("--dry-run"),
    minScore: Number(process.argv.find((a) => a.startsWith("--min-score="))?.split("=")[1] ?? 6),
    uploadIndex:
      process.argv.find((a) => a.startsWith("--upload-index="))?.split("=")[1] ??
      process.env.UPLOAD_INDEX ??
      "/tmp/cv-upload-files.txt",
  };
}

function tokensFromBlog(slug: string, title: string, excerpt: string | null): string[] {
  const raw = `${slug} ${title} ${excerpt ?? ""}`
    .toLowerCase()
    .replace(/daily-\d{4}-\d{2}-\d{2}-\d+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w));
  return [...new Set(raw)].slice(0, 20);
}

function tokensFromFilename(filename: string): string[] {
  return filename
    .toLowerCase()
    .replace(/\.(jpg|jpeg|png|webp|gif|avif)$/i, "")
    .replace(/[-_cropped]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP.has(w) && !/^[a-z0-9]{6,8}$/.test(w));
}

function scoreMatch(blogTokens: string[], fileTokens: string[], filename: string): number {
  const fn = filename.toLowerCase();
  let score = 0;
  for (const t of blogTokens) {
    if (fn.includes(t)) score += Math.min(t.length, 10);
  }
  for (const ft of fileTokens) {
    if (blogTokens.some((bt) => bt.includes(ft) || ft.includes(bt))) {
      score += Math.min(ft.length, 8);
    }
  }
  return score;
}

async function main() {
  const { dryRun, minScore, uploadIndex } = parseArgs();

  if (!existsSync(uploadIndex)) {
    throw new Error(`Upload index missing: ${uploadIndex}`);
  }

  const diskFiles = readFileSync(uploadIndex, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const rows = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
    },
  });

  const usedFiles = new Set(
    rows
      .map((r) => r.coverImage?.trim())
      .filter((u): u is string => !!u && u.startsWith("/uploads/"))
      .map((u) => u.split("/").pop()!)
  );

  const orphanFiles = diskFiles.filter((f) => !usedFiles.has(f));
  const needsUpload = rows.filter((r) => !r.coverImage?.trim().startsWith("/uploads/"));

  console.log(
    `Disk: ${diskFiles.length} | linked: ${usedFiles.size} | orphans: ${orphanFiles.length} | blogs needing upload: ${needsUpload.length}`
  );

  type Pair = { blogId: string; slug: string; file: string; score: number };
  const pairs: Pair[] = [];

  for (const blog of needsUpload) {
    const blogTokens = tokensFromBlog(blog.slug, blog.title, blog.excerpt);
    if (!blogTokens.length) continue;
    for (const file of orphanFiles) {
      const fileTokens = tokensFromFilename(file);
      const score = scoreMatch(blogTokens, fileTokens, file);
      if (score >= minScore) {
        pairs.push({ blogId: blog.id, slug: blog.slug, file, score });
      }
    }
  }

  pairs.sort((a, b) => b.score - a.score);

  const assignedBlogs = new Set<string>();
  const assignedFiles = new Set<string>();
  const assignments: Pair[] = [];

  for (const p of pairs) {
    if (assignedBlogs.has(p.blogId) || assignedFiles.has(p.file)) continue;
    assignedBlogs.add(p.blogId);
    assignedFiles.add(p.file);
    assignments.push(p);
  }

  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Assigning ${assignments.length} orphan uploads (min score ${minScore})…`
  );

  for (const a of assignments.slice(0, 30)) {
    console.log(`  ${a.score} | ${a.slug} ← ${a.file}`);
  }
  if (assignments.length > 30) console.log(`  … +${assignments.length - 30} more`);

  if (!dryRun) {
    for (const a of assignments) {
      await prisma.blog.update({
        where: { id: a.blogId },
        data: { coverImage: `/uploads/${a.file}` },
      });
    }
  }

  console.log(
    `\nDone: ${assignments.length} blogs restored to disk uploads.${dryRun ? " (dry run)" : ""}`
  );
  console.log(`Remaining without upload cover: ${needsUpload.length - assignments.length}`);
  console.log(`Orphans still unlinked: ${orphanFiles.length - assignments.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
