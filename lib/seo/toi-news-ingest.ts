/**
 * TOI RSS → original rewrite (Gemini / OpenAI / Groq / local) → Blog.
 * Dedupes by TOI source link in metaKeywords. Does not scrape TOI HTML.
 */

import { revalidatePath } from "next/cache";
import { BlogStatus } from "@prisma/client";
import { CATEGORIES } from "@/lib/data/categories";
import { PLATFORM_OWNER_EMAIL } from "@/lib/owner";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { SITE } from "@/lib/seo";
import { passesDraftQualityGate, wordCount } from "@/lib/seo/article-quality";
import { MIN_NEWS_INDEXABLE_READING_MINUTES } from "@/lib/seo/crawl-policy";
import { notifySearchEnginesOfUrls } from "@/lib/seo/ping-index";
import {
  resetToiRewriteProviderState,
  rewriteToiHeadline,
} from "@/lib/seo/toi-news-rewrite";
import { fetchToiArticleText } from "@/lib/seo/toi-article-fetch";
import {
  categoryHintForToiItem,
  fetchToiRssHeadlines,
  toiSourceKey,
  type ToiRssItem,
} from "@/lib/seo/toi-rss";
import { readingTime, slugify } from "@/lib/utils";
import { resolveToiCoverForIngest } from "@/lib/seo/toi-cover";

async function enrichWithArticleBody(item: ToiRssItem): Promise<ToiRssItem> {
  const extracted = await fetchToiArticleText(item.link);
  if (!extracted?.articleBody) {
    console.warn(`[toi-news] no article body for ${item.link}`);
    return item;
  }
  return {
    ...item,
    title: extracted.headline || item.title,
    description: extracted.description || item.description,
    articleBody: extracted.articleBody,
    imageUrl: item.imageUrl || extracted.imageUrl,
    publishedAt: extracted.datePublished || item.publishedAt,
  };
}

export { toiSourceKey } from "@/lib/seo/toi-rss";

/** More slots = more latest/trending coverage (entertainment + top). */
const DEFAULT_MAX_PER_RUN = 5;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function uniqueTitleSlug(title: string): Promise<string> {
  const base =
    slugify(title).slice(0, 72) || `toi-news-${Date.now().toString(36)}`;
  let slug = base;
  let n = 0;
  while (
    await prisma.blog.findUnique({ where: { slug }, select: { id: true } })
  ) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
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
    select: { id: true },
  });
}

async function upsertTags(names: string[]) {
  const tagIds: string[] = [];
  const seen = new Set<string>();
  for (const name of names) {
    const slug = slugify(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
      select: { id: true },
    });
    tagIds.push(tag.id);
    if (tagIds.length >= 6) break;
  }
  return tagIds;
}

async function alreadyIngested(sourceKey: string, title: string): Promise<boolean> {
  const byKey = await prisma.blog.findFirst({
    where: { metaKeywords: { contains: sourceKey } },
    select: { id: true },
  });
  if (byKey) return true;

  const titleStub = title.split(/\s+/).slice(0, 6).join(" ").trim();
  if (titleStub.length < 18) return false;
  const byTitle = await prisma.blog.findFirst({
    where: {
      metaKeywords: { contains: "toi-rewrite" },
      title: { contains: titleStub, mode: "insensitive" },
    },
    select: { id: true },
  });
  return Boolean(byTitle);
}

