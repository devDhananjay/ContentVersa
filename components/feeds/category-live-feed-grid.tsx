import { Radio } from "lucide-react";
import type { CategoryFeed } from "@/lib/feeds/types";
import { FeedItemCard } from "./feed-item-card";

interface CategoryLiveFeedGridProps {
  feed: CategoryFeed;
}

export function CategoryLiveFeedGrid({ feed }: CategoryLiveFeedGridProps) {
  return (
    <section className="mb-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-3 md:p-4">
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
          <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-500/90">
            Live now
          </span>
        </div>
        <h2 className="font-display text-base font-bold tracking-tight">
          {feed.title}
        </h2>
        <p className="text-[11px] text-muted-foreground">{feed.subtitle}</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {feed.items.map((item) => (
          <FeedItemCard key={item.id} item={item} category={feed.slug} />
        ))}
      </div>
    </section>
  );
}
