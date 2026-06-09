import type { ReactNode } from "react";
import { ArrowBigUp, MessageCircle, Star, ThumbsUp } from "lucide-react";
import type { FeedItemStats } from "@/lib/feeds/stats";

export function FeedItemStatsBar({ stats }: { stats: FeedItemStats }) {
  const items: { icon: ReactNode; label: string }[] = [];

  if (stats.points != null) {
    items.push({
      icon: <ArrowBigUp className="h-4 w-4 text-orange-500" />,
      label: `${stats.points.toLocaleString()} pts`,
    });
  }
  if (stats.comments != null) {
    items.push({
      icon: <MessageCircle className="h-4 w-4 text-neon-cyan" />,
      label: `${stats.comments.toLocaleString()} comments`,
    });
  }
  if (stats.votes != null) {
    items.push({
      icon: <ThumbsUp className="h-4 w-4 text-neon-pink" />,
      label: `${stats.votes.toLocaleString()} votes`,
    });
  }
  if (stats.upvotes != null) {
    items.push({
      icon: <ArrowBigUp className="h-4 w-4 text-orange-500" />,
      label: `${stats.upvotes.toLocaleString()} upvotes`,
    });
  }
  if (stats.stars != null) {
    items.push({
      icon: <Star className="h-4 w-4 text-amber-400" />,
      label: `${stats.stars.toLocaleString()} stars`,
    });
  }
  if (stats.rating != null) {
    items.push({
      icon: <Star className="h-4 w-4 text-amber-400" />,
      label: `${stats.rating.toFixed(1)} rating`,
    });
  }

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/90"
        >
          {item.icon}
          {item.label}
        </span>
      ))}
    </div>
  );
}
