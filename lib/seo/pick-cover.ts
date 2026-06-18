import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  assignUniqueCovers,
  isUserUpload,
  normalizeCoverUrl,
  pickArticleCoverImage,
} from "@/lib/seo/cover-image";

/** Load cover URLs already used in DB so new posts avoid duplicates. */
export async function pickCoverForNewArticle(input: {
  categorySlug: string;
  title: string;
  tags?: string[];
  slug: string;
}): Promise<string> {
  if (!isDatabaseConfigured()) {
    return pickArticleCoverImage(input);
  }

  const existing = await prisma.blog.findMany({
    where: {
      coverImage: { not: null },
      slug: { not: { startsWith: "discover-" } },
    },
    select: { coverImage: true },
    take: 500,
    orderBy: { createdAt: "desc" },
  });

  const taken = new Set(
    existing
      .map((b) => normalizeCoverUrl(b.coverImage))
      .filter(Boolean)
  );

  return pickArticleCoverImage(input, taken);
}
