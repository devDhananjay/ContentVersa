import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CATEGORIES, getCategoryBySlug } from "@/lib/data/categories";
import { AUTHORS } from "@/lib/data/blogs";
import { getBlogsByCategoryHybrid } from "@/lib/data/blog-db";
import { buildMetadata } from "@/lib/seo";
import { formatNumber, getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return buildMetadata({ title: "Category" });
  return buildMetadata({
    title: cat.name,
    description: cat.description,
    path: `/category/${cat.slug}`,
    image: cat.banner,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return notFound();
  const blogs = await getBlogsByCategoryHybrid(slug);
  const topWriters = AUTHORS.slice(0, 3);

  return (
    <div>
      <section className="relative h-[420px] overflow-hidden">
        <Image
          src={cat.banner}
          alt={cat.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-pink/20 mix-blend-overlay" />
        <div className="container relative h-full flex flex-col justify-end pb-12">
          <Badge variant="gradient" className="w-fit mb-3">
            Category
          </Badge>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight">
            {cat.name}
          </h1>
          <p className="mt-3 text-lg text-foreground/80 max-w-2xl">
            {cat.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {cat.subcategories.map((s) => (
              <Badge key={s} variant="outline" className="bg-background/50 backdrop-blur">
                #{s.toLowerCase().replace(/\s+/g, "-")}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <div className="container py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">
              Trending in {cat.name}
            </h2>
            <Link href={`/blogs?category=${cat.slug}`}>
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          </div>
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {blogs.map((b, i) => (
                <BlogCard key={b.id} blog={b} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-10 text-center">
              <p className="text-muted-foreground">
                No posts in this category yet. Be the first to publish.
              </p>
              <Link href="/dashboard/create" className="inline-block mt-4">
                <Button variant="gradient">Write the first one</Button>
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-display font-semibold mb-4">Top writers</h3>
            <div className="space-y-4">
              {topWriters.map((w) => (
                <Link
                  key={w.id}
                  href={`/profile/${w.username}`}
                  className="flex items-center gap-3"
                >
                  <Avatar>
                    <AvatarImage src={w.avatar} alt={w.name} />
                    <AvatarFallback>{getInitials(w.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{w.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(w.followers)} followers
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Follow
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-display font-semibold mb-4">Subcategories</h3>
            <div className="flex flex-wrap gap-2">
              {cat.subcategories.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-gradient p-5 bg-card">
            <h3 className="font-display font-semibold mb-2">
              Write for {cat.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Got an idea? Pitch it to our editors and reach the {cat.name} audience.
            </p>
            <Link href="/dashboard/create">
              <Button variant="gradient" className="w-full">
                Start writing
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
