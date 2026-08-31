/**
 * Restore coverImage from /uploads/ URLs found in blog HTML content.
 * Safe: only sets cover when content references an orphan file on disk.
 *
 *   npm run db:restore-from-content -- --upload-index=/tmp/cv-upload-files.txt
 *   npm run db:restore-from-content -- --dry-run
 */
import { readFileSync, existsSync } from "node:fs";
import { BlogStatus, PrismaClient } from "@prisma/client";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

const prisma = new PrismaClient();

function parseArgs() {
  return {
    dryRun: process.argv.includes("--dry-run"),
    uploadIndex:
      process.argv.find((a) => a.startsWith("--upload-index="))?.split("=")[1] ??
      "/tmp/cv-upload-files.txt",
  };
}

function extractUploadFiles(html: string | null): string[] {
  if (!html) return [];
  const matches = html.match(/\/uploads\/([a-zA-Z0-9._-]+)/g) ?? [];
  return [...new Set(matches.map((m) => m.replace("/uploads/", "")))];
}

async function main() {
  const { dryRun, uploadIndex } = parseArgs();
  if (!existsSync(uploadIndex)) throw new Error(`Missing ${uploadIndex}`);

  const diskSet = new Set(
    readFileSync(uploadIndex, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
  );

  const blogs = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    select: { id: true, slug: true, title: true, content: true, coverImage: true },
  });

  const used = new Set(
    blogs
      .map((b) => b.coverImage?.trim())
      .filter((u): u is string => !!u && u.startsWith("/uploads/"))
      .map((u) => u.split("/").pop()!)
  );

  const assignments: { slug: string; file: string; reason: string }[] = [];

  for (const blog of blogs) {
    if (blog.coverImage?.trim().startsWith("/uploads/")) continue;

    const files = extractUploadFiles(blog.content);
    for (const file of files) {
      if (!diskSet.has(file) || used.has(file)) continue;
      assignments.push({ slug: blog.slug, file, reason: "content-ref" });
      used.add(file);
      break;
    }
  }

  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Restoring ${assignments.length} covers from content references…`
  );
  for (const a of assignments.slice(0, 40)) {
    console.log(`  ${a.slug} ← ${a.file}`);
  }
  if (assignments.length > 40) console.log(`  … +${assignments.length - 40} more`);

  if (!dryRun) {
    for (const a of assignments) {
      const blog = blogs.find((b) => b.slug === a.slug)!;
      await prisma.blog.update({
        where: { id: blog.id },
        data: { coverImage: `/uploads/${a.file}` },
      });
    }
  }

  console.log(`Done.${dryRun ? " (dry run)" : ""}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
