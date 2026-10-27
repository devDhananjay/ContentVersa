import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { BandAd } from "@/components/ads/band-ad";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";
import { PageBack } from "@/components/site/page-back";
import { getLeaderboardCached } from "@/lib/data/leaderboard";
import { buildMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  return buildMetadata({
    title: t(dict, "footer.leaderboard", "Leaderboard"),
    description: t(dict, "hubs.leaderboardSub"),
    path: "/leaderboard",
    noIndex: true,
  });
}

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const creators = await getLeaderboardCached();

  return (
    <div className="container py-12 max-w-4xl">
      <PageBack href="/" label={t(dict, "common.home")} className="mb-6" />
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 text-neon-orange mb-2">
          <Trophy className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-widest">
            {t(dict, "hubs.leaderboardEyebrow")}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight">
          {t(dict, "hubs.leaderboardTitleBefore") ? (
            <>
              {t(dict, "hubs.leaderboardTitleBefore")}{" "}
            </>
          ) : null}
          <span className="text-gradient">{t(dict, "hubs.leaderboardTitleAccent")}</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          {t(dict, "hubs.leaderboardSub")}
        </p>
      </div>

      <LeaderboardView creators={creators} />
      <BandAd slotKey="horizontal" className="mt-8" />
      <HubAdSense className="!px-0" />
    </div>
  );
}
