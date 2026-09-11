/**
 * Rewrite leftover localhost canonicals written by local tunnel scripts.
 *
 *   npx tsx scripts/fix-localhost-canonicals.ts
 */
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { publicCanonicalUrl } from "../lib/seo/content-redirects";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL not configured");
  }

  const rows = await prisma.blog.findMany({
    where: {
      OR: [
        { canonicalUrl: { contains: "localhost" } },
        { canonicalUrl: { contains: "127.0.0.1" } },
      ],
    },
    select: { id: true, slug: true, canonicalUrl: true },
  });

  console.log(`Localhost canonicals: ${rows.length}`);
  let updated = 0;
  for (const row of rows) {
    const next = publicCanonicalUrl(row.canonicalUrl || "/");
    if (next === row.canonicalUrl) continue;
    await prisma.blog.update({
      where: { id: row.id },
      data: { canonicalUrl: next },
    });
    updated += 1;
  }
  console.log(`Updated ${updated} canonical(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
