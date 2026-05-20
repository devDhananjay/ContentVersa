import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import type { Blog } from "@/lib/data/blogs";

interface Props {
  blogs: Blog[];
}

export function LatestSection({ blogs }: Props) {
  return (
    <section className="container py-12 md:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-sm font-semibold uppercase tracking-widest text-neon-cyan">
            Fresh off the press
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
            Latest from the <span className="text-gradient">community</span>
          </h2>
        </div>
        <Link href="/blogs" className="hidden md:block">
          <Button variant="outline" className="gap-2">
            See all <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {blogs.map((b, i) => (
          <BlogCard key={b.id} blog={b} index={i} />
        ))}
      </div>
    </section>
  );
}
