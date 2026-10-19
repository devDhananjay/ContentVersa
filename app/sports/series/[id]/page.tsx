import { redirect } from "next/navigation";
import { PageBack } from "@/components/site/page-back";
import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { BandAd } from "@/components/ads/band-ad";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { SportsNav } from "@/components/sports/sports-nav";
import { SeriesDetailTabs } from "@/components/sports/series-detail-tabs";
import { getSeriesDetailData } from "@/lib/sports/data";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const series = await getSeriesDetailData(Number(id));
  if (!series) return buildMetadata({ title: "Series", noIndex: true });
  return buildMetadata({
    title: series.name,
    description: `${series.name} — matches, squads, points table and news.`,
    path: `/sports/series/${id}`,
    noIndex: true,
  });
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seriesId = Number(id);
  if (!Number.isFinite(seriesId)) redirect("/sports");

  const series = await getSeriesDetailData(seriesId);
  if (!series) redirect("/sports");

  return (
    <div className="container py-8 md:py-12">
      <PageBack href="/sports" label="Sports Hub" className="mb-6" />

      <SportsNav />

      <div className="mb-8">
        <div className="flex items-center gap-2 text-neon-purple mb-2">
          <CalendarDays className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Series
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          {series.name}
        </h1>
      </div>

      <SeriesDetailTabs
        seriesId={series.id}
        matchGroups={series.matchGroups}
        squads={series.squads}
        pointsTable={series.pointsTable}
        news={series.news}
        seriesName={series.name}
      />

      <BandAd slotKey="horizontal" className="mt-8" />
      <HubAdSense className="!px-0" />
    </div>
  );
}
