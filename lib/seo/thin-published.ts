import { BlogStatus, Prisma } from "@prisma/client";
import { MIN_INDEXABLE_READING_MINUTES } from "@/lib/seo/crawl-policy";

/** Published posts Google treats as low-value at scale. */
export const thinPublishedWhere: Prisma.BlogWhereInput = {
  status: BlogStatus.PUBLISHED,
  OR: [
    { slug: { startsWith: "discover-" } },
    { slug: { contains: "-daily-" } },
    { metaKeywords: { contains: "ai-daily" } },
    { readingTime: { lt: MIN_INDEXABLE_READING_MINUTES } },
  ],
};
