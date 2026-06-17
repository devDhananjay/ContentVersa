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
import { callGeminiJson } from "../lib/ai/gemini";
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

const ARTICLE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    metaDescription: { type: "string" },
    metaKeywords: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    content: { type: "string" },
  },
  required: ["title", "excerpt", "metaDescription", "tags", "content"],
};

type GeneratedArticle = {
  title: string;
  excerpt: string;
  metaDescription: string;
  metaKeywords?: string;
  tags: string[];
  content: string;
};

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
  const system = `You are an expert SEO content writer for ContentVerse (contentverse.co.in), an Indian creator platform.
Write original, helpful, long-form articles in Markdown.
Rules:
- Minimum 1,400 words in "content"
- Use ## and ### headings only (no # h1 — title is separate)
- Include an intro, 5-8 substantive sections, a FAQ with 3-4 questions, and a conclusion
- Write for Indian readers where relevant (₹, Indian cities, regulations)
- Natural tone — not robotic, not keyword-stuffed
- End with "## Support creators" — 2 sentences about tipping writers on ContentVerse
${topic.affiliateNote ? `- ${topic.affiliateNote}` : ""}
- If finance: add disclaimer "This is educational content, not financial advice."
- Do NOT invent fake statistics; use ranges and general guidance when exact data unknown`;

  const user = `Write a complete SEO blog article for:
Title idea: ${topic.title}
Target slug: ${topic.slug}
Category: ${topic.category}
Search intent: ${topic.searchIntent}

Return JSON with title, excerpt (2 sentences), metaDescription (150-160 chars), metaKeywords (comma-separated), tags (5-7), and content (full Markdown body).`;

  return callGeminiJson<GeneratedArticle>(
    system,
    user,
    ARTICLE_SCHEMA,
    16384
  );
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
    if (!article?.content || article.content.length < 800) {
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
