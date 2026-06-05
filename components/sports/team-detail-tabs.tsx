"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamPlayersList } from "@/components/sports/team-players-list";
import { MatchGroupsList } from "@/components/sports/match-groups-list";
import type { MatchGroup, TeamPlayer } from "@/lib/sports/types";

interface TeamDetailTabsProps {
  players: TeamPlayer[];
  schedule: MatchGroup[];
  results: MatchGroup[];
}

export function TeamDetailTabs({
  players,
  schedule,
  results,
}: TeamDetailTabsProps) {
  return (
    <Tabs defaultValue="squad">
      <TabsList className="w-full justify-start h-auto flex-wrap gap-1">
        <TabsTrigger value="squad">Squad ({players.length})</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="results">Results</TabsTrigger>
      </TabsList>

      <TabsContent value="squad" className="mt-5">
        <TeamPlayersList players={players} />
      </TabsContent>
      <TabsContent value="schedule" className="mt-5">
        <MatchGroupsList
          groups={schedule}
          emptyMessage="No upcoming matches scheduled."
        />
      </TabsContent>
      <TabsContent value="results" className="mt-5">
        <MatchGroupsList
          groups={results}
          emptyMessage="No recent results available."
        />
      </TabsContent>
    </Tabs>
  );
}
