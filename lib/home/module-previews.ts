import { getFinanceTickerDataCached } from "@/lib/finance/data";
import { getGoldPriceSnapshot } from "@/lib/goldverse/gold-price";
import { getSportsTeaserData } from "@/lib/sports/data";

export type HomeModulePreviews = {
  sports: string | null;
  finance: string | null;
  gold: string | null;
};

function formatSignedPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Lightweight live snippets for homepage module cards. */
export async function getHomeModulePreviews(): Promise<HomeModulePreviews> {
  const [sports, finance, gold] = await Promise.allSettled([
    getSportsTeaserData(),
    getFinanceTickerDataCached(),
    getGoldPriceSnapshot(),
  ]);

  let sportsPreview: string | null = null;
  if (sports.status === "fulfilled" && sports.value.configured) {
    const live = sports.value.live[0];
    const upcoming = sports.value.upcoming[0];
    if (live) {
      sportsPreview = `LIVE · ${live.team1.shortName || live.team1.name} vs ${live.team2.shortName || live.team2.name}`;
    } else if (upcoming) {
      sportsPreview = `Next · ${upcoming.team1.shortName || upcoming.team1.name} vs ${upcoming.team2.shortName || upcoming.team2.name}`;
    }
  }

  let financePreview: string | null = null;
  if (finance.status === "fulfilled" && finance.value?.nifty) {
    const { nifty } = finance.value;
    financePreview = `Nifty ${nifty.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })} (${formatSignedPercent(nifty.changePercent)})`;
  }

  let goldPreview: string | null = null;
  if (gold.status === "fulfilled" && gold.value.rates?.length) {
    const delhi =
      gold.value.rates.find((row) => /delhi/i.test(row.city)) || gold.value.rates[0];
    goldPreview = `${delhi.city} 22K ${formatInr(delhi.gold22k)} / 10g`;
  }

  return {
    sports: sportsPreview,
    finance: financePreview,
    gold: goldPreview,
  };
}
