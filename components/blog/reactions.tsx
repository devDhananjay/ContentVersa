"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Flame, Sparkles, ThumbsUp, Zap, Loader2 } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import type { ReactionTypeKey } from "@/lib/data/blog-engagement";

const REACTIONS = [
  { type: "LIKE" as const, Icon: ThumbsUp, color: "text-neon-blue", bg: "bg-neon-blue/10" },
  { type: "LOVE" as const, Icon: Heart, color: "text-neon-pink", bg: "bg-neon-pink/10" },
  { type: "FIRE" as const, Icon: Flame, color: "text-neon-orange", bg: "bg-neon-orange/10" },
  { type: "CLAP" as const, Icon: Zap, color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
  { type: "INSIGHTFUL" as const, Icon: Sparkles, color: "text-neon-purple", bg: "bg-neon-purple/10" },
];

type ReactionsProps = {
  blogRef: string;
  initialCount: number;
  initialUserReaction?: ReactionTypeKey | null;
};

export function Reactions({
  blogRef,
  initialCount,
  initialUserReaction = null,
}: ReactionsProps) {
  const router = useRouter();
  const [active, setActive] = React.useState<ReactionTypeKey | null>(initialUserReaction);
  const [count, setCount] = React.useState(initialCount);
  const [loading, setLoading] = React.useState<ReactionTypeKey | null>(null);

  const onToggle = async (type: ReactionTypeKey) => {
    setLoading(type);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(blogRef)}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
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
        throw new Error(data.error || "Could not save reaction");
      }
      setActive(data.userReaction ?? null);
      setCount(data.totalReactions ?? count);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Reaction failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2">
        {REACTIONS.map(({ type, Icon, color, bg }) => {
          const isActive = active === type;
          const isLoading = loading === type;
          return (
            <motion.button
              key={type}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => onToggle(type)}
              disabled={!!loading}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors disabled:opacity-60",
                isActive ? `${bg} ${color}` : "bg-muted/40 text-muted-foreground hover:text-foreground"
              )}
              aria-label={`React ${type.toLowerCase()}`}
              aria-pressed={isActive}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <AnimatePresence>
                {isActive && !isLoading && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={cn(
                      "absolute -top-7 text-[10px] font-bold uppercase tracking-wider",
                      color
                    )}
                  >
                    +1
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <div className="text-sm">
        <span className="font-bold text-foreground">{formatNumber(count)}</span>{" "}
        <span className="text-muted-foreground">reactions</span>
      </div>
    </div>
  );
}
