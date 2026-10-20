/**
 * TOI RSS → original rewrite (Gemini / OpenAI / Groq / local) → Blog.
 * Dedupes by TOI source link in metaKeywords. Does not scrape TOI HTML.
 */

import { BlogStatus } from "@prisma/client";
import { CATEGORIES } from "@/lib/data/categories";
import { PLATFORM_OWNER_EMAIL } from "@/lib/owner";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { passesDraftQualityGate, wordCount } from "@/lib/seo/article-quality";
import {
  resetToiRewriteProviderState,
  rewriteToiHeadline,
} from "@/lib/seo/toi-news-rewrite";
import {
  categoryHintForToiItem,
  fetchToiRssHeadlines,
  toiSourceKey,
} from "@/lib/seo/toi-rss";
import { readingTime, slugify } from "@/lib/utils";

export { toiSourceKey } from "@/lib/seo/toi-rss";

const DEFAULT_MAX_PER_RUN = 2;

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
    maxPerFeed: 6,
    maxTotal: 24,
    feedKeys: options?.feedKeys,
  });

  resetToiRewriteProviderState();

  let created = 0;
  let skipped = 0;
  let failed = 0;
  let published = 0;
  const slugs: string[] = [];

  for (const item of headlines) {
    if (created >= maxPerRun) break;

    const sourceKey = toiSourceKey(item.link);
    if (await alreadyIngested(sourceKey, item.title)) {
      skipped++;
      continue;
    }

    const categorySlug = categoryHintForToiItem(item);
    let rewrite;
    try {
      rewrite = await rewriteToiHeadline(item, categorySlug);
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
    if (!article.content || !passesDraftQualityGate(article.content)) {
      failed++;
      console.warn(
        `[toi-news] quality fail (${wordCount(article.content)} words): "${item.title}"`
      );
      continue;
    }

    const category = await ensureCategory(categorySlug);
    const slug = await uniqueTitleSlug(article.title);
    const tagIds = await upsertTags([...article.tags, "TOI rewrite", "India news"]);
    const status = publish ? BlogStatus.PUBLISHED : BlogStatus.DRAFT;
    const now = new Date();

    await prisma.blog.create({
      data: {
        title: article.title,
        slug,
        excerpt: article.excerpt,
        content: article.content.trim(),
        coverImage: item.imageUrl || null,
        readingTime: readingTime(article.content),
        status,
        publishedAt: publish ? now : null,
        adEligible: false,
        metaTitle: article.title,
        metaDescription: article.metaDescription,
        metaKeywords: [
          sourceKey,
          "toi-rewrite",
          "toi-rss",
          `toi-provider:${article.provider}`,
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
    if (publish) published++;
    slugs.push(slug);
    console.log(
      `[toi-news] ${status} (${article.provider}): ${slug} — "${article.title}" (from ${item.feedKey})`
    );
    await sleep(800);
  }

  return {
    scanned: headlines.length,
    created,
    skipped,
    failed,
    published,
    slugs,
  };
}
