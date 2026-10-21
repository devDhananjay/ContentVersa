/**
 * Replace covers that still point at TOI's default red logo (msid-47529300)
 * with /news-brand-cover.jpg — home Live News + /news + article detail.
 *
 *   npx tsx scripts/replace-toi-default-logo-covers.ts
 */
import { PrismaClient } from "@prisma/client";
import { loadScriptEnv } from "./load-script-env";
import {
  NEWS_BRAND_COVER,
  TOI_DEFAULT_LOGO_MSIDS,
} from "../lib/seo/toi-cover-url";

loadScriptEnv();

const prisma = new PrismaClient();

async function main() {
  const msids = [...TOI_DEFAULT_LOGO_MSIDS];
  let total = 0;
  for (const msid of msids) {
    const res = await prisma.blog.updateMany({
      where: { coverImage: { contains: `msid-${msid}` } },
      data: { coverImage: NEWS_BRAND_COVER },
    });
    total += res.count;
    console.log(`msid-${msid}: ${res.count}`);
  }
  console.log(JSON.stringify({ replaced: total, cover: NEWS_BRAND_COVER }));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
