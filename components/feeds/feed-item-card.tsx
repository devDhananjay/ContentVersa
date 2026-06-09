import Link from "next/link";
import { feedItemPath } from "@/lib/feeds/paths";
import type { FeedItem } from "@/lib/feeds/types";
import { FeedItemImage } from "./feed-item-image";

interface FeedItemCardProps {
  item: FeedItem;
  category: string;
}

export function FeedItemCard({ item, category }: FeedItemCardProps) {
  return (
    <Link
      href={feedItemPath(category, item.id)}
      className="group flex flex-col overflow-hidden rounded-lg border border-border/50 bg-card/80 hover:border-neon-blue/30 transition-colors duration-200"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <FeedItemImage
          image={item.image}
          title={item.title}
          category={category}
          sizes="(min-width: 1024px) 12vw, 28vw"
          iconClassName="h-5 w-5"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col gap-0.5 p-2">
        <h3 className="text-[11px] font-semibold leading-tight line-clamp-2 group-hover:text-neon-blue transition-colors">
          {item.title}
        </h3>
        {item.meta ? (
          <p className="text-[9px] text-muted-foreground truncate">{item.meta}</p>
        ) : null}
      </div>
    </Link>
  );
}
