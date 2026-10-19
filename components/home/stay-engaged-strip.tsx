"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, Mail, PenSquare, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    icon: Bookmark,
    title: "Bookmarks",
    desc: "Save guides and articles to finish later",
    href: "/dashboard/bookmarks",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    desc: "See top readers and creators this week",
    href: "/leaderboard",
  },
  {
    icon: PenSquare,
    title: "Write",
    desc: "Publish an explainer on ContentVerse India",
    href: "/dashboard/create",
  },
  {
    icon: Mail,
    title: "Newsletter",
    desc: "One useful India explainer every Friday",
    href: "/#newsletter",
  },
] as const;

/** Light engagement row — bookmarks, leaderboard, write, newsletter. */
export function StayEngagedStrip() {
  return (
    <section
      id="stay-engaged"
      className="scroll-mt-[calc(var(--site-header-offset)+1rem)] border-y border-border/60 bg-muted/30"
    >
      <div className="container py-10 md:py-12">
        <div className="mb-6">
          <p className="v2-eyebrow">Keep exploring</p>
          <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Stay on ContentVerse India
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Save what you read, climb the board, or publish your own guide.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href} className="block h-full">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.05, duration: 0.45 }}
                  className="v2-raised v2-lift flex h-full flex-col p-5"
                >
                  <span className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="font-semibold">{card.title}</p>
                  <p className={cn("mt-1 text-xs leading-relaxed text-muted-foreground")}>
                    {card.desc}
                  </p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
