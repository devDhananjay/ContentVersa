"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchGroupsList } from "@/components/sports/match-groups-list";
import { PointsTable } from "@/components/sports/points-table";
import { CricketNewsCard } from "@/components/sports/cricket-news-card";
import { TeamPlayersList } from "@/components/sports/team-players-list";
import type {
  CricketNewsItem,
  PointsTableRow,
  SeriesSquadSummary,
  MatchGroup,
  TeamPlayer,
} from "@/lib/sports/types";
import { cn } from "@/lib/utils";

interface SeriesDetailTabsProps {
  seriesId: number;
  matchGroups: MatchGroup[];
  squads: SeriesSquadSummary[];
  pointsTable: PointsTableRow[];
  news: CricketNewsItem[];
  seriesName: string;
}

export function SeriesDetailTabs({
  seriesId,
  matchGroups,
  squads,
  pointsTable,
  news,
  seriesName,
}: SeriesDetailTabsProps) {
  const [activeSquad, setActiveSquad] = React.useState<number | null>(
    squads[0]?.squadId ?? null
  );
  const [squadPlayers, setSquadPlayers] = React.useState<TeamPlayer[]>([]);
  const [loadingSquad, setLoadingSquad] = React.useState(false);

  React.useEffect(() => {
    if (!activeSquad) return;
    let cancelled = false;
    setLoadingSquad(true);
    fetch(`/api/sports/series/${seriesId}/squads/${activeSquad}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setSquadPlayers(json.data ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoadingSquad(false);
      });
    return () => {
      cancelled = true;
    };
  }, [seriesId, activeSquad]);

  return (
    <Tabs defaultValue="matches">
      <TabsList className="w-full justify-start h-auto flex-wrap gap-1">
        <TabsTrigger value="matches">Matches</TabsTrigger>
        <TabsTrigger value="squads">Squads</TabsTrigger>
        {pointsTable.length > 0 && (
          <TabsTrigger value="points">Points Table</TabsTrigger>
        )}
        {news.length > 0 && <TabsTrigger value="news">News</TabsTrigger>}
      </TabsList>

      <TabsContent value="matches" className="mt-5">
        <MatchGroupsList groups={matchGroups} />
      </TabsContent>

      <TabsContent value="squads" className="mt-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {squads.map((s) => (
            <button
              key={s.squadId}
              type="button"
              onClick={() => setActiveSquad(s.squadId)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                activeSquad === s.squadId
                  ? "bg-neon-purple/20 border-neon-purple text-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        {loadingSquad ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Loading squad...
          </p>
        ) : (
          <TeamPlayersList players={squadPlayers} />
        )}
      </TabsContent>

      {pointsTable.length > 0 && (
        <TabsContent value="points" className="mt-5">
          <PointsTable rows={pointsTable} seriesName={seriesName} />
        </TabsContent>
      )}

      {news.length > 0 && (
        <TabsContent value="news" className="mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {news.map((item) => (
              <CricketNewsCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
