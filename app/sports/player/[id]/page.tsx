import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayerStatsTableView } from "@/components/sports/player-stats-table";
import { CricketNewsCard } from "@/components/sports/cricket-news-card";
import {
  getPlayerBattingStats,
  getPlayerBowlingStats,
  getPlayerNews,
  getPlayerProfile,
} from "@/lib/sports/data";
import { playerFaceImageUrl } from "@/lib/sports/transformers";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await getPlayerProfile(Number(id));
  if (!profile) return buildMetadata({ title: "Player" });
  return buildMetadata({
    title: profile.name,
    description: `${profile.name} — ${profile.role ?? "Cricket player"} profile and stats.`,
    path: `/sports/player/${id}`,
    image: profile.imageUrl,
  });
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number(id);
  if (!Number.isFinite(playerId)) notFound();

  const [profile, batting, bowling, news] = await Promise.all([
    getPlayerProfile(playerId),
    getPlayerBattingStats(playerId),
    getPlayerBowlingStats(playerId),
    getPlayerNews(playerId, 6),
  ]);

  if (!profile) notFound();

  const img =
    profile.imageUrl ?? playerFaceImageUrl(playerId);

  return (
    <div className="container py-8 md:py-12 max-w-4xl">
      <Link href="/sports/players">
        <Button variant="ghost" size="sm" className="gap-2 mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Search Players
        </Button>
      </Link>

      <div className="rounded-3xl border bg-card overflow-hidden mb-8">
        <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start bg-gradient-to-br from-neon-purple/10 to-neon-cyan/5">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted">
            {img ? (
              <Image
                src={img}
                alt={profile.name}
                fill
                sizes="112px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
                {profile.name.slice(0, 2)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl md:text-4xl font-extrabold">
              {profile.fullName ?? profile.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.role && <Badge variant="neon">{profile.role}</Badge>}
              {profile.intlTeam && (
                <Badge variant="outline">{profile.intlTeam}</Badge>
              )}
            </div>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {profile.dob && (
                <div>
                  <dt className="text-muted-foreground">Born</dt>
                  <dd className="font-medium">{profile.dob}</dd>
                </div>
              )}
              {profile.birthPlace && (
                <div>
                  <dt className="text-muted-foreground">Birth place</dt>
                  <dd className="font-medium">{profile.birthPlace}</dd>
                </div>
              )}
              {profile.battingStyle && (
                <div>
                  <dt className="text-muted-foreground">Batting</dt>
                  <dd className="font-medium">{profile.battingStyle}</dd>
                </div>
              )}
              {profile.bowlingStyle && (
                <div>
                  <dt className="text-muted-foreground">Bowling</dt>
                  <dd className="font-medium">{profile.bowlingStyle}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {profile.bio && (
          <div className="p-6 md:p-8 border-t">
            <h2 className="font-display font-bold mb-3">About</h2>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line line-clamp-[12]">
              {profile.bio}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <PlayerStatsTableView title="Batting Statistics" stats={batting} />
        <PlayerStatsTableView title="Bowling Statistics" stats={bowling} />
      </div>

      {news.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold mb-2">
            Related <span className="text-gradient">News</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Latest cricket headlines featuring {profile.name}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {news.map((item) => (
              <CricketNewsCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
