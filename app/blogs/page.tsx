import { Suspense } from "react";
import { Metadata } from "next";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogFilters } from "@/components/blog/blog-filters";
import type { Blog } from "@/lib/data/blogs";
import { getPublishedBlogsHybrid } from "@/lib/data/blog-db";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Explore",
  description: "Browse every article on ContentVerse. Filter by category, search and sort.",
  path: "/blogs",
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
    const term = input.q.toLowerCase();
    list = list.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.excerpt.toLowerCase().includes(term) ||
        b.tags.some((t) => t.toLowerCase().includes(term)) ||
        b.author.name.toLowerCase().includes(term)
    );
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
  const sp = await searchParams;
  const all = await getPublishedBlogsHybrid();
  const list = applyFilters(all, sp);

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-6">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          {sp.q ? `Results for "${sp.q}"` : "Explore the verse"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {list.length} {list.length === 1 ? "article" : "articles"} matching your filters
        </p>
      </div>

      <Suspense fallback={<div className="h-24 rounded-2xl bg-muted/40 animate-pulse mb-8" />}>
        <BlogFilters
          defaultQuery={sp.q}
          defaultCategory={sp.category}
          defaultSort={sp.sort || "trending"}
        />
      </Suspense>

      {list.length === 0 ? (
        <div className="rounded-3xl border bg-card p-16 text-center">
          <p className="text-2xl font-display font-bold mb-2">No matches yet</p>
          <p className="text-muted-foreground">Try a different keyword or remove filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((b, i) => (
            <BlogCard key={b.id} blog={b} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
