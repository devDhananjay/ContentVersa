/**
 * TOI RSS → Gemini original rewrite → Blog (DRAFT or PUBLISHED).
 * Dedupes by TOI source link in metaKeywords. Does not scrape TOI HTML.
 */

import { BlogStatus } from "@prisma/client";
import {
  callGeminiJsonWithMeta,
  getGeminiBlogApiKey,
  isGeminiBlogConfigured,
  type GeminiFailure,
} from "@/lib/ai/gemini";
import { CATEGORIES } from "@/lib/data/categories";
import { PLATFORM_OWNER_EMAIL } from "@/lib/owner";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { passesDraftQualityGate, wordCount } from "@/lib/seo/article-quality";
import {
  categoryHintForToiItem,
  fetchToiRssHeadlines,
  toiSourceKey,
  type ToiRssItem,
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

const REWRITE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    content: { type: "string" },
    metaDescription: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
  },
  required: ["title", "excerpt", "content", "metaDescription", "tags"],
};

type RewriteArticle = {
  title: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  tags: string[];
};

type RewriteResult =
  | { ok: true; article: RewriteArticle }
  | { ok: false; failure?: GeminiFailure };

async function rewriteToiItem(
  item: ToiRssItem,
  categorySlug: string
): Promise<RewriteResult> {
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  const system = [
    "You are a senior India news editor for ContentVerse India.",
    "Write an ORIGINAL briefing from the headline and short RSS blurb only.",
    "Do NOT copy sentences from the blurb. Paraphrase and add context for Indian readers.",
    "Use clear Markdown: one H1-style title is separate; body uses ## headings and short paragraphs.",
    "Target 650–900 words. Neutral, factual tone. No invented quotes or fake statistics.",
    "If details are unknown from the blurb, say what is confirmed vs what to watch next.",
    "End with a short 'What to watch next' section — do not invent timelines.",
    "Never claim you are Times of India; this is ContentVerse original analysis.",
  ].join(" ");

  const user = [
    `Category: ${cat?.name ?? categorySlug}`,
    `Headline: ${item.title}`,
    `RSS blurb: ${item.description || "(none — write careful context-only briefing)"}`,
    `Source link (cite only as primary reporting, do not scrape): ${item.link}`,
    `Feed: ${item.feedKey}`,
    item.publishedAt ? `RSS pubDate: ${item.publishedAt}` : "",
    "",
    "Return JSON: title (original, not a TOI clone), excerpt (~160 chars), content (markdown body WITHOUT repeating the title as # heading), metaDescription, tags (3–5 strings).",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await callGeminiJsonWithMeta<RewriteArticle>(
    system,
    user,
    REWRITE_SCHEMA,
    8192,
    { apiKey: getGeminiBlogApiKey() || undefined }
  );
  if (!result.ok) {
    return { ok: false, failure: result.failure };
  }
  const data = result.data;
  if (!data?.title || !data?.content) return { ok: false };

  const attribution = [
    "",
    "---",
    "",
    `*ContentVerse India original briefing. Primary reporting: [Times of India](${item.link}).*`,
  ].join("\n");

  const content = `${data.content.trim()}\n${attribution}`;
  return {
    ok: true,
    article: {
      title: data.title.trim().slice(0, 160),
      excerpt: (data.excerpt || data.metaDescription || "").trim().slice(0, 280),
      content,
      metaDescription: (data.metaDescription || data.excerpt || "")
        .trim()
        .slice(0, 160),
      tags: Array.isArray(data.tags)
        ? data.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 5)
        : ["India news"],
    },
  };
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
  if (!isGeminiBlogConfigured()) {
    throw new Error("GEMINI_BLOG_API_KEY (or GEMINI_API_KEY) missing");
  }

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

  let created = 0;
  let skipped = 0;
  let failed = 0;
  let published = 0;
  const slugs: string[] = [];
  // Don't keep hammering Gemini across every headline when quota/models fail.
  const maxRewriteAttempts = Math.max(maxPerRun + 1, 3);
  let rewriteAttempts = 0;

  for (const item of headlines) {
    if (created >= maxPerRun) break;
    if (rewriteAttempts >= maxRewriteAttempts) break;

    const sourceKey = toiSourceKey(item.link);
    if (await alreadyIngested(sourceKey, item.title)) {
      skipped++;
      continue;
    }

    const categorySlug = categoryHintForToiItem(item);
    rewriteAttempts++;
    let rewrite: RewriteResult;
    try {
      rewrite = await rewriteToiItem(item, categorySlug);
    } catch (err) {
      console.warn(`[toi-news] rewrite error:`, err);
      failed++;
      break;
    }

    if (!rewrite.ok) {
      failed++;
      if (rewrite.failure?.quotaExceeded) {
        console.warn(
          `[toi-news] Gemini quota hit — stopping run early (${rewrite.failure.message.slice(0, 120)})`
        );
        break;
      }
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
        coverImage: null,
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
          categorySlug,
          ...article.tags,
        ]
          .filter(Boolean)
          .join(", "),
        // Keep null so Google treats our URL as canonical; source is in body + metaKeywords.
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
      `[toi-news] ${status}: ${slug} — "${article.title}" (from ${item.feedKey})`
    );
    await sleep(1500);
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
