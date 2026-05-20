import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Bookmarks",
  description: "Saved articles to read later.",
  path: "/bookmarks",
  noIndex: true,
});

export default async function BookmarksPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/bookmarks");

  const data = await getDashboardDataCached(session);
  const saved = data?.bookmarks ?? [];

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
            {saved.length} {saved.length === 1 ? "article" : "articles"} saved to read later.
          </p>
        </div>
      </div>

      {saved.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((b, i) => (
            <BlogCard key={b.id} blog={b} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
          <p>No bookmarks yet.</p>
          <Link href="/blogs" className="mt-4 inline-block">
            <Button variant="gradient">Browse articles</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
