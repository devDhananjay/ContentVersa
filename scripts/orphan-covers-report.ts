/**
 * Export orphan upload files with suggested blog matches for manual restore in admin.
 *
 *   npm run db:orphan-covers-report -- --upload-index=/tmp/cv-upload-files.txt
 * Output: scripts/output/orphan-covers-report.html
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BlogStatus, PrismaClient } from "@prisma/client";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

const prisma = new PrismaClient();

function parseArgs() {
  return {
    uploadIndex:
      process.argv.find((a) => a.startsWith("--upload-index="))?.split("=")[1] ??
      "/tmp/cv-upload-files.txt",
  };
}

const STOP = new Set(["india", "indian", "guide", "2024", "2025", "2026", "daily", "the", "and", "for"]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
}

function score(file: string, slug: string, title: string): number {
  const fn = file.toLowerCase();
  let s = 0;
  for (const t of [...tokens(slug), ...tokens(title)]) {
    if (fn.includes(t)) s += t.length;
  }
  return s;
}

async function main() {
  const { uploadIndex } = parseArgs();
  if (!existsSync(uploadIndex)) throw new Error(`Missing ${uploadIndex}`);

  const diskFiles = readFileSync(uploadIndex, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const blogs = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    select: { slug: true, title: true, coverImage: true },
  });

  const used = new Set(
    blogs
      .map((b) => b.coverImage?.trim())
      .filter((u): u is string => !!u && u.startsWith("/uploads/"))
      .map((u) => u.split("/").pop()!)
  );

  const orphans = diskFiles.filter((f) => !used.has(f));

  type Row = { file: string; suggestions: { slug: string; title: string; score: number }[] };
  const rows: Row[] = [];

  for (const file of orphans) {
    const suggestions = blogs
      .map((b) => ({ slug: b.slug, title: b.title, score: score(file, b.slug, b.title) }))
      .filter((s) => s.score >= 5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    rows.push({ file, suggestions });
  }

  rows.sort((a, b) => (b.suggestions[0]?.score ?? 0) - (a.suggestions[0]?.score ?? 0));

  const outDir = join(process.cwd(), "scripts/output");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "orphan-covers-report.html");

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>Orphan covers (${orphans.length})</title>
<style>
body{font-family:system-ui,sans-serif;margin:24px;background:#111;color:#eee}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{border:1px solid #333;padding:8px;text-align:left;vertical-align:top}
img{width:120px;height:68px;object-fit:cover;border-radius:6px;background:#222}
a{color:#8b5cf6}
code{font-size:11px;color:#aaa}
</style></head><body>
<h1>Orphan upload files — ${orphans.length} unlinked</h1>
<p>Preview → pick blog slug → set cover in <a href="https://contentverse.co.in/admin/blogs">Admin Blogs</a>.</p>
<table><tr><th>Preview</th><th>Filename</th><th>Suggested blogs</th></tr>
${rows
  .map(
    (r) => `<tr>
<td><img src="https://contentverse.co.in/uploads/${encodeURIComponent(r.file)}" alt="" loading="lazy"/></td>
<td><code>${r.file}</code></td>
<td>${r.suggestions.length ? r.suggestions.map((s) => `<div><a href="https://contentverse.co.in/admin/blogs?search=${encodeURIComponent(s.slug)}">${s.slug}</a> <small>(${s.score})</small><br/><small>${s.title.slice(0, 80)}</small></div>`).join("") : "<em>no auto match</em>"}</td>
</tr>`
  )
  .join("")}
</table></body></html>`;

  writeFileSync(outPath, html);
  console.log(`Wrote ${outPath} (${orphans.length} orphans)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
