"use client";

import Link from "next/link";
import { Trophy, BadgeCheck, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "@/components/profile/follow-button";
import type { LeaderboardEntry } from "@/lib/data/leaderboard";
import { formatNumber, getInitials } from "@/lib/utils";

export function LeaderboardView({ creators }: { creators: LeaderboardEntry[] }) {
  if (creators.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
        No creators on the board yet. Publish a blog to get ranked.
      </div>
    );
  }

  const podium = creators.slice(0, 3);
  const rest = creators.slice(3);

  return (
    <>
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10 items-end">
        {podium.map((c, i) => {
          const heights = ["h-48", "h-64", "h-40"];
          const order = [1, 0, 2];
          const idx = order[i];
          const ranked = podium[idx];
          if (!ranked) return null;
          const trophyColors = [
            "from-zinc-300 to-zinc-500",
            "from-yellow-400 to-orange-500",
            "from-amber-700 to-amber-900",
          ];
          return (
            <Link
              key={ranked.id}
              href={`/profile/${ranked.username}`}
              className="flex flex-col items-center group"
            >
              <Avatar className="h-14 w-14 md:h-20 md:w-20 border-2 border-background mb-3 group-hover:ring-2 group-hover:ring-neon-purple/50">
                <AvatarImage src={ranked.avatar} alt={ranked.name} />
                <AvatarFallback>{getInitials(ranked.name)}</AvatarFallback>
              </Avatar>
              <p className="font-semibold text-sm text-center group-hover:text-neon-purple transition-colors">
                {ranked.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(ranked.totalViews)} reads
              </p>
              <div
                className={`mt-2 w-full ${heights[i]} rounded-t-2xl bg-gradient-to-b ${trophyColors[idx]} flex items-center justify-center text-white font-display font-extrabold text-3xl`}
              >
                #{ranked.rank}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="space-y-3">
        {rest.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:border-neon-purple/40 transition-colors"
          >
            <span className="font-display text-2xl font-extrabold text-muted-foreground w-8 shrink-0">
              #{c.rank}
            </span>
            <Link href={`/profile/${c.username}`}>
              <Avatar className="hover:ring-2 hover:ring-neon-purple/40">
                <AvatarImage src={c.avatar} alt={c.name} />
                <AvatarFallback>{getInitials(c.name)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${c.username}`} className="hover:underline">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold truncate">{c.name}</p>
                  {c.verified && (
                    <BadgeCheck className="h-3.5 w-3.5 text-neon-cyan shrink-0" />
                  )}
                </div>
              </Link>
              <p className="text-xs text-muted-foreground">@{c.username}</p>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm shrink-0">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Followers</p>
                <p className="font-semibold">{formatNumber(c.followers)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Views</p>
                <p className="font-semibold">{formatNumber(c.totalViews)}</p>
              </div>
              <Badge variant="success" className="gap-1">
                <TrendingUp className="h-3 w-3" /> +{c.growth}%
              </Badge>
            </div>
            <FollowButton
              username={c.username}
              targetUserId={c.id}
              initialFollowerCount={c.followers}
              className="shrink-0"
            />
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8 flex items-center justify-center gap-1.5">
        <Trophy className="h-3.5 w-3.5" />
        Ranked by views, engagement, followers and published posts — updated live.
      </p>
    </>
  );
}
