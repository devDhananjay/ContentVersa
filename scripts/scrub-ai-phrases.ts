/**
 * Deterministic AI-phrase scrub for published blogs (no LLM quota needed).
 * Replaces common ChatGPT tells with plain human wording.
 *
 *   npx tsx scripts/scrub-ai-phrases.ts
 *   npx tsx scripts/scrub-ai-phrases.ts --apply
 *   npx tsx scripts/scrub-ai-phrases.ts --apply --slug=seo-checklist-new-websites-2026
 */
import { BlogStatus } from "@prisma/client";
import { countAiSmellMarkers, listAiSmellHits } from "../lib/seo/ai-smell";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

/** Order matters — longer / more specific first. */
const REPLACEMENTS: Array<[RegExp, string]> = [
  [/In today's (?:digital|fast-paced|ever-evolving|competitive) (?:world|age|landscape|environment),?\s*/gi, ""],
  [/in today's (?:digital|fast-paced|ever-evolving|competitive) (?:world|age|landscape|environment),?\s*/gi, ""],
  [/In today's competitive\s+/gi, "In a tough "],
  [/in today's competitive\s+/gi, "in a tough "],
  [/not only ([^,.\n]{3,120}) but also/gi, "both $1 and"],
  [/delve into/gi, "look at"],
  [/dive deep into/gi, "look closely at"],
  [/dive deep/gi, "go deeper"],
  [/it's (?:important|crucial|essential) to (?:note|understand|remember) that\s*/gi, ""],
  [/It'?s (?:important|crucial|essential) to (?:note|understand|remember) that\s*/gi, ""],
  [/\bFurthermore,\s*/gi, "Also, "],
  [/\bMoreover,\s*/gi, "Also, "],
  [/In conclusion,\s*/gi, "Bottom line: "],
  [/the landscape of/gi, "the state of"],
  [/landscape of/gi, "state of"],
  [/When it comes to/gi, "For"],
  [/when it comes to/gi, "for"],
  [/in the realm of/gi, "in"],
  [/a comprehensive guide/gi, "a practical guide"],
  [/an ultimate guide/gi, "a practical guide"],
  [/unlock(?:ing)? the (?:power|potential) of/gi, "get more from"],
  [/game-?changer/gi, "big shift"],
  [/cutting-?edge/gi, "modern"],
  [/\bleverage\b/gi, "use"],
  [/\brobust\b/gi, "solid"],
  [/seamless(?:ly)?/gi, "smooth"],
  [/at the end of the day,?\s*/gi, ""],
  [/In this article,?\s*we (?:will|are going to)\s*/gi, "Here I'll "],
  [/in this article,?\s*we (?:will|are going to)\s*/gi, "here I'll "],
  [/Let'?s explore/gi, "Here's"],
  [/let'?s explore/gi, "here's"],
  [/Navigating the/gi, "Working through"],
  [/navigating the/gi, "working through"],
  [/tapestry of/gi, "mix of"],
  [/multifaceted/gi, "layered"],
  [/in the digital age/gi, "online today"],
  [/As we (?:move|navigate) forward,?\s*/gi, ""],
  [/It goes without saying that\s*/gi, ""],
  [/a plethora of/gi, "plenty of"],
  [/shed light on/gi, "explain"],
  [/play(?:s)? a (?:crucial|pivotal|vital) role/gi, "matters a lot"],
  [/## Introduction:[^\n]*/gi, "## Why this matters"],
  [/## Conclusion\b/gi, "## Takeaway"],
];

function scrubText(input: string): string {
  let out = input;
  for (const [re, to] of REPLACEMENTS) {
    out = out.replace(re, to);
  }
  // Clean doubled spaces / empty lines created by removals
  out = out
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^ +/gm, "")
    .trim();
  return out;
}

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
      const content = scrubText(b.content);
      const excerpt = b.excerpt ? scrubText(b.excerpt) : b.excerpt;
      const metaDescription = b.metaDescription
        ? scrubText(b.metaDescription)
        : b.metaDescription;
      const title = scrubText(b.title);
      const after = countAiSmellMarkers(
        `${title}\n${excerpt || ""}\n${content}`
      );
      return { b, before, after, title, excerpt, content, metaDescription };
    })
    .filter((t) => t.before > 0 && (t.after < t.before || t.content !== t.b.content));

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
