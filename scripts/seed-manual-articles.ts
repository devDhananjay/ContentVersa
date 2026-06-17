/**
 * Remove generic mock blogs and seed hand-written articles (2+ per category).
 *
 *   npm run db:seed-manual
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient, BlogStatus } from "@prisma/client";
import { CATEGORIES } from "../lib/data/categories";
import { PLATFORM_OWNER_EMAIL } from "../lib/owner";
import {
  MANUAL_ARTICLES,
  MOCK_BLOG_SLUGS,
} from "../lib/seo/manual-articles";
import { readingTime, slugify } from "../lib/utils";

function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    const path = join(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnvFiles();

const prisma = new PrismaClient();

const GENERIC_MARKERS = [
  "export async function publishBlog",
  "ContentVerse optimizes for the creator",
  "creator-first ecosystem that's actually addictive",
];

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
    select: { id: true },
  });
}

async function upsertTags(names: string[]) {
  const tagIds: string[] = [];
  for (const name of names) {
    const s = slugify(name);
    if (!s) continue;
    const tag = await prisma.tag.upsert({
      where: { slug: s },
      create: { name, slug: s },
      update: {},
      select: { id: true },
    });
    tagIds.push(tag.id);
  }
  return tagIds;
}

async function archiveGenericBlogs() {
  const orConditions = [
    { slug: { in: MOCK_BLOG_SLUGS } },
    ...GENERIC_MARKERS.map((m) => ({ content: { contains: m } })),
  ];

  const result = await prisma.blog.updateMany({
    where: {
      status: BlogStatus.PUBLISHED,
      slug: { not: { startsWith: "discover-" } },
      OR: orConditions,
    },
    data: { status: BlogStatus.ARCHIVED },
  });

  console.log(`Archived ${result.count} generic/mock blogs`);
  return result.count;
}

async function countCategoryBlogs(categorySlug: string) {
  return prisma.blog.count({
    where: {
      status: BlogStatus.PUBLISHED,
      slug: { not: { startsWith: "discover-" } },
      category: { slug: categorySlug },
    },
  });
}

async function publishManual(
  article: (typeof MANUAL_ARTICLES)[number],
  authorId: string,
  categoryId: string
) {
  const tagIds = await upsertTags(article.tags);
  const existing = await prisma.blog.findUnique({ where: { slug: article.slug } });

  if (existing) {
    await prisma.blogTag.deleteMany({ where: { blogId: existing.id } });
    await prisma.blog.update({
      where: { id: existing.id },
      data: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        readingTime: readingTime(article.content),
        status: BlogStatus.PUBLISHED,
        metaTitle: article.title,
        metaDescription: article.excerpt,
        metaKeywords: article.tags.join(", "),
        publishedAt: existing.publishedAt ?? new Date(),
        authorId,
        categoryId,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });
    return "updated";
  }

  await prisma.blog.create({
    data: {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      coverImage: article.coverImage,
      readingTime: readingTime(article.content),
      status: BlogStatus.PUBLISHED,
      metaTitle: article.title,
      metaDescription: article.excerpt,
      metaKeywords: article.tags.join(", "),
      publishedAt: new Date(),
      authorId,
      categoryId,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });
  return "created";
}

async function main() {
  const owner = await prisma.user.findUnique({
    where: { email: PLATFORM_OWNER_EMAIL },
    select: { id: true, name: true },
  });
  if (!owner) {
    throw new Error(`${PLATFORM_OWNER_EMAIL} not found in database`);
  }

  console.log(`Manual blog refresh for ${owner.name}`);
  await archiveGenericBlogs();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const cat of CATEGORIES) {
    let count = await countCategoryBlogs(cat.slug);
    const pool = MANUAL_ARTICLES.filter((a) => a.category === cat.slug);

    for (const article of pool) {
      if (count >= 2) break;

      const category = await ensureCategory(cat.slug);
      const action = await publishManual(article, owner.id, category.id);
      if (action === "created") created++;
      else updated++;

      count = await countCategoryBlogs(cat.slug);
    }

    const final = await countCategoryBlogs(cat.slug);
    if (final < 2) {
      console.warn(`⚠ ${cat.slug}: only ${final} post(s) — add more manually`);
    } else {
      console.log(`✓ ${cat.slug}: ${final} posts`);
    }
  }

  console.log(`\nDone: ${created} created, ${updated} updated, ${skipped} skipped`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
