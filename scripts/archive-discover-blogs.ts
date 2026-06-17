/**
 * Archive syndicated discover-* blogs so they are not indexed or listed as articles.
 * Safe to re-run. Feed pages at /discover/... still work (engagement uses archived rows).
 *
 *   npm run db:archive-discover
 */
import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "../lib/prisma";

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL not configured");
  }

  const result = await prisma.blog.updateMany({
    where: {
      slug: { startsWith: "discover-" },
      status: BlogStatus.PUBLISHED,
    },
    data: { status: BlogStatus.ARCHIVED },
  });

  console.log(`Archived ${result.count} discover syndicated blog(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
