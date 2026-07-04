"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Eye, Heart, MessageCircle } from "lucide-react";
import { BookmarkButton } from "@/components/blog/bookmark-button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNumber, getInitials, timeAgo } from "@/lib/utils";
import { CATEGORIES } from "@/lib/data/categories";
import type { Blog } from "@/lib/data/blogs";
import { cn } from "@/lib/utils";
import { resolveBlogCoverImage, shouldSkipImageOptimization } from "@/lib/upload";

interface BlogCardProps {
  blog: Blog;
  variant?: "default" | "horizontal" | "compact" | "featured";
  index?: number;
  /** Skip scroll-triggered fade-in (use on listing pages). */
  eager?: boolean;
}

export function BlogCard({
  blog,
  variant = "default",
  index = 0,
  eager = false,
}: BlogCardProps) {
  const category = CATEGORIES.find((c) => c.slug === blog.category);
  const coverSrc = resolveBlogCoverImage(blog.coverImage);
  const coverUnoptimized = shouldSkipImageOptimization(coverSrc);

  if (variant === "featured") {
    return (
      <motion.article
        initial={eager ? false : { opacity: 0, y: 28, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.65, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -4 }}
        className="group relative col-span-2 row-span-2 overflow-hidden rounded-3xl border bg-card hover:shadow-neon transition-shadow duration-500"
      >
        <Link href={`/blog/${blog.slug}`} className="block">
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={coverSrc}
              alt={blog.title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              unoptimized={coverUnoptimized}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="gradient" className="shadow-lg">Featured</Badge>
              {category && (
                <Badge variant="neon" className="bg-black/40 backdrop-blur">
                  {category.name}
                </Badge>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <h2 className="font-display text-2xl md:text-4xl font-extrabold leading-tight tracking-tight mb-3 group-hover:text-gradient transition-all duration-300">
                {blog.title}
              </h2>
              <p className="text-sm md:text-base text-white/80 line-clamp-2 max-w-2xl mb-5">
                {blog.excerpt}
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white/20">
                  <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
                  <AvatarFallback>{getInitials(blog.author.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{blog.author.name}</p>
                  <p className="text-xs text-white/60 flex items-center gap-2">
                    <Clock className="h-3 w-3" /> {blog.readingTime} min read · {timeAgo(blog.publishedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === "horizontal") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className="group flex gap-4 rounded-2xl p-3 hover:bg-muted/40 transition-colors"
      >
        <Link href={`/blog/${blog.slug}`} className="relative shrink-0">
          <div className="relative h-24 w-24 md:h-28 md:w-28 overflow-hidden rounded-xl">
            <Image src={coverSrc} alt={blog.title} fill sizes="120px" className="object-cover" unoptimized={coverUnoptimized} />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            {category && (
              <Badge variant="secondary" className="text-[10px]">
                {category.name}
              </Badge>
            )}
            <span>{timeAgo(blog.publishedAt)}</span>
          </div>
          <Link href={`/blog/${blog.slug}`}>
            <h3 className="font-display font-semibold text-base leading-snug line-clamp-2 group-hover:text-gradient transition-colors">
              {blog.title}
            </h3>
          </Link>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {formatNumber(blog.views)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {formatNumber(blog.likes)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {blog.readingTime}m
            </span>
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/blog/${blog.slug}`}
        className="group flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image src={coverSrc} alt={blog.title} fill sizes="64px" className="object-cover" unoptimized={coverUnoptimized} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm line-clamp-2 leading-snug group-hover:text-foreground">
            {blog.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {blog.author.name} · {blog.readingTime}m
          </p>
        </div>
      </Link>
    );
  }

  return (
    <motion.article
      initial={eager ? false : { opacity: 0, y: 24 }}
      animate={eager ? { opacity: 1, y: 0 } : undefined}
      whileInView={eager ? undefined : { opacity: 1, y: 0 }}
      viewport={eager ? undefined : { once: true, margin: "-40px" }}
      transition={{
        duration: eager ? 0.2 : 0.5,
        delay: eager ? 0 : index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border bg-card hover:border-neon-purple/40 hover:shadow-neon transition-shadow duration-300"
    >
      <Link href={`/blog/${blog.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={coverSrc}
            alt={blog.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            unoptimized={coverUnoptimized}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-3 left-3 flex gap-2">
            {category && (
              <Badge
                className={cn(
                  "bg-gradient-to-r text-white border-0 shadow-lg",
                  category.color
                )}
              >
                {category.name}
              </Badge>
            )}
            {blog.premium && <Badge variant="orange">Premium</Badge>}
            {blog.trending && <Badge variant="pink">🔥 Trending</Badge>}
          </div>
          <BookmarkButton
            blogRef={blog.slug}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            iconClassName="h-4 w-4"
          />
        </div>

        <div className="p-5">
          <h3 className="font-display font-bold text-lg leading-snug line-clamp-2 mb-2 group-hover:text-gradient transition-all">
            {blog.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {blog.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
                <AvatarFallback>{getInitials(blog.author.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{blog.author.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {timeAgo(blog.publishedAt)} · {blog.readingTime}m
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {formatNumber(blog.views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> {formatNumber(blog.likes)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" /> {formatNumber(blog.comments)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
