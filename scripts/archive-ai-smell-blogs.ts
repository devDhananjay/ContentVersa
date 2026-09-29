/**
 * Archive AI-smelling / low-value published blogs for AdSense recovery.
 *
 * Uses `.tmp-adsense-blog-priority.json` from the live scan:
 *   - all P1 rewrite candidates
 *   - P2 with words < 1100 OR ai_markers >= 2
 *
 *   npx tsx scripts/archive-ai-smell-blogs.ts
 *   npx tsx scripts/archive-ai-smell-blogs.ts --apply
 */
import fs from "node:fs";
import path from "node:path";
import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { setAiAutoGenEnabled } from "../lib/ai/auto-gen-toggle";
import { categoryFallbackPath, publicCanonicalUrl } from "../lib/seo/content-redirects";
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
  rewrite?: PriorityRow[];
  archive?: PriorityRow[];
};

function shouldArchive(row: PriorityRow): boolean {
  if (row.priority === "P1") return true;
  if (row.priority === "P2") {
    const words = row.words ?? 0;
    const markers = row.ai_markers ?? 0;
    return words < 1100 || markers >= 2;
  }
  return row.action === "ARCHIVE";
}

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL not configured");
  }

  const apply = process.argv.includes("--apply");
  const filePath = path.join(process.cwd(), ".tmp-adsense-blog-priority.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${filePath} — run the live priority scan first`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8")) as PriorityFile;
  const candidates = [...(data.rewrite ?? []), ...(data.archive ?? [])].filter(shouldArchive);
  const slugs = [...new Set(candidates.map((c) => c.slug))];

  console.log(`Candidates to archive: ${slugs.length}`);
  for (const slug of slugs) {
    const row = candidates.find((c) => c.slug === slug)!;
    console.log(
      `  [${row.priority || row.action}] ${slug} — ${row.reason || "ai-smell"} (${row.words ?? "?"}w, m${row.ai_markers ?? "?"})`
    );
  }

  if (!apply) {
    console.log("\nDry run. Pass --apply to archive + pause AI auto-gen.");
    return;
  }

  let archived = 0;
  let missing = 0;
  for (const slug of slugs) {
    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: {
        id: true,
        status: true,
        category: { select: { slug: true } },
      },
    });
    if (!blog) {
      missing++;
      console.log(`  miss ${slug}`);
      continue;
    }
    if (blog.status === BlogStatus.ARCHIVED) continue;

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
  console.log(`\nArchived ${archived} post(s). Missing slugs: ${missing}. AI auto-gen paused.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