function autoPublishEnabled(): boolean {
  const v = (process.env.TOI_NEWS_AUTO_PUBLISH ?? "1").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export type ToiNewsIngestResult = {
  scanned: number;
  created: number;
  skipped: number;
  failed: number;
  published: number;
  slugs: string[];
  /** In-app + push fan-out for top/live desk stories */
  notifiedStories?: number;
  notifiedUsers?: number;
};

/**
 * Every ~30 min: pull TOI RSS, rewrite new headlines, save blogs.
 */
export async function runToiNewsIngest(options?: {
  maxPerRun?: number;
  feedKeys?: string[];
  force?: boolean;
  publish?: boolean;
}): Promise<ToiNewsIngestResult> {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }
  // Gemini optional — OpenAI / Groq / local editorial expand still work.

  if (!options?.force) {
    const { isAiAutoGenEnabled } = await import("@/lib/ai/auto-gen-toggle");
    const enabled = await isAiAutoGenEnabled();
    if (!enabled) {
      return { scanned: 0, created: 0, skipped: 0, failed: 0, published: 0, slugs: [] };
    }
  }

  const envMax = Number(process.env.TOI_NEWS_MAX_PER_RUN || DEFAULT_MAX_PER_RUN);
  const maxPerRun =
    options?.maxPerRun ??
    (Number.isFinite(envMax) && envMax > 0 ? envMax : DEFAULT_MAX_PER_RUN);

  const publish = options?.publish ?? autoPublishEnabled();

  const owner = await prisma.user.findUnique({
    where: { email: PLATFORM_OWNER_EMAIL },
    select: { id: true },
  });
  if (!owner) {
    throw new Error(`${PLATFORM_OWNER_EMAIL} not found`);
  }

  const headlines = await fetchToiRssHeadlines({
    maxPerFeed: 10,
    maxTotal: 48,
    feedKeys: options?.feedKeys,
  });

  resetToiRewriteProviderState();

  let created = 0;
  let skipped = 0;
  let failed = 0;
  let published = 0;
  const slugs: string[] = [];
  const notifyQueue: { slug: string; title: string; feedKey: string }[] = [];

  for (const item of headlines) {
    if (created >= maxPerRun) break;

    const sourceKey = toiSourceKey(item.link);
    if (await alreadyIngested(sourceKey, item.title)) {
      skipped++;
      continue;
    }

    const enriched = await enrichWithArticleBody(item);
    if (!enriched.articleBody && !(enriched.description && enriched.description.length > 120)) {
      failed++;
      console.warn(`[toi-news] skip — thin source: "${item.title}"`);
      continue;
    }

    const categorySlug = categoryHintForToiItem(enriched);
    let rewrite;
    try {
      rewrite = await rewriteToiHeadline(enriched, categorySlug);
    } catch (err) {
      console.warn(`[toi-news] rewrite error:`, err);
      failed++;
      continue;
    }

    if (!rewrite.ok) {
      failed++;
      console.warn(`[toi-news] rewrite failed: "${item.title}"`);
      continue;
    }

    const article = rewrite.article;
    const words = wordCount(article.content || "");
    const okQuality =
      article.provider === "local"
        ? words >= 320 && (article.content?.trim().length ?? 0) >= 1200
        : Boolean(article.content && passesDraftQualityGate(article.content));
    if (!okQuality) {
      failed++;
      console.warn(
        `[toi-news] quality fail (${words} words, ${article.provider}): "${item.title}"`
      );
      continue;
    }

    const category = await ensureCategory(categorySlug);
    const slug = await uniqueTitleSlug(article.title);
    const cleanedTags = article.tags
      .map((t) => t.trim())
      .filter(Boolean)
      .filter((t) => !/^toi\s*rewrite$/i.test(t));
    const tagIds = await upsertTags([
      ...cleanedTags,
      "ContentVerse",
      "India news",
      "Live news",
    ]);
    const status = publish ? BlogStatus.PUBLISHED : BlogStatus.DRAFT;
    const now = new Date();
    const rawCover = enriched.imageUrl || item.imageUrl || null;
    const coverImage = rawCover
      ? await resolveToiCoverForIngest(rawCover)
      : null;

    await prisma.blog.create({
      data: {
        title: article.title,
        slug,
        excerpt: article.excerpt,
        content: article.content.trim(),
        coverImage,
        readingTime: Math.max(
          MIN_NEWS_INDEXABLE_READING_MINUTES,
          readingTime(article.content)
        ),
        status,
        publishedAt: publish ? now : null,
        adEligible: publish,
        metaTitle: article.title,
        metaDescription: article.metaDescription,
        metaKeywords: [
          sourceKey,
          "toi-rewrite",
          "toi-rss",
          `toi-feed:${item.feedKey}`,
          enriched.articleBody ? "toi-full-article" : "toi-rss-only",
          `toi-provider:${article.provider}`,
          `toi-src:${item.link}`,
          categorySlug,
          ...article.tags,
        ]
          .filter(Boolean)
          .join(", "),
        canonicalUrl: null,
        authorId: owner.id,
        categoryId: category.id,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });

    created++;
    if (publish) {
      published++;
      notifyQueue.push({
        slug,
        title: article.title,
        feedKey: item.feedKey,
      });
    }
    slugs.push(slug);
    console.log(
      `[toi-news] ${status} (${article.provider}): ${slug} — "${article.title}" (from ${item.feedKey})`
    );
    await sleep(800);
  }

  let notifiedStories = 0;
  let notifiedUsers = 0;

  if (published > 0 && slugs.length) {
    try {
      revalidatePath("/");
      revalidatePath("/news");
      revalidatePath("/sitemap.xml");
      revalidatePath("/news-sitemap.xml");
      for (const slug of slugs) {
        revalidatePath(`/blog/${slug}`);
      }
    } catch (err) {
      console.warn("[toi-news] revalidate:", err);
    }

    const urls = slugs.map((slug) => `${SITE.url}/blog/${slug}`);
    urls.push(`${SITE.url}/news`);
    void notifySearchEnginesOfUrls(urls);

    try {
      const { dispatchLiveNewsNotifications } = await import(
        "@/lib/notifications/live-news"
      );
      const fanout = await dispatchLiveNewsNotifications(notifyQueue);
      notifiedStories = fanout.stories;
      notifiedUsers = fanout.notified;
    } catch (err) {
      console.warn("[toi-news] live-news notify:", err);
    }
  }

  return {
    scanned: headlines.length,
    created,
    skipped,
    failed,
    published,
    slugs,
    notifiedStories,
    notifiedUsers,
  };
}
