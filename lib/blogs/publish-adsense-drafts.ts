/**
 * AdSense-safe drip publisher for DRAFT blogs.
 * Used by GET /api/cron/publish-adsense-drafts
 *
 * Rules:
 * - Max N posts per run (default 2)
 * - ≥800 words / ≥4 min read
 * - No title/topic overlap with PUBLISHED (or other picks in this run)
 * - Strip ai-daily keywords so pages stay indexable + adEligible
 * - Archive near-duplicate DRAFT siblings with canonical → winner
 */
import { BlogStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { dispatchBlogPublishedNotifications } from "@/lib/notifications/blog-published";
import {
  normalizeTitleKey,
  passesArticleQualityGate,
  wordCount,
} from "@/lib/seo/article-quality";
import { isIndexableArticle } from "@/lib/seo/crawl-policy";
import { publicCanonicalUrl } from "@/lib/seo/content-redirects";
import { readingTime } from "@/lib/utils";

const YMYL_BODY_NOTE = `

---

> **Educational note:** This article is for general information only — not personalised financial, legal, medical, or investment advice. Verify figures and eligibility on official portals (RBI, SEBI, MoHFW, Income Tax, etc.) or with a qualified professional before you act.
`;

const YMYL_CATS = new Set([
  "finance",
  "business",
  "health",
  "psychology",
  "relationships",
  "startups",
  "ai",
]);

/** Ephemeral / thin news patterns — skip for AdSense drip. */
const SKIP_TITLE =
  /live streaming|this weekend|this week|outbreak|stunned|leaks|admit card out|long weekend|what to know today/i;

function significantTokens(title: string): string[] {
  const stop = new Set(
    "the a an in on of for to and or vs what how why key guide india indian 2026 complete must know before top best your from with are can need needs things this that will about explained rights protection claims access".split(
      " "
    )
  );
  return normalizeTitleKey(title)
    .split(" ")
    .filter((w) => w.length > 3 && !stop.has(w));
}

function jaccard(a: string, b: string): number {
  const A = new Set(significantTokens(a));
  const B = new Set(significantTokens(b));
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
}

function stripAiDailyKeywords(meta: string | null | undefined): string {
  return (meta || "")
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !/ai-daily/i.test(s) && !/^cron$/i.test(s))
    .join(", ");
}

function ensureYmylNote(content: string, categorySlug: string | null): string {
  if (!categorySlug || !YMYL_CATS.has(categorySlug)) return content;
  if (
    /educational note|not personalised|not financial advice|not medical advice/i.test(
      content
    )
  ) {
    return content;
  }
  return content.trimEnd() + YMYL_BODY_NOTE;
}

function overlapsTitle(a: string, b: string): boolean {
  return (
    normalizeTitleKey(a) === normalizeTitleKey(b) || jaccard(a, b) >= 0.55
  );
}

export type PublishAdsenseDraftsResult = {
  published: number;
  archived: number;
  skipped: number;
  ids: string[];
  slugs: string[];
  reasons: string[];
};

export async function publishAdsenseSafeDrafts(
  limit = 2
): Promise<PublishAdsenseDraftsResult> {
  const out: PublishAdsenseDraftsResult = {
    published: 0,
    archived: 0,
    skipped: 0,
    ids: [],
    slugs: [],
    reasons: [],
  };

  if (!isDatabaseConfigured()) {
    out.reasons.push("database not configured");
    return out;
  }

  const max = Math.max(0, Math.min(5, Math.floor(limit)));
  if (max === 0) {
    out.reasons.push("limit=0 — no publish this run");
    return out;
  }

  const published = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    select: { title: true, slug: true },
  });

  const drafts = await prisma.blog.findMany({
    where: { status: BlogStatus.DRAFT },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      metaKeywords: true,
      coverImage: true,
      readingTime: true,
      createdAt: true,
      category: { select: { slug: true } },
    },
    orderBy: [{ readingTime: "desc" }, { createdAt: "asc" }],
    take: 80,
  });

  const pickedTitles: string[] = [];
  const pickedSlugs: string[] = [];

  for (const draft of drafts) {
    if (out.published >= max) break;

    if (SKIP_TITLE.test(draft.title)) {
      out.skipped++;
      out.reasons.push(`skip ephemeral: ${draft.slug}`);
      continue;
    }

    let content = ensureYmylNote(draft.content, draft.category?.slug ?? null);
    const metaKeywords = stripAiDailyKeywords(draft.metaKeywords);
    const rt = readingTime(content);
    const words = wordCount(content);

    if (!passesArticleQualityGate(content)) {
      out.skipped++;
      out.reasons.push(`skip thin (${words}w): ${draft.slug}`);
      continue;
    }

    if (
      !isIndexableArticle({
        slug: draft.slug,
        readingTime: rt,
        metaKeywords,
      })
    ) {
      out.skipped++;
      out.reasons.push(`skip not indexable: ${draft.slug}`);
      continue;
    }

    const clashLive = published.find((p) => overlapsTitle(draft.title, p.title));
    if (clashLive) {
      out.skipped++;
      out.reasons.push(`skip overlaps live ${clashLive.slug}: ${draft.slug}`);
      continue;
    }

    if (pickedTitles.some((t) => overlapsTitle(draft.title, t))) {
      out.skipped++;
      out.reasons.push(`skip overlaps batch: ${draft.slug}`);
      continue;
    }

    const now = new Date();
    await prisma.blog.update({
      where: { id: draft.id },
      data: {
        content,
        readingTime: rt,
        metaKeywords,
        status: BlogStatus.PUBLISHED,
        publishedAt: now,
        adEligible: true,
        scheduledFor: null,
      },
    });

    // Archive near-duplicate drafts (same topic) → canonical to this post
    const siblings = drafts.filter(
      (d) =>
        d.id !== draft.id &&
        !pickedSlugs.includes(d.slug) &&
        overlapsTitle(draft.title, d.title)
    );
    for (const sib of siblings) {
      await prisma.blog.update({
        where: { id: sib.id },
        data: {
          status: BlogStatus.ARCHIVED,
          adEligible: false,
          canonicalUrl: publicCanonicalUrl(`/blog/${draft.slug}`),
        },
      });
      out.archived++;
      out.reasons.push(`archived dup ${sib.slug} → ${draft.slug}`);
    }

    await dispatchBlogPublishedNotifications(draft.id).catch(() => {});
    revalidatePath(`/blog/${draft.slug}`);

    out.published++;
    out.ids.push(draft.id);
    out.slugs.push(draft.slug);
    pickedTitles.push(draft.title);
    pickedSlugs.push(draft.slug);
    published.push({ title: draft.title, slug: draft.slug });
    out.reasons.push(
      `published ${draft.slug} (${words}w, ${rt}m, cover=${Boolean(draft.coverImage)})`
    );
  }

  if (out.published) {
    revalidatePath("/");
    revalidatePath("/blogs");
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/blogs");
  }

  return out;
}
