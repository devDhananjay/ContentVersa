import Link from "next/link";
import { getMatchScoreSummary } from "@/lib/sports/transformers";
import type { SportMatch } from "@/lib/sports/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CompactMatchCardProps {
  match: SportMatch;
}

export function CompactMatchCard({ match }: CompactMatchCardProps) {
  const scores = getMatchScoreSummary(match);
  const hasScores = scores.team1 !== "—" || scores.team2 !== "—";

  return (
    <Link
      href={`/sports/match/${match.id}`}
      className={cn(
        "block snap-start shrink-0 w-[260px] rounded-2xl border bg-card p-4 transition-colors hover:border-neon-cyan/40 hover:shadow-sm",
        match.isLive && "border-red-500/30 bg-red-500/5"
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {match.format}
        </Badge>
        {match.isLive ? (
          <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 animate-pulse">
            LIVE
          </Badge>
        ) : (
          <span className="text-[10px] text-muted-foreground truncate max-w-[55%]">
            {match.stateTitle || match.state}
          </span>
        )}
      </div>

      <p className="text-sm font-bold">
        {match.team1.shortName}{" "}
        <span className="text-muted-foreground font-normal text-xs">vs</span>{" "}
        {match.team2.shortName}
      </p>

      {hasScores && (
        <p className="mt-1.5 text-[11px] font-mono text-foreground/80 truncate">
          {scores.team1} · {scores.team2}
        </p>
      )}

      <p className="mt-2 text-[11px] text-neon-cyan line-clamp-2 leading-snug">
        {match.status}
      </p>

      <p className="mt-2 text-[10px] text-muted-foreground line-clamp-1">
        {match.matchDesc}
      </p>
    </Link>
  );
}
