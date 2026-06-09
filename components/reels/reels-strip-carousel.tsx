"use client";

import Link from "next/link";
import { Film, Plus } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import type { ReelItem } from "@/lib/reels/types";

/** Instagram-style vertical preview in the header strip */
const PREVIEW_W = 88;
const PREVIEW_H = 150;

interface ReelsStripCarouselProps {
  reels: ReelItem[];
}

/** Reels story strip — aligned with page container, below the market ticker. */
export function ReelsStripCarousel({ reels }: ReelsStripCarouselProps) {
  return (
    <div className="border-b border-border/30 bg-transparent">
      <div className="container flex items-stretch">
        <div className="shrink-0 flex flex-col justify-center gap-1.5 pr-5 py-[var(--reels-strip-py)] border-r border-border/25 min-w-[88px] self-stretch">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-neon-pink shrink-0" />
            <span className="text-xs font-bold">Reels</span>
          </div>
          <Link href="/reels" className="text-[10px] font-medium text-neon-pink hover:underline">
            See all →
          </Link>
        </div>

        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          <div className="flex items-end gap-4 reels-strip-scroll">
            <CreateReelBubble />
            {reels.map((reel) => (
              <ReelStoryBubble key={reel.id} reel={reel} />
            ))}
            {reels.length === 0 && (
              <p className="text-xs text-muted-foreground whitespace-nowrap self-center">
                Create the first reel →
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewFrame({
  children,
  dashed,
}: {
  children: React.ReactNode;
  dashed?: boolean;
}) {
  return (
    <div
      className={cn(
        "shrink-0 p-[2.5px] shadow-md",
        dashed
          ? "bg-gradient-to-br from-muted-foreground/40 to-muted-foreground/15"
          : "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]"
      )}
      style={{
        width: PREVIEW_W + 5,
        height: PREVIEW_H + 5,
        borderRadius: "calc(var(--reel-preview-radius) + 2px)",
      }}
    >
      <div
        className="w-full h-full overflow-hidden bg-background ring-1 ring-black/10"
        style={{ borderRadius: "var(--reel-preview-radius)" }}
      >
        {children}
      </div>
    </div>
  );
}

function CreateReelBubble() {
  return (
    <Link
      href="/dashboard/reels/create"
      className="shrink-0 flex flex-col items-center gap-2 w-[92px] group"
    >
      <PreviewFrame dashed>
        <div className="w-full h-full bg-muted/40 flex items-center justify-center group-hover:bg-muted/60 transition-colors">
          <Plus className="h-6 w-6 text-neon-pink" />
        </div>
      </PreviewFrame>
      <span className="text-[9px] font-semibold text-muted-foreground group-hover:text-foreground truncate w-full text-center">
        Create
      </span>
    </Link>
  );
}

function ReelStoryBubble({ reel }: { reel: ReelItem }) {
  const thumb = reel.thumbnailUrl || reel.mediaUrl;

  return (
    <Link
      href={`/reels/${reel.id}`}
      className="shrink-0 flex flex-col items-center gap-2 w-[92px] group"
      title={`@${reel.author.username} · ${formatNumber(reel.views)} views`}
    >
      <PreviewFrame>
        <div className="relative w-full h-full bg-muted">
          {reel.mediaType === "VIDEO" ? (
            <video
              src={reel.mediaUrl}
              poster={thumb}
              className="w-full h-full object-cover rounded-[var(--reel-preview-radius)]"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={reel.author.username}
              className="w-full h-full object-cover rounded-[var(--reel-preview-radius)]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>
      </PreviewFrame>
      <span className="text-[9px] font-medium w-full truncate text-center leading-tight">
        {reel.author.username}
      </span>
    </Link>
  );
}
