"use client";

import Link from "next/link";
import { Eye, Film, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import type { ReelDashboardRow } from "@/lib/reels/types";

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Live",
  PENDING: "Pending",
  DRAFT: "Draft",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

interface MyReelsListProps {
  reels: ReelDashboardRow[];
}

export function MyReelsList({ reels }: MyReelsListProps) {
  if (reels.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center">
        <Film className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">You haven&apos;t created any reels yet.</p>
        <Link href="/dashboard/reels/create" className="mt-4 inline-block">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" /> Create Reel
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {reels.map((reel) => (
        <div key={reel.id} className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-muted border">
          {reel.mediaType === "VIDEO" ? (
            <video
              src={reel.mediaUrl}
              poster={reel.thumbnailUrl || undefined}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={reel.thumbnailUrl || reel.mediaUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
          <div className="absolute top-2 left-2">
            <Badge
              variant={reel.status === "PUBLISHED" ? "default" : "secondary"}
              className="text-[9px] h-5"
            >
              {STATUS_LABEL[reel.status] || reel.status}
            </Badge>
          </div>
          <div className="absolute bottom-0 inset-x-0 p-2.5 text-white">
            <p className="text-[10px] line-clamp-2 mb-1.5 opacity-90">{reel.caption}</p>
            <div className="flex items-center gap-3 text-[10px] font-medium">
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
          {reel.status === "PUBLISHED" && (
            <Link
              href={`/reels/${reel.id}`}
              className="absolute inset-0"
              aria-label="View reel"
            />
          )}
        </div>
      ))}
    </div>
  );
}
