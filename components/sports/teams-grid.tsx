import Link from "next/link";
import Image from "next/image";
import { cricbuzzImageUrl } from "@/lib/sports/transformers";
import type { TeamSummary } from "@/lib/sports/types";

interface TeamsGridProps {
  teams: TeamSummary[];
}

export function TeamsGrid({ teams }: TeamsGridProps) {
  if (!teams.length) {
    return (
      <p className="text-center text-muted-foreground py-10">
        No teams available.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {teams.map((team) => {
        const img = cricbuzzImageUrl(team.imageId, "64x64");
        return (
          <Link
            key={team.id}
            href={`/sports/team/${team.id}`}
            className="group flex flex-col items-center rounded-2xl border bg-card p-5 hover:border-neon-cyan/40 hover:shadow-neon transition-all"
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-muted mb-3">
              {img ? (
                <Image
                  src={img}
                  alt={team.shortName}
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold">
                  {team.shortName}
                </div>
              )}
            </div>
            <p className="font-semibold text-sm text-center group-hover:text-neon-cyan transition-colors">
              {team.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {team.shortName}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
