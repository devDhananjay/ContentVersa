/**
 * Deterministic AI-phrase scrub for published blogs (no LLM quota needed).
 *
 *   npx tsx scripts/scrub-ai-phrases.ts
 *   npx tsx scripts/scrub-ai-phrases.ts --apply
 *   npx tsx scripts/scrub-ai-phrases.ts --apply --slug=seo-checklist-new-websites-2026
 */
import { BlogStatus } from "@prisma/client";
import { countAiSmellMarkers, listAiSmellHits } from "../lib/seo/ai-smell";
import { scrubAiFreeText } from "../lib/seo/ai-free-content";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

function parseArgs() {
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  return {
    apply: process.argv.includes("--apply"),
    slug: slugArg?.split("=")[1],
  };
}

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL not configured");
  }

  const { apply, slug } = parseArgs();
  const rows = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      ...(slug ? { slug } : {}),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      metaDescription: true,
    },
  });

  const targets = rows
    .map((b) => {
      const before = countAiSmellMarkers(
        `${b.title}\n${b.excerpt || ""}\n${b.content}`
      );
      const content = scrubAiFreeText(b.content);
      const excerpt = b.excerpt ? scrubAiFreeText(b.excerpt) : b.excerpt;
      const metaDescription = b.metaDescription
        ? scrubAiFreeText(b.metaDescription)
        : b.metaDescription;
      const title = scrubAiFreeText(b.title);
      const after = countAiSmellMarkers(
        `${title}\n${excerpt || ""}\n${content}`
      );
      return { b, before, after, title, excerpt, content, metaDescription };
    })
    .filter(
      (t) =>
        t.content !== t.b.content ||
        t.title !== t.b.title ||
        (t.excerpt || "") !== (t.b.excerpt || "") ||
        (t.metaDescription || "") !== (t.b.metaDescription || "")
    );

  console.log(`Scrub candidates: ${targets.length}`);
  for (const t of targets.slice(0, 40)) {
    console.log(
      `  m${t.before}→${t.after}  ${t.b.slug}  [${listAiSmellHits(`${t.b.title}\n${t.b.content}`).slice(0, 3).join(" | ")}]`
    );
  }
  if (targets.length > 40) console.log(`  … +${targets.length - 40} more`);

  if (!apply) {
    console.log("\nDry run. Pass --apply to save scrubbed copy.");
    return;
  }

  let updated = 0;
  for (const t of targets) {
    await prisma.blog.update({
      where: { id: t.b.id },
      data: {
        title: t.title,
        excerpt: t.excerpt,
        content: t.content,
        metaDescription: t.metaDescription,
      },
    });
    updated++;
  }
  console.log(`\nUpdated ${updated} post(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
