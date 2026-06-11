"use client";

import * as React from "react";
import Link from "next/link";
import { Film, Plus } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import type { ReelItem } from "@/lib/reels/types";
import {
  getLocallyViewedReelIds,
  REEL_VIEWED_EVENT,
} from "@/lib/reels/viewed-local";

/** Instagram-style vertical preview in the header strip */
const PREVIEW_W = 88;
const PREVIEW_H = 150;
const FRAME_W = PREVIEW_W + 5;
const FRAME_H = PREVIEW_H + 5;
const FRAME_RADIUS = "calc(var(--reel-preview-radius) + 2px)";
const STRIP_ITEM_W = 92;

function mergeViewedIds(...groups: string[][]) {
  return new Set(groups.flat());
}

interface ReelsStripCarouselProps {
  reels: ReelItem[];
  viewedReelIds?: string[];
}

/** Reels story strip — aligned with page container, below the market ticker. */
export function ReelsStripCarousel({ reels, viewedReelIds = [] }: ReelsStripCarouselProps) {
  const [viewedSet, setViewedSet] = React.useState(() =>
    mergeViewedIds(viewedReelIds, getLocallyViewedReelIds())
  );

  const syncViewed = React.useCallback(async () => {
    const local = getLocallyViewedReelIds();
    let remote: string[] = [];

    if (reels.length > 0) {
      const params = new URLSearchParams({ ids: reels.map((r) => r.id).join(",") });
      const visitorKey = localStorage.getItem("cv_reel_visitor");
      if (visitorKey) params.set("visitorKey", visitorKey);

      try {
        const res = await fetch(`/api/reels/viewed?${params.toString()}`, {
          credentials: "include",
        });
        const data = (await res.json()) as { viewedIds?: string[] };
        remote = data.viewedIds ?? [];
      } catch {
        /* ignore */
      }
    }

    setViewedSet(mergeViewedIds(viewedReelIds, local, remote));
  }, [reels, viewedReelIds]);

  React.useEffect(() => {
    void syncViewed();
  }, [syncViewed]);

  React.useEffect(() => {
    const onViewed = () => {
      setViewedSet((prev) => mergeViewedIds([...prev], getLocallyViewedReelIds()));
    };
    const onFocus = () => {
      void syncViewed();
    };

    window.addEventListener(REEL_VIEWED_EVENT, onViewed);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      window.removeEventListener(REEL_VIEWED_EVENT, onViewed);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [syncViewed]);

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
          <div className="flex items-start gap-4 reels-strip-scroll">
            <CreateReelBubble />
            {reels.map((reel) => (
              <ReelStoryBubble key={reel.id} reel={reel} viewed={viewedSet.has(reel.id)} />
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

function StripItemShell({
  href,
  title,
  label,
  children,
}: {
  href: string;
  title?: string;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
      className="shrink-0 flex flex-col items-center gap-2 group"
      style={{ width: STRIP_ITEM_W }}
    >
      {children}
      <span className="text-[9px] font-medium w-full truncate text-center leading-tight h-[14px] text-foreground/90">
        {label ?? "\u00A0"}
      </span>
    </Link>
  );
}

function PreviewFrame({
  children,
  viewed,
}: {
  children: React.ReactNode;
  viewed?: boolean;
}) {
  return (
    <div
      className={cn(
        "shrink-0 shadow-md",
        viewed
          ? "p-[2.5px] bg-[#5c5c66]"
          : "p-[2.5px] bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]"
      )}
      style={{
        width: FRAME_W,
        height: FRAME_H,
        borderRadius: FRAME_RADIUS,
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
    <StripItemShell href="/dashboard/reels/create">
      <div
        className="shrink-0 p-[2.5px]"
        style={{
          width: FRAME_W,
          height: FRAME_H,
          borderRadius: FRAME_RADIUS,
        }}
      >
        <div
          className={cn(
            "relative w-full h-full flex flex-col items-center justify-center overflow-hidden",
            "border-2 border-dashed border-neon-pink/60 bg-[#0a0a0c]",
            "group-hover:border-neon-pink/90 transition-colors"
          )}
          style={{ borderRadius: "var(--reel-preview-radius)" }}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -top-6 -left-6 h-20 w-20 rounded-full bg-neon-purple/20 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-neon-pink/15 blur-2xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1 px-2 text-center">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center shadow-md shadow-neon-pink/25">
              <Plus className="h-4 w-4 text-white stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-semibold text-white leading-tight">Create Reel</span>
            <span className="text-[8px] text-muted-foreground leading-tight">Video or image</span>
          </div>
        </div>
      </div>
    </StripItemShell>
  );
}

function ReelStoryBubble({ reel, viewed }: { reel: ReelItem; viewed?: boolean }) {
  const thumb = reel.thumbnailUrl || reel.mediaUrl;

  return (
    <StripItemShell
      href={`/reels/${reel.id}`}
      title={`@${reel.author.username} · ${formatNumber(reel.views)} views`}
      label={reel.author.username}
    >
      <PreviewFrame viewed={viewed}>
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
    </StripItemShell>
  );
}
