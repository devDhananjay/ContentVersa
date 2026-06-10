import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import type { Blog } from "@/lib/data/blogs";

interface FinanceBlogSectionProps {
  blogs: Blog[];
}

export function FinanceBlogSection({ blogs }: FinanceBlogSectionProps) {
  if (!blogs.length) return null;

  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Finance <span className="text-gradient">Insights</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Investing, markets and money stories from ContentVerse
          </p>
        </div>
        <Link href="/blogs?category=finance" className="hidden md:block">
          <Button variant="outline" size="sm" className="gap-2">
            All finance blogs <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {blogs.slice(0, 6).map((blog) => (
          <BlogCard key={blog.slug} blog={blog} />
        ))}
      </div>
    </section>
  );
}
