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

interface Props {
  blogs: Blog[];
}

export function EditorPick({ blogs: picks }: Props) {
  return (
    <section className="container py-12 md:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-neon-orange mb-2">
            <Crown className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">
              Editor&apos;s Pick
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Curated by humans <span className="text-gradient">who actually read.</span>
          </h2>
        </div>
        <Link href="/blogs?sort=editor" className="hidden md:block">
          <Button variant="outline" className="gap-2">
            See all <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {picks.map((b, i) => (
          <motion.article
            key={b.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="group relative flex flex-col sm:flex-row gap-4 p-4 rounded-3xl border bg-card hover:border-neon-orange/40 transition-all"
          >
            <Link href={`/blog/${b.slug}`} className="shrink-0">
              <div className="relative aspect-video sm:aspect-square sm:h-48 sm:w-48 overflow-hidden rounded-2xl">
                <Image src={resolveBlogCoverImage(b.coverImage)} alt={b.title} fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <Badge variant="orange" className="absolute top-2 left-2">
                  <Crown className="h-3 w-3 mr-1" /> Pick
                </Badge>
              </div>
            </Link>
            <div className="flex-1 min-w-0 flex flex-col">
              <Link href={`/blog/${b.slug}`}>
                <h3 className="font-display font-bold text-xl leading-snug mb-2 group-hover:text-gradient transition-colors line-clamp-2">
                  {b.title}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                {b.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={b.author.avatar} alt={b.author.name} />
                    <AvatarFallback>{getInitials(b.author.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium">{b.author.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {timeAgo(b.publishedAt)} · {b.readingTime}m
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(b.views)} reads
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
