"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/motion";
import { MrecAd } from "@/components/ads/mrec-ad";
import type { Blog } from "@/lib/data/blogs";

interface Props {
  blogs: Blog[];
}

export function TrendingSection({ blogs }: Props) {
  const [first, ...rest] = blogs;
  const reduce = useReducedMotion();
  // Keep room for the MREC column on large screens
  const gridCards = rest.slice(0, 4);

  return (
    <section
      className="container relative scroll-mt-[calc(var(--site-header-offset)+1rem)] py-12 md:py-16"
      id="home-articles"
    >
      <Reveal>
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="v2-eyebrow mb-2 inline-flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5" />
              Trending Now
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Hot takes the internet
              <br />
              <span className="text-gradient">can&apos;t stop reading.</span>
            </h2>
          </div>
          <Link href="/blogs?sort=trending" className="hidden sm:block">
            <motion.div whileHover={reduce ? undefined : { x: 4 }}>
              <Button variant="outline" className="gap-2 rounded-full">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </Link>
        </div>
      </Reveal>

      {/* Content + right MREC (TOI column), not a giant band under the grid */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {first && <BlogCard blog={first} variant="featured" />}
          {gridCards.map((b, i) => (
            <BlogCard key={b.id} blog={b} index={i + 1} />
          ))}
        </div>

        <div className="hidden xl:block w-[300px] shrink-0 pt-1">
          <MrecAd slotKey="inArticle" />
        </div>
      </div>

      <div className="mt-8 flex justify-center xl:hidden">
        <MrecAd slotKey="inArticle" />
      </div>

      <div className="mt-6 sm:hidden">
        <Link href="/blogs?sort=trending">
          <Button variant="gradient" className="w-full gap-2">
            View all <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
