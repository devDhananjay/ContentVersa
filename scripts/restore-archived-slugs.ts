/**
 * Restore wrongly archived blogs back to PUBLISHED.
 *
 *   npx tsx scripts/restore-archived-slugs.ts slug1 slug2
 *   npx tsx scripts/restore-archived-slugs.ts --file=/tmp/restore-slugs.txt
 */
import fs from "node:fs";
import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

async function main() {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL not configured");

  const fileArg = process.argv.find((a) => a.startsWith("--file="));
  let slugs = process.argv.filter((a) => !a.startsWith("-") && !a.includes("restore-archived"));
  if (fileArg) {
    slugs = fs
      .readFileSync(fileArg.split("=")[1]!, "utf8")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  // argv[0]=node argv[1]=script path — drop those
  slugs = slugs.filter((s) => !s.includes("node") && !s.endsWith(".ts") && !s.endsWith(".js"));

  if (!slugs.length) throw new Error("No slugs provided");

  let restored = 0;
  for (const slug of slugs) {
    const r = await prisma.blog.updateMany({
      where: { slug, status: BlogStatus.ARCHIVED },
      data: {
        status: BlogStatus.PUBLISHED,
        adEligible: false,
        canonicalUrl: null,
      },
    });
    if (r.count) {
      restored++;
      console.log(`restored ${slug}`);
    } else {
      console.log(`skip ${slug}`);
    }
  }
  console.log(`Restored ${restored} of ${slugs.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
