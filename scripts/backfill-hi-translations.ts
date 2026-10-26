/**
 * Batch AI-translate published blogs → Hindi DRAFT/READY translations.
 *
 * FREE MODE: disabled unless ENABLE_AI_HI_TRANSLATE=1 (saves Gemini quota).
 *
 * Usage:
 *   ENABLE_AI_HI_TRANSLATE=1 npx tsx scripts/backfill-hi-translations.ts --limit=10
 *   ENABLE_AI_HI_TRANSLATE=1 npx tsx scripts/backfill-hi-translations.ts --limit=50 --only=money,jobs
 *
 * Requires DATABASE_URL + GEMINI_API_KEY (use .env.local via tunnel for prod).
 */
import { PrismaClient, BlogStatus } from "@prisma/client";
import { translateBlogToHindi } from "../lib/i18n/translate-blog";
import {
  categoryNeedsHiApproval,
  isAiHiTranslateEnabled,
} from "../lib/i18n/policy";

const prisma = new PrismaClient();

function arg(name: string, fallback?: string) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
}

async function main() {
  if (!isAiHiTranslateEnabled()) {
    console.error(
      "AI Hindi backfill is OFF (free mode).\n" +
        "UI i18n still works without this.\n" +
        "To run: ENABLE_AI_HI_TRANSLATE=1 npx tsx scripts/backfill-hi-translations.ts --limit=10"
    );
    process.exit(1);
  }

  const limit = Number(arg("limit", "20")) || 20;
  const only = (arg("only", "") || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const published = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      slug: { not: { startsWith: "discover-" } },
      translations: { none: { locale: "hi" } },
      ...(only.length
        ? { category: { slug: { in: only } } }
        : {}),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
      category: { select: { slug: true } },
    },
    orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });

  // Prefer sensitive niches first when not filtering
  published.sort((a, b) => {
    const as = categoryNeedsHiApproval(a.category?.slug) ? 0 : 1;
    const bs = categoryNeedsHiApproval(b.category?.slug) ? 0 : 1;
    return as - bs;
  });

  console.log(`Translating ${published.length} blogs to Hindi…`);
  let ok = 0;
  let fail = 0;

  for (const b of published) {
    process.stdout.write(`→ ${b.slug} … `);
    const result = await translateBlogToHindi({
      blogId: b.id,
      title: b.title,
      excerpt: b.excerpt,
      content: b.content,
      metaTitle: b.metaTitle,
      metaDescription: b.metaDescription,
      categorySlug: b.category?.slug,
    });
    if (result.ok) {
      ok++;
      console.log(`ok (${result.status})`);
    } else {
      fail++;
      console.log(`FAIL ${result.error}`);
    }
    // gentle rate limit for Gemini free tier
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`Done. ok=${ok} fail=${fail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
