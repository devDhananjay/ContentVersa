"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { BookmarkButton } from "@/components/blog/bookmark-button";
import type { ReactionTypeKey } from "@/lib/data/blog-engagement";

export function FloatingActions({
  blogRef,
  likes,
  initialBookmarked = false,
  initialUserReaction = null,
}: {
  blogRef: string;
  likes: number;
  initialBookmarked?: boolean;
  initialUserReaction?: ReactionTypeKey | null;
}) {
  const [liked, setLiked] = React.useState(initialUserReaction === "LIKE");
  const [likeCount, setLikeCount] = React.useState(likes);
  const [loading, setLoading] = React.useState(false);

  const toggleLike = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(blogRef)}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "LIKE" }),
      });
      const data = (await res.json()) as {
        totalReactions?: number;
        userReaction?: ReactionTypeKey | null;
        error?: string;
      };
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/auth/sign-in?next=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        throw new Error(data.error || "Could not like");
      }
      setLiked(data.userReaction === "LIKE");
      setLikeCount(data.totalReactions ?? likeCount);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Like failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="hidden xl:flex flex-col items-center gap-2 fixed left-6 top-1/2 -translate-y-1/2 z-30 p-2 rounded-2xl border bg-card/80 backdrop-blur"
    >
      <button
        type="button"
        onClick={toggleLike}
        disabled={loading}
        className={cn(
          "group flex flex-col items-center gap-1 p-2 rounded-xl transition-all disabled:opacity-50",
          liked ? "text-neon-pink bg-neon-pink/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        )}
        aria-label="Like article"
        aria-pressed={liked}
      >
        <Heart className={cn("h-5 w-5", liked && "fill-current")} />
        <span className="text-[10px] font-semibold">{formatNumber(likeCount)}</span>
      </button>
      <a
        href="#comments"
        className="group flex flex-col items-center gap-1 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
        aria-label="Jump to comments"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-[10px] font-semibold">Reply</span>
      </a>
      <BookmarkButton
        blogRef={blogRef}
        initialBookmarked={initialBookmarked}
        className="flex-col gap-1 p-2 rounded-xl hover:bg-muted/40"
        iconClassName="h-5 w-5"
        showLabel
      />
      <button
        type="button"
        className="group flex flex-col items-center gap-1 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
        aria-label="Share article"
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title: document.title, url: window.location.href }).catch(() => {});
          } else {
            navigator.clipboard.writeText(window.location.href);
          }
        }}
      >
        <Share2 className="h-5 w-5" />
        <span className="text-[10px] font-semibold">Share</span>
      </button>
    </motion.div>
  );
}
