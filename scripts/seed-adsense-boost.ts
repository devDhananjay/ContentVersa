/**
 * Publish AdSense boost long-form articles (finance / career / tech / AI).
 *
 *   npx tsx scripts/seed-adsense-boost.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient, BlogStatus } from "@prisma/client";
import { CATEGORIES } from "../lib/data/categories";
import { PLATFORM_OWNER_EMAIL } from "../lib/owner";
import { ADSENSE_BOOST_ARTICLES } from "../lib/seo/adsense-boost-articles";
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

async function publishOne(
  article: (typeof ADSENSE_BOOST_ARTICLES)[number],
  authorId: string,
  categoryId: string
) {
  const tagIds = await upsertTags(article.tags);
  const existing = await prisma.blog.findUnique({
    where: { slug: article.slug },
  });

  const data = {
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    coverImage: article.coverImage,
    readingTime: readingTime(article.content),
    status: BlogStatus.PUBLISHED,
    metaTitle: article.title.slice(0, 70),
    metaDescription: article.excerpt.slice(0, 160),
    metaKeywords: [...article.tags, "adsense-quality"].join(", "),
    authorId,
    categoryId,
  };

  if (existing) {
    await prisma.blogTag.deleteMany({ where: { blogId: existing.id } });
    await prisma.blog.update({
      where: { id: existing.id },
      data: {
        ...data,
        publishedAt: existing.publishedAt ?? new Date(),
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });
    return "updated";
  }

  await prisma.blog.create({
    data: {
      ...data,
      slug: article.slug,
      publishedAt: new Date(),
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });
  return "created";
}

async function main() {
  const owner = await prisma.user.findUnique({
    where: { email: PLATFORM_OWNER_EMAIL },
    select: { id: true },
  });
  if (!owner) {
    throw new Error(
      `${PLATFORM_OWNER_EMAIL} not found. Sign in on production first.`
    );
  }

  let created = 0;
  let updated = 0;
  for (const article of ADSENSE_BOOST_ARTICLES) {
    const cat = await ensureCategory(article.category);
    const result = await publishOne(article, owner.id, cat.id);
    if (result === "created") created++;
    else updated++;
    console.log(`[adsense-boost] ${result}: ${article.slug}`);
  }

  console.log(
    `\nDone. ${created} created, ${updated} updated (${ADSENSE_BOOST_ARTICLES.length} total).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
