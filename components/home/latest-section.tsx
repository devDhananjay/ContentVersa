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
    <section
      className="container scroll-mt-[calc(var(--site-header-offset)+1rem)] py-12 md:py-20"
      id="home-latest"
    >
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="v2-eyebrow">Fresh off the press</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-2">
            Latest from the <span className="text-gradient">community</span>
          </h2>
        </div>
        <Link href="/blogs" className="hidden sm:block">
          <Button variant="outline" className="gap-2 rounded-full">
            See all <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {blogs.map((b, i) => (
          <BlogCard key={b.id} blog={b} index={i} />
        ))}
      </div>

      <div className="mt-6 sm:hidden">
        <Link href="/blogs">
          <Button variant="gradient" className="w-full gap-2">
            See all <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
