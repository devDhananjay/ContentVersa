"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Hash, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

import type { WeeklyTopic } from "@/lib/data/home-data";

interface Props {
  topics: WeeklyTopic[];
}

export function WeeklyTrending({ topics }: Props) {
  return (
    <section className="container py-12 md:py-20">
      <div className="rounded-3xl border bg-card p-6 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 grid-noise opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-2 text-neon-pink mb-2">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">
              Weekly Trending Topics
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-8">
            What the internet is <span className="text-gradient">talking about</span>
          </h2>

          <div className="flex flex-wrap gap-3">
            {topics.map((topic, i) => (
              <motion.div
                key={topic.tag}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  href={`/blogs?tag=${topic.tag}`}
                  className={cn(
                    "group inline-flex items-center gap-2 px-4 py-3 rounded-2xl border bg-background hover:border-transparent transition-all relative overflow-hidden"
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r transition-opacity",
                      topic.color
                    )}
                  />
                  <Hash className="relative h-4 w-4 text-muted-foreground group-hover:text-white" />
                  <span className="relative font-semibold text-sm group-hover:text-white">
                    {topic.tag}
                  </span>
                  <span className="relative text-xs text-muted-foreground group-hover:text-white/80">
                    {topic.count}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
