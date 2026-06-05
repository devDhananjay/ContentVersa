import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SportsNav } from "@/components/sports/sports-nav";
import { TeamDetailTabs } from "@/components/sports/team-detail-tabs";
import {
  getTeamById,
  getTeamPlayers,
  getTeamResults,
  getTeamSchedule,
} from "@/lib/sports/data";
import { cricbuzzImageUrl } from "@/lib/sports/transformers";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const team = await getTeamById(Number(id));
  if (!team) return buildMetadata({ title: "Team" });
  return buildMetadata({
    title: team.name,
    description: `${team.name} cricket team — squad, schedule and results.`,
    path: `/sports/team/${id}`,
  });
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teamId = Number(id);
  if (!Number.isFinite(teamId)) notFound();

  const [team, players, schedule, results] = await Promise.all([
    getTeamById(teamId),
    getTeamPlayers(teamId),
    getTeamSchedule(teamId),
    getTeamResults(teamId),
  ]);

  if (!team) notFound();

  const img = cricbuzzImageUrl(team.imageId, "120x120");

  return (
    <div className="container py-8 md:py-12">
      <Link href="/sports/teams">
        <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" /> All Teams
        </Button>
      </Link>

      <SportsNav />

      <div className="rounded-3xl border bg-card p-6 md:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted">
          {img ? (
            <Image
              src={img}
              alt={team.shortName}
              fill
              sizes="96px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
              {team.shortName}
            </div>
          )}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold">
            {team.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {team.countryName ?? team.shortName} · International
          </p>
        </div>
      </div>

      <TeamDetailTabs
        players={players}
        schedule={schedule}
        results={results}
      />
    </div>
  );
}
