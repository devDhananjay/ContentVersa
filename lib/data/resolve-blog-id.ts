import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getBlogBySlugHybrid } from "@/lib/data/blog-db";

/** Resolve Prisma blog id from slug (DB only — required for feedback/history). */
export async function resolveBlogIdFromSlug(slug: string): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;

  const hybrid = await getBlogBySlugHybrid(slug);
  if (!hybrid?.id) return null;

  const byId = await prisma.blog.findUnique({
    where: { id: hybrid.id },
    select: { id: true },
  });
  if (byId) return byId.id;

  return prisma.blog.findUnique({
    where: { slug },
    select: { id: true },
  }).then((b) => b?.id ?? null);
}
