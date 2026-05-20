import { prisma, isDatabaseConfigured } from "@/lib/prisma";

/** Find a blog by Prisma id or URL slug (used for API routes with one dynamic segment). */
export async function resolveBlogByRef(ref: string) {
  if (!isDatabaseConfigured()) return null;

  const byId = await prisma.blog.findUnique({
    where: { id: ref },
    select: { id: true, slug: true, status: true },
  });
  if (byId) return byId;

  return prisma.blog.findUnique({
    where: { slug: ref },
    select: { id: true, slug: true, status: true },
  });
}
