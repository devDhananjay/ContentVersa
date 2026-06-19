"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Repeat2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { CommunityPost } from "@/lib/data/home-data";

interface Props {
  posts: CommunityPost[];
}

function PostCard({ p, index }: { p: CommunityPost; index: number }) {
  const router = useRouter();
  const [likes, setLikes] = React.useState(p.likes);
  const [liked, setLiked] = React.useState(false);
  const [reposts, setReposts] = React.useState(p.reposts);
  const [reposted, setReposted] = React.useState(p.userReposted);
  const [busy, setBusy] = React.useState(false);
  const [repostBusy, setRepostBusy] = React.useState(false);
  const blogUrl = `/blog/${p.slug}`;

  const onLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(p.slug)}/reactions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "LIKE" }),
      });
      if (res.status === 401) {
        router.push(`/auth/sign-in?next=${encodeURIComponent(blogUrl)}`);
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as { userReaction?: string | null; totalReactions?: number };
        const nowLiked = Boolean(data.userReaction);
        setLiked(nowLiked);
        if (typeof data.totalReactions === "number") setLikes(data.totalReactions);
        else setLikes((n) => (nowLiked ? n + 1 : Math.max(0, n - 1)));
      }
    } catch {
      router.push(blogUrl);
    } finally {
      setBusy(false);
    }
  };

  const onRepost = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (repostBusy) return;
    setRepostBusy(true);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(p.slug)}/repost`, {
        method: "POST",
        credentials: "include",
      });
      if (res.status === 401) {
        router.push(`/auth/sign-in?next=${encodeURIComponent(blogUrl)}`);
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as { reposted?: boolean; repostCount?: number };
        if (typeof data.reposted === "boolean") setReposted(data.reposted);
        if (typeof data.repostCount === "number") setReposts(data.repostCount);
      }
    } catch {
      router.push(blogUrl);
    } finally {
      setRepostBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={blogUrl}
        className="block p-5 rounded-2xl border bg-card hover:border-neon-purple/40 hover:shadow-neon transition-all"
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            {p.author.avatar ? (
              <AvatarImage src={p.author.avatar} alt={p.author.name} />
            ) : null}
            <AvatarFallback>{getInitials(p.author.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">{p.author.name}</p>
              <p className="text-xs text-muted-foreground">
                @{p.author.username} · {p.time}
              </p>
              {p.tag && (
                <Badge variant="neon" className="text-[10px]">
                  #{p.tag}
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90 line-clamp-4">
              {p.content}
            </p>
            <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={onLike}
                className={`flex items-center gap-1.5 transition-colors ${
                  liked ? "text-neon-pink" : "hover:text-neon-pink"
                }`}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 ${liked ? "fill-neon-pink" : ""}`} />
                )}
                {likes}
              </button>
              <span
                className="flex items-center gap-1.5 hover:text-neon-blue transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`${blogUrl}#comments`);
                }}
              >
                <MessageCircle className="h-4 w-4" /> {p.comments}
              </span>
              <button
                type="button"
                onClick={onRepost}
                className={`flex items-center gap-1.5 transition-colors ${
                  reposted ? "text-neon-green" : "hover:text-neon-green"
                }`}
                title="Repost"
              >
                {repostBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Repeat2 className={`h-4 w-4 ${reposted ? "text-neon-green" : ""}`} />
                )}
                {reposts}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function CommunityPosts({ posts }: Props) {
  return (
    <section className="container py-12 md:py-20">
      <div className="text-center mb-10">
        <span className="text-sm font-semibold uppercase tracking-widest text-neon-cyan">
          Community
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
          Short reads, sharp takes
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mt-3">
          What creators are dropping today — micro essays, breakdowns and arguments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((p, i) => (
          <PostCard key={p.slug} p={p} index={i} />
        ))}
      </div>
    </section>
  );
}
