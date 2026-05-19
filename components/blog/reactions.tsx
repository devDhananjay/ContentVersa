"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Flame, Sparkles, ThumbsUp, Zap } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

const REACTIONS = [
  { type: "LIKE", Icon: ThumbsUp, color: "text-neon-blue", bg: "bg-neon-blue/10" },
  { type: "LOVE", Icon: Heart, color: "text-neon-pink", bg: "bg-neon-pink/10" },
  { type: "FIRE", Icon: Flame, color: "text-neon-orange", bg: "bg-neon-orange/10" },
  { type: "CLAP", Icon: Zap, color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
  { type: "INSIGHTFUL", Icon: Sparkles, color: "text-neon-purple", bg: "bg-neon-purple/10" },
];

export function Reactions({ initialCount }: { initialCount: number }) {
  const [active, setActive] = React.useState<string | null>(null);
  const [count, setCount] = React.useState(initialCount);

  const onToggle = (type: string) => {
    if (active === type) {
      setActive(null);
      setCount((c) => c - 1);
    } else {
      if (!active) setCount((c) => c + 1);
      setActive(type);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2">
        {REACTIONS.map(({ type, Icon, color, bg }) => {
          const isActive = active === type;
          return (
            <motion.button
              key={type}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => onToggle(type)}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                isActive ? `${bg} ${color}` : "bg-muted/40 text-muted-foreground hover:text-foreground"
              )}
              aria-label={`React ${type.toLowerCase()}`}
            >
              <Icon className="h-4 w-4" />
              <AnimatePresence>
                {isActive && (
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
