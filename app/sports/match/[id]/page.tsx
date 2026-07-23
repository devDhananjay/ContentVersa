import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/blog-card";
import { MatchDetailTabs } from "@/components/sports/match-detail-tabs";
import { getMatchScoreSummary, cricbuzzImageUrl } from "@/lib/sports/transformers";
import {
  getMatchCommentary,
  getMatchDetail,
  getMatchScorecard,
} from "@/lib/sports/data";
import { getBlogsByCategoryHybrid } from "@/lib/data/blog-db";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatchDetail(Number(id));
  if (!match) return buildMetadata({ title: "Match", noIndex: true });
  return buildMetadata({
    title: `${match.team1.shortName} vs ${match.team2.shortName}`,
    description: `${match.seriesName} — ${match.status}`,
    path: `/sports/match/${id}`,
    noIndex: true,
  });
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matchId = Number(id);
  if (!Number.isFinite(matchId)) redirect("/sports");

  const [match, blogs, scorecard, commentary] = await Promise.all([
    getMatchDetail(matchId),
    getBlogsByCategoryHybrid("sports"),
    getMatchScorecard(matchId),
    getMatchCommentary(matchId),
  ]);
  if (!match) redirect("/sports");

  const scores = getMatchScoreSummary(match);
  const team1Img = cricbuzzImageUrl(match.team1.imageId, "80x80");
  const team2Img = cricbuzzImageUrl(match.team2.imageId, "80x80");

  return (
    <div className="container py-8 md:py-12">
      <Link href="/sports">
        <Button variant="ghost" size="sm" className="gap-2 mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back to Sports Hub
        </Button>
      </Link>

      <div className="rounded-3xl border bg-card overflow-hidden">
        <div className="p-6 md:p-8 border-b bg-gradient-to-br from-lime-500/10 to-green-500/5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline">{match.format}</Badge>
            {match.isLive && (
              <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>
            )}
            <Badge variant="neon">{match.matchType}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {match.seriesName} · {match.matchDesc}
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            <TeamBlock
              teamId={match.team1.id}
              name={match.team1.name}
              shortName={match.team1.shortName}
              score={scores.team1}
              imageUrl={team1Img}
            />
            <span className="text-center text-2xl font-bold text-muted-foreground">
              vs
            </span>
            <TeamBlock
              teamId={match.team2.id}
              name={match.team2.name}
              shortName={match.team2.shortName}
              score={scores.team2}
              imageUrl={team2Img}
              align="right"
            />
          </div>

          <p className="mt-6 text-center text-neon-cyan font-medium">{match.status}</p>

          {match.venue && (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {match.venue.ground}, {match.venue.city}
            </p>
          )}
        </div>

        <MatchDetailTabs
          matchId={matchId}
          isLive={match.isLive}
          initialScorecard={scorecard}
          initialCommentary={commentary}
        />
      </div>

      {blogs.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold mb-6">
            Related sports blogs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogs.slice(0, 3).map((blog, i) => (
              <BlogCard key={blog.id} blog={blog} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TeamBlock({
  teamId,
  name,
  shortName,
  score,
  imageUrl,
  align = "left",
}: {
  teamId: number;
  name: string;
  shortName: string;
  score: string;
  imageUrl?: string;
  align?: "left" | "right";
}) {
  const nameBlock = (
    <div>
      <p className="font-display text-2xl font-extrabold hover:text-neon-cyan transition-colors">
        {shortName}
      </p>
      <p className="text-sm text-muted-foreground">{name}</p>
    </div>
  );

  return (
    <div className={align === "right" ? "md:text-right" : ""}>
      <div
        className={`flex items-center gap-3 ${
          align === "right" ? "md:flex-row-reverse" : ""
        }`}
      >
        {teamId > 0 ? (
          <Link
            href={`/sports/team/${teamId}`}
            className={`flex items-center gap-3 rounded-xl p-1 -m-1 hover:bg-accent/50 transition-colors ${
              align === "right" ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={shortName}
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold">
                  {shortName}
                </div>
              )}
            </div>
            {nameBlock}
          </Link>
        ) : (
          <>
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={shortName}
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold">
                  {shortName}
                </div>
              )}
            </div>
            {nameBlock}
          </>
        )}
      </div>
      <p className={`mt-2 font-mono text-lg ${align === "right" ? "md:text-right" : ""}`}>
        {score}
      </p>
    </div>
  );
}
