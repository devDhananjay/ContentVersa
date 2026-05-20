import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";

export default async function DashboardBookmarksPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/dashboard/bookmarks");

  const data = await getDashboardDataCached(session);
  const bookmarks = data?.bookmarks ?? [];

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-neon-purple" />
          Bookmarks
        </h1>
        <p className="text-muted-foreground mt-1">
          Articles you saved — only visible on your account.
        </p>
      </div>

      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarks.map((b, i) => (
            <BlogCard key={b.id} blog={b} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
          <p>No bookmarks yet.</p>
          <Link href="/blogs" className="mt-4 inline-block">
            <Button variant="gradient">Explore articles</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
