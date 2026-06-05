import Image from "next/image";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LiveMatchTicker } from "@/components/sports/live-match-ticker";
import { SportsNav } from "@/components/sports/sports-nav";
import { SportsSidebar } from "@/components/sports/sports-sidebar";
import { getSportsHubDataCached } from "@/lib/sports/data";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600";

export async function SportsBrowseShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const hub = await getSportsHubDataCached();
  const tickerMatches = [...hub.live, ...hub.upcoming, ...hub.recent];

  return (
    <div>
      <section className="relative h-[240px] md:h-[280px] overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Sports Hub"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/45" />
        <div className="absolute inset-0 bg-gradient-to-br from-lime-500/15 via-green-500/5 to-neon-cyan/15 mix-blend-overlay" />
        <div className="container relative h-full flex flex-col justify-end pb-8">
          <Badge variant="gradient" className="w-fit mb-2 text-xs">
            Cricket · Live
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Sports Hub
          </h1>
          <p className="mt-1.5 text-sm text-foreground/75 max-w-xl">
            Live scores, teams, players and cricket news in one place.
          </p>
        </div>
      </section>

      <LiveMatchTicker matches={tickerMatches} />

      {!hub.configured && (
        <div className="container mt-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-muted-foreground">
              Add <code className="rounded bg-muted px-1 text-xs">RAPIDAPI_KEY</code> to
              enable live cricket data.
            </p>
          </div>
        </div>
      )}

      <div className="container py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 lg:gap-10 items-start">
          <div className="min-w-0 space-y-8">
            <SportsNav />
            {children}
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <SportsSidebar
              upcoming={hub.upcoming}
              rankingsByFormat={hub.rankingsByFormat}
              trendingPlayers={hub.trendingPlayers}
              pointsTable={hub.pointsTable}
              pointsTableSeriesName={hub.pointsTableSeriesName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
