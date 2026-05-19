import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { BLOGS } from "@/lib/data/blogs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Bookmarks",
  description: "Saved articles to read later.",
  path: "/bookmarks",
  noIndex: true,
});

export default function BookmarksPage() {
  const saved = BLOGS.slice(0, 6);
  return (
    <div className="container py-12 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center text-white">
          <Bookmark className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Bookmarks
          </h1>
          <p className="text-muted-foreground">
            {saved.length} reads waiting for you. (Demo)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {saved.map((b, i) => (
          <BlogCard key={b.id} blog={b} index={i} />
        ))}
      </div>
    </div>
  );
}
