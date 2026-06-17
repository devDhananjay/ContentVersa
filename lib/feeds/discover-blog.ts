import { createHash } from "crypto";
import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { PLATFORM_OWNER_EMAIL } from "@/lib/owner";
import { readingTime } from "@/lib/utils";
import type { ResolvedBlogRef } from "@/lib/data/ensure-blog-in-db";
import type { FeedItemDetail } from "./types";

export function isDiscoverSyndicatedSlug(slug: string): boolean {
  return slug.startsWith("discover-");
}

export function getDiscoverSlug(category: string, id: string): string {
  const normalizedId = decodeURIComponent(id);
  const hash = createHash("sha256")
    .update(`${category}\0${normalizedId}`)
    .digest("hex")
    .slice(0, 20);
  return `discover-${category}-${hash}`;
}

export async function ensureDiscoverBlogInDb(
  item: FeedItemDetail
): Promise<ResolvedBlogRef | null> {
  if (!isDatabaseConfigured()) return null;

  const slug = getDiscoverSlug(item.category, item.id);

  const owner = await prisma.user.findFirst({
    where: {
      OR: [
        { email: PLATFORM_OWNER_EMAIL },
        { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!owner) return null;

  let categoryId: string | null = null;
  const cat = await prisma.category.upsert({
    where: { slug: item.category },
    create: {
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      slug: item.category,
    },
    update: {},
    select: { id: true },
  });
  categoryId = cat.id;

  const content = item.description || item.subtitle || item.title;
  const excerpt =
    item.subtitle || item.description?.slice(0, 220) || item.title;

  const row = await prisma.blog.upsert({
    where: { slug },
    create: {
      title: item.title,
      slug,
      excerpt,
      content,
      coverImage: item.image || "",
      readingTime: readingTime(content),
      status: BlogStatus.ARCHIVED,
      publishedAt: new Date(),
      authorId: owner.id,
      categoryId,
    },
    update: {
      title: item.title,
      excerpt,
      content,
      coverImage: item.image || "",
      readingTime: readingTime(content),
      categoryId,
      status: BlogStatus.ARCHIVED,
    },
    select: { id: true, slug: true, status: true },
  });

  return row;
}

export function parseCommentCountFromMeta(meta?: string): number {
  const match = meta?.match(/(\d[\d,]*)\s*comments?\b/i);
  if (!match) return 0;
  return Number(match[1].replace(/,/g, "")) || 0;
}
