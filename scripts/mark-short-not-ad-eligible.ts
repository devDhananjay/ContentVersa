/**
 * Until Gemini quota resets and expand finishes: keep short posts published
 * but mark adEligible=false so AdSense doesn't monetize thin URLs.
 *
 *   npx tsx scripts/mark-short-not-ad-eligible.ts
 *   npx tsx scripts/mark-short-not-ad-eligible.ts --apply
 */
import { BlogStatus } from "@prisma/client";
import { wordCount } from "../lib/seo/article-quality";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

const MIN_WORDS = 1000;

async function main() {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL not configured");
  const apply = process.argv.includes("--apply");

  const blogs = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      slug: { not: { startsWith: "discover-" } },
    },
    select: {
      id: true,
      slug: true,
      content: true,
      readingTime: true,
      adEligible: true,
    },
  });

  const short = blogs.filter(
    (b) => wordCount(b.content) < MIN_WORDS || b.readingTime < 5
  );
  const strong = blogs.filter((b) => !short.some((s) => s.id === b.id));

  console.log(`Published: ${blogs.length}`);
  console.log(`Short (<${MIN_WORDS}w or <5 min): ${short.length}`);
  console.log(`Strong: ${strong.length}`);

  if (!apply) {
    console.log("\nDry run. Pass --apply to set adEligible=false on short posts.");
    return;
  }

  let updated = 0;
  for (const b of short) {
    if (b.adEligible === false) continue;
    await prisma.blog.update({
      where: { id: b.id },
      data: { adEligible: false },
    });
    updated++;
  }

  let enabled = 0;
  for (const b of strong) {
    if (b.adEligible === true) continue;
    const words = wordCount(b.content);
    if (words < MIN_WORDS) continue;
    await prisma.blog.update({
      where: { id: b.id },
      data: { adEligible: true },
    });
    enabled++;
  }

  console.log(`adEligible=false on ${updated} short post(s)`);
  console.log(`adEligible=true on ${enabled} strong post(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
