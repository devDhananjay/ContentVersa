import Link from "next/link";
import { Calendar } from "lucide-react";
import type {
  PlayerRanking,
  PointsTableRow,
  RankingFormat,
  SportMatch,
  TrendingPlayer,
} from "@/lib/sports/types";
import { Badge } from "@/components/ui/badge";
import { IccRankings } from "@/components/sports/icc-rankings";
import { TrendingPlayers } from "@/components/sports/trending-players";
import { PointsTable } from "@/components/sports/points-table";

interface SportsSidebarProps {
  upcoming: SportMatch[];
  rankingsByFormat: Partial<Record<RankingFormat, PlayerRanking[]>>;
  trendingPlayers: TrendingPlayer[];
  pointsTable: PointsTableRow[];
  pointsTableSeriesName?: string;
}

export function SportsSidebar({
  upcoming,
  rankingsByFormat,
  trendingPlayers,
  pointsTable,
  pointsTableSeriesName,
}: SportsSidebarProps) {
  const miniUpcoming = upcoming.slice(0, 5);

  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-neon-cyan" />
          <h3 className="font-display font-bold">Upcoming Fixtures</h3>
        </div>
        {miniUpcoming.length ? (
          <ul className="space-y-3">
            {miniUpcoming.map((match) => (
              <li key={match.id}>
                <Link
                  href={`/sports/match/${match.id}`}
                  className="block rounded-xl p-2.5 -mx-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {match.team1.shortName} vs {match.team2.shortName}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {match.format}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {match.status}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No fixtures scheduled.</p>
        )}
      </div>

      <IccRankings rankingsByFormat={rankingsByFormat} />

      <TrendingPlayers players={trendingPlayers} />

      <PointsTable rows={pointsTable} seriesName={pointsTableSeriesName} />
    </aside>
  );
}
