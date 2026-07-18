"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/motion";
import type { Blog } from "@/lib/data/blogs";

interface Props {
  blogs: Blog[];
}

export function TrendingSection({ blogs }: Props) {
  const [first, ...rest] = blogs;
  const reduce = useReducedMotion();

  return (
    <section className="container py-12 md:py-20 relative" id="home-articles">
      <Reveal>
        <div className="flex items-end justify-between mb-8">
          <div>
            <motion.div
              className="flex items-center gap-2 text-neon-pink mb-2"
              animate={reduce ? undefined : { x: [0, 4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flame className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-widest">
                Trending Now
              </span>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
              Hot takes the internet
              <br />
              <span className="text-gradient">can&apos;t stop reading.</span>
            </h2>
          </div>
          <Link href="/blogs?sort=trending" className="hidden md:block">
            <motion.div whileHover={reduce ? undefined : { x: 4 }}>
              <Button variant="outline" className="gap-2">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {first && <BlogCard blog={first} variant="featured" />}
        {rest.map((b, i) => (
          <BlogCard key={b.id} blog={b} index={i + 1} />
        ))}
      </div>
    </section>
  );
}
