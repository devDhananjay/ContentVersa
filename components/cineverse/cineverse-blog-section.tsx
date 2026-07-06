import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import type { Blog } from "@/lib/data/blogs";

export function CineverseBlogSection({ blogs }: { blogs: Blog[] }) {
  if (!blogs.length) return null;

  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Movie <span className="text-gradient">News & Reviews</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bollywood, OTT and cinema stories from ContentVerse creators
          </p>
        </div>
        <Link href="/blogs?category=movies" className="hidden md:block">
          <Button variant="outline" size="sm" className="gap-2">
            All movie blogs <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.slice(0, 6).map((blog) => (
          <BlogCard key={blog.slug} blog={blog} />
        ))}
      </div>
    </section>
  );
}
