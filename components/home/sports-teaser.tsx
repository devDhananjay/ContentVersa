import Link from "next/link";
import { ArrowRight, Medal } from "lucide-react";
import { MatchCard } from "@/components/sports/match-card";
import { CricketNewsCard } from "@/components/sports/cricket-news-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SportsTeaserData } from "@/lib/sports/types";

interface SportsTeaserProps {
  data: SportsTeaserData;
}

export function SportsTeaser({ data }: SportsTeaserProps) {
  if (!data.configured) return null;

  const featuredMatches = [...data.live, ...data.upcoming].slice(0, 2);
  if (!featuredMatches.length && !data.news.length) return null;

  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <Badge variant="neon" className="mb-2 gap-1">
            <Medal className="h-3 w-3" /> Sports Hub
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Live <span className="text-gradient">Cricket</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Scores, fixtures and headlines — stay in the game
          </p>
        </div>
        <Link href="/sports" className="hidden md:block">
          <Button variant="outline" className="gap-2">
            Open Sports Hub <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {featuredMatches.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredMatches.map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
          </div>
        )}

        {data.news.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {data.news.slice(0, 2).map((item) => (
              <CricketNewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 md:hidden">
        <Link href="/sports">
          <Button variant="gradient" className="w-full gap-2">
            Open Sports Hub <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
