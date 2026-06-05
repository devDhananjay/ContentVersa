"use client";

import * as React from "react";
import { CompactMatchCard } from "@/components/sports/compact-match-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SportMatch } from "@/lib/sports/types";

interface MatchesSectionProps {
  initialLive: SportMatch[];
  initialUpcoming: SportMatch[];
  initialRecent: SportMatch[];
}

export function MatchesSection({
  initialLive,
  initialUpcoming,
  initialRecent,
}: MatchesSectionProps) {
  const [live, setLive] = React.useState(initialLive);
  const [upcoming, setUpcoming] = React.useState(initialUpcoming);
  const [recent, setRecent] = React.useState(initialRecent);

  React.useEffect(() => {
    const refresh = async () => {
      try {
        const [liveRes, upRes, recRes] = await Promise.all([
          fetch("/api/sports/matches/live"),
          fetch("/api/sports/matches/upcoming"),
          fetch("/api/sports/matches/recent"),
        ]);
        const [liveJson, upJson, recJson] = await Promise.all([
          liveRes.json(),
          upRes.json(),
          recRes.json(),
        ]);
        if (liveJson.data) setLive(liveJson.data);
        if (upJson.data) setUpcoming(upJson.data);
        if (recJson.data) setRecent(recJson.data);
      } catch {
        /* keep stale data */
      }
    };

    const id = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Tabs defaultValue="live" className="w-full">
      <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-muted/50 p-1">
        <TabsTrigger value="live" className="gap-2 text-sm">
          Live
          {live.length > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
              {live.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="upcoming" className="text-sm">
          Upcoming
        </TabsTrigger>
        <TabsTrigger value="recent" className="text-sm">
          Results
        </TabsTrigger>
      </TabsList>

      <TabsContent value="live" className="mt-4">
        <MatchCarousel matches={live} empty="No live matches right now." />
      </TabsContent>
      <TabsContent value="upcoming" className="mt-4">
        <MatchCarousel matches={upcoming} empty="No upcoming fixtures." />
      </TabsContent>
      <TabsContent value="recent" className="mt-4">
        <MatchCarousel matches={recent} empty="No recent results." />
      </TabsContent>
    </Tabs>
  );
}

function MatchCarousel({
  matches,
  empty,
}: {
  matches: SportMatch[];
  empty: string;
}) {
  if (!matches.length) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
      {matches.map((match) => (
        <CompactMatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
