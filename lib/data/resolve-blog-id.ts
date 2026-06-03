import { resolveBlogByRef } from "@/lib/data/ensure-blog-in-db";

/** Resolve Prisma blog id from slug (syncs mock blogs into DB when needed). */
export async function resolveBlogIdFromSlug(slug: string): Promise<string | null> {
  const blog = await resolveBlogByRef(slug);
  return blog?.id ?? null;
}
