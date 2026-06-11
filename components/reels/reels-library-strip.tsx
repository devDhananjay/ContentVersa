"use client";

import Link from "next/link";
import { Eye, Heart, Play } from "lucide-react";
import { CreateReelCardLink } from "@/components/reels/create-reel-card";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";
import type { ReelDashboardRow } from "@/lib/reels/types";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "LIVE", className: "bg-emerald-500/95 text-white" },
  PENDING: { label: "PENDING", className: "bg-orange-500/95 text-white" },
  DRAFT: { label: "DRAFT", className: "bg-muted-foreground/90 text-white" },
  REJECTED: { label: "REJECTED", className: "bg-red-500/95 text-white" },
  ARCHIVED: { label: "ARCHIVED", className: "bg-muted-foreground/90 text-white" },
};

interface ReelsLibraryStripProps {
  reels: ReelDashboardRow[];
  title?: string;
  showManageLink?: boolean;
}

export function ReelsLibraryStrip({
  reels,
  title = "Your library",
  showManageLink = false,
}: ReelsLibraryStripProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {showManageLink && reels.length > 0 && (
          <Link href="/dashboard/reels" className="text-xs text-neon-pink hover:underline">
            Manage all →
          </Link>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        <CreateReelCard />
        {reels.map((reel) => (
          <ReelLibraryCard key={reel.id} reel={reel} />
        ))}
      </div>
    </div>
  );
}

export function CreateReelCard() {
  return <CreateReelCardLink variant="library" />;
}

export function ReelLibraryCard({ reel }: { reel: ReelDashboardRow }) {
  const thumb = reel.thumbnailUrl || reel.mediaUrl;
  const isLive = reel.status === "PUBLISHED";
  const href = isLive ? `/reels/${reel.id}` : "/dashboard/reels";
  const badge = STATUS_BADGE[reel.status] ?? {
    label: reel.status,
    className: "bg-amber-500/95 text-white",
  };

  return (
    <Link href={href} className="shrink-0 group w-[130px]">
      <div className="relative w-[130px] h-[220px] rounded-2xl overflow-hidden bg-muted border border-border/50 shadow-md group-hover:ring-2 group-hover:ring-neon-pink/40 transition-all">
        {reel.mediaType === "VIDEO" ? (
          <video
            src={reel.mediaUrl}
            poster={thumb}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

        {reel.mediaType === "VIDEO" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-5 w-5 text-white fill-white" />
          </div>
        )}

        <Badge
          className={cn(
            "absolute top-2 left-2 text-[9px] h-5 px-2 font-bold border-0 uppercase tracking-wide",
            badge.className
          )}
        >
          {badge.label}
        </Badge>

        <div className="absolute bottom-0 inset-x-0 p-2.5">
          <p className="text-[10px] text-white/95 line-clamp-2 leading-snug mb-1.5 font-medium">
            {reel.caption}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-white font-medium">
            <span className="flex items-center gap-0.5">
              <Eye className="h-3 w-3" />
              {formatNumber(reel.views)}
            </span>
            <span className="flex items-center gap-0.5">
              <Heart className="h-3 w-3" />
              {formatNumber(reel.likesCount)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
