import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMatchScoreSummary, cricbuzzImageUrl } from "@/lib/sports/transformers";
import type { SportMatch } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: SportMatch;
  compact?: boolean;
}

export function MatchCard({ match, compact = false }: MatchCardProps) {
  const scores = getMatchScoreSummary(match);
  const team1Img = cricbuzzImageUrl(match.team1.imageId, "64x64");
  const team2Img = cricbuzzImageUrl(match.team2.imageId, "64x64");
  const matchLabel = `${match.team1.shortName} vs ${match.team2.shortName}`;

  return (
    <Link
      href={`/sports/match/${match.id}`}
      aria-label={`View match: ${matchLabel}`}
      className={cn(
        "block rounded-2xl border bg-card p-4 transition-all hover:border-neon-cyan/40 hover:shadow-neon",
        compact && "h-auto self-start",
        match.isLive && "border-red-500/30 bg-red-500/5"
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
          {match.format}
        </Badge>
        {match.isLive ? (
          <Badge className="bg-red-500 text-white animate-pulse gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            LIVE
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground truncate max-w-[50%]">
            {match.stateTitle || match.state}
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
        {match.seriesName} · {match.matchDesc}
      </p>

      <div className="space-y-2.5">
        <TeamRow
          name={match.team1.shortName}
          score={scores.team1}
          imageUrl={team1Img}
          compact={compact}
        />
        <TeamRow
          name={match.team2.shortName}
          score={scores.team2}
          imageUrl={team2Img}
          compact={compact}
        />
      </div>

      <p className="mt-3 text-xs text-neon-cyan line-clamp-2">{match.status}</p>

      {match.venue && !compact && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="line-clamp-1">{match.venue.city}</span>
        </p>
      )}
    </Link>
  );
}

function TeamRow({
  name,
  score,
  imageUrl,
  compact,
}: {
  name: string;
  score: string;
  imageUrl?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <TeamAvatar name={name} imageUrl={imageUrl} />
        <span className={cn("font-semibold", compact ? "text-sm" : "text-base")}>
          {name}
        </span>
      </div>
      <span className="text-sm font-mono text-foreground/90 shrink-0">{score}</span>
    </div>
  );
}

function TeamAvatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  return (
    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-muted">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="28px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold">
          {name.slice(0, 2)}
        </div>
      )}
    </div>
  );
}
