import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import type { Blog } from "@/lib/data/blogs";
import { SHORTS_SLOGAN_WORDS } from "@/lib/utils";

export function NewsIn60Tagline({ className }: { className?: string }) {
  return (
    <h2
      className={`font-display font-extrabold tracking-tight text-gradient leading-[1.1] ${className || ""}`}
    >
      News in {SHORTS_SLOGAN_WORDS} words
    </h2>
  );
}

export function NewsIn60Section({ blogs }: { blogs: Blog[] }) {
  const shorts = blogs.slice(0, 8);
  if (shorts.length === 0) return null;

  return (
    <section className="py-14 md:py-24 border-y border-border/40 bg-zinc-950/40">
      <div className="container mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <NewsIn60Tagline className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl" />
            <p className="text-muted-foreground mt-4 text-base md:text-lg max-w-2xl">
              Open any story and tap <strong>Summarize with AI</strong> for a quick{" "}
              {SHORTS_SLOGAN_WORDS}-word read.
            </p>
          </div>
          <Link href="/blogs" className="shrink-0">
            <Button variant="outline" size="lg" className="gap-2">
              All stories <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-4 px-4 md:px-[max(1rem,calc((100vw-1280px)/2+1rem))] snap-x snap-mandatory scrollbar-thin">
        {shorts.map((blog, i) => (
          <div
            key={blog.slug}
            className="w-[min(300px,85vw)] shrink-0 snap-center"
          >
            <BlogCard blog={blog} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
