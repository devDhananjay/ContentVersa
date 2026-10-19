"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Crown, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Blog } from "@/lib/data/blogs";
import { resolveBlogCoverImage } from "@/lib/upload";
import { formatNumber, getInitials, timeAgo } from "@/lib/utils";

type PickCard = {
  id: string;
  href: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  readingTime: number;
  views: number;
  publishedAt: string;
  author: { name: string; avatar?: string };
  isDemo?: boolean;
};

/** Offline / empty-DB fallback — real India guides, not fake blog slugs. */
const DEMO_PICKS: PickCard[] = [
  {
    id: "demo-sip",
    href: "/guides/money/sip-calculator-india-beginners-guide",
    title: "SIP for beginners — how much to start in India",
    excerpt:
      "A clear path from first SIP to habit: amount, tenure, and mistakes to skip.",
    coverImage: null,
    readingTime: 8,
    views: 12400,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    author: { name: "Editors" },
    isDemo: true,
  },
  {
    id: "demo-cibil",
    href: "/guides/money/credit-score-cibil-india-guide",
    title: "CIBIL / credit score: what actually moves it",
    excerpt:
      "What lenders look at, what myths waste time, and how to repair without panic.",
    coverImage: null,
    readingTime: 10,
    views: 9800,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    author: { name: "Editors" },
    isDemo: true,
  },
  {
    id: "demo-huid",
    href: "/guides/money/huid-hallmark-gold-buying-india",
    title: "HUID explained: verify hallmarked gold before you pay",
    excerpt:
      "Hallmark checklist, invoice traps, and how to verify HUID on the BIS app.",
    coverImage: null,
    readingTime: 7,
    views: 7600,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    author: { name: "Editors" },
    isDemo: true,
  },
];

function toCards(blogs: Blog[]): PickCard[] {
  return blogs.slice(0, 3).map((b) => ({
    id: b.id,
    href: `/blog/${b.slug}`,
    title: b.title,
    excerpt: b.excerpt,
    coverImage: b.coverImage,
    readingTime: b.readingTime,
    views: b.views,
    publishedAt: b.publishedAt,
    author: { name: b.author.name, avatar: b.author.avatar },
  }));
}

interface Props {
  blogs: Blog[];
}

export function EditorPick({ blogs }: Props) {
  const picks = blogs.length > 0 ? toCards(blogs) : DEMO_PICKS;

  return (
    <section
      id="editor-picks"
      className="container scroll-mt-[calc(var(--site-header-offset)+1rem)] py-12 md:py-16"
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="v2-eyebrow inline-flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5" />
            Editor&apos;s Pick
          </p>
          <h2 className="mt-1.5 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Curated by humans{" "}
            <span className="text-gradient italic">who actually read.</span>
          </h2>
        </div>
        <Link href={blogs.length ? "/blogs?sort=editor" : "/guides"} className="hidden sm:block">
          <Button variant="outline" className="gap-2 rounded-full">
            See all <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {picks.map((b, i) => (
          <motion.article
            key={b.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="v2-raised v2-lift group flex flex-col overflow-hidden"
          >
            <Link href={b.href} className="relative aspect-[16/10] shrink-0 bg-muted/50">
              {b.coverImage ? (
                <Image
                  src={resolveBlogCoverImage(b.coverImage)}
                  alt={b.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-accent/20" />
              )}
              <Badge
                variant="orange"
                className="absolute left-3 top-3 shadow-sm"
              >
                <Crown className="mr-1 h-3 w-3" /> Pick
              </Badge>
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <Link href={b.href}>
                <h3 className="font-display text-xl font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-primary">
                  {b.title}
                </h3>
              </Link>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                {b.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {b.author.avatar ? (
                      <AvatarImage src={b.author.avatar} alt={b.author.name} />
                    ) : null}
                    <AvatarFallback>{getInitials(b.author.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{b.author.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {timeAgo(b.publishedAt)} · {b.readingTime}m
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatNumber(b.views)} reads
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="mt-6 sm:hidden">
        <Link href={blogs.length ? "/blogs?sort=editor" : "/guides"}>
          <Button variant="gradient" className="w-full gap-2">
            See all picks <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
