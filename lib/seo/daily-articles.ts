import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { PLATFORM_OWNER_EMAIL } from "@/lib/owner";
import { CATEGORIES } from "@/lib/data/categories";
import { callGeminiJson } from "@/lib/ai/gemini";
import { istDayKey } from "@/lib/engagement/streak";
import { generateSeoArticle } from "@/lib/seo/article-generator";
import { passesArticleQualityGate } from "@/lib/seo/article-quality";
import { fetchGoogleNewsHeadlines } from "@/lib/seo/google-news-trends";
import { suggestHotTopics, type HotTopic } from "@/lib/seo/hot-topics";
import { readingTime, slugify } from "@/lib/utils";

const PER_CATEGORY_DEFAULT = 1;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function dailySlug(category: string, slot: number, day = istDayKey()) {
  return `${category}-daily-${day}-${slot}`;
}

/** Count today's daily-cron posts (draft or published) so we don't regenerate. */
async function countTodayPosts(categorySlug: string, day = istDayKey()) {
  const prefix = `${categorySlug}-daily-${day}-`;
  return prisma.blog.count({
    where: {
      slug: { startsWith: prefix },
      status: { in: [BlogStatus.DRAFT, BlogStatus.PUBLISHED] },
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
  for (const name of names.slice(0, 5)) {
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

const NEWS_TOPIC_SCHEMA = {
  type: "object",
  properties: {
    topics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          searchIntent: { type: "string" },
          whyTrending: { type: "string" },
        },
        required: ["title", "searchIntent", "whyTrending"],
      },
    },
  },
  required: ["topics"],
};

/**
 * Prefer Google News headlines → Gemini blog angles; fall back to suggestHotTopics.
 */
async function topicsForCategory(
  categorySlug: string,
  count: number
): Promise<HotTopic[]> {
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  const name = cat?.name ?? categorySlug;
  const headlines = await fetchGoogleNewsHeadlines(categorySlug);

  if (headlines.length > 0) {
    const day = istDayKey();
    const headlineLines = headlines
      .map(
        (h, i) =>
          `${i + 1}. ${h.title}${h.source ? ` (${h.source})` : ""}`
      )
      .join("\n");

    const system = `You are an editorial strategist for ContentVerse (contentverse.co.in), an Indian content platform.
Turn real Google News headlines into specific, SEO-friendly blog article ideas.
Do not invent unrelated topics — ground each idea in the provided headlines.
Return JSON only.`;

    const user = `Today (IST): ${day}
Category: ${name} (${categorySlug})

Today's Google News headlines for this category:
${headlineLines}

Suggest exactly ${count} blog article idea(s) for Indian readers, based on the most important / most searchable headline(s) above.
Each title under 90 characters. Make it a blog angle (explainer, listicle, take, guide) — not a news wire rewrite.

Return JSON: { "topics": [{ "title": "...", "searchIntent": "...", "whyTrending": "..." }] }`;

    const jsonResult = await callGeminiJson<{ topics: HotTopic[] }>(
      system,
      user,
      NEWS_TOPIC_SCHEMA,
      2048
    );

    const fromNews = jsonResult?.topics
      ?.filter(
        (t) =>
          t &&
          typeof t.title === "string" &&
          typeof t.searchIntent === "string" &&
          typeof t.whyTrending === "string"
      )
      .map((t) => ({
        title: t.title.trim().slice(0, 90),
        searchIntent: t.searchIntent.trim(),
        whyTrending: t.whyTrending.trim(),
      }));

    if (fromNews?.length) {
      console.log(
        `[daily-articles] ${categorySlug}: topic from Google News (${headlines.length} headlines)`
      );
      return fromNews.slice(0, count);
    }
  }

  console.warn(
    `[daily-articles] ${categorySlug}: Google News empty/failed — falling back to hot-topics`
  );
  const { topics } = await suggestHotTopics(categorySlug, count);
  return topics.slice(0, count);
}

export type DailyArticlesResult = {
  created: number;
  skipped: number;
  failed: number;
  day: string;
  runSlot: "all" | "first" | "second";
  categoriesProcessed: number;
};

/**
 * Generate up to `perCategory` fresh AI draft articles per category for today (IST).
 * Content only — no cover image; status DRAFT for manual cover + publish.
 */
export async function runDailyArticleGeneration(options?: {
  perCategory?: number;
  maxTotal?: number;
  runSlot?: "all" | "first" | "second";
}): Promise<DailyArticlesResult> {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY missing");
  }

  const perCategory = options?.perCategory ?? PER_CATEGORY_DEFAULT;
  const runSlot = options?.runSlot ?? "all";
  const mid = Math.ceil(CATEGORIES.length / 2);
  const categories =
    runSlot === "first"
      ? CATEGORIES.slice(0, mid)
      : runSlot === "second"
        ? CATEGORIES.slice(mid)
        : CATEGORIES;

  const maxTotal =
    options?.maxTotal ??
    Number(
      process.env.DAILY_AI_MAX_TOTAL ||
        String(categories.length * perCategory)
    );

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

  for (const cat of categories) {
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
      if (
        exists &&
        (exists.status === BlogStatus.PUBLISHED ||
          exists.status === BlogStatus.DRAFT)
      ) {
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
      // Content-only: operator adds cover image before publishing.
      const coverImage = null;

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
            status: BlogStatus.DRAFT,
            metaTitle: article.title,
            metaDescription: article.metaDescription,
            metaKeywords: article.metaKeywords ?? article.tags.join(", "),
            publishedAt: null,
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
            status: BlogStatus.DRAFT,
            metaTitle: article.title,
            metaDescription: article.metaDescription,
            metaKeywords: article.metaKeywords ?? article.tags.join(", "),
            authorId: owner.id,
            categoryId: category.id,
            tags: { create: tagIds.map((tagId) => ({ tagId })) },
          },
        });
      }

      created++;
      console.log(
        `[daily-articles] DRAFT created: ${slug} — "${article.title}"`
      );
      await sleep(3500);
    }
  }

  return { created, skipped, failed, day, runSlot, categoriesProcessed: categories.length };
}
