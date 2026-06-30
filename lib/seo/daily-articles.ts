import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { PLATFORM_OWNER_EMAIL } from "@/lib/owner";
import { CATEGORIES } from "@/lib/data/categories";
import { resolveArticleCoverImage } from "@/lib/seo/article-cover";
import { istDayKey } from "@/lib/engagement/streak";
import { generateSeoArticle } from "@/lib/seo/article-generator";
import { passesArticleQualityGate } from "@/lib/seo/article-quality";
import { suggestHotTopics, type HotTopic } from "@/lib/seo/hot-topics";
import { readingTime, slugify } from "@/lib/utils";

const PER_CATEGORY_DEFAULT = 1;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function dailySlug(category: string, slot: number, day = istDayKey()) {
  return `${category}-daily-${day}-${slot}`;
}

async function countTodayPosts(categorySlug: string, day = istDayKey()) {
  const prefix = `${categorySlug}-daily-${day}-`;
  return prisma.blog.count({
    where: {
      slug: { startsWith: prefix },
      status: BlogStatus.PUBLISHED,
    },
  });
}

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

async function topicsForCategory(
  categorySlug: string,
  count: number
): Promise<HotTopic[]> {
  const { topics } = await suggestHotTopics(categorySlug, count);
  return topics.slice(0, count);
}

export type DailyArticlesResult = {
  created: number;
  skipped: number;
  failed: number;
  day: string;
};

/** Generate up to `perCategory` fresh AI articles per category for today (IST). */
export async function runDailyArticleGeneration(options?: {
  perCategory?: number;
  maxTotal?: number;
}): Promise<DailyArticlesResult> {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY missing");
  }

  const perCategory = options?.perCategory ?? PER_CATEGORY_DEFAULT;
  const maxTotal =
    options?.maxTotal ??
    Number(process.env.DAILY_AI_MAX_TOTAL || String(CATEGORIES.length * perCategory));

  const owner = await prisma.user.findUnique({
    where: { email: PLATFORM_OWNER_EMAIL },
    select: { id: true },
  });
  if (!owner) {
    throw new Error(`${PLATFORM_OWNER_EMAIL} not found`);
  }

  const day = istDayKey();
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const cat of CATEGORIES) {
    const already = await countTodayPosts(cat.slug, day);
    const need = Math.max(0, perCategory - already);
    if (need === 0) {
      skipped += perCategory;
      continue;
    }

    const hotTopics = await topicsForCategory(cat.slug, perCategory);

    for (let slot = 0; slot < perCategory && created < maxTotal; slot++) {
      const topic = hotTopics[slot];
      if (!topic) {
        failed++;
        continue;
      }

      const slug = dailySlug(cat.slug, slot, day);
      const exists = await prisma.blog.findUnique({
        where: { slug },
        select: { id: true, status: true },
      });
      if (exists?.status === BlogStatus.PUBLISHED) {
        skipped++;
        continue;
      }
      if (created >= maxTotal) break;

      const category = await ensureCategory(cat.slug);
      const { article, reason } = await generateSeoArticle({
        title: topic.title,
        category: cat.name,
        categorySlug: cat.slug,
        searchIntent: topic.searchIntent,
        affiliateNote:
          cat.slug === "finance"
            ? "Include educational disclaimer; no stock tips."
            : `Editorial angle: ${topic.whyTrending}`,
      });

      if (!article?.content || !passesArticleQualityGate(article.content)) {
        failed++;
        console.warn(
          `[daily-articles] ${cat.slug} slot ${slot}: ${reason ?? "quality gate failed"} — "${topic.title}"`
        );
        await sleep(3000);
        continue;
      }

      const tagIds = await upsertTags(article.tags);
      const coverImage = await resolveArticleCoverImage(
        {
          categorySlug: cat.slug,
          title: article.title,
          excerpt: article.excerpt,
          tags: article.tags,
          coverKeywords: article.coverKeywords,
          coverImagePrompt: article.coverImagePrompt,
          searchIntent: topic.searchIntent,
          contentSnippet: article.content.slice(0, 800),
          slug,
        },
        { preferAi: true, retries: 2 }
      );

      if (exists) {
        await prisma.blogTag.deleteMany({ where: { blogId: exists.id } });
        await prisma.blog.update({
          where: { id: exists.id },
          data: {
            title: article.title,
            excerpt: article.excerpt,
            content: article.content.trim(),
            coverImage,
            readingTime: readingTime(article.content),
            status: BlogStatus.PUBLISHED,
            metaTitle: article.title,
            metaDescription: article.metaDescription,
            metaKeywords: article.metaKeywords ?? article.tags.join(", "),
            publishedAt: new Date(),
            authorId: owner.id,
            categoryId: category.id,
            tags: { create: tagIds.map((tagId) => ({ tagId })) },
          },
        });
      } else {
        await prisma.blog.create({
          data: {
            title: article.title,
            slug,
            excerpt: article.excerpt,
            content: article.content.trim(),
            coverImage,
            readingTime: readingTime(article.content),
            status: BlogStatus.PUBLISHED,
            metaTitle: article.title,
            metaDescription: article.metaDescription,
            metaKeywords: article.metaKeywords ?? article.tags.join(", "),
            publishedAt: new Date(),
            authorId: owner.id,
            categoryId: category.id,
            tags: { create: tagIds.map((tagId) => ({ tagId })) },
          },
        });
      }

      created++;
      await sleep(3500);
    }
  }

  return { created, skipped, failed, day };
}
