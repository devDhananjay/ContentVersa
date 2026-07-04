"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import type { CategoryWithCount } from "@/lib/data/home-data";
import { categoryPageHref } from "@/lib/data/categories";
import { cn } from "@/lib/utils";

const TopCategoriesPicker = (icon: string) => {
  const C = (Lucide as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon];
  return C ?? Lucide.Hash;
};

interface Props {
  categories: CategoryWithCount[];
}

export function PopularCategories({ categories }: Props) {
  const list = categories.length > 0 ? categories : [];
  return (
    <section className="container py-12 md:py-20">
      <div className="text-center mb-10">
        <span className="text-sm font-semibold uppercase tracking-widest text-neon-cyan">
          Explore
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
          Find your <span className="text-gradient">corner of the internet</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mt-3">
          21 hand-curated categories with deeply engaged communities. Pick a vibe and dive in.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {list.map((cat, i) => {
          const Icon = TopCategoriesPicker(cat.icon);
          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={categoryPageHref(cat.slug)}
                className={cn(
                  "relative group flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl p-3 overflow-hidden border bg-card hover:border-transparent transition-all"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br",
                    cat.color
                  )}
                />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white",
                      cat.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-center group-hover:text-white transition-colors">
                    {cat.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
