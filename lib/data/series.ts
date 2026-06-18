import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export async function getSeriesParts(seriesSlug: string) {
  if (!isDatabaseConfigured()) return [];

  const rows = await prisma.blog.findMany({
    where: { seriesSlug, status: "PUBLISHED" },
    select: { slug: true, title: true, seriesPart: true },
    orderBy: { seriesPart: "asc" },
  });

  return rows
    .filter((r) => r.seriesPart != null)
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      part: r.seriesPart!,
    }));
}

export async function getBlogSeriesMeta(blogId: string) {
  if (!isDatabaseConfigured()) return null;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { seriesSlug: true, seriesPart: true },
  });
  if (!blog?.seriesSlug || !blog.seriesPart) return null;

  const parts = await getSeriesParts(blog.seriesSlug);
  return {
    seriesSlug: blog.seriesSlug,
    currentPart: blog.seriesPart,
    parts,
  };
}
