"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { CategoryWithCount } from "@/lib/data/home-data";
import { categoryPageHref } from "@/lib/data/categories";

const ROTATING_WORDS = ["Read.", "Create.", "Grow.", "Earn.", "Build."];

interface Props {
  categories: CategoryWithCount[];
  stats: { creators: string; readers: string; paid: string };
}

export function Hero({ categories, stats }: Props) {
  const [wordIndex, setWordIndex] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(
      () => setWordIndex((i) => (i + 1) % ROTATING_WORDS.length),
      2200
    );
    return () => clearInterval(t);
  }, []);

  const quickCategories = categories.slice(0, 8);

  return (
    <section className="relative overflow-hidden">
      <div className="container relative pt-6 md:pt-10 pb-20 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <Badge
            variant="neon"
            className="mb-6 py-1.5 px-4 text-xs gap-1.5 border-neon-cyan/30 bg-neon-cyan/5"
          >
            <Sparkles className="h-3 w-3" />
            Welcome to ContentVerse v1.0 · Now with AI Assist
          </Badge>

          <h1 className="font-display font-extrabold tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] max-w-5xl">
            The home for{" "}
            <span className="text-gradient inline-block">
              <motion.span
                key={wordIndex}
                initial={{ opacity: 0, y: 20, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -20, rotateX: 90 }}
                transition={{ duration: 0.4 }}
                className="inline-block min-w-[3ch]"
              >
                {ROTATING_WORDS[wordIndex]}
              </motion.span>
            </span>
            <br />
            <span className="text-foreground">creators of the new internet.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
            ContentVerse is where bold writers, builders, and thinkers publish, grow an audience, and actually get paid for their work.
          </p>

          <form
            action="/blogs"
            className="mt-10 w-full max-w-2xl relative"
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search ‘AI agents’, ‘growth loops’, ‘TypeScript’…"
                className="h-16 pl-14 pr-32 text-base rounded-2xl shadow-glow bg-card/80 backdrop-blur"
              />
              <Button
                variant="gradient"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-12 rounded-xl"
              >
                Search
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2">
              Trending now
            </span>
            {quickCategories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  href={categoryPageHref(cat.slug)}
                  className="text-xs rounded-full border border-border/60 px-3 py-1.5 hover:border-neon-purple/60 hover:text-foreground text-muted-foreground transition-colors backdrop-blur"
                >
                  #{cat.name}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            <Link href="/dashboard/create">
              <Button variant="gradient" size="xl" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Start Writing
              </Button>
            </Link>
            <Link href="/blogs">
              <Button variant="outline" size="xl" className="gap-2">
                <TrendingUp className="h-5 w-5" />
                Explore Articles
              </Button>
            </Link>
          </div>

          {[
            { value: stats.creators, label: "Published creators" },
            { value: stats.readers, label: "Article reads" },
            { value: stats.paid, label: "Paid to creators" },
          ].filter((stat) => stat.value !== "—").length > 0 && (
          <div className="mt-16 grid grid-cols-3 gap-8 md:gap-16">
            {[
              { value: stats.creators, label: "Published creators" },
              { value: stats.readers, label: "Article reads" },
              { value: stats.paid, label: "Paid to creators" },
            ]
              .filter((stat) => stat.value !== "—")
              .map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-extrabold text-2xl md:text-4xl text-gradient">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
