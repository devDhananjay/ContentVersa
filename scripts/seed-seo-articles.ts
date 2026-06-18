/**
 * Generate SEO articles with Gemini and publish under the platform owner.
 *
 *   npm run db:seed-seo
 *   npm run db:seed-seo -- --limit=3
 *   npm run db:seed-seo -- --slug=bareilly-uttar-pradesh-complete-travel-guide-2026
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient, BlogStatus } from "@prisma/client";
import { generateSeoArticle, type GeneratedArticle } from "../lib/seo/article-generator";
import { PLATFORM_OWNER_EMAIL } from "../lib/owner";
import { SEO_ARTICLE_TOPICS, type SeedTopic } from "../lib/seo/seed-topics";
import { CATEGORIES } from "../lib/data/categories";
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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  return {
    limit: limitArg ? Number(limitArg.split("=")[1]) : SEO_ARTICLE_TOPICS.length,
    slug: slugArg?.split("=")[1],
    dryRun: process.argv.includes("--dry-run"),
  };
}

async function ensureCategory(slug: string) {
  const def = CATEGORIES.find((c) => c.slug === slug);
  return prisma.category.upsert({
    where: { slug },
    create: {
      name: def?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1),
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

async function generateArticle(topic: SeedTopic): Promise<GeneratedArticle | null> {
  const { article } = await generateSeoArticle({
    title: topic.title,
    category: topic.category,
    searchIntent: topic.searchIntent,
    affiliateNote: topic.affiliateNote,
  });
  return article;
}

async function publishArticle(
  topic: SeedTopic,
  article: GeneratedArticle,
  authorId: string,
  categoryId: string
) {
  const slug = topic.slug;
  const content = article.content.trim();
  const tagIds = await upsertTags(article.tags);

  const existing = await prisma.blog.findUnique({ where: { slug } });
  if (existing) {
    await prisma.blogTag.deleteMany({ where: { blogId: existing.id } });
    await prisma.blog.update({
      where: { id: existing.id },
      data: {
        title: article.title,
        excerpt: article.excerpt,
        content,
        coverImage: topic.coverImage,
        readingTime: readingTime(content),
        status: BlogStatus.PUBLISHED,
        metaTitle: article.title,
        metaDescription: article.metaDescription,
        metaKeywords: article.metaKeywords ?? article.tags.join(", "),
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
      slug,
      excerpt: article.excerpt,
      content,
      coverImage: topic.coverImage,
      readingTime: readingTime(content),
      status: BlogStatus.PUBLISHED,
      metaTitle: article.title,
      metaDescription: article.metaDescription,
      metaKeywords: article.metaKeywords ?? article.tags.join(", "),
      publishedAt: new Date(),
      authorId,
      categoryId,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });
  return "created";
}

async function main() {
  const { limit, slug, dryRun } = parseArgs();

  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY missing in .env");
  }

  const owner = await prisma.user.findUnique({
    where: { email: PLATFORM_OWNER_EMAIL },
    select: { id: true, name: true, username: true },
  });
  if (!owner) {
    throw new Error(
      `${PLATFORM_OWNER_EMAIL} not found. Sign in with Google on production first, then re-run.`
    );
  }

  let topics = SEO_ARTICLE_TOPICS;
  if (slug) topics = topics.filter((t) => t.slug === slug);
  topics = topics.slice(0, limit);

  console.log(`SEO seed → ${topics.length} articles for ${owner.name} (@${owner.username})`);
  if (dryRun) {
    console.log(topics.map((t) => t.slug).join("\n"));
    return;
  }

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(`\n[${i + 1}/${topics.length}] ${topic.slug}`);

    const category = await ensureCategory(topic.category);
    const article = await generateArticle(topic);
    if (!article?.content || article.content.length < 400) {
      console.error("  ✗ Gemini failed or content too short — skipping");
      failed++;
      await sleep(3000);
      continue;
    }

    const action = await publishArticle(topic, article, owner.id, category.id);
    if (action === "created") created++;
    else updated++;
    console.log(`  ✓ ${action} — "${article.title}" (${readingTime(article.content)} min read)`);

    await sleep(2500);
  }

  console.log(`\nDone: ${created} created, ${updated} updated, ${failed} failed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
