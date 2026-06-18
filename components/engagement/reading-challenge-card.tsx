"use client";

import * as React from "react";
import { Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Challenge = {
  read: number;
  goal: number;
  complete: boolean;
};

export function ReadingChallengeCard() {
  const [challenge, setChallenge] = React.useState<Challenge | null>(null);

  React.useEffect(() => {
    fetch("/api/me/challenges", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Challenge | null) => {
        if (data) setChallenge(data);
      })
      .catch(() => {});
  }, []);

  if (!challenge) return null;

  const pct = Math.min(100, Math.round((challenge.read / challenge.goal) * 100));

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2 text-neon-cyan mb-2">
        <Target className="h-5 w-5" />
        <h3 className="font-display font-bold">Weekly challenge</h3>
        {challenge.complete && <Badge variant="success">Done</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">
        Read {challenge.goal} AI articles this week
      </p>
      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {challenge.read} / {challenge.goal} articles · unlocks AI Explorer badge
      </p>
    </div>
  );
}
