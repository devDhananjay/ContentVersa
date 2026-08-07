import { Suspense } from "react";
import { Metadata } from "next";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogFilters } from "@/components/blog/blog-filters";
import { BlogPagination } from "@/components/blog/blog-pagination";
import { CategoryLiveFeedGrid } from "@/components/feeds/category-live-feed-grid";
import type { Blog } from "@/lib/data/blogs";
import { getPublishedBlogsLiteHybrid } from "@/lib/data/blog-db";
import { getCategoryFeed } from "@/lib/feeds/data";
import { hasCategoryFeed } from "@/lib/feeds/constants";
import { parseBlogPageSize } from "@/lib/blogs/list-params";
import { buildMetadata, SITE } from "@/lib/seo";

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
  if (input.q) {
    const term = input.q.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          b.excerpt.toLowerCase().includes(term) ||
          b.tags.some((t) => t.toLowerCase().includes(term)) ||
          b.author.name.toLowerCase().includes(term)
      );
    }
  }
  if (input.category) list = list.filter((b) => b.category === input.category);
  if (input.tag) list = list.filter((b) => b.tags.includes(input.tag!));
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

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
      list = list.filter((b) => +new Date(b.publishedAt) >= today);
      list.sort((a, b) => b.views - a.views);
      if (list.length < 3) {
        list = [...all].sort((a, b) => b.views - a.views).slice(0, 12);
      }
      break;
    }
    case "trending_week": {
      list = list.filter((b) => +new Date(b.publishedAt) >= weekAgo);
      list.sort(
        (a, b) =>
          Number(!!b.trending) - Number(!!a.trending) ||
          b.views + b.likes - (a.views + a.likes)
      );
      if (list.length < 3) {
        list = [...all]
          .filter((b) => b.trending || +new Date(b.publishedAt) >= weekAgo)
          .sort((a, b) => b.views - a.views);
      }
      break;
    }
    default:
      list.sort((a, b) => Number(!!b.trending) - Number(!!a.trending) || b.views - a.views);
  }
  return list;
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const spRaw = await searchParams;
  const sp: Record<string, string | undefined> = {
    ...spRaw,
    q: spRaw.q?.trim() || undefined,
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
  const category = sp.category;
  const feed =
    category && hasCategoryFeed(category) ? await getCategoryFeed(category) : null;

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
      <Suspense fallback={<div className="h-20 rounded-2xl bg-muted/40 animate-pulse mb-6" />}>
        <BlogFilters
          defaultQuery={sp.q}
          defaultCategory={sp.category}
          defaultSort={sp.sort || "trending"}
        />
      </Suspense>

      {feed ? <CategoryLiveFeedGrid feed={feed} /> : null}

      {list.length === 0 ? (
        <div className="rounded-3xl border bg-card p-16 text-center">
          <p className="text-2xl font-display font-bold mb-2">No matches yet</p>
          <p className="text-muted-foreground">Try a different keyword or remove filters.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {pageItems.map((b, i) => (
              <BlogCard key={b.id} blog={b} index={i} eager={i < 6} />
            ))}
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
