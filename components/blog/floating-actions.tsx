"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingActions({ likes }: { likes: number }) {
  const [liked, setLiked] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="hidden xl:flex flex-col items-center gap-2 fixed left-6 top-1/2 -translate-y-1/2 z-30 p-2 rounded-2xl border bg-card/80 backdrop-blur"
    >
      <button
        onClick={() => setLiked((v) => !v)}
        className={cn(
          "group flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
          liked ? "text-neon-pink bg-neon-pink/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        )}
        aria-label="Like article"
      >
        <Heart className={cn("h-5 w-5", liked && "fill-current")} />
        <span className="text-[10px] font-semibold">{liked ? likes + 1 : likes}</span>
      </button>
      <a
        href="#comments"
        className="group flex flex-col items-center gap-1 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
        aria-label="Jump to comments"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-[10px] font-semibold">Reply</span>
      </a>
      <button
        onClick={() => setSaved((v) => !v)}
        className={cn(
          "group flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
          saved ? "text-neon-cyan bg-neon-cyan/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        )}
        aria-label="Bookmark article"
      >
        <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
        <span className="text-[10px] font-semibold">Save</span>
      </button>
      <button
        className="group flex flex-col items-center gap-1 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
        aria-label="Share article"
      >
        <Share2 className="h-5 w-5" />
        <span className="text-[10px] font-semibold">Share</span>
      </button>
    </motion.div>
  );
}
