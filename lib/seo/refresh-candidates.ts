/**
 * P2 — Identify published blogs that likely need an SEO refresh
 * (cheaper than publishing new thin pages). Uses on-site signals only;
 * merge with GSC low-CTR queries manually in admin.
 */

import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { isAutoDailyCronSlug, isDiscoverSyndicatedSlug } from "@/lib/seo/crawl-policy";

export type SeoRefreshCandidate = {
  id: string;
  slug: string;
  title: string;
  views: number;
  readingTime: number;
  publishedAt: string | null;
  updatedAt: string;
  reasons: string[];
  score: number;
};

const STALE_DAYS = 120;
const LOW_VIEWS = 80;
const BORDERLINE_READ_MIN = 4;

function daysSince(d: Date): number {
  return Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
}

export function scoreRefreshCandidate(input: {
  views: number;
  readingTime: number;
  publishedAt: Date | null;
  updatedAt: Date;
  metaDescription: string | null;
  slug: string;
}): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  if (isDiscoverSyndicatedSlug(input.slug) || isAutoDailyCronSlug(input.slug)) {
    return { score: 0, reasons: ["Syndicated or auto-daily slug — refresh or noindex instead"] };
  }

  if (input.publishedAt) {
    const age = daysSince(input.publishedAt);
    if (age >= STALE_DAYS && input.views < LOW_VIEWS) {
      score += 40;
      reasons.push(`Stale (${age}d) with low views (${input.views})`);
    } else if (age >= STALE_DAYS) {
      score += 15;
      reasons.push(`Published ${age} days ago — check freshness`);
    }
  }

  if (input.readingTime === BORDERLINE_READ_MIN) {
    score += 25;
    reasons.push("Borderline read time (4 min) — expand for indexability");
  }

  if (!input.metaDescription?.trim()) {
    score += 20;
    reasons.push("Missing meta description");
  }

  if (input.publishedAt) {
    const refreshed = daysSince(input.updatedAt);
    const published = daysSince(input.publishedAt);
    if (published > 60 && refreshed > 90) {
      score += 15;
      reasons.push("Not materially updated since publish");
    }
  }

  if (input.views >= 200 && input.readingTime >= 5) {
    score += 10;
    reasons.push("Has traction — refresh may lift CTR quickly");
  }

  return { score, reasons };
}

export async function getSeoRefreshCandidates(
  limit = 25
): Promise<SeoRefreshCandidate[]> {
  if (!isDatabaseConfigured()) return [];

  const blogs = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      views: true,
      readingTime: true,
      publishedAt: true,
      updatedAt: true,
      metaDescription: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 500,
  });

  const ranked = blogs
    .map((b) => {
      const { score, reasons } = scoreRefreshCandidate({
        views: b.views,
        readingTime: b.readingTime,
        publishedAt: b.publishedAt,
        updatedAt: b.updatedAt,
        metaDescription: b.metaDescription,
        slug: b.slug,
      });
      return {
        id: b.id,
        slug: b.slug,
        title: b.title,
        views: b.views,
        readingTime: b.readingTime,
        publishedAt: b.publishedAt?.toISOString() ?? null,
        updatedAt: b.updatedAt.toISOString(),
        reasons,
        score,
      };
    })
    .filter((r) => r.score > 0 && r.reasons.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
}
