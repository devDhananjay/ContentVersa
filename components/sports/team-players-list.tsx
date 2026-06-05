import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { playerFaceImageUrl } from "@/lib/sports/transformers";
import type { TeamPlayer } from "@/lib/sports/types";

interface TeamPlayersListProps {
  players: TeamPlayer[];
}

export function TeamPlayersList({ players }: TeamPlayersListProps) {
  if (!players.length) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Squad not available.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {players.map((p) => (
        <Link
          key={p.id}
          href={`/sports/player/${p.id}`}
          className="flex items-center gap-3 rounded-xl border p-3 hover:border-neon-purple/40 transition-colors"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
            {playerFaceImageUrl(p.imageId) ? (
              <Image
                src={playerFaceImageUrl(p.imageId)!}
                alt={p.name}
                fill
                sizes="40px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold">
                {p.name.slice(0, 2)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm truncate">{p.name}</p>
              {p.captain && (
                <Badge variant="neon" className="text-[9px] px-1.5 py-0">
                  C
                </Badge>
              )}
            </div>
            {p.role && (
              <p className="text-xs text-muted-foreground">{p.role}</p>
            )}
            {p.battingStyle && (
              <p className="text-[10px] text-muted-foreground truncate">
                {p.battingStyle}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
