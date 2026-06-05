import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import type { Blog } from "@/lib/data/blogs";

interface SportsBlogSectionProps {
  blogs: Blog[];
}

export function SportsBlogSection({ blogs }: SportsBlogSectionProps) {
  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-sm font-semibold uppercase tracking-widest text-neon-purple">
            From our writers
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
            Sports <span className="text-gradient">Editorial</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analysis, opinion and culture from the ContentVerse community
          </p>
        </div>
        <Link href="/category/sports" className="hidden md:block">
          <Button variant="outline" size="sm" className="gap-2">
            All sports blogs <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {blogs.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {blogs.map((blog, i) => (
            <BlogCard key={blog.id} blog={blog} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <PenLine className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">
            No sports blogs yet. Be the first to write about cricket!
          </p>
          <Link href="/dashboard/create">
            <Button variant="gradient">Write a sports blog</Button>
          </Link>
        </div>
      )}
    </section>
  );
}
