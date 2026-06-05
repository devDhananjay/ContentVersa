"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/profile/follow-button";
import type { TopWriterRow } from "@/lib/data/top-writers";
import { formatNumber, getInitials } from "@/lib/utils";

export function TopWritersPanel({ writers }: { writers: TopWriterRow[] }) {
  if (writers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No writers in this category yet. Be the first to publish.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {writers.map((w) => (
        <div key={w.id} className="flex items-center gap-3">
          <Link href={`/profile/${w.username}`} className="shrink-0">
            <Avatar className="hover:ring-2 hover:ring-neon-purple/40">
              <AvatarImage src={w.avatar} alt={w.name} />
              <AvatarFallback>{getInitials(w.name)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/profile/${w.username}`}
              className="text-sm font-semibold truncate block hover:underline"
            >
              {w.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {formatNumber(w.followers)} followers · {w.blogs} posts
            </p>
          </div>
          <FollowButton
            username={w.username}
            targetUserId={w.id}
            initialFollowerCount={w.followers}
            className="shrink-0"
          />
        </div>
      ))}
    </div>
  );
}
