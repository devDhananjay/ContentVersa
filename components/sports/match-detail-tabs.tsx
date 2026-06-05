"use client";

import * as React from "react";
import type {
  CommentaryItem,
  MatchScorecard,
  ScorecardInnings,
} from "@/lib/sports/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface MatchDetailTabsProps {
  matchId: number;
  isLive: boolean;
  initialScorecard: MatchScorecard | null;
  initialCommentary: CommentaryItem[];
}

export function MatchDetailTabs({
  matchId,
  isLive,
  initialScorecard,
  initialCommentary,
}: MatchDetailTabsProps) {
  const [scorecard, setScorecard] = React.useState(initialScorecard);
  const [commentary, setCommentary] = React.useState(initialCommentary);

  React.useEffect(() => {
    if (!isLive) return;

    const refresh = async () => {
      try {
        const [scRes, commRes] = await Promise.all([
          fetch(`/api/sports/matches/${matchId}/scorecard`),
          fetch(`/api/sports/matches/${matchId}/commentary`),
        ]);
        const [scJson, commJson] = await Promise.all([
          scRes.json(),
          commRes.json(),
        ]);
        if (scJson.data) setScorecard(scJson.data);
        if (commJson.data) setCommentary(commJson.data);
      } catch {
        /* keep stale */
      }
    };

    const id = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(id);
  }, [matchId, isLive]);

  const hasScorecard = scorecard && scorecard.innings.length > 0;
  const hasCommentary = commentary.length > 0;

  if (!hasScorecard && !hasCommentary) {
    return (
      <div className="p-6 md:p-8 text-center text-muted-foreground text-sm space-y-2">
        <p>Detailed scorecard and commentary are not available yet.</p>
        <p className="text-xs">
          Data syncs hourly from the cricket API. Check back soon or view the
          summary above.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={hasScorecard ? "scorecard" : "commentary"}>
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 px-6">
        {hasScorecard && (
          <TabsTrigger
            value="scorecard"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-neon-cyan"
          >
            Scorecard
          </TabsTrigger>
        )}
        {hasCommentary && (
          <TabsTrigger
            value="commentary"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-neon-cyan"
          >
            Commentary
          </TabsTrigger>
        )}
      </TabsList>

      {hasScorecard && (
        <TabsContent value="scorecard" className="p-6 md:p-8 mt-0 space-y-8">
          {scorecard!.innings.map((inn) => (
            <InningsBlock key={inn.id} innings={inn} />
          ))}
        </TabsContent>
      )}

      {hasCommentary && (
        <TabsContent value="commentary" className="p-6 md:p-8 mt-0">
          <ul className="space-y-3 max-h-[480px] overflow-y-auto">
            {commentary.map((c, i) => (
              <li
                key={`${c.overNum}-${i}`}
                className={cn(
                  "rounded-xl border p-3 text-sm",
                  c.eventType === "WICKET" && "border-red-500/30 bg-red-500/5",
                  c.eventType === "FOUR" && "border-neon-cyan/30 bg-neon-cyan/5",
                  c.eventType === "SIX" && "border-neon-purple/30 bg-neon-purple/5"
                )}
              >
                {c.overNum && (
                  <span className="text-xs font-mono text-muted-foreground mr-2">
                    {c.overNum}
                  </span>
                )}
                {c.text}
              </li>
            ))}
          </ul>
        </TabsContent>
      )}
    </Tabs>
  );
}

function InningsBlock({ innings }: { innings: ScorecardInnings }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h3 className="font-display font-bold text-lg">{innings.teamName}</h3>
        <p className="font-mono text-neon-cyan">
          {innings.score} ({innings.overs} ov)
          {innings.runRate ? ` · RR ${innings.runRate.toFixed(2)}` : ""}
        </p>
      </div>

      {innings.batsmen.length > 0 && (
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs min-w-[480px]">
            <thead>
              <tr className="text-muted-foreground border-b">
                <th className="text-left py-2 font-medium">Batsman</th>
                <th className="text-right py-2 px-2 font-medium">R</th>
                <th className="text-right py-2 px-2 font-medium">B</th>
                <th className="text-right py-2 px-2 font-medium">4s</th>
                <th className="text-right py-2 px-2 font-medium">6s</th>
                <th className="text-right py-2 font-medium">SR</th>
              </tr>
            </thead>
            <tbody>
              {innings.batsmen.map((b) => (
                <tr key={b.name} className="border-b border-border/40">
                  <td className="py-2">
                    <span className="font-medium">{b.name}</span>
                    {b.isCaptain && (
                      <span className="ml-1 text-[10px] text-muted-foreground">(c)</span>
                    )}
                    {b.isKeeper && (
                      <span className="ml-1 text-[10px] text-muted-foreground">(wk)</span>
                    )}
                    {b.dismissal && (
                      <p className="text-[10px] text-muted-foreground">{b.dismissal}</p>
                    )}
                    {!b.dismissal && b.runs > 0 && (
                      <p className="text-[10px] text-neon-cyan">not out</p>
                    )}
                  </td>
                  <td className="text-right py-2 px-2 font-semibold">{b.runs}</td>
                  <td className="text-right py-2 px-2">{b.balls}</td>
                  <td className="text-right py-2 px-2">{b.fours}</td>
                  <td className="text-right py-2 px-2">{b.sixes}</td>
                  <td className="text-right py-2">{b.strikeRate.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {innings.extras && (
        <p className="text-xs text-muted-foreground mb-3">Extras: {innings.extras}</p>
      )}

      {innings.bowlers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[400px]">
            <thead>
              <tr className="text-muted-foreground border-b">
                <th className="text-left py-2 font-medium">Bowler</th>
                <th className="text-right py-2 px-2 font-medium">O</th>
                <th className="text-right py-2 px-2 font-medium">M</th>
                <th className="text-right py-2 px-2 font-medium">R</th>
                <th className="text-right py-2 font-medium">W</th>
                <th className="text-right py-2 font-medium">Econ</th>
              </tr>
            </thead>
            <tbody>
              {innings.bowlers.map((b) => (
                <tr key={b.name} className="border-b border-border/40">
                  <td className="py-2 font-medium">{b.name}</td>
                  <td className="text-right py-2 px-2">{b.overs}</td>
                  <td className="text-right py-2 px-2">{b.maidens}</td>
                  <td className="text-right py-2 px-2">{b.runs}</td>
                  <td className="text-right py-2 px-2 font-semibold">{b.wickets}</td>
                  <td className="text-right py-2">{b.economy.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
