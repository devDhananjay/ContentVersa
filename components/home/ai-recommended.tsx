"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Blog } from "@/lib/data/blogs";

interface Props {
  blogs: Blog[];
}

export function AIRecommended({ blogs: picks }: Props) {
  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/[0.04] to-transparent" />
      </div>

      <div className="container">
        <div className="relative rounded-3xl border bg-gradient-to-br from-neon-blue/5 via-neon-purple/5 to-neon-pink/5 backdrop-blur p-6 md:p-10 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-neon-purple/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-neon-blue/20 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <Badge variant="gradient" className="mb-3 gap-1.5">
                <Sparkles className="h-3 w-3" /> AI Recommended For You
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                Hand-picked by our model.
                <br />
                <span className="text-gradient">Tuned to your taste.</span>
              </h2>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Reads our AI thinks you&apos;ll love based on what you&apos;ve been reading and what&apos;s breaking out across the platform.
              </p>
            </div>
            <Link href="/blogs?sort=recommended">
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" /> Tune recommendations
              </Button>
            </Link>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {picks.map((b, i) => (
              <BlogCard key={b.id} blog={b} index={i} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
