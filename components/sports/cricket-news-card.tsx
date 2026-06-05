import Link from "next/link";
import Image from "next/image";
import { timeAgo } from "@/lib/utils";
import type { CricketNewsItem } from "@/lib/sports/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CricketNewsCardProps {
  item: CricketNewsItem;
  variant?: "default" | "compact";
}

export function CricketNewsCard({ item, variant = "default" }: CricketNewsCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/sports/news/${item.id}`}
        className="group snap-start shrink-0 w-[240px] flex gap-2.5 rounded-xl border bg-card p-2.5 hover:border-neon-purple/40 transition-colors"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">
              News
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {item.storyType && (
            <Badge variant="outline" className="text-[8px] px-1 py-0 mb-1">
              {item.storyType}
            </Badge>
          )}
          <h3 className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-neon-cyan transition-colors">
            {item.headline}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            {timeAgo(item.publishedAt)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/sports/news/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:border-neon-purple/40 hover:shadow-neon"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.headline}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-lime-500/20 to-green-500/20 text-sm text-muted-foreground">
            Cricket News
          </div>
        )}
        {item.storyType && (
          <Badge
            variant="neon"
            className="absolute top-3 left-3 bg-black/50 backdrop-blur"
          >
            {item.storyType}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {item.context && (
          <p className="text-[11px] uppercase tracking-wider text-neon-cyan mb-1">
            {item.context}
          </p>
        )}
        <h3 className="font-display text-lg font-bold leading-snug group-hover:text-gradient transition-colors line-clamp-2">
          {item.headline}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
          {item.intro}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {timeAgo(item.publishedAt)}
          {item.source ? ` · ${item.source}` : ""}
        </p>
      </div>
    </Link>
  );
}

interface CricketNewsStripProps {
  items: CricketNewsItem[];
  className?: string;
}

export function CricketNewsStrip({ items, className }: CricketNewsStripProps) {
  if (!items.length) return null;

  return (
    <div
      className={cn(
        "flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory",
        className
      )}
    >
      {items.map((item) => (
        <CricketNewsCard key={item.id} item={item} variant="compact" />
      ))}
    </div>
  );
}
