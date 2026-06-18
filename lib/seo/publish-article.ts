import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/data/categories";
import type { GeneratedArticle } from "@/lib/seo/article-generator";
import { pickCoverForNewArticle } from "@/lib/seo/pick-cover";
import { readingTime, slugify } from "@/lib/utils";

async function ensureCategory(slug: string) {
  const def = CATEGORIES.find((c) => c.slug === slug);
  return prisma.category.upsert({
    where: { slug },
    create: {
      name: def?.name ?? slug,
      slug,
      description: def?.description,
      banner: def?.banner,
      icon: def?.icon,
      color: def?.color,
    },
    update: {},
    select: { id: true, banner: true },
  });
}

async function upsertTags(names: string[]) {
  const tagIds: string[] = [];
  for (const name of names.slice(0, 8)) {
    const slug = slugify(name);
    if (!slug) continue;
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
      select: { id: true },
    });
    tagIds.push(tag.id);
  }
  return tagIds;
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (await prisma.blog.findUnique({ where: { slug }, select: { id: true } })) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function publishGeneratedArticle(input: {
  authorId: string;
  categorySlug: string;
  article: GeneratedArticle;
  slugHint?: string;
  publish?: boolean;
}) {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  const category = await ensureCategory(input.categorySlug);
  const content = input.article.content.trim();
  const tagIds = await upsertTags(input.article.tags);

  const baseSlug =
    input.slugHint?.trim() ||
    slugify(input.article.title).slice(0, 72) ||
    `article-${Date.now().toString(36)}`;
  const slug = await uniqueSlug(baseSlug);

  const coverImage = await pickCoverForNewArticle({
    categorySlug: input.categorySlug,
    title: input.article.title,
    tags: input.article.tags,
    slug,
  });

  const status = input.publish !== false ? BlogStatus.PUBLISHED : BlogStatus.DRAFT;

  const blog = await prisma.blog.create({
    data: {
      title: input.article.title,
      slug,
      excerpt: input.article.excerpt,
      content,
      coverImage,
      readingTime: readingTime(content),
      status,
      metaTitle: input.article.title,
      metaDescription: input.article.metaDescription,
      metaKeywords: input.article.metaKeywords ?? input.article.tags.join(", "),
      publishedAt: status === BlogStatus.PUBLISHED ? new Date() : null,
      authorId: input.authorId,
      categoryId: category.id,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
    select: { id: true, slug: true, title: true, readingTime: true },
  });

  return blog;
}
