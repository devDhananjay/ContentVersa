import type { Metadata } from "next";
import { Trophy, Flame, BadgeCheck, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AUTHORS } from "@/lib/data/blogs";
import { formatNumber, getInitials } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Leaderboard",
  description: "Top ContentVerse creators ranked by reach, engagement and growth.",
  path: "/leaderboard",
});

const RANKED = [...AUTHORS]
  .sort((a, b) => b.followers - a.followers)
  .map((a, i) => ({ ...a, rank: i + 1, growth: 5 + i * 3 }));

export default function LeaderboardPage() {
  const podium = RANKED.slice(0, 3);
  const rest = RANKED.slice(3);

  return (
    <div className="container py-12 max-w-4xl">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 text-neon-orange mb-2">
          <Trophy className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-widest">
            Top creators
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight">
          The <span className="text-gradient">leaderboard</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Weekly ranking of ContentVerse&apos;s top creators by audience growth, engagement and impact.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10 items-end">
        {podium.map((c, i) => {
          const heights = ["h-48", "h-64", "h-40"];
          const order = [1, 0, 2];
          const idx = order[i];
          const ranked = podium[idx];
          const trophyColors = ["from-zinc-300 to-zinc-500", "from-yellow-400 to-orange-500", "from-amber-700 to-amber-900"];
          return (
            <div key={ranked.id} className="flex flex-col items-center">
              <Avatar className="h-14 w-14 md:h-20 md:w-20 border-2 border-background mb-3">
                <AvatarImage src={ranked.avatar} alt={ranked.name} />
                <AvatarFallback>{getInitials(ranked.name)}</AvatarFallback>
              </Avatar>
              <p className="font-semibold text-sm text-center">{ranked.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(ranked.followers)}
              </p>
              <div
                className={`mt-2 w-full ${heights[i]} rounded-t-2xl bg-gradient-to-b ${trophyColors[idx]} flex items-center justify-center text-white font-display font-extrabold text-3xl`}
              >
                #{ranked.rank}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {rest.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:border-neon-purple/40 transition-colors"
          >
            <span className="font-display text-2xl font-extrabold text-muted-foreground w-8">
              #{c.rank}
            </span>
            <Avatar>
              <AvatarImage src={c.avatar} alt={c.name} />
              <AvatarFallback>{getInitials(c.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold truncate">{c.name}</p>
                {c.verified && <BadgeCheck className="h-3.5 w-3.5 text-neon-cyan" />}
              </div>
              <p className="text-xs text-muted-foreground">@{c.username}</p>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Followers</p>
                <p className="font-semibold">{formatNumber(c.followers)}</p>
              </div>
              <Badge variant="success" className="gap-1">
                <TrendingUp className="h-3 w-3" /> +{c.growth}%
              </Badge>
            </div>
            <Button variant="outline" size="sm">Follow</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
