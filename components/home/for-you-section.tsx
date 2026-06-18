import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getForYouFeed } from "@/lib/data/for-you-feed";

export async function ForYouSection() {
  const session = await getCurrentUser();
  if (!session) return null;

  const userId = await resolveUserId(session).catch(() => null);
  if (!userId) return null;

  const blogs = await getForYouFeed(userId, 6);
  if (blogs.length === 0) return null;

  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-sm font-semibold uppercase tracking-widest text-neon-purple flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            For you
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
            Picked from your reads & follows
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Personalized from your reading history and categories you follow.
          </p>
        </div>
        <Link href="/blogs" className="hidden sm:block">
          <Button variant="outline" size="sm">
            Browse all
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {blogs.map((b, i) => (
          <BlogCard key={b.id} blog={b} index={i} />
        ))}
      </div>
    </section>
  );
}
