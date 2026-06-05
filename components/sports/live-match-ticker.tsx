"use client";

import Link from "next/link";
import { MatchCard } from "@/components/sports/match-card";
import type { SportMatch } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

interface LiveMatchTickerProps {
  matches: SportMatch[];
}

export function LiveMatchTicker({ matches }: LiveMatchTickerProps) {
  const live = matches.filter((m) => m.isLive);
  if (!live.length) return null;

  return (
    <div className="border-b border-red-500/20 bg-red-500/5">
      <div className="container py-2">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="shrink-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-500">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Live
          </span>
          {live.map((match) => (
            <Link
              key={match.id}
              href={`/sports/match/${match.id}`}
              className={cn(
                "shrink-0 rounded-full border border-border/60 bg-background/80 px-3 py-1.5",
                "text-xs hover:border-red-500/40 transition-colors"
              )}
            >
              <span className="font-semibold">{match.team1.shortName}</span>
              <span className="mx-1.5 text-muted-foreground">vs</span>
              <span className="font-semibold">{match.team2.shortName}</span>
              <span className="ml-2 text-muted-foreground hidden sm:inline">
                · {match.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
