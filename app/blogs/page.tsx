import { Suspense } from "react";
import { Metadata } from "next";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogFilters } from "@/components/blog/blog-filters";
import { BlogPagination } from "@/components/blog/blog-pagination";
import type { Blog } from "@/lib/data/blogs";
import { getPublishedBlogsLiteHybrid } from "@/lib/data/blog-db";
import { CATEGORIES } from "@/lib/data/categories";
import { parseBlogPageSize } from "@/lib/blogs/list-params";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { PageBack } from "@/components/site/page-back";
import { buildMetadata, SITE } from "@/lib/seo";

const CATEGORY_SLUGS = new Set(CATEGORIES.map((c) => c.slug));
const CATEGORY_BY_NAME = new Map(
  CATEGORIES.map((c) => [c.name.toLowerCase(), c.slug])
);

export const metadata: Metadata = buildMetadata({
  title: "Explore articles",
  description:
    "Browse every article on ContentVerse India. Filter by category, search, and sort — stories, guides, and India topics.",
  path: "/blogs",
  keywords: [
    "ContentVerse India articles",
    "Indian blogs to read",
    "finance blogs India",
    "cricket blogs India",
    "career articles India",
    "technology blogs India",
    "creator stories India",
    "explore blogs India",
  ],
});

function resolveCategorySlug(raw?: string): string | undefined {
  if (!raw?.trim()) return undefined;
  const key = raw.trim().toLowerCase();
  if (CATEGORY_SLUGS.has(key)) return key;
  return CATEGORY_BY_NAME.get(key);
}

function applyFilters(
  all: Blog[],
  input: {
    q?: string;
    category?: string;
    sort?: string;
    tag?: string;
  }
) {
  let list = [...all];
  const categorySlug = resolveCategorySlug(input.category);

  if (input.q) {
    const term = input.q.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          b.excerpt.toLowerCase().includes(term) ||
          b.tags.some((t) => t.toLowerCase().includes(term)) ||
          b.author.name.toLowerCase().includes(term) ||
          b.author.username.toLowerCase().includes(term) ||
          b.category.toLowerCase().includes(term)
      );
    }
  }

  // Strict category match — never fall back to unfiltered list
  if (categorySlug) {
    list = list.filter((b) => b.category === categorySlug);
  }
  if (input.tag) {
    const tag = input.tag.trim().toLowerCase();
    list = list.filter((b) =>
      b.tags.some((t) => t.toLowerCase() === tag || t.toLowerCase().includes(tag))
    );
  }

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const scoped = [...list];

  switch (input.sort) {
    case "latest":
      list.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
      break;
    case "liked":
      list.sort((a, b) => b.likes - a.likes);
      break;
    case "viewed":
      list.sort((a, b) => b.views - a.views);
      break;
    case "editor":
      list = list.filter((b) => b.editorPick);
      break;
    case "most_read_today": {
      const today = todayStart.getTime();
      const todays = list.filter((b) => +new Date(b.publishedAt) >= today);
      list = (todays.length >= 1 ? todays : scoped).sort(
        (a, b) => b.views - a.views
      );
      break;
    }
    case "trending_week": {
      const week = list.filter((b) => +new Date(b.publishedAt) >= weekAgo);
      list = (week.length >= 1 ? week : scoped).sort(
        (a, b) =>
          Number(!!b.trending) - Number(!!a.trending) ||
          b.views + b.likes - (a.views + a.likes)
      );
      break;
    }
    default:
      list.sort(
        (a, b) =>
          Number(!!b.trending) - Number(!!a.trending) || b.views - a.views
      );
  }
  return list;
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const spRaw = await searchParams;
  const categorySlug = resolveCategorySlug(spRaw.category);
  const sp: Record<string, string | undefined> = {
    ...spRaw,
    q: spRaw.q?.trim() || undefined,
    category: categorySlug,
    sort: spRaw.sort?.trim() || undefined,
    tag: spRaw.tag?.trim() || undefined,
  };
  const pageSize = parseBlogPageSize(sp.limit);
  const all = await getPublishedBlogsLiteHybrid();
  const list = applyFilters(all, sp);
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const page = Math.min(
    totalPages,
    Math.max(1, Number.parseInt(sp.page || "1", 10) || 1)
  );
  const start = (page - 1) * pageSize;
  const pageItems = list.slice(start, start + pageSize);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Explore articles · ContentVerse India",
    url: `${SITE.url}/blogs`,
    description:
      "Browse articles on ContentVerse India — filter by category, search, and sort.",
    numberOfItems: list.length,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
  };

  return (
    <div className="container pt-8 pb-8 md:pt-10 md:pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageBack href="/" label="Home" className="mb-6" />
      <Suspense fallback={<div className="h-20 rounded-2xl bg-muted/40 animate-pulse mb-6" />}>
        <BlogFilters
          defaultQuery={sp.q}
          defaultCategory={sp.category}
          defaultSort={sp.sort || "trending"}
        />
      </Suspense>

      {list.length === 0 ? (
        <div className="rounded-3xl border bg-card p-16 text-center">
          <p className="text-2xl font-display font-bold mb-2">No matches yet</p>
          <p className="text-muted-foreground">
            Try a different keyword, category, or clear filters.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {pageItems.map((b, i) => (
              <BlogCard key={b.id} blog={b} index={i} eager={i < 6} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <HubAdSense className="!px-0 w-auto" />
          </div>
          <BlogPagination
            page={page}
            totalPages={totalPages}
            totalItems={list.length}
            pageSize={pageSize}
            searchParams={sp}
          />
        </>
      )}
    </div>
  );
}
