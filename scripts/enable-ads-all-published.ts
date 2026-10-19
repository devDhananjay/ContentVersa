/**
 * Turn ads ON for every PUBLISHED blog.
 *
 *   npx tsx scripts/enable-ads-all-published.ts          # dry-run
 *   npx tsx scripts/enable-ads-all-published.ts --apply
 */
import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL not configured");
  }
  const apply = process.argv.includes("--apply");
  const where = { status: BlogStatus.PUBLISHED };

  const total = await prisma.blog.count({ where });
  const on = await prisma.blog.count({ where: { ...where, adEligible: true } });
  console.log(`Published: ${total} | adEligible ON: ${on} | OFF: ${total - on}`);

  if (!apply) {
    console.log("Dry-run. Re-run with --apply to enable ads on all published blogs.");
    return;
  }

  const res = await prisma.blog.updateMany({
    where: { ...where, adEligible: false },
    data: { adEligible: true },
  });
  const after = await prisma.blog.count({ where: { ...where, adEligible: true } });
  console.log(`Updated ${res.count}. Now ON: ${after}/${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
