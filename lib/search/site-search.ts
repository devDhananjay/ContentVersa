/**
 * Site-wide search: blogs (DB) + guides + tools + key hubs.
 * Home hero placeholders (SIP / CIBIL / HUID) live mostly outside /blogs.
 */

import { BlogStatus, type Prisma } from "@prisma/client";
import { prisma, isDatabaseConfigured, safeDbQuery } from "@/lib/prisma";
import {
  GUIDE_ARTICLES,
  GUIDE_SECTIONS,
  guideArticlePath,
  guideSectionPath,
} from "@/lib/guides/registry";
import { TOOL_REGISTRY, toolPath } from "@/lib/tools/registry";

export type SiteSearchHit = {
  type: "blog" | "guide" | "tool" | "hub";
  title: string;
  description: string;
  href: string;
  badge?: string;
};

const HUB_PAGES: Array<{
  title: string;
  description: string;
  href: string;
  keywords: string[];
  badge: string;
}> = [
  {
    title: "HUID Verification — check hallmarked gold",
    description:
      "Verify 6-character HUID on hallmarked gold jewellery with BIS-backed lookup on ContentVerse India.",
    href: "/huid-verification",
    keywords: ["huid", "hallmark", "gold", "bis", "jewellery", "jewelry"],
    badge: "GoldVerse",
  },
  {
    title: "GoldVerse — live gold rates & guides",
    description: "City gold rates, hallmark tips, and buying guides for India.",
    href: "/goldverse",
    keywords: ["gold", "gold rate", "22k", "24k", "jewellery"],
    badge: "GoldVerse",
  },
  {
    title: "MoneyVerse — salary, SIP & tax tools",
    description: "Practical money tools and explainers for India.",
    href: "/moneyverse",
    keywords: ["money", "salary", "tax", "sip", "emi", "cibil"],
    badge: "MoneyVerse",
  },
  {
    title: "CineVerse — movies & OTT in India",
    description: "Movie cast, trailer, ratings and where to watch in India.",
    href: "/cineverse",
    keywords: ["movie", "movies", "ott", "bollywood", "trailer"],
    badge: "CineVerse",
  },
  {
    title: "Live News — India desk",
    description: "Live India news briefings updated through the day.",
    href: "/news",
    keywords: ["news", "live news", "headlines", "breaking"],
    badge: "News",
  },
  {
    title: "India Tools hub",
    description: "Free IFSC, SIP, EMI, weather, PDF and more India utilities.",
    href: "/tools",
    keywords: ["tools", "calculator", "ifsc", "utility"],
    badge: "Tools",
  },
  {
    title: "India Guides hub",
    description: "Original explainers on money, schemes, jobs, cricket and more.",
    href: "/guides",
    keywords: ["guides", "explainer", "schemes"],
    badge: "Guides",
  },
];

function scoreText(hay: string, terms: string[]): number {
  const h = hay.toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (!t) continue;
    if (h === t) score += 40;
    else if (h.startsWith(t)) score += 24;
    else if (h.includes(t)) score += 12;
  }
  return score;
}

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9\u0900-\u097f]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

