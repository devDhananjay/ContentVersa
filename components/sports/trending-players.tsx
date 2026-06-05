import Link from "next/link";
import Image from "next/image";
import type { TrendingPlayer } from "@/lib/sports/types";
import { playerFaceImageUrl } from "@/lib/sports/transformers";
import { TrendingUp } from "lucide-react";

interface TrendingPlayersProps {
  players: TrendingPlayer[];
}

export function TrendingPlayers({ players }: TrendingPlayersProps) {
  if (!players.length) return null;

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-neon-purple" />
        <h3 className="font-display font-bold">Trending Players</h3>
      </div>
      <ul className="space-y-2">
        {players.map((p) => (
          <li key={p.id}>
            <Link
              href={`/sports/player/${p.id}`}
              className="flex items-center gap-2.5 rounded-lg p-1.5 -mx-1.5 hover:bg-accent/50 transition-colors"
            >
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
              {playerFaceImageUrl(p.faceImageId) ? (
                <Image
                  src={playerFaceImageUrl(p.faceImageId)!}
                  alt={p.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[9px] font-bold">
                  {p.name.slice(0, 2)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {p.teamName}
              </p>
            </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
