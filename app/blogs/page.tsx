import { Metadata } from "next";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogFilters } from "@/components/blog/blog-filters";
import { BLOGS, searchBlogs } from "@/lib/data/blogs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Explore",
  description: "Browse every article on ContentVerse. Filter by category, search and sort.",
  path: "/blogs",
});

function applyFilters(input: {
  q?: string;
  category?: string;
  sort?: string;
  tag?: string;
}) {
  let list = [...BLOGS];
  if (input.q) list = searchBlogs(input.q);
  if (input.category) list = list.filter((b) => b.category === input.category);
  if (input.tag) list = list.filter((b) => b.tags.includes(input.tag!));
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
  const list = applyFilters(sp);

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

      <BlogFilters
        defaultQuery={sp.q}
        defaultCategory={sp.category}
        defaultSort={sp.sort || "trending"}
      />

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