async function searchBlogsDb(q: string, limit: number): Promise<SiteSearchHit[]> {
  if (!isDatabaseConfigured()) return [];
  const terms = tokenize(q);
  if (!terms.length) return [];

  return (
    (await safeDbQuery([], async () => {
      const or: Prisma.BlogWhereInput[] = terms.flatMap((term) => [
        { title: { contains: term, mode: "insensitive" } },
        { excerpt: { contains: term, mode: "insensitive" } },
        { slug: { contains: term, mode: "insensitive" } },
        { metaKeywords: { contains: term, mode: "insensitive" } },
        { metaTitle: { contains: term, mode: "insensitive" } },
        { metaDescription: { contains: term, mode: "insensitive" } },
        { content: { contains: term, mode: "insensitive" } },
        { tags: { some: { tag: { name: { contains: term, mode: "insensitive" } } } } },
      ]);

      const rows = await prisma.blog.findMany({
        where: {
          status: BlogStatus.PUBLISHED,
          slug: { not: { startsWith: "discover-" } },
          OR: or,
        },
        select: {
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: "desc" },
        take: Math.max(limit * 3, 24),
      });

      const scored = rows
        .map((r) => {
          const hay = `${r.title} ${r.excerpt || ""} ${r.slug}`;
          return {
            hit: {
              type: "blog" as const,
              title: r.title,
              description: (r.excerpt || "").slice(0, 160),
              href: `/blog/${r.slug}`,
              badge: "Article",
            },
            score: scoreText(hay, terms) + (r.title.toLowerCase().includes(q.toLowerCase()) ? 20 : 0),
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((x) => x.hit);

      return scored;
    }, "site-search-blogs")) ?? []
  );
}

function searchGuides(q: string, terms: string[], limit: number): SiteSearchHit[] {
  const articleHits = GUIDE_ARTICLES.map((a) => {
    const hay = `${a.title} ${a.shortTitle} ${a.description} ${a.keywords.join(" ")} ${a.slug}`;
    return {
      hit: {
        type: "guide" as const,
        title: a.title,
        description: a.description.slice(0, 160),
        href: guideArticlePath(a),
        badge: "Guide",
      },
      score: scoreText(hay, terms) + scoreText(hay, [q.toLowerCase()]),
    };
  }).filter((x) => x.score > 0);

  const sectionHits = GUIDE_SECTIONS.map((s) => {
    const hay = `${s.title} ${s.shortTitle} ${s.description} ${s.keywords.join(" ")} ${s.slug}`;
    return {
      hit: {
        type: "guide" as const,
        title: s.title,
        description: s.description.slice(0, 160),
        href: guideSectionPath(s.slug),
        badge: "Guide section",
      },
      score: scoreText(hay, terms),
    };
  }).filter((x) => x.score > 0);

  return [...articleHits, ...sectionHits]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.hit);
}

function searchTools(terms: string[], limit: number): SiteSearchHit[] {
  return TOOL_REGISTRY.map((t) => {
    const hay = `${t.title} ${t.shortTitle} ${t.description} ${t.keywords.join(" ")} ${t.slug}`;
    return {
      hit: {
        type: "tool" as const,
        title: t.shortTitle || t.title,
        description: t.description.slice(0, 160),
        href: toolPath(t.slug),
        badge: t.badge || "Tool",
      },
      score: scoreText(hay, terms),
    };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.hit);
}

function searchHubs(terms: string[], limit: number): SiteSearchHit[] {
  return HUB_PAGES.map((h) => {
    const hay = `${h.title} ${h.description} ${h.keywords.join(" ")}`;
    return {
      hit: {
        type: "hub" as const,
        title: h.title,
        description: h.description,
        href: h.href,
        badge: h.badge,
      },
      score: scoreText(hay, terms),
    };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.hit);
}

export type SiteSearchResult = {
  query: string;
  blogs: SiteSearchHit[];
  guides: SiteSearchHit[];
  tools: SiteSearchHit[];
  hubs: SiteSearchHit[];
  total: number;
};

export async function searchSite(query: string): Promise<SiteSearchResult> {
  const q = query.trim();
  const empty: SiteSearchResult = {
    query: q,
    blogs: [],
    guides: [],
    tools: [],
    hubs: [],
    total: 0,
  };
  if (!q || q.length < 2) return empty;

  const terms = tokenize(q);
  if (!terms.length) return empty;

  const [blogs, guides, tools, hubs] = await Promise.all([
    searchBlogsDb(q, 12),
    Promise.resolve(searchGuides(q, terms, 10)),
    Promise.resolve(searchTools(terms, 8)),
    Promise.resolve(searchHubs(terms, 6)),
  ]);

  return {
    query: q,
    blogs,
    guides,
    tools,
    hubs,
    total: blogs.length + guides.length + tools.length + hubs.length,
  };
}
