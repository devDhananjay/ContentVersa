import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/data/categories";
import type { GeneratedArticle } from "@/lib/seo/article-generator";
import { resolveArticleCoverImage } from "@/lib/seo/article-cover";
import { refineForPublish } from "@/lib/seo/refine-for-publish";
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
  searchIntent?: string;
  /** Skip cover generation when pipeline already produced one. */
  coverImage?: string | null;
}) {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  const category = await ensureCategory(input.categorySlug);
  const wantPublish = input.publish !== false;

  // Live publish must pass AI-free gate. If it fails, force DRAFT instead of going live unclean.
  let title = input.article.title;
  let excerpt = input.article.excerpt;
  let content = input.article.content.trim();
  let metaDescription = input.article.metaDescription;
  let status = wantPublish ? BlogStatus.PUBLISHED : BlogStatus.DRAFT;

  if (wantPublish) {
    try {
      const cleaned = await refineForPublish({
        title,
        excerpt,
        content,
        metaDescription,
        categorySlug: input.categorySlug,
        searchIntent: input.searchIntent,
      });
      title = cleaned.title;
      excerpt = cleaned.excerpt || excerpt;
      content = cleaned.content;
      metaDescription = cleaned.metaDescription || metaDescription;
    } catch {
      status = BlogStatus.DRAFT;
    }
  }

  const tagIds = await upsertTags(input.article.tags);

  const baseSlug =
    input.slugHint?.trim() ||
    slugify(title).slice(0, 72) ||
    `article-${Date.now().toString(36)}`;
  const slug = await uniqueSlug(baseSlug);

  const coverImage =
    input.coverImage?.trim() ||
    (await resolveArticleCoverImage(
      {
        categorySlug: input.categorySlug,
        title,
        excerpt,
        tags: input.article.tags,
        coverKeywords: input.article.coverKeywords,
        coverImagePrompt: input.article.coverImagePrompt,
        searchIntent: input.searchIntent,
        contentSnippet: content.slice(0, 800),
        slug,
      },
      { preferAi: true, retries: 2 }
    ));

  const blog = await prisma.blog.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      readingTime: readingTime(content),
      status,
      metaTitle: title,
      metaDescription,
      metaKeywords: input.article.metaKeywords ?? input.article.tags.join(", "),
      publishedAt: status === BlogStatus.PUBLISHED ? new Date() : null,
      authorId: input.authorId,
      categoryId: category.id,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
    select: { id: true, slug: true, title: true, readingTime: true, status: true, excerpt: true, coverImage: true },
  });

  return blog;
}
