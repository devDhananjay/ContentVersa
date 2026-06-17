import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { CATEGORIES, categoryPageHref } from "@/lib/data/categories";
import { getCategoriesWithCountsHybrid } from "@/lib/data/blog-db";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description:
    "Browse 21 ContentVerse categories — from AI and startups to lifestyle and gaming. Find your corner of the internet.",
  path: "/categories",
});

export default async function CategoriesIndex() {
  const withCounts = await getCategoriesWithCountsHybrid();
  const countBySlug = new Map(withCounts.map((c) => [c.slug, c.blogCount]));

  return (
    <div className="container py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-sm font-semibold uppercase tracking-widest text-neon-cyan">
          Explore
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mt-3">
          All <span className="text-gradient">categories</span>
        </h1>
        <p className="text-muted-foreground mt-4">
          Twenty-one hand-curated spaces. Each with its own banner, top writers and trending takes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => {
          const count = countBySlug.get(cat.slug) ?? 0;
          return (
            <Link
              key={cat.slug}
              href={categoryPageHref(cat.slug)}
              className="group relative aspect-[16/10] overflow-hidden rounded-3xl border bg-card hover:border-transparent transition-all"
            >
              <Image
                src={cat.banner}
                alt={cat.name}
                fill
                sizes="(min-width:1024px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={cn("absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent")} />
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 group-hover:opacity-80 transition-opacity", cat.color)} />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <h2 className="font-display text-2xl font-extrabold">{cat.name}</h2>
                <p className="text-sm text-white/80 line-clamp-2 mt-1">{cat.description}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-white/70">
                  <span>{count} posts</span>
                  <span>·</span>
                  <span>{cat.subcategories.length} subcategories</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
